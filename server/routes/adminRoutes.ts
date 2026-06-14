import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getResults,
} from "../controllers/adminController";

const router = Router();

// Apply auth is mandatory for all admin endpoints
router.use(authenticate);
router.use(authorize(["ADMIN"]));

// Exams management
router.post("/exams", createExam);
router.get("/exams", getExams);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);

// Questions management
router.post("/questions", addQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// View students grades
router.get("/results", getResults);

export default router;
