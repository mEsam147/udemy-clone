// hooks/useCategories.ts
import useSWR from "swr";
import { fetchWrapper } from "@/lib/api";
import { Category } from "@/lib/types";

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    "/categories",
    fetchWrapper,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
}
