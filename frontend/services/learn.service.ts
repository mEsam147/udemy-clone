import { fetchWrapper } from "@/lib/api";

// Types
export interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    expertise: string[];
  };
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  enrolledAt: string;
  rating?: number;
  nextLesson?: {
    id: string;
    title: string;
    duration: number;
    order: number;
  };
  estimatedCompletionTime?: {
    lessonsRemaining: number;
    hoursRemaining: number;
    daysEstimated: number;
    completionPace: string;
  };
}

export interface LearningProgress {
  totalEnrolled: number;
  totalCompleted: number;
  totalInProgress: number;
  completionRate: number;
  averageProgress: number;
  totalHoursCompleted: number;
  currentStreak: number;
  maxStreak: number;
  dailyActivity: Array<{
    date: string;
    activities: number;
    uniqueCourses: number;
  }>;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  isCompleted: boolean;
  resources: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  transcript?: string;
}

export interface CourseLearningData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    expertise: string[];
    responseTime: string;
    officeHours: string;
  };
  progress: number;
  lessons: Lesson[];
  isEnrolled: boolean;
  canAccessFullContent: boolean;
  nextLesson?: Lesson;
  courseCompleted: boolean;
  enrollment?: {
    id: string;
    progress: number;
    enrolledAt: string;
    lastAccessed: string;
    rating?: number;
  };
}

export interface LearningRecommendation {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  price: number;
  originalPrice?: number;
  discountInfo?: {
    originalPrice: number;
    discountPercentage: number;
    savings: number;
  };
  category: string;
  level: string;
  ratings: {
    average: number;
    count: number;
  };
  studentsEnrolled: number;
  totalHours: number;
  lecturesCount: number;
  whyRecommended: string;
}

// Retry function with exponential backoff
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
      if (!error.message?.includes("429")) {
        throw error;
      }

      const backoffDelay = initialDelay * Math.pow(2, i);
      console.warn(`Rate limited. Retrying in ${backoffDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};

// Learning Services
// export const getEnrolledCourses = async (params?: {
//   page?: number;
//   limit?: number;
// }): Promise<{
//   data: EnrolledCourse[];
//   count: number;
//   total: number;
//   pagination: any;
//   overallProgress: number;
// }> => {
//   return retryWithBackoff(async () => {
//     const queryString = params
//       ? new URLSearchParams(params as any).toString()
//       : "";
//     const endpoint = queryString ? `/learn?${queryString}` : "/learn";
//     const response = await fetchWrapper(endpoint);

//     return {
//       data: response.data || response.courses || [],
//       count: response.count || 0,
//       total: response.total || 0,
//       pagination: response.pagination || {},
//       overallProgress: response.overallProgress || 0,
//     };
//   });
// };

// export const getCourseLearningData = async (
//   slug: string
// ): Promise<CourseLearningData> => {
//   return retryWithBackoff(async () => {
//     const response = await fetchWrapper(`/learn/courses/${slug}`);

//     if (!response.success) {
//       throw new Error(response.message || "Failed to fetch course data");
//     }

//     return response.data;
//   });
// };

// export const updateLessonProgress = async (
//   courseId: string,
//   lessonId: string,
//   completed: boolean
// ): Promise<any> => {
//   return retryWithBackoff(async () => {
//     return fetchWrapper(`/learn/courses/${courseId}/progress`, "PUT", {
//       lessonId,
//       completed,
//     });
//   });
// };

// export const getLearningProgress = async (
//   range?: string
// ): Promise<LearningProgress> => {
//   return retryWithBackoff(async () => {
//     const endpoint = range
//       ? `/learn/progress?range=${range}`
//       : "/learn/progress";
//     const response = await fetchWrapper(endpoint);
//     return response.data || response;
//   });
// };

// export const getLearningRecommendations = async (params?: {
//   limit?: number;
//   category?: string;
//   level?: string;
// }): Promise<LearningRecommendation[]> => {
//   return retryWithBackoff(async () => {
//     const queryString = params
//       ? new URLSearchParams(params as any).toString()
//       : "";
//     const endpoint = queryString
//       ? `/learn/recommendations?${queryString}`
//       : "/learn/recommendations";
//     const response = await fetchWrapper(endpoint);
//     return response.data || response.recommendations || [];
//   });
// };

// export const getRecentCourses = async (params?: {
//   limit?: number;
//   days?: number;
// }): Promise<EnrolledCourse[]> => {
//   return retryWithBackoff(async () => {
//     const queryString = params
//       ? new URLSearchParams(params as any).toString()
//       : "";
//     const endpoint = queryString
//       ? `/learn/recent?${queryString}`
//       : "/learn/recent";
//     const response = await fetchWrapper(endpoint);
//     return response.data || response.courses || [];
//   });
// };

// export const searchLearningContent = async (
//   query: string,
//   filters?: {
//     type?: string;
//     category?: string;
//     level?: string;
//     page?: number;
//     limit?: number;
//   }
// ): Promise<any> => {
//   return retryWithBackoff(async () => {
//     const params = new URLSearchParams({ q: query, ...filters });
//     return fetchWrapper(`/learn/search?${params.toString()}`);
//   });
// };

// export const getLearningStreaks = async (days?: number): Promise<any> => {
//   return retryWithBackoff(async () => {
//     const endpoint = days ? `/learn/streaks?days=${days}` : "/learn/streaks";
//     const response = await fetchWrapper(endpoint);
//     return response.data || response;
//   });
// };

// export const getLearningTimeline = async (params?: {
//   limit?: number;
//   since?: string;
// }): Promise<any> => {
//   return retryWithBackoff(async () => {
//     const queryString = params
//       ? new URLSearchParams(params as any).toString()
//       : "";
//     const endpoint = queryString
//       ? `/learn/timeline?${queryString}`
//       : "/learn/timeline";
//     const response = await fetchWrapper(endpoint);
//     return response.data || response.timeline || [];
//   });
// };

// // Additional utility functions
// export const calculateTimeToComplete = (
//   totalHours: number,
//   progress: number
// ): string => {
//   const remainingHours = totalHours * (1 - progress / 100);
//   if (remainingHours < 1) return "Less than 1 hour";
//   if (remainingHours < 24) return `${Math.ceil(remainingHours)} hours`;
//   return `${Math.ceil(remainingHours / 24)} days`;
// };

// export const formatDuration = (minutes: number): string => {
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   if (hours > 0) {
//     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
//   }
//   return `${mins}m`;
// };

// export const getProgressColor = (progress: number): string => {
//   if (progress >= 90) return "text-green-600";
//   if (progress >= 70) return "text-blue-600";
//   if (progress >= 50) return "text-yellow-600";
//   return "text-red-600";
// };

// export const getProgressVariant = (
//   progress: number
// ): "default" | "secondary" | "destructive" => {
//   if (progress >= 90) return "default";
//   if (progress >= 50) return "secondary";
//   return "destructive";
// };

import { Enrollment } from "@/lib/types";

export interface LearningProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export const learnService = {
  getEnrolledCourses: () => fetchWrapper("/learn", "GET"),

  getLearningProgress: () => fetchWrapper("/learn/progress", "GET"),

  getLearningRecommendations: () =>
    fetchWrapper("/learn/recommendations", "GET"),

  getRecentCourses: () => fetchWrapper("/learn/recent", "GET"),

  searchLearningContent: (query: string) =>
    fetchWrapper(`/learn/search?query=${query}`, "GET"),

  getLearningStreaks: () => fetchWrapper("/learn/streaks", "GET"),

  getLearningTimeline: () => fetchWrapper("/learn/timeline", "GET"),

  getCourseLearningData: (slug: string) =>
    fetchWrapper(`/learn/courses/${slug}`, "GET"),

  updateLessonProgress: (courseId: string, progress: number) =>
    fetchWrapper(`/learn/courses/${courseId}/progress`, "PUT", { progress }),
};
