// services/instructor.service.ts
import { fetchWrapper } from "@/lib/api";

export interface Instructor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    country?: string;
  };
  profile: {
    bio: string;
    expertise: string[];
    website?: string;
    socialLinks?: {
      youtube?: string;
      twitter?: string;
      linkedin?: string;
    };
    availability?: string;
    responseTime?: string;
    officeHours?: string;
    contactEmail?: string;
  };
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalReviews: number;
    averageRating: number;
    totalEnrollments: number;
  };
  isVerified: boolean;
  featured: boolean;
  joinedAt: string;
  courses?: Course[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  level: string;
  duration: number;
  studentsEnrolled: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export interface InstructorFilters {
  page?: number;
  limit?: number;
  search?: string;
  expertise?: string | string[];
  verified?: boolean;
  featured?: boolean;
  country?: string;
  sort?: "popular" | "rating" | "newest" | "courses" | "students";
}

export interface InstructorsResponse {
  success: boolean;
  data: Instructor[];
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface InstructorResponse {
  success: boolean;
  data: Instructor;
}

export const instructorService = {
  // Get all instructors with filters and pagination
  getAllInstructors: (
    filters: InstructorFilters = {}
  ): Promise<InstructorsResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return fetchWrapper(`/instructors?${queryParams}`);
  },

  // Get instructor by ID
  getInstructorById: (id: string): Promise<InstructorResponse> =>
    fetchWrapper(`/instructors/${id}`),

  // Protected routes (for logged-in instructors)
  getInstructorProfile: (): Promise<{ success: boolean; data: any }> =>
    fetchWrapper("/instructors/profile/me"),

  getInstructorCourses: (filters: any = {}): Promise<any> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    return fetchWrapper(`/instructors/profile/me/courses?${queryParams}`);
  },

  getInstructorStudents: (): Promise<any> =>
    fetchWrapper("/instructors/profile/me/students"),

  getInstructorEarnings: (): Promise<any> =>
    fetchWrapper("/instructors/profile/me/earnings"),

  getInstructorDashboard: (): Promise<any> =>
    fetchWrapper("/instructors/profile/me/dashboard"),

  // Application routes
  applyForInstructor: (applicationData: {
    message: string;
  }): Promise<{ success: boolean; message: string }> =>
    fetchWrapper("/instructors/apply", "POST", applicationData),

  getInstructorApplications: (): Promise<{ success: boolean; data: any[] }> =>
    fetchWrapper("/instructors/applications"),

  updateInstructorApplication: (
    userId: string,
    status: "approved" | "rejected"
  ): Promise<{ success: boolean; message: string }> =>
    fetchWrapper(`/instructors/applications/${userId}`, "PUT", { status }),

  getInstructorPublicCourses: (
    instructorId: string,
    filters: any = {}
  ): Promise<any> => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return fetchWrapper(`/instructors/${instructorId}/courses?${queryParams}`);
  },
};
