import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Page Imports
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import ResultsPage from "./pages/ResultsPage";

// Route Guard for authenticated users and correct Role access
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ("ADMIN" | "STUDENT")[];
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-mono">Verifying credentials security...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    const targetDashboard = user.role === "ADMIN" ? "/admin-dashboard" : "/student-dashboard";
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};

// Route Guard for Guest users (prevents viewing login/register pages if already authenticated)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-mono">Loading dynamic cabinet settings...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const targetDashboard = user.role === "ADMIN" ? "/admin-dashboard" : "/student-dashboard";
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Core Guest routes available */}
        <Route path="/" element={<Landing />} />
        
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />

        {/* ADMIN (Teacher) Protected Dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create-exam"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateExam />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/edit-exam/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateExam />
            </ProtectedRoute>
          }
        />

        {/* STUDENT Protected Cabinets */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/take-exam/:id"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <TakeExam />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/results-slip"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Direct link fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
