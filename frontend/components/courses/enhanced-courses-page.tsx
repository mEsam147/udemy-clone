// components/courses/enhanced-courses-page.tsx - COMPLETE FIXED VERSION
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Grid,
  List,
  Compass as Compare,
  TrendingUp,
  BookOpen,
  Filter,
  Crown,
  Lock,
  CheckCircle,
  Zap,
} from "lucide-react";
import { CourseGrid } from "@/components/courses/course-grid";
import { AdvancedSearch } from "@/components/courses/advanced-search";
import {
  useCourses,
  useCategories,
  useSearchCourses,
} from "@/hooks/useCourses";
import type {
  Course,
  Category,
  PaginationInfo,
  SearchFilters,
} from "@/lib/types";
import { CustomPagination } from "../ui/custom-pagination";
import { CourseComparison } from "./course-comparison";
import { useAuth } from "@/context/AuthContext";
import { useCompareList, useCompareSummary } from "@/hooks/useCompare";

interface EnhancedCoursesPageProps {
  initialCourses?: Course[];
  initialCategories?: Category[];
  initialPagination?: PaginationInfo;
}

const sortOptions = [
  { value: "newest", label: "Newest", icon: BookOpen },
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "duration-short", label: "Shortest First" },
  { value: "duration-long", label: "Longest First" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function EnhancedCoursesPage({
  initialCourses = [],
  initialCategories = [],
  initialPagination,
}: EnhancedCoursesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Parse URL search parameters
  const urlSearch = searchParams?.get("search") || "";
  const urlCategory = searchParams?.get("category") || "";
  const urlSort = searchParams?.get("sort") || "newest";
  const urlPage = searchParams?.get("page") || "1";

  // State for all internal management
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Pagination state - initialize from URL
  const [currentPage, setCurrentPage] = useState(parseInt(urlPage) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Premium user detection
  const isPremiumUser =
    user?.subscription?.plan === "pro" || user?.subscription?.plan === "team";
  const userPlan = user?.subscription?.plan || "free";

  // Initialize filters from URL parameters
  const initialFilters = useMemo((): SearchFilters => {
    const categories = urlCategory ? [urlCategory] : [];

    return {
      query: urlSearch,
      categories: categories,
      levels: [],
      priceRange: [0, 500],
      durationRange: [0, 50],
      rating: 0,
      features: [],
      language: "all",
      sortBy: (urlSort as any) || "newest",
    };
  }, [urlSearch, urlCategory, urlSort]);

  // Filters state - initialized from URL
  const [currentFilters, setCurrentFilters] =
    useState<SearchFilters>(initialFilters);

  // Use compare hooks
  const { 
    addToCompare, 
    removeFromCompare, 
    clearCompareList, 
    isInCompareList,
    getCompareList 
  } = useCompareList();

  const { compareList, count: compareCount, canAddMore } = useCompareSummary();

  // Determine if we need to fetch from API or use initial data
  const hasActiveFilters = useMemo(() => {
    return (
      currentFilters.query ||
      currentFilters.categories.length > 0 ||
      currentFilters.levels.length > 0 ||
      currentFilters.priceRange[0] > 0 ||
      currentFilters.priceRange[1] < 500 ||
      currentFilters.durationRange[0] > 0 ||
      currentFilters.durationRange[1] < 50 ||
      currentFilters.rating > 0 ||
      currentFilters.features.length > 0 ||
      currentFilters.language !== "all" ||
      currentFilters.sortBy !== "newest"
    );
  }, [currentFilters]);

  // Update URL when filters or pagination change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add search parameters
    if (currentFilters.query) params.set("search", currentFilters.query);
    if (currentFilters.categories.length > 0) {
      params.set("category", currentFilters.categories[0]); // Take first category for URL
    }
    if (currentFilters.sortBy && currentFilters.sortBy !== "newest") {
      params.set("sort", currentFilters.sortBy);
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    // Build new URL
    const newUrl = `/courses${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    // Only update URL if it's different from current
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [currentFilters, currentPage, router]);

  // Sync state with URL when URL changes externally
  useEffect(() => {
    setCurrentFilters((prev) => ({
      ...prev,
      query: urlSearch,
      categories: urlCategory ? [urlCategory] : [],
      sortBy: (urlSort as any) || "newest",
    }));
    setCurrentPage(parseInt(urlPage) || 1);
  }, [urlSearch, urlCategory, urlSort, urlPage]);

  const buildBackendParams = (
    filters: SearchFilters,
    page: number,
    limit: number
  ) => {
    const params: Record<string, any> = {
      page,
      limit,
    };

    if (filters.query) params.search = filters.query;
    if (filters.categories.length > 0)
      params.category = filters.categories.join(",");
    if (filters.levels.length > 0) params.level = filters.levels.join(",");
    if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0];
    if (filters.priceRange[1] < 500) params.maxPrice = filters.priceRange[1];
    if (filters.durationRange[0] > 0)
      params.minDuration = filters.durationRange[0];
    if (filters.durationRange[1] < 50)
      params.maxDuration = filters.durationRange[1];
    if (filters.rating > 0) params.minRating = filters.rating;
    if (filters.features.length > 0)
      params.features = filters.features.join(",");
    if (filters.language !== "all") params.language = filters.language;

    const sortMap: Record<string, string> = {
      newest: "-createdAt",
      popular: "-studentsEnrolled",
      "price-low": "price",
      "price-high": "-price",
      rating: "-ratings.average",
      "duration-short": "duration",
      "duration-long": "-duration",
    };

    params.sort = sortMap[filters.sortBy] || "-createdAt";

    return params;
  };

  const backendParams = useMemo(
    () => buildBackendParams(currentFilters, currentPage, itemsPerPage),
    [currentFilters, currentPage, itemsPerPage]
  );

  // Use React Query for data fetching ONLY when we have active filters
  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useCourses(hasActiveFilters ? backendParams : undefined, {
    enabled: hasActiveFilters,
  });

  const { data: categories = initialCategories, isLoading: categoriesLoading } =
    useCategories();

  const {
    data: searchResponse,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchCourses(
    currentFilters.query,
    hasActiveFilters ? backendParams : undefined,
    {
      enabled: hasActiveFilters && !!currentFilters.query,
    }
  );

  // Use initial data when no active filters, otherwise use API data
  const { coursesArray, paginationInfo } = useMemo(() => {
    // If no active filters, use initial data with client-side processing
    if (!hasActiveFilters) {
      let processedCourses = [...initialCourses];

      // Apply basic client-side filtering and sorting
      if (urlSearch) {
        const searchTerm = urlSearch.toLowerCase();
        processedCourses = processedCourses.filter(
          (course) =>
            course.title?.toLowerCase().includes(searchTerm) ||
            course.description?.toLowerCase().includes(searchTerm) ||
            course.instructor?.name?.toLowerCase().includes(searchTerm) ||
            course.category?.toLowerCase().includes(searchTerm)
        );
      }

      if (urlCategory) {
        processedCourses = processedCourses.filter((course) =>
          course.category?.toLowerCase().includes(urlCategory.toLowerCase())
        );
      }

      // Apply client-side sorting
      switch (currentFilters.sortBy) {
        case "price-low":
          processedCourses.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          processedCourses.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          processedCourses.sort(
            (a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0)
          );
          break;
        case "duration-short":
          processedCourses.sort((a, b) => a.duration - b.duration);
          break;
        case "duration-long":
          processedCourses.sort((a, b) => b.duration - a.duration);
          break;
        case "popular":
          processedCourses.sort(
            (a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0)
          );
          break;
        case "newest":
        default:
          // Keep original order (newest first from server)
          break;
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCourses = processedCourses.slice(startIndex, endIndex);

      const fallbackPagination = {
        currentPage: currentPage,
        totalPages: Math.max(
          1,
          Math.ceil(processedCourses.length / itemsPerPage)
        ),
        totalItems: processedCourses.length,
        itemsPerPage: itemsPerPage,
      };

      return {
        coursesArray: paginatedCourses,
        paginationInfo: fallbackPagination,
      };
    }

    // Otherwise, use API data
    const response = currentFilters.query ? searchResponse : coursesResponse;

    if (!response) {
      const fallbackPagination = {
        currentPage: currentPage,
        totalPages: Math.max(
          1,
          Math.ceil(initialCourses.length / itemsPerPage)
        ),
        totalItems: initialCourses.length,
        itemsPerPage: itemsPerPage,
      };
      return {
        coursesArray: initialCourses,
        paginationInfo: fallbackPagination,
      };
    }

    // Extract data from the correct response structure
    const data = response.data || response; // response.data contains the courses array
    const pagination = response.pagination || {
      currentPage: currentPage,
      totalPages: Math.ceil((response.total || data.length) / itemsPerPage),
      totalItems: response.total || data.length,
      itemsPerPage: itemsPerPage,
    };

    return {
      coursesArray: data, // This should now be the courses array
      paginationInfo: pagination,
    };
  }, [
    hasActiveFilters,
    coursesResponse,
    searchResponse,
    currentFilters.query,
    currentFilters.sortBy,
    initialCourses,
    currentPage,
    itemsPerPage,
    urlCategory,
    urlSearch,
  ]);

  const isLoading = (coursesLoading || searchLoading) && hasActiveFilters;
  const error = coursesError || searchError;

  // Calculate visible range for results text
  const { startItem, endItem } = useMemo(() => {
    if (
      !paginationInfo ||
      !paginationInfo.currentPage ||
      !paginationInfo.itemsPerPage ||
      !paginationInfo.totalItems
    ) {
      return { startItem: 0, endItem: 0 };
    }

    const start =
      (paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage + 1;
    const end = Math.min(
      paginationInfo.currentPage * paginationInfo.itemsPerPage,
      paginationInfo.totalItems
    );

    return {
      startItem: isNaN(start) ? 1 : start,
      endItem: isNaN(end) ? paginationInfo.totalItems : end,
    };
  }, [paginationInfo]);

  // Handle search - updates state which triggers URL update
  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Reset to first page when searching

    // Refetch data with new filters only if we have active filters
    if (hasActiveFilters) {
      if (filters.query) {
        refetchSearch();
      } else {
        refetchCourses();
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Handle add to compare with validation
  const handleAddToCompare = (course: Course) => {
    try {
      console.log("🎯 Adding course to compare:", course);
      addToCompare(course);
    } catch (error: any) {
      console.error("❌ Error adding to compare:", error);
      // You can show a toast notification here
      alert(error.message);
    }
  };

  const handleRemoveFromCompare = (courseId: string) => {
    removeFromCompare(courseId);
  };

  const handleClearCompare = () => {
    clearCompareList();
  };

  // Clear all filters and reset URL
  const clearAllFilters = () => {
    setCurrentFilters({
      query: "",
      categories: [],
      levels: [],
      priceRange: [0, 500],
      durationRange: [0, 50],
      rating: 0,
      features: [],
      language: "all",
      sortBy: "newest",
    });
    setCurrentPage(1);
  };

  // Handle course access based on premium status
  const canAccessCourse = (course: Course) => {
    // If course is not premium, anyone can access
    if (!course.isPremium) return true;

    // If user is not authenticated, cannot access premium courses
    if (!isAuthenticated) return false;

    // Only premium users can access premium courses
    return isPremiumUser;
  };

  // Handle course click with premium access check
  const handleCourseClick = (course: Course) => {
    if (canAccessCourse(course)) {
      router.push(`/courses/${course.slug || course._id}`);
    } else {
      // Redirect to pricing page for premium courses
      router.push("/pricing");
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-12 text-center"
      >
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-12 w-12 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Error Loading Courses</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {error.message || "Sorry, we couldn't load the courses at this time."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
        >
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      {/* Premium User Banner */}
      {isPremiumUser && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-primary to-purple-600 text-white py-6 rounded-2xl mb-8"
        >
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crown className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome to Premium! 🎉</h1>
            </div>
            <p className="text-lg opacity-90 mb-4">
              You now have unlimited access to all premium courses
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Full Access
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Download Resources
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Certificates
              </Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {isPremiumUser
            ? "All Courses - Premium Access"
            : "Discover Amazing Courses"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {isPremiumUser
            ? "Your premium subscription gives you unlimited access to all courses, resources, and certificates."
            : "Learn from industry experts and advance your career with our comprehensive course library. Master new skills with hands-on projects and real-world applications."}
        </p>
      </motion.div>

      {/* User Plan Status Card */}
      {isAuthenticated && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-muted/50 rounded-2xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Current Plan:{" "}
                  <span className="capitalize text-primary">{userPlan}</span>
                </h3>
                <p className="text-muted-foreground">
                  {isPremiumUser
                    ? `Premium access until ${new Date(
                        user.subscription.currentPeriodEnd
                      ).toLocaleDateString()}`
                    : "Upgrade to unlock premium courses and features"}
                </p>
              </div>
              {!isPremiumUser && (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Search */}
      <motion.div variants={itemVariants} className="mb-8">
        <AdvancedSearch
          onSearch={handleSearch}
          isOpen={isAdvancedSearchOpen}
          onToggle={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
          categories={categories || []}
          initialFilters={currentFilters}
        />
      </motion.div>

      {/* Results Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 p-6 bg-muted/50 rounded-2xl border"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {paginationInfo?.totalItems?.toLocaleString() || 0} Courses
                Found
              </h3>
              <p className="text-sm text-muted-foreground">
                Showing {startItem || 0} - {endItem || 0} of{" "}
                {paginationInfo?.totalItems?.toLocaleString() || 0} results
                {(paginationInfo?.totalPages || 0) > 1 &&
                  ` • Page ${paginationInfo?.currentPage || 1} of ${
                    paginationInfo?.totalPages || 1
                  }`}
                {!hasActiveFilters && " • Using cached data"}
              </p>
            </div>
          </div>

          {compareList.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
            >
              <Compare className="h-4 w-4" />
              Compare ({compareList.length})
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground"
              >
                {compareList.length}
              </Badge>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Sort */}
          <div className="flex-1 lg:flex-none">
            <Select
              value={currentFilters.sortBy}
              onValueChange={(value) =>
                handleSearch({ ...currentFilters, sortBy: value })
              }
            >
              <SelectTrigger className="w-full lg:w-48 h-11">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon && <option.icon className="h-4 w-4" />}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1 bg-background">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 p-0 rounded-md"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 p-0 rounded-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        variants={itemVariants}
        key={`${currentPage}-${currentFilters.sortBy}-${viewMode}-${hasActiveFilters}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="text-center py-20">
            <motion.div
              className="relative inline-flex items-center justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-2">Loading courses...</h3>
            </motion.div>
          </div>
        ) : coursesArray.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No courses found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              {currentFilters.query || currentFilters.categories.length > 0
                ? "Try adjusting your search criteria or browse all courses."
                : "No courses available at the moment. Please check back later."}
            </p>
            {(currentFilters.query || currentFilters.categories.length > 0) && (
              <Button
                onClick={clearAllFilters}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Clear All Filters
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`courses-${currentPage}-${hasActiveFilters}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CourseGrid
                  courses={coursesArray}
                  viewMode={viewMode}
                  isLoading={false}
                  onCourseClick={handleCourseClick}
                  canAccessCourse={canAccessCourse}
                  isPremiumUser={isPremiumUser}
                  onAddToCompare={handleAddToCompare}
                  compareList={compareList}
                />
              </motion.div>
            </AnimatePresence>

            {/* ALWAYS SHOW PAGINATION */}
            {paginationInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 p-6 bg-muted/30 rounded-lg border"
              >
                <CustomPagination
                  currentPage={paginationInfo.currentPage}
                  totalPages={paginationInfo.totalPages}
                  totalItems={paginationInfo.totalItems}
                  itemsPerPage={paginationInfo.itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Course Comparison */}
      <AnimatePresence>
        {showComparison && (
          <CourseComparison
            courses={compareList}
            onRemoveCourse={handleRemoveFromCompare}
            onClose={() => setShowComparison(false)}
            onClearAll={handleClearCompare}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}