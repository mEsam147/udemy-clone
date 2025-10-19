"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Users,
  Star,
  Play,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { SearchResult } from "@/services/home.service";
import Image from "next/image";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Helper to format duration
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Skeleton Loader Component
const ResultSkeleton = () => (
  <div className="bg-card rounded-2xl shadow-sm border p-6 h-full animate-pulse">
    <div className="flex gap-4">
      <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
    <div className="flex gap-4 mt-4">
      <div className="h-3 bg-muted rounded w-1/4"></div>
      <div className="h-3 bg-muted rounded w-1/4"></div>
      <div className="h-3 bg-muted rounded w-1/4"></div>
    </div>
  </div>
);

// Enhanced Result Item Component with proper shadcn/ui styling
const ResultItem = ({
  result,
  index,
}: {
  result: SearchResult & { resultType?: string };
  index: number;
}) => {
  const resultType = result.resultType || result.type;

  if (resultType === "course") {
    return (
      <div
        className="bg-card rounded-2xl shadow-sm border p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        style={{
          animationDelay: `${index * 100}ms`,
          animation: `slideUp 0.6s ease-out ${index * 100}ms both`,
        }}
        onClick={() => window.open(`/courses/${result.slug}`, "_self")}
      >
        <div className="flex gap-4">
          <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={result.image}
              alt={result.title}
              fill
              className="object-cover"
              sizes="128px"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {result.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 mt-2 text-sm">
              {result.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="font-medium">{result.ratings?.average || 0}</span>
            <span>({result.ratings?.count || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{result.studentsEnrolled} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{result.totalHours} hours</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Badge variant="secondary">{result.level}</Badge>
            <Badge variant="outline">{result.category}</Badge>
          </div>
          <p className="text-xl font-bold">${result.price}</p>
        </div>
      </div>
    );
  }

  if (resultType === "instructor") {
    return (
      <div
        className="bg-card rounded-2xl shadow-sm border p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        style={{
          animationDelay: `${index * 100}ms`,
          animation: `slideUp 0.6s ease-out ${index * 100}ms both`,
        }}
        onClick={() => window.open(`/instructor/${result.id}`, "_self")}
      >
        <div className="flex gap-4 items-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Image
              src={result.avatar}
              alt={result.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {result.name}
            </h3>
            <p className="text-muted-foreground mt-1">Instructor</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(result.expertise || []).map((exp) => (
            <Badge key={exp} variant="secondary">
              {exp}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (resultType === "lesson") {
    return (
      <div
        className="bg-card rounded-2xl shadow-sm border p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        style={{
          animationDelay: `${index * 100}ms`,
          animation: `slideUp 0.6s ease-out ${index * 100}ms both`,
        }}
        onClick={() => window.open(`/learn/${result.id}`, "_self")}
      >
        <div className="flex gap-4">
          <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {result.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 mt-2 text-sm">
              {result.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(result.duration)}</span>
            </div>
            {result.isPreview && <Badge variant="secondary">Preview</Badge>}
          </div>
          {result.course && (
            <p className="text-sm text-muted-foreground">
              From: <span className="font-medium">{result.course.title}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

// Custom Select Component with shadcn/ui styling
const CustomSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-[180px] h-12 px-4 py-2 border border-input bg-background rounded-lg hover:border-accent-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 flex items-center justify-between"
      >
        <span className="text-sm font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${
                value === option.value
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Pagination Component
const SearchPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "ellipsis-start");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("ellipsis-end", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {visiblePages.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const pageNumber = page as number;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => onPageChange(pageNumber)}
                isActive={currentPage === pageNumber}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

// Main Search Page Component
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as any) || "all";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [query, setQuery] = React.useState(initialQuery);
  const [type, setType] = React.useState(initialType);
  const [sort, setSort] = React.useState("relevance");
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [isSearching, setIsSearching] = React.useState(false);

  // Enable search immediately on page load and when params change
  const { data, isLoading, error } = useHomeSearch({
    query,
    type,
    sort: sort as any,
    page: currentPage,
    limit: 9,
    enabled: true,
  });

  // Update URL when search parameters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `/search?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [query, type, currentPage]);

  // Reset to page 1 when search query or type changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, type]);

  // Simulate search state for better UX
  React.useEffect(() => {
    if (query) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [query, data]);

  // Get results to display based on current type
  const getResultsToDisplay = () => {
    if (!data) return [];

    let results: (SearchResult & { resultType: string })[] = [];

    switch (type) {
      case "courses":
        results = (data.courses || []).map((item) => ({
          ...item,
          resultType: "course",
          type: "course",
        }));
        break;
      case "instructors":
        results = (data.instructors || []).map((item) => ({
          ...item,
          resultType: "instructor",
          type: "instructor",
        }));
        break;
      case "lessons":
        results = (data.lessons || []).map((item) => ({
          ...item,
          resultType: "lesson",
          type: "lesson",
        }));
        break;
      case "all":
      default:
        const allResults = [
          ...(data.courses || []).map((item) => ({
            ...item,
            resultType: "course",
            type: "course",
          })),
          ...(data.instructors || []).map((item) => ({
            ...item,
            resultType: "instructor",
            type: "instructor",
          })),
          ...(data.lessons || []).map((item) => ({
            ...item,
            resultType: "lesson",
            type: "lesson",
          })),
        ];
        results = allResults;
        break;
    }

    return results;
  };

  const resultsToDisplay = getResultsToDisplay();
  const totalDisplayResults = resultsToDisplay.length;
  const totalPages = data?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const typeOptions = [
    { value: "all", label: "All" },
    { value: "courses", label: "Courses" },
    { value: "instructors", label: "Instructors" },
    { value: "lessons", label: "Lessons" },
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
    { value: "students", label: "Students" },
    { value: "newest", label: "Newest" },
  ];

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .search-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      }
      
      @media (max-width: 768px) {
        .search-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
            Discover Amazing Content
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search through courses, instructors, and lessons to find exactly
            what you're looking for
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-card rounded-2xl shadow-lg border p-6 lg:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for courses, instructors, or lessons..."
                  className="pl-12 h-14 text-lg border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-2 h-10 px-6 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <CustomSelect
                    value={type}
                    onValueChange={setType}
                    options={typeOptions}
                    placeholder="Content Type"
                  />
                  <CustomSelect
                    value={sort}
                    onValueChange={setSort}
                    options={sortOptions}
                    placeholder="Sort by"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Advanced filters</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto">
          {/* Results Summary */}
          <div className="mb-8">
            {isLoading || isSearching ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Searching for the best results...
                </p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <p className="text-destructive">
                  An error occurred while fetching results. Please try again.
                </p>
              </div>
            ) : (
              data && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-muted-foreground text-lg">
                      Found{" "}
                      <span className="font-bold text-foreground">
                        {data.total}
                      </span>{" "}
                      results for
                      <span className="font-medium text-foreground">
                        {" "}
                        "{query}"
                      </span>
                      {type !== "all" && (
                        <span>
                          {" "}
                          in{" "}
                          <span className="font-medium text-primary">
                            {type}
                          </span>
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {totalDisplayResults} results on page{" "}
                      {currentPage} of {totalPages}
                    </p>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Results Grid */}
          {isLoading || isSearching ? (
            <div className="search-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <ResultSkeleton key={index} />
              ))}
            </div>
          ) : !isLoading && !error && resultsToDisplay.length > 0 ? (
            <>
              <div className="search-grid">
                {resultsToDisplay.map((result, index) => (
                  <ResultItem
                    key={`${result.resultType}-${result.id}`}
                    result={result}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <SearchPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : null}

          {/* Empty States */}
          {!isLoading && !error && resultsToDisplay.length === 0 && query && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No results found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any matches for "
                  <span className="font-medium">{query}</span>". Try different
                  keywords or check your spelling.
                </p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setType("all");
                    setCurrentPage(1);
                  }}
                  variant="outline"
                >
                  Clear search
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && !query && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Start your search
                </h3>
                <p className="text-muted-foreground">
                  Enter a search term above to discover courses, instructors,
                  and lessons that match your interests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
