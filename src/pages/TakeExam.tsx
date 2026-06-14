import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import {
  GraduationCap,
  Clock,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  HelpCircleIcon
} from "lucide-react";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
}

interface SelectedAnswer {
  questionId: string;
  selectedAnswer: string;
}

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState(30); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  
  // Submit modal warning state
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/student/exams/${id}`);
        const exam = response.data;
        setExamTitle(exam.title);
        setQuestions(exam.questions || []);
        setDuration(exam.duration || 30);
        setTimeLeft((exam.duration || 30) * 60);

        // Prefill empty answers array
        const initialAnswers = (exam.questions || []).map((q: any) => ({
          questionId: q._id,
          selectedAnswer: "",
        }));
        setAnswers(initialAnswers);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            "This exam could not be fetched. If you've already attempted it, multiple attempts are locked."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // Timed counter down action
  useEffect(() => {
    if (loading || error) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit when times out!
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error]);

  const handleSelectOption = (optionText: string) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionId === questions[currentIndex]._id
          ? { ...ans, selectedAnswer: optionText }
          : ans
      )
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post("/student/submit", {
        examId: id,
        answers,
      });
      // Redirect students directly to results dashboard, supplying feedback body!
      navigate("/results-slip", { state: { feedbackDetails: response.data, examTitle } });
    } catch (err: any) {
      console.error(err);
      alert("An error occurred while automatically grading your exam: " + (err.response?.data?.error || err.message));
      navigate("/student-dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const processFormFinish = async () => {
    setShowSubmitWarning(false);
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post("/student/submit", {
        examId: id,
        answers,
      });
      // Navigate to results slip, carrying response and title in React state
      navigate("/results-slip", { state: { feedbackDetails: response.data, examTitle } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Grading core submitted answers failed.");
      setSubmitting(false);
    }
  };

  const handleManualSubmitTrigger = () => {
    // Check if there are unanswered questions
    const unanswered = answers.filter((ans) => !ans.selectedAnswer).length;
    if (unanswered > 0) {
      setShowSubmitWarning(true);
    } else {
      processFormFinish();
    }
  };

  // Human readable clocks
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const activeAnswerObj = answers.find(
    (ans) => ans.questionId === questions[currentIndex]?._id
  );
  const activeSelectedValue = activeAnswerObj ? activeAnswerObj.selectedAnswer : "";

  const unansweredCount = answers.filter((ans) => !ans.selectedAnswer).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">Establishing secure exam connections...</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Downloading syllabus and testing metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 font-display">Exam Session Unauthorized</h2>
          <p className="text-xs text-slate-500 leading-relaxed bg-red-50/50 p-4 border border-red-100 rounded-xl">
            {error}
          </p>
          <Link
            to="/student-dashboard"
            className="inline-flex py-2.5 px-6 shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Go Back to Cabinet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="take-exam-screen" className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Top Session Progress Bar */}
      <header className="border-b border-slate-200/80 bg-white h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="border-l border-slate-200 pl-3">
            <h1 className="font-display font-black text-sm text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-[400px]">
              {examTitle}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Student Evaluation Session</p>
          </div>
        </div>

        {/* Counter Clock */}
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-1.5 rounded-full font-mono text-xs font-extrabold shadow-sm shrink-0">
          <Clock className="h-4 w-4 text-red-600 animate-pulse" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main interactive testing viewport container */}
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Grid of question navigation indices (4 Columns) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Evaluation Progress Grid
          </h2>
          
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 gap-2.5">
            {questions.map((q, idx) => {
              const matchedAns = answers.find((ans) => ans.questionId === q._id);
              const isAnswered = matchedAns && !!matchedAns.selectedAnswer;
              const isActive = idx === currentIndex;

              let btnClass = "bg-slate-50 border border-slate-200 text-slate-600";
              if (isAnswered) btnClass = "bg-blue-50 border border-blue-200 text-blue-700 font-semibold";
              if (isActive) btnClass = "bg-blue-600 border border-blue-600 text-white font-black shadow-md";

              return (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-500 space-y-1">
            <p className="flex justify-between font-medium">
              <span>Answered:</span>
              <span className="font-bold text-blue-600">{questions.length - unansweredCount}</span>
            </p>
            <p className="flex justify-between font-medium">
              <span>Unanswered:</span>
              <span className="font-bold text-orange-500">{unansweredCount}</span>
            </p>
          </div>
        </div>

        {/* Right column: The questionnaire module content cards (8 Columns) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Question card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-1.5 text-xs text-blue-650 font-bold font-mono">
              <HelpCircle className="h-4.5 w-4.5 text-blue-600" /> QUESTION {currentIndex + 1} OF {questions.length}
            </div>

            <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg leading-relaxed">
              {questions[currentIndex]?.questionText}
            </h3>

            {/* MCQ Options Radio Grid */}
            <div className="space-y-3">
              {questions[currentIndex]?.options.map((option, oIdx) => {
                const isSelected = activeSelectedValue === option;
                const optLetter = ["A", "B", "C", "D"][oIdx];

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border flex items-center gap-4 transition-all outline-none cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 text-blue-800 font-bold"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 font-mono text-xs rounded-full flex items-center justify-center border font-bold shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-250 text-slate-500"
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="text-xs sm:text-sm">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls bottom row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-250 disabled:opacity-40 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Save & Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Save & Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleManualSubmitTrigger}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-455 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Grading...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Finish & Grade Exam
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* MODAL WINDOW: Unanswered questions submit warning card */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <HelpCircleIcon className="h-12 w-12 text-orange-500 mx-auto" />
            <h3 className="font-display font-extrabold text-slate-900 text-lg">Unanswered Questions</h3>
            <p className="text-xs text-slate-500 leading-relaxed bg-orange-50 p-3.5 rounded-xl border border-orange-100">
              You have <span className="font-extrabold text-orange-650">{unansweredCount}</span> unanswered questions. 
              Submitting now will grade these omissions as incorrect. Are you sure you wish to submit?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-750 font-bold text-xs rounded-xl cursor-pointer"
              >
                Go back and complete
              </button>
              <button
                onClick={processFormFinish}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Grade Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
