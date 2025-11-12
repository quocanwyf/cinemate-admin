import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor: Tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const adminApi = {
  getDashboardStats: () => api.get("/admin/dashboard/statistics"),

  // User Management
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/users", { params }),

  updateUserStatus: (userId: string, isActive: boolean) =>
    api.patch(`/admin/users/${userId}/status`, { isActive }), // ← Sửa key thành isActive

  // Featured Lists
  getFeaturedLists: () => api.get("/admin/featured-lists"),

  getFeaturedListById: (listId: string) =>
    api.get(`/admin/featured-lists/${listId}`),

  createFeaturedList: (data: { title: string; description?: string }) =>
    api.post("/admin/featured-lists", data),

  updateFeaturedList: (
    listId: string,
    data: { title?: string; description?: string; movieIds?: number[] }
  ) => api.put(`/admin/featured-lists/${listId}`, data),

  deleteFeaturedList: (listId: string) =>
    api.delete(`/admin/featured-lists/${listId}`),

  // Comment Moderation
  getComments: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/comments", { params }),

  deleteComment: (commentId: string) =>
    api.delete(`/admin/comments/${commentId}`),
};
