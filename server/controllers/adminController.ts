import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Exam } from "../models/Exam";
import { Submission } from "../models/Submission";
import { isInMemory, memoryStore } from "../config/db";
import mongoose from "mongoose";

// --- EXAM MANAGEMENT ---

export async function createExam(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { title, description, duration, questions } = req.body;
    const adminId = req.user?.id;

    if (!title || duration === undefined) {
      return res.status(400).json({ error: "Exam title and duration are required" });
    }

    const processedQuestions = (questions || []).map((q: any) => ({
      _id: q._id || new mongoose.Types.ObjectId().toString(),
      questionText: q.questionText,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    let newExam: any;

    if (isInMemory()) {
      newExam = {
        _id: new mongoose.Types.ObjectId().toString(),
        title,
        description: description || "",
        duration: Number(duration),
        questions: processedQuestions,
        createdBy: adminId,
        createdAt: new Date(),
      };
      memoryStore.exams.push(newExam);
    } else {
      newExam = await (Exam as any).create({
        title,
        description,
        duration: Number(duration),
        questions: processedQuestions,
        createdBy: adminId,
      });
    }

    res.status(201).json({
      message: "Exam created successfully",
      exam: newExam,
    });
  } catch (error: any) {
    console.error("Create Exam Error:", error);
    res.status(500).json({ error: "Failed to create exam" });
  }
}

export async function getExams(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    let exams = [];

    if (isInMemory()) {
      exams = [...memoryStore.exams];
    } else {
      exams = await (Exam as any).find().sort({ createdAt: -1 });
    }

    res.status(200).json(exams);
  } catch (error: any) {
    console.error("Get Exams Error:", error);
    res.status(500).json({ error: "Failed to retrieve exams" });
  }
}

export async function updateExam(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const { title, description, duration, questions } = req.body;

    if (isInMemory()) {
      const idx = memoryStore.exams.findIndex((e) => e._id.toString() === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Exam not found" });
      }

      const updatedQuestions = questions ? questions.map((q: any) => ({
        _id: q._id || new mongoose.Types.ObjectId().toString(),
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      })) : memoryStore.exams[idx].questions;

      memoryStore.exams[idx] = {
        ...memoryStore.exams[idx],
        title: title !== undefined ? title : memoryStore.exams[idx].title,
        description: description !== undefined ? description : memoryStore.exams[idx].description,
        duration: duration !== undefined ? Number(duration) : memoryStore.exams[idx].duration,
        questions: updatedQuestions,
      };

      return res.status(200).json({
        message: "Exam updated successfully",
        exam: memoryStore.exams[idx],
      });
    } else {
      const updatedExam = await (Exam as any).findByIdAndUpdate(
        id,
        {
          $set: {
            title,
            description,
            duration: Number(duration),
            ...(questions && { questions }),
          },
        },
        { new: true }
      );

      if (!updatedExam) {
        return res.status(404).json({ error: "Exam not found" });
      }

      res.status(200).json({
        message: "Exam updated successfully",
        exam: updatedExam,
      });
    }
  } catch (error: any) {
    console.error("Update Exam Error:", error);
    res.status(500).json({ error: "Failed to update exam" });
  }
}

export async function deleteExam(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const idx = memoryStore.exams.findIndex((e) => e._id.toString() === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Exam not found" });
      }
      memoryStore.exams.splice(idx, 1);
      // Clean up orphaned submissions in memory as well
      memoryStore.submissions = memoryStore.submissions.filter((s) => s.examId.toString() !== id);

      return res.status(200).json({ message: "Exam deleted successfully" });
    } else {
      const exam = await (Exam as any).findByIdAndDelete(id);
      if (!exam) {
        return res.status(404).json({ error: "Exam not found" });
      }
      // Clean up related submissions in real DB
      await (Submission as any).deleteMany({ examId: id });
      res.status(200).json({ message: "Exam deleted successfully" });
    }
  } catch (error: any) {
    console.error("Delete Exam Error:", error);
    res.status(500).json({ error: "Failed to delete exam" });
  }
}

// --- QUESTIONS MANAGEMENT ---

export async function addQuestion(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { examId, questionText, options, correctAnswer, explanation } = req.body;

    if (!examId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ error: "Missing required question fields" });
    }

    const question = {
      _id: new mongoose.Types.ObjectId().toString(),
      questionText,
      options,
      correctAnswer,
      explanation: explanation || "",
    };

    if (isInMemory()) {
      const idx = memoryStore.exams.findIndex((e) => e._id.toString() === examId);
      if (idx === -1) {
        return res.status(404).json({ error: "Exam not found" });
      }
      memoryStore.exams[idx].questions.push(question);
      return res.status(201).json({
        message: "Question added successfully",
        question,
      });
    } else {
      const updatedExam = await (Exam as any).findByIdAndUpdate(
        examId,
        { $push: { questions: question } },
        { new: true }
      );

      if (!updatedExam) {
        return res.status(404).json({ error: "Exam not found" });
      }

      const added = updatedExam.questions[updatedExam.questions.length - 1];
      res.status(201).json({
        message: "Question added successfully",
        question: added,
      });
    }
  } catch (error: any) {
    console.error("Add Question Error:", error);
    res.status(500).json({ error: "Failed to add question" });
  }
}

export async function updateQuestion(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params; // Question ID
    const { examId, questionText, options, correctAnswer, explanation } = req.body;

    if (isInMemory()) {
      // Find the exam containing the question
      let foundExamIdx = -1;
      let foundQuestIdx = -1;

      for (let i = 0; i < memoryStore.exams.length; i++) {
        const qIdx = memoryStore.exams[i].questions.findIndex((q: any) => q._id.toString() === id);
        if (qIdx !== -1) {
          foundExamIdx = i;
          foundQuestIdx = qIdx;
          break;
        }
      }

      if (foundExamIdx === -1) {
        return res.status(404).json({ error: "Question not found in any exam" });
      }

      const q = memoryStore.exams[foundExamIdx].questions[foundQuestIdx];
      memoryStore.exams[foundExamIdx].questions[foundQuestIdx] = {
        ...q,
        questionText: questionText !== undefined ? questionText : q.questionText,
        options: options !== undefined ? options : q.options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : q.correctAnswer,
        explanation: explanation !== undefined ? explanation : q.explanation,
      };

      return res.status(200).json({
        message: "Question updated successfully",
        question: memoryStore.exams[foundExamIdx].questions[foundQuestIdx],
      });
    } else {
      // Look up and update question in nested array
      const exam = await (Exam as any).findOneAndUpdate(
        { "questions._id": id },
        {
          $set: {
            "questions.$.questionText": questionText,
            "questions.$.options": options,
            "questions.$.correctAnswer": correctAnswer,
            "questions.$.explanation": explanation,
          },
        },
        { new: true }
      );

      if (!exam) {
        return res.status(404).json({ error: "Question not found" });
      }

      const updated = exam.questions.find((q: any) => q._id.toString() === id);
      res.status(200).json({
        message: "Question updated successfully",
        question: updated,
      });
    }
  } catch (error: any) {
    console.error("Update Question Error:", error);
    res.status(500).json({ error: "Failed to update question" });
  }
}

export async function deleteQuestion(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params; // Question ID

    if (isInMemory()) {
      let found = false;
      for (let i = 0; i < memoryStore.exams.length; i++) {
        const qIdx = memoryStore.exams[i].questions.findIndex((q: any) => q._id.toString() === id);
        if (qIdx !== -1) {
          memoryStore.exams[i].questions.splice(qIdx, 1);
          found = true;
          break;
        }
      }

      if (!found) {
        return res.status(404).json({ error: "Question not found" });
      }

      return res.status(200).json({ message: "Question deleted successfully" });
    } else {
      const exam = await (Exam as any).findOneAndUpdate(
        { "questions._id": id },
        { $pull: { questions: { _id: id } } },
        { new: true }
      );

      if (!exam) {
        return res.status(404).json({ error: "Question not found" });
      }

      res.status(200).json({ message: "Question deleted successfully" });
    }
  } catch (error: any) {
    console.error("Delete Question Error:", error);
    res.status(500).json({ error: "Failed to delete question" });
  }
}

// --- RESULTS (ADMIN) ---

export async function getResults(req: AuthenticatedRequest, res: Response): Promise<any> {
  try {
    let submissions = [];

    if (isInMemory()) {
      submissions = memoryStore.submissions.map((s) => {
        const student = memoryStore.users.find((u) => u._id.toString() === s.studentId.toString());
        const exam = memoryStore.exams.find((e) => e._id.toString() === s.examId.toString());

        return {
          ...s,
          studentId: {
            _id: s.studentId,
            name: student ? student.name : "Unknown",
            email: student ? student.email : "Unknown",
          },
          examId: {
            _id: s.examId,
            title: exam ? exam.title : "Deleted Exam",
          },
        };
      });
    } else {
      submissions = await (Submission as any).find()
        .populate("studentId", "name email")
        .populate("examId", "title")
        .sort({ submittedAt: -1 });
    }

    res.status(200).json(submissions);
  } catch (error: any) {
    console.error("Get Admin Results Error:", error);
    res.status(500).json({ error: "Failed to retrieve results" });
  }
}
