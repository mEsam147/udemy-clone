// hooks/useCompare.ts - COMPLETE FIXED VERSION
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareService } from "@/services/compare.service";
import type { Course } from "@/lib/types";
import { useCallback } from "react";

// Query key factory
export const compareKeys = {
  all: ["compare"] as const,
  lists: () => [...compareKeys.all, "list"] as const,
  list: (filters: any) => [...compareKeys.lists(), { filters }] as const,
};

// Hook to manage compare list with proper persistence
export function useCompareList() {
  const queryClient = useQueryClient();

  // Get current compare list from query cache
  const getCompareList = useCallback((): Course[] => {
    const list = queryClient.getQueryData(compareKeys.lists()) || [];
    console.log("🔄 getCompareList - Current list:", list.map(c => ({
      id: c._id,
      title: c.title,
      hasValidId: !!(c._id && c._id.length === 24)
    })));
    return list;
  }, [queryClient]);

  // Add course to compare list
  const addToCompare = useCallback((course: Course) => {
    console.log("🔄 addToCompare - Adding course:", {
      id: course._id,
      title: course.title,
      hasValidId: course._id && course._id.length === 24
    });

    // Validate course has proper _id field
    if (!course._id || course._id.length !== 24) {
      console.error("❌ addToCompare - Invalid course ID:", course._id);
      throw new Error(`Invalid course ID: ${course._id}. Cannot add to comparison.`);
    }

    const currentList = getCompareList();

    if (currentList.length >= 3) {
      throw new Error("Cannot compare more than 3 courses");
    }

    // Check if course is already in list
    const exists = currentList.find((c) => c._id === course._id);
    if (exists) {
      throw new Error("Course already in comparison list");
    }

    const newList = [...currentList, course];
    console.log("🔄 addToCompare - New list:", newList.map(c => ({
      id: c._id,
      title: c.title
    })));
    queryClient.setQueryData(compareKeys.lists(), newList);

    return newList;
  }, [queryClient, getCompareList]);

  // Remove course from compare list
  const removeFromCompare = useCallback((courseId: string) => {
    console.log("🔄 removeFromCompare - Removing:", courseId);
    const currentList = getCompareList();
    const newList = currentList.filter((c) => c._id !== courseId);
    queryClient.setQueryData(compareKeys.lists(), newList);
    return newList;
  }, [queryClient, getCompareList]);

  // Clear compare list
  const clearCompareList = useCallback(() => {
    console.log("🔄 clearCompareList");
    queryClient.setQueryData(compareKeys.lists(), []);
  }, [queryClient]);


  // Check if course is in compare list
  const isInCompareList = useCallback((courseId: string): boolean => {
    const currentList = getCompareList();
    const isInList = currentList.some((c) => c._id === courseId);
    console.log("🔄 isInCompareList - Course:", courseId, "In list:", isInList);
    return isInList;
  }, [getCompareList]);

  return {
    addToCompare,
    removeFromCompare,
    clearCompareList,
    isInCompareList,
    getCompareList,
  };
}

// Hook to fetch comparison data from API - FIXED
export function useComparisonData(courseIds: string[]) {
  return useQuery({
    queryKey: ["comparison", "data", ...courseIds],
    queryFn: () => {
      console.log("🔄 useComparisonData - Fetching for courseIds:", courseIds);

      // Validate course IDs before making the API call
      const validCourseIds = courseIds.filter(id => id && id.length === 24);

      if (validCourseIds.length === 0) {
        console.error("❌ useComparisonData - No valid course IDs");
        throw new Error("No valid course IDs provided");
      }

      console.log("🔄 useComparisonData - Valid course IDs:", validCourseIds);
      return compareService.getComparisonData(validCourseIds);
    },
    enabled: courseIds.length > 0 && courseIds.every(id => id && id.length === 24),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch courses for comparison - FIXED
export function useCompareCourses(courseIds: string[]) {
  return useQuery({
    queryKey: ["compare", "courses", ...courseIds],
    queryFn: () => {
      console.log("🔄 useCompareCourses - Fetching for courseIds:", courseIds);

      // Validate course IDs before making the API call
      const validCourseIds = courseIds.filter(id => id && id.length === 24);

      if (validCourseIds.length === 0) {
        console.error("❌ useCompareCourses - No valid course IDs");
        throw new Error("No valid course IDs provided");
      }

      console.log("🔄 useCompareCourses - Valid course IDs:", validCourseIds);
      return compareService.getCoursesForComparison(validCourseIds);
    },
    enabled: courseIds.length > 0 && courseIds.every(id => id && id.length === 24),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get comparison summary
export function useCompareSummary() {
  const { getCompareList } = useCompareList();

  const compareList = getCompareList();

  return {
    compareList,
    count: compareList.length,
    canAddMore: compareList.length < 3,
    hasCourses: compareList.length > 0,
    courseIds: compareList.map(course => course._id).filter(id => id && id.length === 24),
  };
}
