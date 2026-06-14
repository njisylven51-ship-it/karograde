import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Exam } from "../models/Exam";
import { Submission } from "../models/Submission";
import { isInMemory, memoryStore } from "../config/db";
import mongoose from "mongoose";

// Get available exams for the student
// We check if student has already completed them so we can flag them in the list
export async function getStudentExams(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let exams = [];
    let completedExamIds: string[] = [];

    if (isInMemory()) {
      exams = [...memoryStore.exams];
      completedExamIds = memoryStore.submissions
        .filter((s) => s.studentId.toString() === studentId.toString())
        .map((s) => s.examId.toString());
    } else {
      exams = await (Exam as any).find().sort({ createdAt: -1 });
      const submissions = await (Submission as any).find({ studentId }).select("examId");
      completedExamIds = submissions.map((s: any) => s.examId.toString());
    }

    // Map exams to include a completed boolean and strip answers
    const processedExams = exams.map((exam: any) => {
      const examObj = exam.toObject ? exam.toObject() : { ...exam };
      
      // Strip answers from the main list questions
      if (examObj.questions) {
        examObj.questions = examObj.questions.map((q: any) => {
          const { correctAnswer, explanation, ...stripped } = q;
          return stripped;
        });
      }

      return {
        ...examObj,
        completed: completedExamIds.includes(examObj._id.toString()),
      };
    });

    res.status(200).json(processedExams);
  } catch (error: any) {
    console.error("Get Student Exams Error:", error);
    res.status(500).json({ error: "Failed to fetch student exams" });
  }
}

// Get single exam details (without answers to prevent leaks)
export async function getStudentExamById(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let exam: any;
    let alreadyAttempted = false;

    // Check if double attempt
    if (isInMemory()) {
      exam = memoryStore.exams.find((e) => e._id.toString() === id);
      alreadyAttempted = memoryStore.submissions.some(
        (s) => s.studentId.toString() === studentId.toString() && s.examId.toString() === id
      );
    } else {
      exam = await (Exam as any).findById(id);
      const sub = await (Submission as any).findOne({ studentId, examId: id });
      alreadyAttempted = !!sub;
    }

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    if (alreadyAttempted) {
      return res.status(400).json({
        error: "You have already completed this exam. Multiple attempts are not allowed.",
        alreadyAttempted: true
      });
    }

    // Clone and strip correct answers and explanations
    const examObj = exam.toObject ? exam.toObject() : { ...exam };
    if (examObj.questions) {
      examObj.questions = examObj.questions.map((q: any) => {
        return {
          _id: q._id.toString(),
          questionText: q.questionText,
          options: q.options,
        };
      });
    }

    res.status(200).json(examObj);
  } catch (error: any) {
    console.error("Get Student Exam By Id Error:", error);
    res.status(500).json({ error: "Failed to retrieve exam details" });
  }
}

// Submit answers, grade dynamically and save
export async function submitExam(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { examId, answers } = req.body; // array of { questionId, selectedAnswer }
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!examId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Exam ID and answers array are required" });
    }

    // 1. Enforce ONE ATTEMPT rule
    let alreadyAttempted = false;
    if (isInMemory()) {
      alreadyAttempted = memoryStore.submissions.some(
        (s) => s.studentId.toString() === studentId.toString() && s.examId.toString() === examId
      );
    } else {
      const sub = await (Submission as any).findOne({ studentId, examId });
      alreadyAttempted = !!sub;
    }

    if (alreadyAttempted) {
      return res.status(400).json({
        error: "You have already completed this exam. Multiple attempts are not allowed.",
      });
    }

    // 2. Fetch proper exam details with correct answers
    let exam: any;
    if (isInMemory()) {
      exam = memoryStore.exams.find((e) => e._id.toString() === examId);
    } else {
      exam = await (Exam as any).findById(examId);
    }

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // 3. Gracefully execute grading
    let score = 0;
    const totalQuestions = exam.questions.length;
    const gradedAnswers: any[] = [];

    exam.questions.forEach((q: any) => {
      const questionIdStr = q._id.toString();
      // Find what student selected
      const studentAnsObj = answers.find((a: any) => a.questionId === questionIdStr);
      const selected = studentAnsObj ? studentAnsObj.selectedAnswer : "";
      
      const isCorrect = selected.trim() === q.correctAnswer.trim();
      if (isCorrect) {
        score++;
      }

      gradedAnswers.push({
        questionId: questionIdStr,
        selectedAnswer: selected,
        isCorrect,
      });
    });

    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

    // 4. Save Submission
    let submission: any;
    if (isInMemory()) {
      submission = {
        _id: new mongoose.Types.ObjectId().toString(),
        studentId,
        examId,
        answers: gradedAnswers,
        score,
        totalQuestions,
        percentage,
        submittedAt: new Date(),
      };
      
      // Secondary check just to be absolutely sure no race condition can slip past
      const reCheck = memoryStore.submissions.some(
        (s) => s.studentId.toString() === studentId.toString() && s.examId.toString() === examId
      );
      if (reCheck) {
        return res.status(400).json({
          error: "You have already completed this exam. Multiple attempts are not allowed.",
        });
      }

      memoryStore.submissions.push(submission);
    } else {
      try {
        submission = await (Submission as any).create({
          studentId,
          examId,
          answers: gradedAnswers,
          score,
          totalQuestions,
          percentage,
        });
      } catch (dbErr: any) {
        // Handle Mongoose compound unique index error
        if (dbErr.code === 11000) {
          return res.status(400).json({
            error: "You have already completed this exam. Multiple attempts are not allowed.",
          });
        }
        throw dbErr;
      }
    }

    // 5. Structure full corrections and explanations response
    const resultsFeedback = exam.questions.map((q: any) => {
      const questionIdStr = q._id.toString();
      const studentAnsObj = answers.find((a: any) => a.questionId === questionIdStr);
      const selected = studentAnsObj ? studentAnsObj.selectedAnswer : "";

      return {
        _id: questionIdStr,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: selected,
        isCorrect: selected.trim() === q.correctAnswer.trim(),
        explanation: q.explanation || "",
      };
    });

    res.status(201).json({
      message: "Exam submitted and graded successfully",
      score,
      totalQuestions,
      percentage,
      feedback: resultsFeedback,
      submittedAt: submission.submittedAt || new Date()
    });
  } catch (error: any) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ error: "Failed to grade and submit exam" });
  }
}

// Get the student's historical exam submissions and scores
export async function getStudentResults(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    let list = [];

    if (isInMemory()) {
      list = memoryStore.submissions
        .filter((s) => s.studentId.toString() === studentId.toString())
        .map((s) => {
          const exam = memoryStore.exams.find((e) => e._id.toString() === s.examId.toString());
          return {
            ...s,
            examId: {
              _id: s.examId,
              title: exam ? exam.title : "Deleted Exam",
              description: exam ? exam.description : "",
              duration: exam ? exam.duration : 0,
            },
          };
        });
    } else {
      list = await (Submission as any).find({ studentId })
        .populate("examId", "title description duration")
        .sort({ submittedAt: -1 });
    }

    res.status(200).json(list);
  } catch (error: any) {
    console.error("Get Student Results Error:", error);
    res.status(500).json({ error: "Failed to retrieve your results" });
  }
}
