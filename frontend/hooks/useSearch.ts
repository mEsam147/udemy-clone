"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "./use-debounce";
import { useAuth } from "@/context/AuthContext";
import { searchCourses } from "@/services/course.service";

interface Course {
  _id: string;
  title: string;
  slug: string;
  image: string;
  instructor: { name: string };
  ratings: { average: number; count: number };
  category: string;
}

interface SearchResponse {
  success: boolean;
  data: Course[];
}

const useSearch = () => {
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchSearchResults = async (query: string) => {
    if (!query ) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data: SearchResponse = await searchCourses(query, { limit: 5, suggest: true });
      if (!data.success) {
        throw new Error(data.message || "Search failed");
      }
      setSearchResults(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during search");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
  };
};

export default useSearch;