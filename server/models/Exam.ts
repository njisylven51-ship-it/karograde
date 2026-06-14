import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [
      (arr: string[]) => arr.length >= 2,
      "A question must have at least 2 options",
    ],
  },
  correctAnswer: {
    type: String, // Value matches one of the options or index (we will store option text)
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
});

const ExamSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 30,
  },
  questions: {
    type: [QuestionSchema],
    default: [],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Exam = mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
export const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
