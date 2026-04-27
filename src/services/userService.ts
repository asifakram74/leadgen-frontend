import api from "../lib/api";

export const userService = {
  getProfile: async () => {
    const response = await api.get("/api/profile");
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put("/api/profile", profileData);
    return response.data;
  },

  updatePassword: async (passwordData: any) => {
    const response = await api.put("/api/profile/password", passwordData);
    return response.data;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Admin User Management
  getAllUsers: async (params?: { q?: string; role?: string; status?: string; page?: number; size?: number }) => {
    const response = await api.get("/api/users", { params });
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post("/api/users", userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },
};
