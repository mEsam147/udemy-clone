import { fetchWrapper } from "@/lib/api";
import { Course, User } from "@/lib/types";

export interface Review {
  _id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
}

export const studentService = {
  getUsers: () => fetchWrapper("/admin/users", "GET"),
  
  getStudentDashboard: (userId: string, role: "student" | "instructor" | "admin") =>
    fetchWrapper(`/students/dashboard`, "Get"),
  
  getWishlist: () => fetchWrapper("/students/wishlist", "GET"),
  
  addToWishlist: (courseId: string|number) =>
    fetchWrapper(`/students/wishlist/${courseId}`, "POST"),

  removeFromWishlist: (courseId: string|number) =>
    fetchWrapper(`/students/wishlist/${courseId}`, "DELETE"),
  
  getLearningActivity: () =>
    fetchWrapper(`/students/activity`, "GET"),
  
 
};