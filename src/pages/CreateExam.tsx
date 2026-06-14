import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Trash2,
  ListPlus,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

interface QuestionInput {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function CreateExam() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Editing mode if id exists
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active question being created inside the drawer form
  const [qText, setQText] = useState("");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrect, setQCorrect] = useState("A");
  const [qExplanation, setQExplanation] = useState("");
  const [qLocalError, setQLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchExam = async () => {
        setFetching(true);
        setError(null);
        try {
          const response = await api.get(`/student/exams/${id}`);
          const exam = response.data;
          
          // Since getStudentExamById strips correct answers due to cheaters, 
          // let's check: can we fetch via admin? Ah! In server, getExams gets all exams with answers!
          // Let's filter correct exam from the admin list to populate.
          const adminExamsRes = await api.get('/admin/exams');
          const fullExam = adminExamsRes.data.find((e: any) => e._id === id);

          if (fullExam) {
            setTitle(fullExam.title);
            setDescription(fullExam.description || "");
            setDuration(fullExam.duration || 30);
            setQuestions(fullExam.questions || []);
          } else {
            setError("Exam records could not be fetched or you are unauthorized.");
          }
        } catch (err: any) {
          console.error(err);
          setError("Failed to retrieve exam details for editing.");
        } finally {
          setFetching(false);
        }
      };
      fetchExam();
    }
  }, [id, isEditMode]);

  const handleAddQuestionToExam = () => {
    setQLocalError(null);

    if (!qText.trim()) {
      setQLocalError("Question description text is mandatory.");
      return;
    }
    if (!qOptA.trim() || !qOptB.trim() || !qOptC.trim() || !qOptD.trim()) {
      setQLocalError("All 4 multiple-choice options (A, B, C, D) are required.");
      return;
    }

    const optionsArray = [qOptA.trim(), qOptB.trim(), qOptC.trim(), qOptD.trim()];
    let correctValue = "";
    if (qCorrect === "A") correctValue = qOptA.trim();
    if (qCorrect === "B") correctValue = qOptB.trim();
    if (qCorrect === "C") correctValue = qOptC.trim();
    if (qCorrect === "D") correctValue = qOptD.trim();

    const newQuestion: QuestionInput = {
      questionText: qText.trim(),
      options: optionsArray,
      correctAnswer: correctValue,
      explanation: qExplanation.trim(),
    };

    setQuestions((prev) => [...prev, newQuestion]);

    // Reset single question form inputs
    setQText("");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQCorrect("A");
    setQExplanation("");
  };

  const handleRemoveQuestionFromExam = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Exam title is required.");
      return;
    }
    if (duration <= 0) {
      setError("Duration must be a positive integer.");
      return;
    }
    if (questions.length === 0) {
      setError("Please add at least 1 MCQ question to build this exam.");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      durationCount: duration, // we parse on server as well
      duration: duration,
      questions,
    };

    try {
      if (isEditMode) {
        await api.put(`/admin/exams/${id}`, payload);
      } else {
        await api.post("/admin/exams", payload);
      }
      navigate("/admin-dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to finalize exam deployment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-exam-container" className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb nav */}
        <div className="flex items-center justify-between border-b border-light-slate-100 pb-4">
          <Link
            to="/admin-dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-display font-bold text-slate-800 text-sm"> KaroGrade Studio</span>
          </div>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-950">
            {isEditMode ? "Edit Examination Questions" : "Deploy Multiple Choice Examination"}
          </h1>
          <p className="text-slate-500 text-xs mt-1">Configure test title, durations, multiple choices, and automatic feedback explanation structures.</p>
        </div>

        {error && (
          <div className="flex gap-2 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Loading examination specifics...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveExam} className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT PANEL: Basic Exam Details & Questions Queue (7 Columns) */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Card 1: Exam Settings */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-display font-extrabold text-sm uppercase text-slate-450 tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" /> Exam Parameters
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Exam Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-slate-55 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm rounded-xl outline-none"
                    placeholder="E.g., Intro to Microeconomics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Test Duration (Mins)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full px-4 py-2 bg-slate-55 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm rounded-xl outline-none font-mono"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Total MCQ Queue</label>
                    <div className="h-9 px-4 bg-slate-50 border border-slate-200 flex items-center text-sm font-semibold text-slate-700 rounded-xl">
                      {questions.length} Question{questions.length === 1 ? "" : "s"} Created
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Short Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-55 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm rounded-xl outline-none resize-none"
                    placeholder="Short summary/rules outlining the scope of the assessment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Card 2: Questions Queue */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-display font-extrabold text-sm uppercase text-slate-450 tracking-wider">
                  Question Queue List
                </h2>

                {questions.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400">
                    <ListPlus className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">Queue is currently empty.</p>
                    <p className="text-[10px] mt-0.5">Use the questions creator on the right to populate your exam.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-xs font-semibold text-slate-800">
                            <span className="text-blue-600 font-bold font-mono">Q{idx + 1}:</span> {q.questionText}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromExam(idx)}
                            className="bg-white border border-slate-200 text-slate-500 hover:text-red-650 p-1.5 rounded-lg transition-colors cursor-pointer shadow-sm hover:border-red-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>

                        {/* Options indicators */}
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const mapLet = ["A", "B", "C", "D"][oIdx];
                            const isCorrectVal = opt.trim() === q.correctAnswer.trim();
                            return (
                              <div
                                key={oIdx}
                                className={`text-[11px] px-2.5 py-1.5 rounded border ${
                                  isCorrectVal
                                    ? "bg-green-50 border-green-200 text-green-700 font-bold"
                                    : "bg-white border-slate-100 text-slate-550"
                                } truncate`}
                              >
                                {mapLet}. {opt} {isCorrectVal && "✓"}
                              </div>
                            );
                          })}
                        </div>
                        
                        {q.explanation && (
                          <p className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-200/50 pt-2 bg-white/40 p-1.5 rounded-lg">
                            <span className="font-semibold text-slate-600 uppercase">Correction Note:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-blue-500/10 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 animate-spin" /> Saving parameters...
                  </>
                ) : isEditMode ? (
                  "Deploy Final Changes"
                ) : (
                  "Finalize and Publish Exam"
                )}
              </button>
            </div>

            {/* RIGHT PANEL: Question Creator Input block (5 Columns) */}
            <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
              <h2 className="font-display font-extrabold text-sm uppercase text-slate-450 tracking-wider flex items-center gap-2">
                <ListPlus className="h-4 w-4 text-purple-600" /> Add MCQ Question
              </h2>

              {qLocalError && (
                <div className="flex gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-[11px]">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <p>{qLocalError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Question Text</label>
                <textarea
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs rounded-xl outline-none resize-none"
                  placeholder="Describe what is being evaluated..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                />
              </div>

              {/* A/B/C/D Inputs */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>OPTION A</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs rounded-lg outline-none"
                    placeholder="Enter choice A text"
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>OPTION B</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs rounded-lg outline-none"
                    placeholder="Enter choice B text"
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>OPTION C</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs rounded-lg outline-none"
                    placeholder="Enter choice C text"
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>OPTION D</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs rounded-lg outline-none"
                    placeholder="Enter choice D text"
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                  />
                </div>
              </div>

              {/* Selection for Correct choice */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650">Select Correct Choice Option</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs"
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                  >
                    <option value="A">Choice A</option>
                    <option value="B">Choice B</option>
                    <option value="C">Choice C</option>
                    <option value="D">Choice D</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mistakes Explanation / Correction Note</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs rounded-xl outline-none resize-none"
                  placeholder="Summarize key details explaining why this option text is correct..."
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleAddQuestionToExam}
                className="w-full flex items-center justify-center gap-1 py-2 bg-purple-650 border border-purple-200 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Append Question to Queue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
