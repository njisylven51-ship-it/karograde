import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, role: "ADMIN" | "STUDENT") => Promise<any>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reload state if token exists in localStorage
    const savedToken = localStorage.getItem("karograde_token");
    const savedUser = localStorage.getItem("karograde_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Corrupt storage - purge
        localStorage.removeItem("karograde_token");
        localStorage.removeItem("karograde_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem("karograde_token", receivedToken);
      localStorage.setItem("karograde_user", JSON.stringify(receivedUser));

      setLoading(false);
      return receivedUser;
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.response?.data?.error || "Login failed. Please try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "ADMIN" | "STUDENT"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/signup", { name, email, password, role });
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem("karograde_token", receivedToken);
      localStorage.setItem("karograde_user", JSON.stringify(receivedUser));

      setLoading(false);
      return receivedUser;
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.response?.data?.error || "Signup failed. Please check inputs.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("karograde_token");
    localStorage.removeItem("karograde_user");
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
