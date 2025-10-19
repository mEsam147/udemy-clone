import { fetchWrapper } from "@/lib/api";
import { Course, Enrollment } from "@/lib/types";

export interface PlatformStats {
  users: number;
  courses: number;
  enrollments: number;
  categories: Array<{ _id: string; courseCount: number }>;
}

export interface InstructorAnalytics {
  courses: Course[];
  enrollments: Enrollment[];
  enrollmentTrends: Array<{ _id: string; count: number }>;
  revenue: number;
  students: number;
}

export interface StudentProgress {
  enrollments: Enrollment[];
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
}

export const analyticsService = {
  getPlatformStats: () => fetchWrapper("/analytics/platform", "GET"),

 
  
  getRevenueAnalytics: () =>
    fetchWrapper("/analytics/revenue"),
  
  getUserAnalytics: () =>
    fetchWrapper("/analytics/users"),
  

  getInstructorAnalytics: () => fetchWrapper("/analytics/instructor", "GET"),

  getStudentProgress: () => fetchWrapper("/analytics/student-progress", "GET"),

  // getRevenueAnalytics: (period: "7d" | "30d" | "90d" | "1y") =>
  //   fetchWrapper(`/analytics/revenue?period=${period}`, "GET"),

  getEnrollmentAnalytics: (courseId?: string) =>
    fetchWrapper(
      courseId
        ? `/analytics/enrollments?courseId=${courseId}`
        : "/analytics/enrollments",
      "GET"
    ),


    getStudentAnalytics: (): Promise<{ success: boolean; data: StudentAnalytics }> => {
    return fetchWrapper("/analytics/student", "GET");
  },

  getEnrollments: (): Promise<{ success: boolean; data: Enrollment[] }> => {
    return fetchWrapper("/enrollments/user/enrolled", "GET");
  },

  getStudentProgressDetails: (courseId: string): Promise<{ success: boolean; data: any }> => {
    return fetchWrapper(`/analytics/student/progress/${courseId}`, "GET");
  },
};
