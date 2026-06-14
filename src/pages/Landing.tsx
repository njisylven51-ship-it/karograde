import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Award, CheckCircle2, ShieldCheck, ArrowRight, NotebookPen, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div id="landing-container" className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header id="landing-header" className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Karo<span className="text-blue-600">Grade</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section id="hero" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <Award className="h-3.5 w-3.5" /> Next-Gen Assessment Suite
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Instant. Automated. <br />
              <span className="text-blue-600">Cheating-Proof MCQ</span> Grading.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              KaroGrade simplifies testing for educational institutions. Teachers create exams, students submit answers online, and the system delivers instant, granular corrections with automated feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex justify-center items-center gap-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center items-center gap-2 text-base font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-xl shadow-sm transition-all"
              >
                Teacher/Student Sign In
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            {/* Visual Decorative Card Grid representing grading */}
            <div className="relative border border-slate-200 bg-white rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-light-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Assessment Completed</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">EX-2026</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400">EXAM TITLE</p>
                <p className="text-base font-display font-semibold text-slate-800">Advanced Computer Networks</p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Automated Grade</p>
                  <p className="text-3xl font-display font-bold text-green-600">92%</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Correct Answers</p>
                  <p className="text-3xl font-display font-bold text-slate-800">23<span className="text-slate-400 text-lg">/25</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 items-center">
                  <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 className="h-4 w-4" /> Passed with Honours</span>
                  <span className="font-mono text-slate-400">Time Taken: 14 mins</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
            {/* Overlay Absolute Accent Badges */}
            <div className="absolute -top-4 -right-4 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-800 uppercase leading-none">Strict Anti-Cheat</p>
                <p className="text-[9px] text-slate-400 font-mono">1-Attempt Locked</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Split */}
        <section id="features" className="py-16 bg-white border-t border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
                Specially Engineered for Academic Integrity & Speed
              </h2>
              <p className="text-slate-500 text-sm">
                KaroGrade bridges the gap between digital examinations and robust, immutable evaluation architectures.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <NotebookPen className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">Complete MCQ Engine</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Admins design exams complete with custom multiple-choice options, configure matching answers, and add specific pedagogical clarifications for mistakes.
                </p>
              </div>

              <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">1-Attempt Constraint</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Permanently lock tests upon submission. Backend compound indexes reject repeat filings, avoiding double-submits or user manipulation efforts.
                </p>
              </div>

              <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">Instant Grading & Feedback</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submissions are graded immediately upon receipt. Students get immediate dashboards showing incorrect decisions alongside complete analytical breakdowns.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="h-5 w-5 text-blue-500" />
            <span className="font-display font-bold">KaroGrade</span>
          </div>
          <p className="text-slate-500">© 2026 KaroGrade Assessment Solutions. Created for academic excellence.</p>
        </div>
      </footer>
    </div>
  );
}
