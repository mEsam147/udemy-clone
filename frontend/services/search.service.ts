import { fetchWrapper } from "@/lib/api";

// Types
export interface SearchResult {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  isPublished?: boolean;
  isEnrolled?: boolean;
  course?: {
    _id: string;
    title: string;
    slug: string;
  };
  duration?: number;
  email?: string;
  type: "course" | "lesson" | "student";
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    query: string;
  };
}

export interface RecentSearchesResponse {
  success: boolean;
  data: {
    recentSearches: string[];
  };
}

// Retry function with exponential backoff
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<any> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // If it's not a rate limit error, don't retry
      if (!error.message?.includes("429") && !error.message?.includes("rate limit")) {
        throw error;
      }

      const backoffDelay = initialDelay * Math.pow(2, i);
      console.warn(`Rate limited. Retrying in ${backoffDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};

// Search Services
export const searchService = {
  /**
   * Perform dashboard search with role-based filtering
   */
  dashboardSearch: async (query: string): Promise<SearchResponse> => {
    return retryWithBackoff(async () => {
      if (!query || query.trim().length === 0) {
        return {
          success: true,
          data: {
            results: [],
            total: 0,
            query: "",
          },
        };
      }

      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetchWrapper(`/search/dashboard?query=${encodedQuery}`, "GET");

      return response;
    });
  },

  /**
   * Get recent searches for the authenticated user
   */
  getRecentSearches: async (): Promise<RecentSearchesResponse> => {
    return retryWithBackoff(async () => {
      return fetchWrapper("/search/recent", "GET");
    });
  },

  /**
   * Clear recent searches for the authenticated user
   */
  clearRecentSearches: async (): Promise<{ success: boolean; message: string }> => {
    return retryWithBackoff(async () => {
      return fetchWrapper("/search/recent", "DELETE");
    });
  },

  /**
   * Search courses with advanced filters
   */
  searchCourses: async (params: {
    query: string;
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<any> => {
    return retryWithBackoff(async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return fetchWrapper(`/search/courses?${searchParams.toString()}`, "GET");
    });
  },

  /**
   * Search lessons within a specific course
   */
  searchLessons: async (courseId: string, query: string): Promise<any> => {
    return retryWithBackoff(async () => {
      const encodedQuery = encodeURIComponent(query);
      return fetchWrapper(`/search/courses/${courseId}/lessons?query=${encodedQuery}`, "GET");
    });
  },

  /**
   * Search users (for admin/instructor)
   */
  searchUsers: async (params: {
    query: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    return retryWithBackoff(async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      return fetchWrapper(`/search/users?${searchParams.toString()}`, "GET");
    });
  },
};

// Utility functions
export const searchUtils = {
  /**
   * Filter search results by type
   */
  filterByType: (results: SearchResult[], type: SearchResult["type"]): SearchResult[] => {
    return results.filter(result => result.type === type);
  },

  /**
   * Group search results by type
   */
  groupByType: (results: SearchResult[]): Record<string, SearchResult[]> => {
    return results.reduce((groups, result) => {
      const type = result.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(result);
      return groups;
    }, {} as Record<string, SearchResult[]>);
  },

  /**
   * Sort search results by relevance
   */
  sortByRelevance: (results: SearchResult[]): SearchResult[] => {
    return [...results].sort((a, b) => {
      // Add your relevance scoring logic here
      // For now, just return as-is
      return 0;
    });
  },

  /**
   * Highlight search terms in text
   */
  highlightText: (text: string, query: string): string => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Calculate search score based on match quality
   */
  calculateSearchScore: (item: SearchResult, query: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Title matches are most important
    if (item.title?.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }

    // Category matches
    if (item.category?.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    // Exact matches get bonus points
    if (item.title?.toLowerCase() === lowerQuery) {
      score += 15;
    }

    // Course enrollment status (for students)
    if (item.isEnrolled) {
      score += 3;
    }

    // Published status
    if (item.isPublished) {
      score += 2;
    }

    return score;
  },
};

// Export types for use in components
export type { SearchResult };
