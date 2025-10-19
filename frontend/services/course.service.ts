// // services/courseService.ts
// import { fetchWrapper } from "@/lib/api";
// import {
//   Course,
//   EnrollmentStatusResponse,
//   Lesson,
//   SearchResponse,
//   WishlistActionResponse,
//   WishlistStatusResponse,
// } from "@/lib/types";

// /**
//  * Retry function with exponential backoff for rate limiting
//  */
// const retryWithBackoff = async (
//   fn: () => Promise<any>,
//   maxRetries = 3,
//   initialDelay = 1000
// ) => {
//   let lastError: any;

//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await fn();
//     } catch (error: any) {
//       lastError = error;

//       // If it's not a rate limit error, don't retry
//       if (!error.message?.includes("429")) {
//         throw error;
//       }

//       // Rate limit error - wait with exponential backoff
//       const backoffDelay = initialDelay * Math.pow(2, i);
//       console.warn(
//         `Rate limited (429). Retrying in ${backoffDelay}ms... (Attempt ${
//           i + 1
//         }/${maxRetries})`
//       );
//       await new Promise((resolve) => setTimeout(resolve, backoffDelay));
//     }
//   }

//   throw lastError;
// };

// // Course services
// export const getAllCourses = async (params?: Record<string, any>) => {
//   return retryWithBackoff(async () => {
//     let queryString = "";

//     if (params) {
//       const safeParams = Object.fromEntries(
//         Object.entries(params).map(([key, value]) => [
//           key,
//           value != null ? String(value) : "",
//         ])
//       );

//       queryString = new URLSearchParams(safeParams).toString();
//     }

//     const endpoint = queryString ? `/courses?${queryString}` : "/courses";
//     const response = await fetchWrapper(endpoint);

//     // Normalize response structure for consistent pagination
//     const normalizedResponse = {
//       ...response,
//       data: response.data || response.courses || response || [],
//       currentPage:
//         parseInt(response.currentPage) || parseInt(params?.page) || 1,
//       totalPages: parseInt(response.totalPages) || 1,
//       totalCount:
//         parseInt(response.totalCount) ||
//         parseInt(response.count) ||
//         response.data?.length ||
//         response.courses?.length ||
//         response.length ||
//         0,
//       count:
//         parseInt(response.count) ||
//         response.data?.length ||
//         response.courses?.length ||
//         response.length ||
//         0,
//       limit: parseInt(response.limit) || parseInt(params?.limit) || 12,
//       pagination: response.pagination || {
//         currentPage:
//           parseInt(response.currentPage) || parseInt(params?.page) || 1,
//         totalPages:
//           parseInt(response.totalPages) ||
//           Math.ceil(
//             (parseInt(response.totalCount) ||
//               parseInt(response.count) ||
//               response.data?.length ||
//               0) / (parseInt(response.limit) || parseInt(params?.limit) || 12)
//           ),
//         totalCount:
//           parseInt(response.totalCount) ||
//           parseInt(response.count) ||
//           response.data?.length ||
//           0,
//         limit: parseInt(response.limit) || parseInt(params?.limit) || 12,
//       },
//     };

//     return normalizedResponse;
//   });
// };

// export const getCourse = async (identifier: string) => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(`/courses/${identifier}`);
//     return response.data || response;
//   });
// };

// export const createCourse = async (data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper("/courses", "POST", data, {
//       isFormData: true,
//     });
//   });
// };

// export const updateCourse = async (id: string, data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${id}`, "PUT", data);
//   });
// };

// export const deleteCourse = async (id: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${id}`, "DELETE");
//   });
// };

// export const searchCourses = async (
//   query: string,
//   role: string,
//   userId: string
// ) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(
//       `/courses/search?query=${encodeURIComponent(
//         query
//       )}&role=${encodeURIComponent(role)}&userId=${encodeURIComponent(userId)}`,
//       "GET",
//       undefined,
//       { credentials: "include" }
//     );
//   });
// };

// // frontend/services/course.service.ts (add dashboardSearch)
// export const dashboardSearch = async (query: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(
//       `/courses/dashboard/search?query=${encodeURIComponent(query)}`,
//       "GET",
//       undefined,
//       {
//         credentials: "include",
//       }
//     );
//   });
// };

// export const getCategories = async () => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper("/courses/categories");

//     // Normalize categories response
//     if (Array.isArray(response)) {
//       return response.map((cat: any) => ({
//         id: cat.id || cat._id || "",
//         name: cat.name || "",
//         course_count: cat.course_count || cat.courseCount || 0,
//       }));
//     }

//     return response.data || response.categories || response || [];
//   });
// };

// // Lesson services
// export const getCourseLessons = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/lessons`, "GET");
//   });
// };

// export const addLesson = async (courseId: string, data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/lessons`, "POST", data, {
//       isFormData: true,
//     });
//   });
// };

// export const updateLesson = async (
//   courseId: string,
//   lessonId: string,
//   lessonFormData: FormData,
//   onUploadProgress?: (progressEvent: any) => void
// ) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(
//       `/courses/${courseId}/lessons/${lessonId}`,
//       "PUT",
//       lessonFormData,
//       {
//         isFormData: true,
//         onUploadProgress,
//       }
//     );
//   });
// };

// export const deleteLesson = async (courseId: string, lessonId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/lessons/${lessonId}`, "DELETE");
//   });
// };

// // Video upload services with Cloudinary support
// export const uploadLessonVideo = async (courseId: string, data: FormData) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/lessons`, "POST", data, {
//       isFormData: true,
//     });
//   });
// };

// export const updateLessonWithVideo = async (
//   courseId: string,
//   lessonId: string,
//   data: FormData
// ) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(
//       `/courses/${courseId}/lessons/${lessonId}`,
//       "PUT",
//       data,
//       {
//         isFormData: true,
//       }
//     );
//   });
// };

// export const getVideoUrl = async (courseId: string, lessonId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/lessons/${lessonId}/video-url`);
//   });
// };

// // Enrollment services
// export const enrollCourse = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/enroll`, "POST");
//   });
// };

// export const getEnrolledCourses = async () => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper("/courses/user/enrolled");
//   });
// };

// export const getCourseProgress = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/progress`);
//   });
// };

// export const updateProgress = async (courseId: string, data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/progress`, "PUT", data);
//   });
// };

// // Review services
// export const addReview = async (courseId: string, data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/review`, "POST", data);
//   });
// };

// export const getCourseReviews = async (courseId: string) => {
//   // return retryWithBackoff(async () => {
//   return fetchWrapper(`/courses/${courseId}/reviews`);
//   // });
// };

// // Instructor services
// // services/course.service.ts
// // services/course.service.ts
// export const getInstructorCourses = async (
//   params: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     status?: string;
//     sort?: string;
//   } = {}
// ) => {
//   const queryString = new URLSearchParams(
//     Object.entries(params)
//       .filter(([_, value]) => value !== undefined && value !== "")
//       .map(([key, value]) => [key, String(value)])
//   ).toString();

//   const endpoint = queryString
//     ? `/courses/instructor/my-courses?${queryString}`
//     : "/courses/instructor/my-courses";

//   const response = await fetchWrapper(endpoint);

//   return {
//     data: response.data || [],
//     count: response.count || response.data?.length || 0,
//     totalCount: response.totalCount || 0,
//     currentPage: parseInt(response.currentPage) || params.page || 1,
//     totalPages: parseInt(response.totalPages) || 1,
//     limit: parseInt(response.limit) || params.limit || 10,
//   };
// };

// // Admin services
// export const getAllCoursesAdmin = async (params?: Record<string, any>) => {
//   return retryWithBackoff(async () => {
//     const queryString = params ? new URLSearchParams(params).toString() : "";
//     const endpoint = queryString
//       ? `/courses/admin?${queryString}`
//       : "/courses/admin";
//     return fetchWrapper(endpoint);
//   });
// };

// export const toggleCoursePublishStatus = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/admin/${courseId}/publish`, "PATCH");
//   });
// };

// // @/services/course.service.ts

// export async function checkEnrollment(
//   courseId: string
// ): Promise<EnrollmentStatusResponse> {
//   if (!courseId) {
//     throw new Error("Course ID is required");
//   }

//   try {
//     const response = await fetchWrapper(
//       `/courses/${courseId}/enrolled`,
//       "GET",
//       null,
//       {
//         credentials: "include",
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error checking enrollment status:", error);
//     // If not authenticated, return false
//     if (error instanceof Error && error.message.includes("401")) {
//       return { isEnrolled: false, courseId };
//     }
//     throw error;
//   }
// }

// // @/services/course.service.ts - Updated for User wishlist

// // Add to wishlist
// export async function addToWishlist(
//   courseId: string
// ): Promise<WishlistActionResponse> {
//   if (!courseId) throw new Error("Course ID is required");

//   try {
//     const response = await fetchWrapper(
//       `/courses/${courseId}/wishlist`,
//       "POST",
//       null,
//       {
//         credentials: "include",
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error adding to wishlist:", error);
//     throw error;
//   }
// }

// // Remove from wishlist
// export async function removeFromWishlist(
//   courseId: string
// ): Promise<WishlistActionResponse> {
//   if (!courseId) throw new Error("Course ID is required");

//   try {
//     const response = await fetchWrapper(
//       `/courses/${courseId}/wishlist`,
//       "DELETE",
//       null,
//       {
//         credentials: "include",
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error removing from wishlist:", error);
//     throw error;
//   }
// }

// // Check wishlist status
// export async function getWishlistStatus(
//   courseId: string
// ): Promise<WishlistStatusResponse> {
//   if (!courseId) {
//     return { isInWishlist: false, courseId: "", wishlistCount: 0 };
//   }

//   try {
//     const response = await fetchWrapper(
//       `/courses/${courseId}/wishlist-status`,
//       "GET",
//       null,
//       {
//         credentials: "include",
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error checking wishlist status:", error);
//     // If not authenticated, return false
//     if (error instanceof Error && error.message.includes("401")) {
//       return { isInWishlist: false, courseId, wishlistCount: 0 };
//     }
//     throw error;
//   }
// }

// // Get user's wishlist
// export async function getUserWishlist(): Promise<{
//   data: Course[];
//   count: number;
//   totalWishlistCount: number;
// }> {
//   try {
//     const response = await fetchWrapper("/courses/wishlist", "GET", null, {
//       credentials: "include",
//     });
//     return response;
//   } catch (error) {
//     console.error("Error fetching wishlist:", error);
//     return { data: [], count: 0, totalWishlistCount: 0 };
//   }
// }

// export async function applyForInstructor() {
//   fetchWrapper("/instructors/apply", "POST");
// }
// export const getAllInstructors = () => {
//   fetchWrapper(`/courses/instructors/all`, "GET");
// };

// export const getInstructorStats = async () => {
//   fetchWrapper(`/courses/instructors/stats`);
// };

// export const updateInstructorApplication = (
//   userId: string,
//   status: "approved" | "rejected",
//   reason?: string
// ) => {
//   fetchWrapper(`/courses/applications/${userId}`, { status, reason });
// };

// export async function getInstructorApplications() {
//   fetchWrapper("/courses/applications", "GET");
// }

// // export const updateCourseStatus = async (courseId: string, status: string) => {
// //   return retryWithBackoff(async () => {
// //     return fetchWrapper(`/courses/${courseId}`, "PUT", { status });
// //   });
// // };

// export const getInstructorAnalytics = async (courseId?: string) => {
//   return retryWithBackoff(async () => {
//     const endpoint = courseId
//       ? `/analytics/instructor?courseId=${courseId}`
//       : "/analytics/instructor";
//     return fetchWrapper(endpoint);
//   });
// };

// export const getInstructorEarnings = async () => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper("/instructor/earnings");
//   });
// };

// export const getInstructorStudents = async (courseId?: string) => {
//   return retryWithBackoff(async () => {
//     const endpoint = courseId
//       ? `/instructor/students?courseId=${courseId}`
//       : "/instructor/students";
//     return fetchWrapper(endpoint);
//   });
// };

// // Update your courseService.ts with these functions

// // Get course details by ID
// export const getCourseDetails = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(`/courses/id/${courseId}`);
//     return response.data || response;
//   });
// };

// // Update course status

// // Get course analytics
// export const getCourseAnalytics = async (courseId: string) => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(`/courses/${courseId}/analytics`);
//     return response.data || response;
//   });
// };

// // Update course details
// export const updateCourseDetails = async (courseId: string, data: any) => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/courses/${courseId}/details`, "PUT", data);
//   });
// };

// // services/course.service.ts
// export const updateCourseStatus = async (courseId: string, status: string) => {
//   const response = await fetchWrapper(`/courses/${courseId}/status`, "PATCH", {
//     status,
//   });

//   console.log("response statis", response);
//   return response;
// };

// export const bulkUpdateCourseStatus = async (
//   courseIds: string[],
//   status: string
// ) => {
//   const response = await fetchWrapper("/courses/bulk-status", "PATCH", {
//     courseIds,
//     status,
//   });
//   return response;
// };

// export const getCourseStatusStats = async () => {
//   const response = await fetchWrapper("/courses/status-stats", "GET");
//   return response;
// };

// export const getEnrollmentStatus = async (courseId: string, userId: string) => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(
//       `/enrollments/${courseId}/enrolled`,
//       "GET"
//     );
//     return response.data || response;
//   });
// };



// services/courseService.ts
import { fetchWrapper } from "@/lib/api";
import {
  Course,
  EnrollmentStatusResponse,
  Lesson,
  SearchResponse,
  WishlistActionResponse,
  WishlistStatusResponse,
  InstructorApplication,
  InstructorStats,
} from "@/lib/types";

/**
 * Retry function with exponential backoff for rate limiting
 */
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  initialDelay = 1000
) => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // If it's not a rate limit error, don't retry
      if (!error.message?.includes("429") && error.status !== 429) {
        throw error;
      }

      // Rate limit error - wait with exponential backoff
      const backoffDelay = initialDelay * Math.pow(2, i);
      console.warn(
        `Rate limited (429). Retrying in ${backoffDelay}ms... (Attempt ${
          i + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};

// Course services
export const getAllCourses = async (params?: Record<string, any>) => {
  return retryWithBackoff(async () => {
    let queryString = "";

    if (params) {
      const safeParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          value != null ? String(value) : "",
        ])
      );

      queryString = new URLSearchParams(safeParams).toString();
    }

    const endpoint = queryString ? `/courses?${queryString}` : "/courses";
    const response = await fetchWrapper(endpoint);

    // Normalize response structure for consistent pagination
    return {
      ...response,
      data: response.data || response.courses || response || [],
      currentPage: response.currentPage || params?.page || 1,
      totalPages: response.totalPages || 1,
      totalCount: response.totalCount || response.count || 0,
      count: response.count || response.data?.length || 0,
      limit: response.limit || params?.limit || 12,
      pagination: response.pagination || {
        currentPage: response.currentPage || params?.page || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || response.count || 0,
        limit: response.limit || params?.limit || 12,
      },
    };
  });
};

// export const getCourse = async (identifier: string): Promise<Course> => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(`/courses/${identifier}`);
//     return response.data || response;
//   });
// };

export const getCourse = async (identifier: string): Promise<Course> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${identifier}`, "GET");
    
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch course details");
    }

    const courseData = response.data || response;

    

    return courseData;
  });
};

export const createCourse = async (data: any) => {
  return retryWithBackoff(async () => {
    return fetchWrapper("/courses", "POST", data, {
      isFormData: true,
    });
  });
};

export const updateCourse = async (id: string, data: any) => {
  return retryWithBackoff(async () => {
    return fetchWrapper(`/courses/${id}`, "PUT", data);
  });
};

export const deleteCourse = async (id: string) => {
  return retryWithBackoff(async () => {
    return fetchWrapper(`/courses/${id}`, "DELETE");
  });
};

// export const searchCourses = async (
//   query: string,
//   role: string,
//   userId: string
// ) => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(
//       `/courses/search?query=${encodeURIComponent(
//         query
//       )}&role=${encodeURIComponent(role)}&userId=${encodeURIComponent(userId)}`
//     );
//     return response.data || response;
//   });
// };


export const searchCourses = async (query: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(
      `/courses/search?query=${encodeURIComponent(query)}`
    );
    return response.data || response;
  });
};

// Keep the existing one for backward compatibility
export const searchCoursesWithAuth = async (query: string, role: string, userId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(
      `/courses/search?query=${encodeURIComponent(query)}&role=${encodeURIComponent(role)}&userId=${encodeURIComponent(userId)}`
    );
    return response.data || response;
  });
};


// Dashboard search
export const dashboardSearch = async (query: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(
      `/courses/dashboard/search?query=${encodeURIComponent(query)}`
    );
    return response.data || response;
  });
};

export const getCategories = async () => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/categories");
    return response.data || response.categories || response || [];
  });
};

// Lesson services
export const getCourseLessons = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/lessons`);
    return response.data || response;
  });
};

export const addLesson = async (courseId: string, data: any) => {
  return retryWithBackoff(async () => {
    return fetchWrapper(`/courses/${courseId}/lessons`, "POST", data, {
      isFormData: true,
    });
  });
};

export const updateLesson = async (
  courseId: string,
  lessonId: string,
  data: FormData
) => {
  return retryWithBackoff(async () => {
    return fetchWrapper(
      `/courses/${courseId}/lessons/${lessonId}`,
      "PUT",
      data,
      {
        isFormData: true,
      }
    );
  });
};

export const deleteLesson = async (courseId: string, lessonId: string) => {
  return retryWithBackoff(async () => {
    return fetchWrapper(`/courses/${courseId}/lessons/${lessonId}`, "DELETE");
  });
};

// Video services
export const getVideoUrl = async (courseId: string, lessonId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/lessons/${lessonId}/video-url`);
    return response.data || response;
  });
};

// Enrollment services
export const enrollCourse = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/enroll`, "POST");
    return response.data || response;
  });
};

export const getEnrolledCourses = async () => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/user/enrolled");
    return response.data || response;
  });
};

export const getCourseProgress = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/progress`);
    return response.data || response;
  });
};

export const updateProgress = async (courseId: string, data: any) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/progress`, "PUT", data);
    return response.data || response;
  });
};

// Review services
export const addReview = async (courseId: string, data: any) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/review`, "POST", data);
    return response.data || response;
  });
};

export const getCourseReviews = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/reviews`);
    return response.data || response;
  });
};

// Instructor services
export const getInstructorCourses = async (params: any = {}) => {
  return retryWithBackoff(async () => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const endpoint = queryString
      ? `/courses/instructor/my-courses?${queryString}`
      : "/courses/instructor/my-courses";

    const response = await fetchWrapper(endpoint);

    return {
      data: response.data || [],
      count: response.count || response.data?.length || 0,
      totalCount: response.totalCount || 0,
      currentPage: response.currentPage || params.page || 1,
      totalPages: response.totalPages || 1,
      limit: response.limit || params.limit || 10,
    };
  });
};

// Admin services - FIXED IMPLEMENTATIONS
export const getInstructorApplications = async (): Promise<{ data: InstructorApplication[] }> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/applications");
    return response;
  });
};

export const updateInstructorApplication = async (
  userId: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<any> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/applications/${userId}`, "PUT", {
      status,
      reason,
    });
    return response;
  });
};

export const getAllInstructors = async (): Promise<{ data: any[] }> => {
  return retryWithBackoff(async () => {
     fetchWrapper("/courses/instructors/all");
    
  });
};

export const getInstructorStats = async (): Promise<{ data: InstructorStats }> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/instructors/stats");
    return response;
  });
};

// Wishlist services
export const addToWishlist = async (courseId: string): Promise<WishlistActionResponse> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/wishlist`, "POST");
    return response.data || response;
  });
};

export const removeFromWishlist = async (courseId: string): Promise<WishlistActionResponse> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/wishlist`, "DELETE");
    return response.data || response;
  });
};

export const getWishlistStatus = async (courseId: string): Promise<WishlistStatusResponse> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/wishlist-status`);
    return response.data || response;
  });
};

export const getUserWishlist = async (): Promise<{ data: Course[]; count: number; totalWishlistCount: number }> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/wishlist");
    return response.data || response;
  });
};

// Instructor application
export const applyForInstructor = async () => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/instructor/apply", "POST");
    return response.data || response;
  });
};

// Course status management
export const updateCourseStatus = async (courseId: string, status: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/status`, "PATCH", {
      status,
    });
    return response.data || response;
  });
};


// services/courseService.ts - Add this function
export const getAllInstructorsOptimized = async (): Promise<{ data: any[] }> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/instructors/optimized");
    return response;
  });
};

export const bulkUpdateCourseStatus = async (courseIds: string[], status: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/bulk-status", "PATCH", {
      courseIds,
      status,
    });
    return response.data || response;
  });
};

export const getCourseStatusStats = async () => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/courses/status-stats");
    return response.data || response;
  });
};

// Analytics services
export const getInstructorAnalytics = async (courseId?: string) => {
  return retryWithBackoff(async () => {
    const endpoint = courseId
      ? `/analytics/instructor?courseId=${courseId}`
      : "/analytics/instructor";
    const response = await fetchWrapper(endpoint);
    return response.data || response;
  });
};

export const getInstructorEarnings = async () => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper("/instructor/earnings");
    return response.data || response;
  });
};

export const getInstructorStudents = async (courseId?: string) => {
  return retryWithBackoff(async () => {
    const endpoint = courseId
      ? `/instructor/students?courseId=${courseId}`
      : "/instructor/students";
    const response = await fetchWrapper(endpoint);
    return response.data || response;
  });
};

// Course details and analytics
export const getCourseDetails = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/id/${courseId}`);
    return response.data || response;
  });
};

export const getCourseAnalytics = async (courseId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/analytics`);
    return response.data || response;
  });
};

export const updateCourseDetails = async (courseId: string, data: any) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/details`, "PUT", data);
    return response.data || response;
  });
};

// Enrollment status
export const checkEnrollment = async (courseId: string): Promise<EnrollmentStatusResponse> => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/courses/${courseId}/enrolled`);
    return response.data || response;
  });
};

export const getEnrollmentStatus = async (courseId: string, userId: string) => {
  return retryWithBackoff(async () => {
    const response = await fetchWrapper(`/enrollments/${courseId}/enrolled`);
    return response.data || response;
  });
};