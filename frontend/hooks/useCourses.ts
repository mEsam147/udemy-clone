// // hooks/useCourses.ts
// import {
//   useQuery,
//   useInfiniteQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";
// import * as courseService from "@/services/course.service";
// import {
//   Course,
//   Review,
//   Category,
//   EnrollmentStatusResponse,
// } from "@/lib/types";

// interface UseCourseReviewsProps {
//   courseId: string;
//   enabled?: boolean;
// }

// // hooks/useCourses.ts
// // export const useCourses = (params?: Record<string, any>) => {
// //   return useQuery({
// //     queryKey: ["courses", params],
// //     queryFn: () => courseService.getAllCourses(params),
// //     select: (response) => {
// //       // Handle both array and paginated responses
// //       if (Array.isArray(response)) {
// //         return response;
// //       }
// //       return response.data || response;
// //     },
// //     staleTime: 5 * 60 * 1000,
// //   });
// // };

// // hooks/useCourses.ts
// // hooks/useCourses.ts - Updated version
// // hooks/useCourses.ts - Updated version
// // hooks/useCourses.ts - Fix pagination handling
// // hooks/useCourses.ts - Updated to handle your backend structure
// export const useCourses = (params?: Record<string, any>) => {
//   const currentPage = params?.page || 1;
//   const itemsPerPage = params?.limit || 12;

//   return useQuery({
//     queryKey: ["courses", params],
//     queryFn: () => courseService.getAllCourses(params),
//     select: (response) => {
//       console.log("Courses API Response:", response);
      
//       // Handle different response structures
//       if (Array.isArray(response)) {
//         return {
//           data: response,
//           pagination: {
//             currentPage,
//             totalPages: Math.ceil(response.length / itemsPerPage),
//             totalItems: response.length,
//             itemsPerPage,
//           }
//         };
//       }
      
//       // Handle your backend's pagination structure
//       if (response && typeof response === 'object') {
//         const data = response.data || response.courses || [];
        
//         // Extract from your backend structure
//         const backendPagination = response.pagination || {};
//         const count = response.count || data.length;
        
//         // Calculate total pages based on count and limit
//         const totalItems = count;
//         const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
        
//         // Determine current page from next/prev structure
//         let calculatedCurrentPage = currentPage;
//         if (backendPagination.next) {
//           calculatedCurrentPage = backendPagination.next.page - 1;
//         } else if (backendPagination.prev) {
//           calculatedCurrentPage = backendPagination.prev.page + 1;
//         } else {
//           calculatedCurrentPage = 1;
//         }

//         const pagination = {
//           currentPage: calculatedCurrentPage,
//           totalPages: calculatedTotalPages,
//           totalItems: totalItems,
//           itemsPerPage: itemsPerPage,
//         };

//         console.log("Processed pagination:", pagination);
        
//         return { data, pagination };
//       }
      
//       // Fallback
//       return { data: [], pagination: null };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
// };

// export const useSearchCourses = (query: string, filters?: Record<string, any>) => {
//   const currentPage = filters?.page || 1;
//   const itemsPerPage = filters?.limit || 12;

//   return useQuery({
//     queryKey: ["search", query, filters],
//     queryFn: () => courseService.searchCourses(query, "student", "user-id"),
//     select: (response) => {
//       if (!response) return { data: [], pagination: null };
      
//       if (Array.isArray(response)) {
//         return {
//           data: response,
//           pagination: {
//             currentPage,
//             totalPages: Math.ceil(response.length / itemsPerPage),
//             totalItems: response.length,
//             itemsPerPage,
//           }
//         };
//       }
      
//       if (response && typeof response === 'object') {
//         const data = response.data || response.courses || [];
//         const backendPagination = response.pagination || {};
//         const count = response.count || data.length;
        
//         const totalItems = count;
//         const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
        
//         let calculatedCurrentPage = currentPage;
//         if (backendPagination.next) {
//           calculatedCurrentPage = backendPagination.next.page - 1;
//         } else if (backendPagination.prev) {
//           calculatedCurrentPage = backendPagination.prev.page + 1;
//         }

//         const pagination = {
//           currentPage: calculatedCurrentPage,
//           totalPages: calculatedTotalPages,
//           totalItems: totalItems,
//           itemsPerPage: itemsPerPage,
//         };

//         return { data, pagination };
//       }
      
//       return { data: [], pagination: null };
//     },
//     enabled: !!query,
//     staleTime: 2 * 60 * 1000,
//   });
// };

// // hooks/useCourses.ts - Add this function
// export const useCourseLessons = (courseId: string, options?: any) => {
//   return useQuery({
//     queryKey: ["course-lessons", courseId],
//     queryFn: () => courseService.getCourseLessons(courseId),
//     enabled: !!courseId && options?.enabled !== false,
//     select: (response) => {
//       if (Array.isArray(response)) {
//         return response;
//       }
//       return response.data || response.lessons || [];
//     },
//     staleTime: 5 * 60 * 1000,
//   });
// };

// // export const useSearchCourses = (
// //   query: string,
// //   filters?: Record<string, any>
// // ) => {
// //   return useQuery({
// //     queryKey: ["search", query, filters],
// //     queryFn: () => courseService.searchCourses(query, "student", "user-id"), // Adjust based on your auth
// //     select: (response) => {
// //       console.log("Search API Response:", response);

// //       if (!response) return { data: [], pagination: null };

// //       if (Array.isArray(response)) {
// //         return {
// //           data: response,
// //           pagination: {
// //             currentPage: filters?.page || 1,
// //             totalPages: Math.ceil(response.length / (filters?.limit || 12)),
// //             totalItems: response.length,
// //             itemsPerPage: filters?.limit || 12,
// //           },
// //         };
// //       }

// //       if (response && typeof response === "object") {
// //         const data = response.data || response.courses || [];
// //         const pagination = response.pagination || {
// //           currentPage: response.currentPage || filters?.page || 1,
// //           totalPages:
// //             response.totalPages ||
// //             Math.ceil(
// //               (response.totalCount ||
// //                 response.total ||
// //                 response.count ||
// //                 data.length) / (response.limit || filters?.limit || 12)
// //             ),
// //           totalItems:
// //             response.totalCount ||
// //             response.total ||
// //             response.count ||
// //             data.length,
// //           itemsPerPage: response.limit || filters?.limit || 12,
// //         };

// //         return { data, pagination };
// //       }

// //       return { data: [], pagination: null };
// //     },
// //     enabled: !!query,
// //     staleTime: 2 * 60 * 1000,
// //   });
// // };

// export const useCourse = (slug: string) => {
//   return useQuery({
//     queryKey: ["course", slug],
//     queryFn: () => courseService.getCourse(slug),
//     select: (response) => response.data || response,
//     enabled: !!slug,
//   });
// };

// export const useCourseBySlug = (identifier: string, initialCourse?: Course) => {
//   return useQuery({
//     queryKey: ["course", identifier],
//     queryFn: () => courseService.getCourse(identifier), // Use getCourse from certificateService
//     select: (response) => response.data || response,
//     enabled: !!identifier,
//     initialData: initialCourse ? { data: initialCourse } : undefined, // Use initialCourse if provided
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// };

// export const useCourseReviews = ({
//   courseId,
//   page = 1,
//   limit = 10,
//   enabled = true,
// }: UseCourseReviewsProps) => {
//   return useQuery({
//     queryKey: ["reviews", courseId, page, limit],
//     queryFn: () => courseService.getCourseReviews(courseId, page, limit),
//     select: (response) => {
//       const data = response.data || response;
//       return {
//         reviews: data.reviews || [],
//         averageRating: data.averageRating || 0,
//         totalRatings: data.totalRatings || 0,
//         ratingDistribution: data.ratingDistribution || {
//           5: 0,
//           4: 0,
//           3: 0,
//           2: 0,
//           1: 0,
//         },
//         pagination: data.pagination || {
//           page: 1,
//           limit: 10,
//           total: 0,
//           pages: 0,
//         },
//       };
//     },
//     enabled: !!courseId && enabled,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };
// export const useCategories = () => {
//   return useQuery({
//     queryKey: ["categories"],
//     queryFn: () => courseService.getCategories(),
//     select: (response) => response.data || response,
//     staleTime: 60 * 60 * 1000, // 1 hour
//   });
// };

// // export const useSearchCourses = (
// //   query: string,
// //   filters?: Record<string, any>
// // ) => {
// //   return useQuery({
// //     queryKey: ["search", query, filters],
// //     queryFn: () => courseService.searchCourses(query, filters),
// //     select: (response) => response.data || response,
// //     enabled: !!query,
// //   });
// // };

// // hooks/useCourses.ts

// export const useEnrollCourse = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (courseId: string) => courseService.enrollCourse(courseId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
//     },
//   });
// };

// export const useEnrolledCourses = () => {
//   return useQuery({
//     queryKey: ["enrolled-courses"],
//     queryFn: () => courseService.getEnrolledCourses(),
//     select: (response) => response.data || response,
//   });
// };

// // Also update the return type for better typing
// export const useIsEnrolled = (courseId: string) => {
//   return useQuery({
//     queryKey: ["is-enrolled", courseId],
//     queryFn: () => courseService.checkEnrollment(courseId),
//     select: (response: EnrollmentStatusResponse) => response,
//     enabled: !!courseId,
//     staleTime: 2 * 60 * 1000,
//   }) as {
//     data: EnrollmentStatusResponse | undefined;
//     isLoading: boolean;
//     error: Error | null;
//     refetch: () => void;
//   };
// };

// // hooks/useCourses.ts - Updated for User wishlist

// export const useWishlistActions = (courseId: string) => {
//   const queryClient = useQueryClient();

//   // Toggle wishlist mutation
//   const toggleWishlistMutation = useMutation({
//     mutationFn: async (action: "add" | "remove") => {
//       if (action === "add") {
//         return await courseService.addToWishlist(courseId);
//       } else {
//         return await courseService.removeFromWishlist(courseId);
//       }
//     },
//     onSuccess: (data, action) => {
//       // Update user's profile in cache (if you have a user query)
//       queryClient.invalidateQueries({ queryKey: ["user-profile"] });

//       // Invalidate wishlist status for this course
//       queryClient.invalidateQueries({
//         queryKey: ["wishlist-status", courseId],
//       });

//       // Invalidate user's wishlist
//       queryClient.invalidateQueries({ queryKey: ["user-wishlist"] });

//       // Update course data in cache
//       queryClient.setQueryData(["course", courseId], (old: any) => {
//         if (old?.success && old?.data) {
//           return {
//             ...old,
//             data: {
//               ...old.data,
//               // You can add a virtual field if needed
//             },
//           };
//         }
//         return old;
//       });
//     },
//     onError: (error) => {
//       console.error("Wishlist action failed:", error);
//     },
//   });

//   // Get wishlist status query
//   const { data: wishlistStatus, isLoading: wishlistLoading } = useQuery({
//     queryKey: ["wishlist-status", courseId],
//     queryFn: () => courseService.getWishlistStatus(courseId),
//     enabled: !!courseId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   const toggleWishlist = (currentStatus: boolean) => {
//     const action = currentStatus ? "remove" : "add";
//     return toggleWishlistMutation.mutateAsync(action);
//   };

//   return {
//     isInWishlist: wishlistStatus?.isInWishlist || false,
//     wishlistCount: wishlistStatus?.wishlistCount || 0,
//     toggleWishlist,
//     isLoading: wishlistLoading || toggleWishlistMutation.isPending,
//     error: toggleWishlistMutation.error,
//   };
// };

// // Hook to get user's wishlist
// export const useUserWishlist = () => {
//   return useQuery({
//     queryKey: ["user-wishlist"],
//     queryFn: () => courseService.getUserWishlist(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     select: (response) => ({
//       courses: response.data || [],
//       count: response.count || 0,
//       totalWishlistCount: response.totalWishlistCount || 0,
//     }),
//   });
// };


// hooks/useCourses.ts
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as courseService from "@/services/course.service";
import {
  Course,
  Review,
  Category,
  EnrollmentStatusResponse,
  SearchFilters,
} from "@/lib/types";

import {useAuth} from "@/context/AuthContext"
// Query keys factory
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters: any) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  categories: () => [...courseKeys.all, "categories"] as const,
  search: (query: string, filters: any) => [...courseKeys.all, "search", query, filters] as const,
  enrolled: () => [...courseKeys.all, "enrolled"] as const,
  wishlist: () => [...courseKeys.all, "wishlist"] as const,
  wishlistStatus: (courseId: string) => [...courseKeys.all, "wishlist-status", courseId] as const,
  reviews: (courseId: string) => [...courseKeys.all, "reviews", courseId] as const,
  lessons: (courseId: string) => [...courseKeys.all, "lessons", courseId] as const,
  instructor: {
    all: ["instructor-courses"] as const,
    list: (params: any) => [...courseKeys.instructor.all, "list", params] as const,
    analytics: (courseId?: string) => [...courseKeys.instructor.all, "analytics", courseId] as const,
  },
};

interface UseCoursesOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
  staleTime?: number;
  retry?: number;
}

interface UseCourseReviewsProps {
  courseId: string;
  enabled?: boolean;
}

// Main courses hook
// hooks/useCourses.ts - Fix the useCourses hook
export const useCourses = (params?: Record<string, any>) => {
  const currentPage = params?.page || 1;
  const itemsPerPage = params?.limit || 12;

  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseService.getAllCourses(params),
    select: (response) => {
      console.log("Courses API Response:", response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            currentPage,
            totalPages: Math.ceil(response.length / itemsPerPage),
            totalItems: response.length,
            itemsPerPage,
          }
        };
      }
      
      // Handle your backend's pagination structure
      if (response && typeof response === 'object') {
        const data = response.data || response.courses || [];
        
        // Extract from your backend structure
        const backendPagination = response.pagination || {};
        const count = response.count || data.length;
        
        // Calculate total pages based on count and limit
        const totalItems = count;
        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Determine current page from next/prev structure
        let calculatedCurrentPage = currentPage;
        if (backendPagination.next) {
          calculatedCurrentPage = backendPagination.next.page - 1;
        } else if (backendPagination.prev) {
          calculatedCurrentPage = backendPagination.prev.page + 1;
        } else {
          calculatedCurrentPage = 1;
        }

        const pagination = {
          currentPage: calculatedCurrentPage,
          totalPages: calculatedTotalPages,
          totalItems: totalItems,
          itemsPerPage: itemsPerPage,
        };

        console.log("Processed pagination:", pagination);
        
        return { data, pagination };
      }
      
      // Fallback
      return { data: [], pagination: null };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fix the useSearchCourses hook too
export const useSearchCourses = (
  query: string,
  filters?: Record<string, any>,
  options: UseCoursesOptions = {}
) => {
  const {
    enabled = true,
    staleTime = 2 * 60 * 1000,
    retry = 1,
  } = options;

  return useQuery({
    queryKey: courseKeys.search(query, filters),
    queryFn: () => courseService.searchCourses(query),
    select: (response) => {
      console.log("🔍 Raw search API response:", response);

      if (!response) {
        return {
          data: [],
          pagination: {
            currentPage: filters?.page || 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: filters?.limit || 12,
          },
          count: 0,
        };
      }

      // Handle array response
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            currentPage: filters?.page || 1,
            totalPages: Math.ceil(response.length / (filters?.limit || 12)),
            totalItems: response.length,
            itemsPerPage: filters?.limit || 12,
          },
          count: response.length,
        };
      }

      // Handle object response - same structure as useCourses
      if (response && typeof response === 'object') {
        const data = response.data || response.courses || response || [];
        const totalItems = response.count || response.total || data.length;
        
        const backendPagination = response.pagination || {};
        let currentPage = filters?.page || 1;
        if (backendPagination.next) {
          currentPage = backendPagination.next.page - 1;
        } else if (backendPagination.prev) {
          currentPage = backendPagination.prev.page + 1;
        }

        const itemsPerPage = backendPagination.limit || filters?.limit || 12;
        const totalPages = backendPagination.totalPages || Math.ceil(totalItems / itemsPerPage);

        return {
          data,
          pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
          },
          count: totalItems,
        };
      }

      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 12,
        },
        count: 0,
      };
    },
    // FIX: Pass options directly
    enabled: !!query && enabled,
    staleTime: staleTime,
    retry: retry,
    refetchOnWindowFocus: false,
  });
};

// Search courses hook
// export const useSearchCourses = (
//   query: string,
//   role: string = "student", 
//   userId: string = "user-id",
//   options: UseCoursesOptions = {}
// ) => {
//   const {
//     enabled = true,
//     staleTime = 2 * 60 * 1000, // 2 minutes for search results
//     retry = 1,
//   } = options;

//   return useQuery({
//     queryKey: courseKeys.search(query, { query, role, userId }),
//     queryFn: () => courseService.searchCourses(query, role, userId),
//     select: (response) => {
//       if (!response) {
//         return {
//           data: [],
//           count: 0,
//         };
//       }

//       // Handle both array and object responses
//       if (Array.isArray(response)) {
//         return {
//           data: response,
//           count: response.length,
//         };
//       }

//       return {
//         data: response.data || response.courses || response || [],
//         count: response.count || response.data?.length || 0,
//       };
//     },
//     enabled: !!query && enabled,
//     staleTime,
//     retry,
//     refetchOnWindowFocus: false,
//   });
// };


// hooks/useCourses.ts - Fix useSearchCourses
// export const useSearchCourses = (
//   query: string,
//   filters?: Record<string, any>,
//   options: UseCoursesOptions = {}
// ) => {
//   const {
//     enabled = true,
//     staleTime = 2 * 60 * 1000,
//     retry = 1,
//   } = options;

//   // Get the current user from your auth context
//   const { user } = useAuth() // Your user hook
//   const userId = user?.id;
//   const userRole = user?.role || 'student';

//   return useQuery({
//     queryKey: courseKeys.search(query, { ...filters, userId, userRole }),
//     queryFn: () => courseService.searchCourses(query, userRole, userId),
//     enabled: !!query && enabled && !!userId, // Only enable if we have a user ID
//     staleTime,
//     retry,
//     refetchOnWindowFocus: false,
//   });
// };
// Dashboard search hook
export const useDashboardSearch = (query: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["dashboard-search", query],
    queryFn: () => courseService.dashboardSearch(query),
    enabled: !!query && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Single course hook
export const useCourse = (identifier: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.detail(identifier),
    queryFn: () => courseService.getCourse(identifier),
    select: (response) => {
      // Return the course data directly
      if (response && typeof response === 'object') {
        return response.data || response;
      }
      return response;
    },
    enabled: !!identifier && options.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes for single course
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
};

// Course by slug with initial data support
export const useCourseBySlug = (identifier: string, initialCourse?: Course) => {
  return useQuery({
    queryKey: courseKeys.detail(identifier),
    queryFn: () => courseService.getCourse(identifier),
    select: (response) => response.data || response,
    enabled: !!identifier,
    initialData: initialCourse,
    staleTime: 5 * 60 * 1000,
  });
};

// Categories hook
export const useCategories = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.categories(),
    queryFn: courseService.getCategories,
    select: (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || response.categories || response || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour for categories
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: options.enabled !== false,
  });
};

// Course lessons hook
export const useCourseLessons = (courseId: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.lessons(courseId),
    queryFn: () => courseService.getCourseLessons(courseId),
    enabled: !!courseId && options.enabled !== false,
    select: (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || response.lessons || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Course reviews hook
export const useCourseReviews = ({
  courseId,
  enabled = true,
}: UseCourseReviewsProps) => {
  return useQuery({
    queryKey: courseKeys.reviews(courseId),
    queryFn: () => courseService.getCourseReviews(courseId),
    select: (response) => {
      const data = response.data || response;
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return {
          reviews: data,
          averageRating: 0,
          totalRatings: data.length,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }
      
      return {
        reviews: data.reviews || [],
        averageRating: data.averageRating || 0,
        totalRatings: data.totalRatings || 0,
        ratingDistribution: data.ratingDistribution || {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
        },
      };
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Video URL hook
export const useVideoUrl = (courseId: string, lessonId: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["video-url", courseId, lessonId],
    queryFn: () => courseService.getVideoUrl(courseId, lessonId),
    enabled: !!courseId && !!lessonId && options.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes for video URLs
  });
};

// Enrollment hooks
export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseService.enrollCourse(courseId),
    onSuccess: (data, courseId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: courseKeys.enrolled() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: ["is-enrolled", courseId] });
    },
    onError: (error, courseId) => {
      console.error(`Enrollment failed for course ${courseId}:`, error);
    },
  });
};

export const useEnrolledCourses = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.enrolled(),
    queryFn: () => courseService.getEnrolledCourses(),
    select: (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || response || [];
    },
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // Shorter cache for enrolled courses
  });
};

export const useCourseProgress = (courseId: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => courseService.getCourseProgress(courseId),
    enabled: !!courseId && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => 
      courseService.updateProgress(courseId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", variables.courseId] });
    },
  });
};

export const useIsEnrolled = (courseId: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["is-enrolled", courseId],
    queryFn: () => courseService.checkEnrollment(courseId),
    select: (response: EnrollmentStatusResponse) => response,
    enabled: !!courseId && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Wishlist hooks
export const useWishlistActions = (courseId: string) => {
  const queryClient = useQueryClient();

  const toggleWishlistMutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (action === "add") {
        return await courseService.addToWishlist(courseId);
      } else {
        return await courseService.removeFromWishlist(courseId);
      }
    },
    onSuccess: (data, action) => {
      // Invalidate all relevant wishlist queries
      queryClient.invalidateQueries({ queryKey: courseKeys.wishlist() });
      queryClient.invalidateQueries({ queryKey: courseKeys.wishlistStatus(courseId) });
      
      // Update user profile if exists
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Optimistically update course data
      queryClient.setQueryData(courseKeys.detail(courseId), (old: any) => {
        if (!old) return old;
        
        const courseData = old.data || old;
        return {
          ...old,
          data: {
            ...courseData,
            isInWishlist: action === "add",
          },
        };
      });
    },
    onError: (error, action) => {
      console.error(`Wishlist ${action} failed:`, error);
    },
  });

  const { data: wishlistStatus, isLoading: wishlistLoading } = useQuery({
    queryKey: courseKeys.wishlistStatus(courseId),
    queryFn: () => courseService.getWishlistStatus(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  const toggleWishlist = (currentStatus: boolean) => {
    const action = currentStatus ? "remove" : "add";
    return toggleWishlistMutation.mutateAsync(action);
  };

  return {
    isInWishlist: wishlistStatus?.isInWishlist || false,
    wishlistCount: wishlistStatus?.wishlistCount || 0,
    toggleWishlist,
    isLoading: wishlistLoading || toggleWishlistMutation.isPending,
    error: toggleWishlistMutation.error,
  };
};

export const useUserWishlist = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.wishlist(),
    queryFn: () => courseService.getUserWishlist(),
    select: (response) => ({
      courses: response.data || [],
      count: response.count || 0,
      totalWishlistCount: response.totalWishlistCount || 0,
    }),
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Review mutations
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => 
      courseService.addReview(courseId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.reviews(variables.courseId) });
    },
  });
};

// Instructor courses hook
export const useInstructorCourses = (params: any = {}, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: courseKeys.instructor.list(params),
    queryFn: () => courseService.getInstructorCourses(params),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
};

// Instructor analytics hook
export const useInstructorAnalytics = (courseId?: string) => {
  return useQuery({
    queryKey: courseKeys.instructor.analytics(courseId),
    queryFn: () => courseService.getInstructorAnalytics(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Instructor earnings hook
export const useInstructorEarnings = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["instructor-earnings"],
    queryFn: () => courseService.getInstructorEarnings(),
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};

// Instructor students hook
export const useInstructorStudents = (courseId?: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["instructor-students", courseId],
    queryFn: () => courseService.getInstructorStudents(courseId),
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};

// Course management mutations
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => courseService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor.all });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      courseService.updateCourse(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor.all });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.removeQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor.all });
    },
  });
};

// Lesson management mutations
export const useAddLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => 
      courseService.addLesson(courseId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lessons(variables.courseId) });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId, data }: { courseId: string; lessonId: string; data: FormData }) => 
      courseService.updateLesson(courseId, lessonId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lessons(variables.courseId) });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) => 
      courseService.deleteLesson(courseId, lessonId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lessons(variables.courseId) });
    },
  });
};

// Course status management
export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) => 
      courseService.updateCourseStatus(courseId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor.all });
    },
  });
};

export const useBulkUpdateCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseIds, status }: { courseIds: string[]; status: string }) => 
      courseService.bulkUpdateCourseStatus(courseIds, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      variables.courseIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor.all });
    },
  });
};

// Instructor application hooks
export const useApplyForInstructor = () => {
  return useMutation({
    mutationFn: () => courseService.applyForInstructor(),
  });
};

export const useInstructorApplications = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["instructor-applications"],
    queryFn: () => courseService.getInstructorApplications(),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateInstructorApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: "approved" | "rejected"; reason?: string }) => 
      courseService.updateInstructorApplication(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-applications"] });
    },
  });
};

// Cache management hook (using React Query's built-in cache)
export const useCourseCache = () => {
  const queryClient = useQueryClient();

  const clearCourseCache = () => {
    queryClient.removeQueries({ queryKey: courseKeys.all });
  };

  const invalidateCourseList = () => {
    queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
  };

  const invalidateCourse = (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  const prefetchCourse = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(courseId),
      queryFn: () => courseService.getCourse(courseId),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    clearCourseCache,
    invalidateCourseList,
    invalidateCourse,
    prefetchCourse,
  };
};