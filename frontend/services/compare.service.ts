// services/compare.service.ts - UPDATED WITH REAL API
import { fetchWrapper } from "@/lib/api";
import type { Course, ComparisonData } from "@/lib/types";

class CompareService {
  private baseUrl = '/compare';

  /**
   * Get courses for comparison by their IDs
   */
  async getCoursesForComparison(courseIds: string[]): Promise<Course[]> {
    console.log("🔍 CompareService - getCoursesForComparison called with:", courseIds);

    // Validate course IDs before sending
    const validCourseIds = courseIds.filter(id => id && id.length >= 1);

    if (validCourseIds.length === 0) {
      throw new Error("No valid course IDs provided");
    }

    if (validCourseIds.length > 3) {
      throw new Error("Cannot compare more than 3 courses");
    }

    console.log("🔍 CompareService - Sending valid course IDs:", validCourseIds);

    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/courses`,
        "POST",
        { courseIds: validCourseIds }
      );

      console.log("🔍 CompareService - Success response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ CompareService - Error:", error);
      throw error;
    }
  }

  /**
   * Get detailed comparison data for courses
   */
  async getComparisonData(courseIds: string[]): Promise<ComparisonData> {
    console.log("🔍 CompareService - getComparisonData called with:", courseIds);

    // Validate course IDs before sending
    const validCourseIds = courseIds.filter(id => id && id.length >= 1);

    if (validCourseIds.length === 0) {
      throw new Error("No valid course IDs provided");
    }

    if (validCourseIds.length > 3) {
      throw new Error("Cannot compare more than 3 courses");
    }

    console.log("🔍 CompareService - Sending valid course IDs:", validCourseIds);

    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/${validCourseIds.join(",")}`,
        "GET"
      );

      console.log("🔍 CompareService - Success response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ CompareService - Error:", error);
      throw error;
    }
  }

  /**
   * Get available courses for comparison
   */
  async getAvailableCourses(params?: {
    page?: number;
    limit?: number;
  }) {
    try {
      const queryString = params
        ? `?page=${params.page || 1}&limit=${params.limit || 10}`
        : '';

      const response = await fetchWrapper(
        `${this.baseUrl}/available/courses${queryString}`,
        "GET"
      );

      return response.data;
    } catch (error) {
      console.error("❌ CompareService - Error fetching available courses:", error);
      throw error;
    }
  }

  /**
   * Add a course to comparison list (API call)
   */
  async addToComparison(courseId: string): Promise<{ success: boolean; message: string }> {
    if (!courseId) {
      throw new Error("Invalid course ID");
    }

    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/add/${courseId}`,
        "POST"
      );

      return response;
    } catch (error) {
      console.error("❌ CompareService - Error adding course to comparison:", error);
      throw error;
    }
  }

  /**
   * Remove a course from comparison list (API call)
   */
  async removeFromComparison(courseId: string): Promise<{ success: boolean; message: string }> {
    if (!courseId) {
      throw new Error("Invalid course ID");
    }

    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/remove/${courseId}`,
        "DELETE"
      );

      return response;
    } catch (error) {
      console.error("❌ CompareService - Error removing course from comparison:", error);
      throw error;
    }
  }

  /**
   * Clear all courses from comparison list (API call)
   */
  async clearComparison(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/clear`,
        "DELETE"
      );

      return response;
    } catch (error) {
      console.error("❌ CompareService - Error clearing comparison:", error);
      throw error;
    }
  }

  /**
   * Get user's comparison list from server
   */
  async getComparisonList(): Promise<Course[]> {
    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/list`,
        "GET"
      );

      return response.data || [];
    } catch (error) {
      console.error("❌ CompareService - Error getting comparison list:", error);
      throw error;
    }
  }

  /**
   * Sync local comparison with server
   */
  async syncComparison(courseIds: string[]): Promise<{ success: boolean }> {
    try {
      const response = await fetchWrapper(
        `${this.baseUrl}/sync`,
        "POST",
        { courseIds }
      );

      return response;
    } catch (error) {
      console.error("❌ CompareService - Error syncing comparison:", error);
      throw error;
    }
  }
}

export const compareService = new CompareService();
