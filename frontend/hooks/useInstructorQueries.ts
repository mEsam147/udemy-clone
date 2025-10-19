// hooks/useInstructors.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  instructorService,
  type InstructorFilters,
  type InstructorsResponse,
} from "@/services/instructor.service";

// Get all instructors with filters and pagination
export const useInstructors = (filters: InstructorFilters = {}) => {
  return useQuery({
    queryKey: ["instructors", filters],
    queryFn: () => instructorService.getAllInstructors(filters),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

// Get instructor by ID
export const useInstructor = (id: string) => {
  return useQuery({
    queryKey: ["instructor", id],
    queryFn: () => instructorService.getInstructorById(id),
    retry: 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

// Infinite query for instructors (for infinite scroll)
export const useInfiniteInstructors = (
  filters: Omit<InstructorFilters, "page"> = {}
) => {
  return useInfiniteQuery({
    queryKey: ["instructors", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      instructorService.getAllInstructors({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage: InstructorsResponse) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
};
export const useInstructorCourses = (
  instructorId: string,
  filters: any = {}
) => {
  return useQuery({
    queryKey: ["instructor", instructorId, "courses", filters],
    queryFn: () =>
      instructorService.getInstructorPublicCourses(instructorId, filters),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    enabled: !!instructorId,
  });
};
