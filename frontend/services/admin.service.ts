import { fetchWrapper } from "@/lib/api";
import { Course, User } from "@/lib/types";

export interface Review {
  _id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
}

export const adminService = {
  getUsers: () => fetchWrapper("/admin/users", "GET"),

  getApplications: () => fetchWrapper("/admin/applications", "GET"),

  updateUserRole: (userId: string, role: "student" | "instructor" | "admin") =>
    fetchWrapper(`/admin/users/${userId}/role`, "PUT", { role }),

  getAllCourses: () => fetchWrapper("/admin/courses", "GET"),

  toggleCoursePublishStatus: (courseId: string, isPublished: boolean) =>
    fetchWrapper(`/admin/courses/${courseId}/publish`, "PATCH", {
      isPublished,
    }),

  getReviews: () => fetchWrapper("/admin", "GET"),
  // services/admin.service.ts

  getUserProfile: (userId: string) => {
    return fetchWrapper(`/admin/users/${userId}/profile` , "GET");
  },

  getUserStats: (userId: string) => {
    return fetchWrapper(`/admin/users/${userId}/stats`, "GET");
  },

  deactivateUser: async (
    userId: string,
    action: "deactivate" | "activate" = "deactivate"
  ) => {
    fetchWrapper(`/admin/users/${userId}/status`, "PATCH", {
      action,
    });
  },

  // Alternative method names for clarity
  activateUser: async (userId: string) => {
    return adminService.deactivateUser(userId, "activate");
  },

  suspendUser: async (userId: string, reason?: string, duration?: number) => {
    
      fetchWrapper(`/admin/users/${userId}/suspend`,  "PATCH", {
        reason,
        duration,
      });
    
    
  },
};
