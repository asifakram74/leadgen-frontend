import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leadgenbackend.onlinetoolpot.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global error handling (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 if it's the main browser context and NOT a background sync/bootstrap
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/register");
        
        if (!isAuthPage) {
            console.warn("[API] 401 Detected - Expiring Session Safely");
            const AUTH_KEYS = ["token", "role", "email", "first_name", "last_name", "status", "is_verified", "profile_picture"];
            AUTH_KEYS.forEach(key => localStorage.removeItem(key));
            window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Converts a relative backend storage path (e.g. /storage/profiles/user_1.png)
 * into a fully-qualified URL using the NEXT_PUBLIC_API_URL env variable.
 * Returns empty string if no path is provided.
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path; // already absolute
  return `${API_URL}${path}`;
}

export default api;
