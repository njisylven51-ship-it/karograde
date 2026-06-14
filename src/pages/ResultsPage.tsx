import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Award,
  CircleCheck,
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Check,
  X,
  Info
} from "lucide-react";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve feedback and metadata passed via react router state
  const stateData = location.state as {
    feedbackDetails?: {
      score: number;
      totalQuestions: number;
      percentage: number;
      feedback: Array<{
        _id: string;
        questionText: string;
        options: string[];
        correctAnswer: string;
        selectedAnswer: string;
        isCorrect: boolean;
        explanation: string;
      }>;
      submittedAt: string;
    };
    examTitle?: string;
  };

  if (!stateData || !stateData.feedbackDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 font-display">Grade Slip Missing</h2>
          <p className="text-xs text-slate-550 leading-relaxed bg-yellow-50 border border-yellow-100 p-3.5 rounded-xl">
            No grade record found in the routing active context. This occurs if you reload the results directly.
          </p>
          <Link
            to="/student-dashboard"
            className="inline-flex py-2.5 px-6 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Go Back to Cabinet
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, feedback, submittedAt } = stateData.feedbackDetails;
  const examTitle = stateData.examTitle || "Autonomous MCQ Evaluation";
  
  const isPass = percentage >= 50;

  return (
    <div id="results-page-screen" className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
        
        {/* Simple Top Banner Branding */}
        <div className="flex items-center justify-between border-b border-light-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-display font-bold text-slate-800 text-sm"> KaroGrade Reporting</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Slip issued: {new Date(submittedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Dynamic score summary dial (Bento box look) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm grid md:grid-cols-12 gap-6 items-center">
          
          {/* Left stats column: Circular percentage container (5 columns) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
            <div
              className={`h-28 w-28 rounded-full flex flex-col items-center justify-center border-4 font-mono ${
                isPass
                  ? "bg-green-50/50 border-green-500 text-green-700"
                  : "bg-red-50/50 border-red-500 text-red-700"
              }`}
            >
              <span className="text-3xl font-extrabold tracking-tight">{percentage}%</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Graded Score</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1">
              <BookOpenCheck className="h-4 w-4 text-blue-500" /> Score: {score} / {totalQuestions} Correct
            </p>
          </div>

          {/* Right stats column: Text feedback and descriptions (7 columns) */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grading Summary Report</h2>
              <h3 className="font-display font-extrabold text-slate-900 text-lg leading-snug">
                {examTitle}
              </h3>
            </div>

            <div className="space-y-2">
              {isPass ? (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200 text-green-800 text-xs font-bold rounded-lg leading-none">
                  <CircleCheck className="h-4 w-4 shrink-0" /> Academic Passed with Honors
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-105 border border-red-200 text-red-800 text-xs font-bold rounded-lg leading-none">
                  <AlertCircle className="h-4 w-4 shrink-0" /> Academic Remediation Recommended
                </div>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">
                {isPass
                  ? "Outstanding efforts! You completed the course criteria successfully. Review incorrect choices below to refine details further."
                  : "Score lies below passing margin (50%). Study core feedback structures and corrections before registering on upcoming blocks."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/student-dashboard"
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
              >
                Return to Student Cabinet <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Correction sheets */}
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            🗒️ Detailed Correction & Explanations Review
          </h3>

          <div className="space-y-5">
            {feedback.map((f, idx) => (
              <div
                key={f._id}
                className={`bg-white border rounded-2xl p-5 md:p-6 shadow-sm space-y-4 border-l-4 ${
                  f.isCorrect ? "border-l-green-500" : "border-l-red-500"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-slate-400">
                      QUESTION {idx + 1} • {f.isCorrect ? "CORRECT ✓" : "INCORRECT ✗"}
                    </p>
                    <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                      {f.questionText}
                    </h4>
                  </div>
                </div>

                {/* MCQ option indicators listing */}
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {f.options.map((opt, oIdx) => {
                    const optLet = ["A", "B", "C", "D"][oIdx];
                    const isStudentSelected = f.selectedAnswer.trim() === opt.trim();
                    const isTargetCorrect = f.correctAnswer.trim() === opt.trim();

                    let blockStyle = "bg-slate-50 border-slate-200 text-slate-750";
                    let letStyle = "bg-white border-slate-250 text-slate-500";

                    if (isTargetCorrect) {
                      blockStyle = "bg-green-50 border-green-200 text-green-800 font-bold";
                      letStyle = "bg-green-500 border-green-500 text-white";
                    } else if (isStudentSelected && !f.isCorrect) {
                      blockStyle = "bg-red-50 border-red-200 text-red-800 font-bold";
                      letStyle = "bg-red-500 border-red-500 text-white";
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`px-4 py-2 text-xs rounded-xl border flex items-center gap-3 ${blockStyle}`}
                      >
                        <span
                          className={`h-5.5 w-5.5 font-mono text-[10px] rounded-full flex items-center justify-center border font-bold shrink-0 ${letStyle}`}
                        >
                          {optLet}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isTargetCorrect && <Check className="h-4.5 w-4.5 text-green-600 ml-auto shrink-0" />}
                        {isStudentSelected && !f.isCorrect && <X className="h-4.5 w-4.5 text-red-600 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-100 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wide text-slate-500 text-[10px] mb-1">
                      Automated Correction Pedagogics
                    </h5>
                    <p className="leading-relaxed">
                      {f.explanation || "No specialized clarification was appended by the coordinate editor. Study general textbook definitions on this subject."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
