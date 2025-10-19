// services/compare.service.ts - FIXED VERSION
import type { Course, ComparisonData } from "@/lib/types";

class CompareService {
  async getCoursesForComparison(courseIds: string[]): Promise<Course[]> {
    console.log("🔍 CompareService - getCoursesForComparison called with:", courseIds);
    
    // Validate course IDs before sending
    const validCourseIds = courseIds.filter(id => id && id.length === 24);
    
    if (validCourseIds.length === 0) {
      throw new Error("No valid course IDs provided");
    }

    console.log("🔍 CompareService - Sending valid course IDs:", validCourseIds);

    const response = await fetch("/api/compare/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseIds: validCourseIds
      }),
    });

    console.log("🔍 CompareService - Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("🔍 CompareService - Error response:", errorData);
      throw new Error(errorData.message || "Failed to fetch comparison courses");
    }

    const data = await response.json();
    console.log("🔍 CompareService - Success response:", data);
    return data.data;
  }

  async getComparisonData(courseIds: string[]): Promise<ComparisonData> {
    console.log("🔍 CompareService - getComparisonData called with:", courseIds);
    
    // Validate course IDs before sending
    const validCourseIds = courseIds.filter(id => id && id.length === 24);
    
    if (validCourseIds.length === 0) {
      throw new Error("No valid course IDs provided");
    }

    console.log("🔍 CompareService - Sending valid course IDs:", validCourseIds);

    const response = await fetch(`/api/compare/${validCourseIds.join(",")}`);

    console.log("🔍 CompareService - Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("🔍 CompareService - Error response:", errorData);
      throw new Error(errorData.message || "Failed to fetch comparison data");
    }

    const data = await response.json();
    console.log("🔍 CompareService - Success response:", data);
    return data.data;
  }
}

export const compareService = new CompareService();