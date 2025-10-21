// hooks/useComparisonApi.ts - COMPLETE FIXED VERSION
import { useMutation, useQuery } from "@tanstack/react-query";
import { Course } from "@/lib/types";
import { compareService } from "@/services/compare.service";

export function useComparison() {
  // Get comparison data
  const getComparison = useMutation({
    mutationFn: async (courseIds: string[]) => {
      return await compareService.getComparisonData(courseIds);
    },
    onError: (error: any) => {
      console.error("❌ useComparison - Error:", error);
    }
  });

  // Get available courses for comparison
  const getAvailableCourses = useQuery({
    queryKey: ["availableCoursesForComparison"],
    queryFn: async () => {
      return await compareService.getAvailableCourses();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return {
    getComparison,
    getAvailableCourses
  };
}
