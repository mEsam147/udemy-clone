// hooks/useHomeSearch.ts
import { useQuery } from "@tanstack/react-query";
import * as searchService from "@/services/home.service";
import { useDebounce } from "@/hooks/use-debounce";
import React from "react";

interface UseHomeSearchParams extends Partial<searchService.SearchParams> {
  query?: string;
  enabled?: boolean;
}

export function useHomeSearch({
  query,
  type = "all",
  lang = "en",
  page = 1,
  limit = 10,
  category,
  level,
  price_min,
  price_max,
  sort = "relevance",
  enabled = true,
}: UseHomeSearchParams) {
  const debouncedQuery = useDebounce(query, 300);

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "search",
      {
        q: debouncedQuery,
        type,
        lang,
        page,
        limit,
        category,
        level,
        price_min,
        price_max,
        sort,
      },
    ],
    queryFn: () =>
      searchService.homeService.search({
        q: debouncedQuery!,
        type,
        lang,
        page,
        limit,
        category,
        level,
        price_min,
        price_max,
        sort,
      }),
    // Fix: Enable query when enabled is true OR when we have a query
    enabled: enabled || !!debouncedQuery,
    staleTime: 5 * 60 * 1000,
  });

  const data = React.useMemo(() => {
    if (!apiData?.data) {
      return {
        results: {
          courses: { items: [], count: 0 },
          instructors: { items: [], count: 0 },
          lessons: { items: [], count: 0 },
          total: 0,
          page: 1,
          totalPages: 0,
        },
      };
    }
    return apiData.data;
  }, [apiData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
