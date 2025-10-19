// frontend/services/enrollments.service.ts
import { fetchWrapper } from "@/lib/api";
import { Course } from "@/lib/types";

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  completedLessons: string[];
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
  isEnrolled?: boolean; // Add this field
  rating?: {
    score: number;
    review: string;
    ratedAt: string;
  };
}

export interface EnrollmentResponse {
  success: boolean;
  data: Enrollment | null;
  message?: string;
}

export interface CheckEnrollmentResponse {
  success: boolean;
  data: {
    isEnrolled: boolean;
    _id?: string;
    completedLessons?: string[];
    progress?: number;
    enrolledAt?: string;
    lastAccessed?: string;
  } | null;
  message?: string;
}

export const enrollmentsService = {
  // POST /enrollments/:courseId/enroll
  enrollInCourse: (courseId: string): Promise<EnrollmentResponse> =>
    fetchWrapper(`/enrollments/${courseId}/enroll`, "POST"),

  // GET /enrollments/:courseId/enrollment
  getEnrollmentByCourse: (courseId: string): Promise<EnrollmentResponse> =>
    fetchWrapper(`/enrollments/${courseId}/enrollment`),

  // GET /enrollments/user/enrolled
  getMyEnrollments: (): Promise<{ success: boolean; data: Enrollment[] }> =>
    fetchWrapper("/enrollments/user/enrolled", "GET"),

  // GET /enrollments/:courseId/progress
  getCourseProgress: (courseId: string): Promise<EnrollmentResponse> =>
    fetchWrapper(`/enrollments/${courseId}/progress`, "GET"),

  // PUT /enrollments/:courseId/progress
  updateProgress: (courseId: string, lessonId: string): Promise<EnrollmentResponse> =>
    fetchWrapper(`/enrollments/${courseId}/progress`, "PUT", { lessonId }),

  // GET /enrollments/:courseId/enrolled
  checkEnrollment: (courseId: string): Promise<CheckEnrollmentResponse> =>
    fetchWrapper(`/enrollments/${courseId}/enrolled`, "GET"),

  // POST /enrollments/:courseId/complete-lesson/:lessonId
  markLessonCompleted: async (
    courseId: string,
    lessonId: string
  ): Promise<EnrollmentResponse> => {
    try {
      const response = await fetchWrapper(
        `/enrollments/${courseId}/complete-lesson/${lessonId}`,
        "POST",
        null,
        {
          credentials: "include",
        }
      );
      return response;
    } catch (error: any) {
      console.error("Error marking lesson completed:", error);
      throw error;
    }
  },

  // Manual enrollment fallback for payment issues
  createEnrollmentFromPayment: (courseId: string, sessionId: string): Promise<EnrollmentResponse> =>
    fetchWrapper('/enrollments/payment/enroll', 'POST', { courseId, sessionId }),
};