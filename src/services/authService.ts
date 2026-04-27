import api from "../lib/api";

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (payload: { token: string; new_password: string }) => {
    const response = await api.post("/api/auth/reset-password", payload);
    return response.data;
  },
};
