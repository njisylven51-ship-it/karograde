import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  GraduationCap,
  LogOut,
  FolderOpen,
  Users,
  Plus,
  FileText,
  Clock,
  Trash2,
  TrendingUp,
  Award,
  AlertCircle,
  Loader2,
  Calendar, CheckCircle, Search
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"exams" | "results" | "analytics">("exams");
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [examSearch, setExamSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get("/admin/exams"),
        api.get("/admin/results"),
      ]);
      setExams(examsRes.data);
      setResults(resultsRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load admin dashboards data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this exam? This will erase all student submissions linked to this exam permanently.")) {
      return;
    }

    try {
      await api.delete(`/admin/exams/${examId}`);
      // Refresh local lists
      setExams((prev) => prev.filter((e) => e._id !== examId));
      setResults((prev) => prev.filter((r) => r.examId && r.examId._id !== examId));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete exam.");
    }
  };

  // Filter exams based on search query
  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(examSearch.toLowerCase()))
  );

  // Filter results based on search query
  const filteredResults = results.filter((r) =>
    (r.studentId?.name || "Unknown").toLowerCase().includes(studentSearch.toLowerCase()) ||
    (r.studentId?.email || "Unknown").toLowerCase().includes(studentSearch.toLowerCase()) ||
    (r.examId?.title || "Deleted Exam").toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Stats Calculations
  const totalExams = exams.length;
  const totalSubmissions = results.length;
  
  const avgPercentage = totalSubmissions > 0
    ? Number((results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalSubmissions).toFixed(1))
    : 0;

  const passedCount = results.filter((r) => (r.percentage || 0) >= 50).length;
  const passRate = totalSubmissions > 0
    ? Number(((passedCount / totalSubmissions) * 100).toFixed(1))
    : 0;

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-800">
              Karo<span className="text-blue-600">Grade</span> Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-purple-600 font-mono tracking-wider font-semibold">COORDINATOR (TEACHER)</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg border border-slate-200/50 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-slate-950">Welcome, {user?.name}!</h1>
            <p className="text-slate-500 text-xs mt-1">Configure grading schemes, build multi-choice exams, and audit performance reports real-time.</p>
          </div>
          <Link
            to="/create-exam"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create New Exam
          </Link>
        </div>

        {/* Dynamic Analytics summary banner (Bento grids style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1.5">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Active Exams</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-display font-bold text-slate-900">{totalExams}</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono">Total Created</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1.5">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Total Submissions</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-display font-bold text-slate-900">{totalSubmissions}</span>
              <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-mono">Completed</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1.5">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Average Grade</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-display font-bold text-slate-900">{avgPercentage}%</span>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-mono">Performance</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1.5">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Pass Rate (≥50%)</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-display font-bold text-slate-900">{passRate}%</span>
              <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-mono">{passedCount} Students</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab("exams")}
            className={`pb-3 font-display font-bold text-sm tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === "exams"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📋 Manage Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`pb-3 font-display font-bold text-sm tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === "results"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🎓 Grading Gradebook ({results.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 font-display font-bold text-sm tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📊 Detailed Analytics
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex gap-2 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loader State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Synchronizing assessment records...</p>
          </div>
        ) : (
          <div>
            {/* TABS VIEWPORT */}
            {activeTab === "exams" && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-sm">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Search examinations by title..."
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                  />
                </div>

                {filteredExams.length === 0 ? (
                  <div className="border border-slate-200 border-dashed rounded-2xl p-12 text-center bg-white">
                    <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold mb-1">No examinations configured yet</p>
                    <p className="text-slate-500 text-xs mb-4">Launch your first multiple-choice classroom evaluation directly.</p>
                    <Link
                      to="/create-exam"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Start Exam Creator
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                      <div
                        key={exam._id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 relative"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-display font-extrabold text-slate-950 line-clamp-1">
                              {exam.title}
                            </h3>
                            <button
                              onClick={() => handleDeleteExam(exam._id)}
                              className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Exam"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                            {exam.description || "No description provided."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-slate-600 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{exam.duration} mins</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <span>{exam.questions?.length || 0} MCQs</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link
                            to={`/edit-exam/${exam._id}`}
                            className="flex-grow text-center text-xs font-semibold py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Edit Questions
                          </Link>
                          <button
                            onClick={() => {
                              // Direct action representation: View results filtered by this exam
                              setActiveTab("results");
                              setStudentSearch(exam.title);
                            }}
                            className="text-xs font-semibold px-3 py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            Results
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex justify-between items-center">
                  <div className="relative max-w-sm w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Search by student name, email, or exam..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch("")}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>

                {filteredResults.length === 0 ? (
                  <div className="border border-slate-200 border-dashed rounded-2xl p-12 text-center bg-white">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold mb-1">No grader filings synchronized</p>
                    <p className="text-slate-500 text-xs">Students have not yet completed any MCQ test evaluations matching your filtration.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <th className="py-3 px-5">Student Details</th>
                            <th className="py-3 px-5">Completed Exam</th>
                            <th className="py-3 px-4 text-center">Score Grade</th>
                            <th className="py-3 px-4 text-center">Percentage</th>
                            <th className="py-3 px-4">Completion Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredResults.map((result) => (
                            <tr key={result._id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-5">
                                <div className="font-bold text-slate-800">
                                  {result.studentId?.name || "Unknown Student"}
                                </div>
                                <div className="text-slate-450 text-[10px] font-mono">
                                  {result.studentId?.email || "Unknown Email"}
                                </div>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="font-semibold text-slate-700">
                                  {result.examId?.title || "Deleted Exam"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                                {result.score} <span className="text-slate-400">/ {result.totalQuestions}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`px-2 py-1 rounded font-bold font-mono text-[11px] ${
                                    result.percentage >= 70
                                      ? "bg-green-50 text-green-700"
                                      : result.percentage >= 50
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {result.percentage}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                                {new Date(result.submittedAt).toLocaleDateString()} at{" "}
                                {new Date(result.submittedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Card 1: Exam difficulty metrics */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-5 w-5 text-blue-600" /> Grade Distribution Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 items-center">
                        <span className="font-semibold text-green-600">Excellent (≥ 80%)</span>
                        <span className="font-mono font-bold text-slate-800">
                          {results.filter((r) => r.percentage >= 80).length} / {totalSubmissions}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${
                              totalSubmissions > 0
                                ? (results.filter((r) => r.percentage >= 80).length / totalSubmissions) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 items-center">
                        <span className="font-semibold text-blue-600">Average Passed (50% - 79%)</span>
                        <span className="font-mono font-bold text-slate-800">
                          {results.filter((r) => r.percentage >= 50 && r.percentage < 80).length} / {totalSubmissions}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              totalSubmissions > 0
                                ? (results.filter((r) => r.percentage >= 50 && r.percentage < 80).length /
                                    totalSubmissions) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 items-center">
                        <span className="font-semibold text-red-600">Needs Academic Help (&lt; 50%)</span>
                        <span className="font-mono font-bold text-slate-800">
                          {results.filter((r) => r.percentage < 50).length} / {totalSubmissions}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${
                              totalSubmissions > 0
                                ? (results.filter((r) => r.percentage < 50).length / totalSubmissions) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Highest Performing Student list */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-purple-600" /> Highest Scorers Honor Roll
                  </h3>
                  {results.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 text-center">No student metrics documented yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                      {[...results]
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 5)
                        .map((res, i) => (
                          <div key={res._id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-slate-400 font-bold w-4">#{i + 1}</span>
                              <div>
                                <p className="font-bold text-slate-800">{res.studentId?.name || "Unknown"}</p>
                                <p className="text-[10px] text-slate-450 line-clamp-1">{res.examId?.title}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-green-600">{res.percentage}%</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
