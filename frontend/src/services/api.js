import axios from "axios";
import { saveToken, removeToken } from "./auth";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s timeout for AI calls
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Auto-logout + redirect on 401 Unauthorized (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      const publicPaths = ["/", "/login", "/register"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Error Message Helper ─────────────────────────────────────────────────────
/**
 * Extracts a clean, human-readable error message from Axios errors.
 * Handles: network errors, timeouts, server detail strings, and validation arrays.
 */
export function getApiError(err, fallback = "Something went wrong. Please try again.") {
  if (!err.response) {
    // Network / timeout / backend not running
    if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
      return "Request timed out. The AI is taking too long — please try again.";
    }
    return "Cannot connect to server. Make sure the backend is running on http://localhost:8000";
  }

  const detail = err.response?.data?.detail;
  if (!detail) return fallback;

  // FastAPI validation errors come as an array of objects
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }

  return String(detail);
}

// ─── Health Check ────────────────────────────────────────────────────────────
/** Pings the backend /health endpoint. Returns { ok: bool, message: string } */
export const checkBackendHealth = async () => {
  try {
    const res = await api.get("/health", { timeout: 5000 });
    return { ok: true, message: res.data?.status || "healthy" };
  } catch {
    return { ok: false, message: "Backend offline" };
  }
};

// ─── Auth Endpoints ──────────────────────────────────────────────────────────
export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post(
    "/auth/login",
    new URLSearchParams({ username: data.email, password: data.password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

export const getProfile = () => api.get("/auth/profile");

// ─── Interview Endpoints ─────────────────────────────────────────────────────
export const generateQuestion = (category) =>
  api.post("/interview/generate-question", { category });

// ─── Analysis Endpoints ──────────────────────────────────────────────────────
export const analyzeAnswer = (question, answer) =>
  api.post("/analysis/analyze-answer", { question, answer });

// ─── Advanced: Voice Interview ───────────────────────────────────────────────
export const analyzeVoice = async (question, transcript) => {
  try {
    return await api.post("/voice/analyze", { question, transcript });
  } catch (err) {
    if (err.response?.status === 404) {
      return await api.post("/advanced/voice/analyze", { question, transcript });
    }
    throw err;
  }
};

// ─── Advanced: Resume Interview & Analysis ─────────────────────────────────────
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    return await api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return await api.post("/advanced/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    throw err;
  }
};

export const analyzeResume = (data) =>
  api.post("/resume/analyze", data);

export const analyzeResumeAnswer = (question, answer) =>
  api.post("/analysis/analyze-answer", { question, answer });

// ─── AI Mock Interview System ────────────────────────────────────────────────
export const startMockInterview = (interview_type, difficulty, total_questions) =>
  api.post("/mock-interview/start", { interview_type, difficulty, total_questions });

export const submitMockAnswer = (data) =>
  api.post("/mock-interview/submit-answer", data);

export const finishMockInterview = (data) =>
  api.post("/mock-interview/finish", data);

// ─── History & Performance Endpoints ─────────────────────────────────────────
export const getInterviewHistory = (type = "All") =>
  api.get("/interview/history", { params: { type } });

export const getInterviewStats = () =>
  api.get("/interview/performance");

export const getInterviewPerformance = () =>
  api.get("/interview/performance");

export const getInterviewDetails = (id) =>
  api.get(`/interview/history/${id}`);

export const createInterviewHistory = (data) =>
  api.post("/interview/history", data);

export const deleteInterview = (id) =>
  api.delete(`/interview/history/${id}`);

// ─── Dashboard Analytics Endpoints ──────────────────────────────────────────
export const getDashboardAnalytics = () =>
  api.get("/dashboard/analytics");

export const getRecentActivity = () =>
  api.get("/dashboard/recent-activity");

export const getDashboardInsights = () =>
  api.get("/dashboard/insights");

export default api;

