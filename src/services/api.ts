import axios from "axios";

// Access base API URL from Vite context
const API_URL = (import.meta as any).env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically apply JWT bearer tokens if stored in client local session
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("karograde_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
