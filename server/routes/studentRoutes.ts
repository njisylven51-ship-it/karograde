import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getStudentExams,
  getStudentExamById,
  submitExam,
  getStudentResults,
} from "../controllers/studentController";

const router = Router();

// Apply auth is mandatory for all student endpoints
router.use(authenticate);
router.use(authorize(["STUDENT"]));

router.get("/exams", getStudentExams);
router.get("/exams/:id", getStudentExamById);
router.post("/submit", submitExam);
router.get("/results", getStudentResults);

export default router;
