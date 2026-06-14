import mongoose, { Schema } from "mongoose";

const AnswerSchema = new Schema({
  questionId: {
    type: String, // String representation or ObjectId of question
    required: true,
  },
  selectedAnswer: {
    type: String, // Text of the selected answer
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const SubmissionSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  answers: {
    type: [AnswerSchema],
    default: [],
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique constraint: studentId + examId
SubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export const Submission = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
export const SavedAnswer = mongoose.models.SavedAnswer || mongoose.model("SavedAnswer", AnswerSchema);
