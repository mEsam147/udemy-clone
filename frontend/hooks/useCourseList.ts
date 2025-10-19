// hooks/useCourseList.ts
import useSWR from 'swr';
import { fetchWrapper } from '@/lib/api';
import { Course, PaginationInfo } from '@/lib/types';

interface CourseListResponse {
  success: boolean;
  data: Course[];
  count: number;
  pagination: PaginationInfo;
}

interface UseCourseListParams {
  filters: {
    query?: string;
    categories?: string[];
    levels?: string[];
    priceRange?: [number, number];
    durationRange?: [number, number];
    rating?: number;
    features?: string[];
    language?: string;
    sortBy?: string;
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export function useCourseList({ filters, pagination }: UseCourseListParams) {
  const params = new URLSearchParams();

  // Add filters
  if (filters.query) params.append('search', filters.query);
  if (filters.categories && filters.categories.length > 0) params.append('category', filters.categories.join(','));
  if (filters.levels && filters.levels.length > 0) params.append('level', filters.levels.join(','));
  if (filters.priceRange) {
    params.append('minPrice', filters.priceRange[0].toString());
    params.append('maxPrice', filters.priceRange[1].toString());
  }
  if (filters.durationRange) {
    params.append('minDuration', filters.durationRange[0].toString());
    params.append('maxDuration', filters.durationRange[1].toString());
  }
  if (filters.rating) params.append('minRating', filters.rating.toString());
  if (filters.features && filters.features.length > 0) params.append('features', filters.features.join(','));
  if (filters.language && filters.language !== 'all') params.append('language', filters.language);

  // Add sorting
  const sortMap: Record<string, string> = {
    newest: '-createdAt',
    popular: '-enrollments',
    'price-low': 'price',
    'price-high': '-price',
    rating: '-rating',
    'duration-short': 'duration',
    'duration-long': '-duration',
  };
  params.append('sort', sortMap[filters.sortBy] || '-createdAt');

  // Add pagination
  params.append('page', pagination.page.toString());
  params.append('limit', pagination.limit.toString());

  const { data, error, isLoading } = useSWR<CourseListResponse>(
    `/courses?${params.toString()}`,
    fetchWrapper,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    courses: data?.data || [],
    pagination: data?.pagination,
    total: data?.count || 0,
    isLoading,
    error,
  };
}