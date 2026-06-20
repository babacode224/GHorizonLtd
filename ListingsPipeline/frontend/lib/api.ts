import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

// Attach JWT token for admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Submission API (public) ----------
export const submitProperty = (formData: FormData) =>
  api.post("/api/submissions/property", formData);

export const submitVehicle = (formData: FormData) =>
  api.post("/api/submissions/vehicle", formData);

// ---------- Admin API ----------
export const adminLogin = (email: string, password: string) =>
  api.post("/api/admin/auth/login", { email, password });

export const fetchPendingSubmissions = (vertical?: "property" | "vehicle") =>
  api.get("/api/admin/submissions", { params: { vertical } });

export const fetchPropertyDetail = (id: string) =>
  api.get(`/api/admin/submissions/property/${id}`);

export const fetchVehicleDetail = (id: string) =>
  api.get(`/api/admin/submissions/vehicle/${id}`);

export const publishProperty = (id: string, body: Record<string, unknown>) =>
  api.put(`/api/admin/submissions/property/${id}/publish`, body);

export const publishVehicle = (id: string, body: Record<string, unknown>) =>
  api.put(`/api/admin/submissions/vehicle/${id}/publish`, body);

export const rejectProperty = (id: string, reason: string) =>
  api.put(`/api/admin/submissions/property/${id}/reject`, { rejection_reason: reason });

export const rejectVehicle = (id: string, reason: string) =>
  api.put(`/api/admin/submissions/vehicle/${id}/reject`, { rejection_reason: reason });

// ---------- Public API ----------
export const fetchPublicProperties = (params?: Record<string, unknown>) =>
  api.get("/api/properties", { params });

export const fetchPublicVehicles = (params?: Record<string, unknown>) =>
  api.get("/api/vehicles", { params });
