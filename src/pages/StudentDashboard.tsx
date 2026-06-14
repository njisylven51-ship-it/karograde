import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  GraduationCap,
  LogOut,
  FolderOpen,
  Award,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp, Calendar, Info
} from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, submissionsRes] = await Promise.all([
        api.get("/student/exams"),
        api.get("/student/results"),
      ]);
      setExams(examsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load student cabinet details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Student stats
  const totalCompleted = submissions.length;
  
  const avgScore = totalCompleted > 0
    ? Number((submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalCompleted).toFixed(1))
    : 0;

  const passedCount = submissions.filter((s) => (s.percentage || 0) >= 50).length;

  return (
    <div id="student-dashboard" className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Navigation Row */}
      <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-800">
              Karo<span className="text-blue-600">Grade</span> Cabinet
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-green-600 font-mono tracking-wider font-semibold">STUDENT ACCOUNT</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-650 hover:bg-red-50 px-3 py-2 rounded-lg border border-slate-200/50 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Welcome and Stats Cards */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-slate-950">Welcome, {user?.name}!</h1>
            <p className="text-slate-500 text-xs mt-1">Review available exam sessions, submit answers, and check instant corrective annotations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3.5 p-1">
              <div className="h-10 w-10 text-blue-600 bg-blue-50 border border-blue-100/50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Exams Completed</p>
                <p className="text-lg font-display font-bold text-slate-905">{totalCompleted}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-1">
              <div className="h-10 w-10 text-green-600 bg-green-50 border border-green-100/50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Average Success</p>
                <p className="text-lg font-display font-bold text-slate-900">{avgScore}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-1">
              <div className="h-10 w-10 text-purple-600 bg-purple-50 border border-purple-100/50 rounded-xl flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Passing Rate</p>
                <p className="text-lg font-display font-bold text-slate-900">{passedCount} Exam{passedCount === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex gap-2 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Loading dynamic examination cabinet...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Available Exams (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                📋 Available Examination Sessions
              </h2>

              {exams.length === 0 ? (
                <div className="border border-slate-200 border-dashed rounded-2xl p-12 text-center bg-white">
                  <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-800 font-bold mb-1 col-span-3">No active exams posted</p>
                  <p className="text-slate-500 text-xs">A coordinator has not yet finalized any MCQ testing programs for this course.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => {
                    const isCompleted = exam.completed;
                    
                    return (
                      <div
                        key={exam._id}
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                          isCompleted
                            ? "border-slate-200/60 opacity-80 bg-white/60"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-3">
                            <h3 className="font-display font-extrabold text-slate-950 text-base">
                              {exam.title}
                            </h3>
                            {isCompleted && (
                              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-mono">
                                <CheckCircle className="h-3 w-3" /> COMPLETED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {exam.description || "Testing instructions and syllabus parameters."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100/80 pt-4">
                          <div className="flex gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>{exam.duration} Minutes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span>{exam.questions?.length || 0} Questions</span>
                            </div>
                          </div>

                          {isCompleted ? (
                            <Link
                              to="/historical-results"
                              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-blue-100"
                            >
                              View Correction Explanations
                            </Link>
                          ) : (
                            <Link
                              to={`/take-exam/${exam._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
                            >
                              Take Exam <ChevronRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Submission History & Analysis (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                🏆 Historical Grade Reports
              </h2>

              {submissions.length === 0 ? (
                <div className="border border-slate-200 border-dashed rounded-2xl p-8 text-center bg-white space-y-2">
                  <Award className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-slate-700 text-xs font-semibold">No finished exams on file</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Info className="h-3.5 w-3.5 text-blue-500 inline mr-1" />
                    Completing an available exam computes automatic corrections and loads detailed breakdowns right here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h4 className="font-display font-bold text-slate-900 text-xs line-clamp-1">
                            {sub.examId?.title || "Deleted Examination"}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 h-10 w-10 rounded-full flex flex-col items-center justify-center font-bold font-mono text-xs border ${
                            sub.percentage >= 80
                              ? "bg-green-50 border-green-200 text-green-700"
                              : sub.percentage >= 50
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-red-50 border-red-200 text-red-700"
                          }`}
                        >
                          <span className="text-[11px] font-extrabold leading-none">{sub.percentage}%</span>
                        </span>
                      </div>

                      <div className="flex border-t border-slate-100 mt-3 pt-3.5 justify-between text-[11px] text-slate-550 items-center">
                        <span className="font-medium">
                          Score: {sub.score} <span className="text-slate-400">/ {sub.totalQuestions}</span>
                        </span>
                        
                        {/* Dynamic quick check */}
                        <span className={`font-semibold ${sub.percentage >= 50 ? "text-green-600" : "text-red-500"}`}>
                          {sub.percentage >= 50 ? "Passed ✓" : "Needs Review ✗"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
