import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Lock, Mail, User, ShieldAlert, Loader2, AlertCircle } from "lucide-react";

export default function Signup() {
  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STUDENT">("STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!name || !email || !password) {
      setLocalError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signup(name, email, password, role);
      // Route based on role selection
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err: any) {
      // Error is stored globally in AuthContext but we catch to stop spinner
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="signup-screen" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 justify-center">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="font-display font-bold text-2xl tracking-tight">
              Karo<span className="text-blue-600">Grade</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 font-display">Create your account</h2>
          <p className="text-slate-500 text-xs">Join KaroGrade to create, take, or auto-grade examinations</p>
        </div>

        {/* Errors Block */}
        {(localError || error) && (
          <div className="flex gap-2 bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registration Error</p>
              <p className="opacity-90">{localError || error}</p>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="name-input">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name-input"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none text-slate-800 placeholder-slate-400"
                placeholder="Dr. Thomas Miller or Alice Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="email-input">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email-input"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none text-slate-800 placeholder-slate-400"
                placeholder="tmiller@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="password-input">
              Password (Min 6 chars)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password-input"
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Identify Your Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                  role === "STUDENT"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 font-bold"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold leading-none ${role === "STUDENT" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  S
                </div>
                <span>I'm a Student</span>
              </button>

              {/* Teacher (Admin) Role */}
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                  role === "ADMIN"
                    ? "border-purple-600 bg-purple-50/50 text-purple-700 font-bold"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold leading-none ${role === "ADMIN" ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  T
                </div>
                <span>I'm a Teacher</span>
              </button>
            </div>
            {role === "ADMIN" && (
              <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1 mt-1 bg-purple-50 px-2.5 py-1 rounded">
                <ShieldAlert className="h-3.5 w-3.5" /> Generates Exam structures, edits question details, and views grading sheets.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Structuring account...
              </>
            ) : (
              "Complete Sign Up"
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
