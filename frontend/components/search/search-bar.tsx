"use client";

import * as React from "react";
import { Search, Clock, Users, Star, Play, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { SearchResult } from "@/services/home.service";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SearchType = "all" | "courses" | "instructors" | "lessons";
type ResultType = "course" | "instructor" | "lesson";

interface ResultWithType extends SearchResult {
  resultType?: ResultType;
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<SearchType>("all");

  const { data, isLoading, error } = useHomeSearch({
    query,
    type,
    limit: 5,
    enabled: open,
  });

  // Close modal when clicking outside
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Get results based on current type
  // const getCurrentResults = () => {
  //   if (!data) {
  //     return { results: [], displayCount: 0, totalCount: 0 };
  //   }

  //   let results: ResultWithType[] = [];
  //   let displayCount = 0;
  //   let totalCount = data.total || 0;

  //   switch (type) {
  //     case "courses":
  //       results = data.courses || [];
  //       displayCount = results.length;
  //       totalCount = data.total || displayCount;
  //       break;
  //     case "instructors":
  //       results = data.instructors || [];
  //       displayCount = results.length;
  //       totalCount = data.total || displayCount;
  //       break;
  //     case "lessons":
  //       results = data.lessons || [];
  //       displayCount = results.length;
  //       totalCount = data.total || displayCount;
  //       break;
  //     case "all":
  //     default:
  //       const allResults: ResultWithType[] = [
  //         ...(data.courses || []).map((item) => ({
  //           ...item,
  //           resultType: "course" as const,
  //         })),
  //         ...(data.instructors || []).map((item) => ({
  //           ...item,
  //           resultType: "instructor" as const,
  //         })),
  //         ...(data.lessons || []).map((item) => ({
  //           ...item,
  //           resultType: "lesson" as const,
  //         })),
  //       ];
  //       results = allResults.slice(0, 5);
  //       displayCount = results.length;
  //       totalCount = data.total || 0;
  //       break;
  //   }

  //   return { results, displayCount, totalCount };
  // };

  // In your SearchBar component, update the getCurrentResults function:

const getCurrentResults = () => {
  if (!data) {
    return { results: [], displayCount: 0, totalCount: 0 };
  }

  let results: ResultWithType[] = [];
  let displayCount = 0;
  let totalCount = data.total || 0;

  console.log("Processing results for type:", type, "Data:", data);

  switch (type) {
    case "courses":
      results = (data.courses || []).map(item => ({ ...item, resultType: "course" as const }));
      displayCount = results.length;
      totalCount = data.total || displayCount;
      console.log("Courses results:", results.length);
      break;
    case "instructors":
      results = (data.instructors || []).map(item => ({ ...item, resultType: "instructor" as const }));
      displayCount = results.length;
      totalCount = data.total || displayCount;
      console.log("Instructors results:", results.length);
      break;
    case "lessons":
      results = (data.lessons || []).map(item => ({ ...item, resultType: "lesson" as const }));
      displayCount = results.length;
      totalCount = data.total || displayCount;
      console.log("Lessons results:", results.length);
      break;
    case "all":
    default:
      const allResults: ResultWithType[] = [
        ...(data.courses || []).map((item) => ({
          ...item,
          resultType: "course" as const,
        })),
        ...(data.instructors || []).map((item) => ({
          ...item,
          resultType: "instructor" as const,
        })),
        ...(data.lessons || []).map((item) => ({
          ...item,
          resultType: "lesson" as const,
        })),
      ];
      results = allResults.slice(0, 5);
      displayCount = results.length;
      totalCount = data.total || 0;
      console.log("All results:", results.length);
      break;
  }

  return { results, displayCount, totalCount };
};

  const {
    results: currentResults,
    displayCount,
    totalCount,
  } = getCurrentResults();
  const hasResults = currentResults.length > 0;

  const handleSelect = (result: ResultWithType) => {
    setOpen(false);
    setQuery("");

    const resultType = result.resultType || result.type;

    if (resultType === "course") {
      router.push(`/courses/${result.slug}`);
    } else if (resultType === "instructor") {
      router.push(`/instructor/${result.id}`);
    } else if (resultType === "lesson") {
      router.push(`/learn/${result.id}`);
    }
  };

  const handleViewAll = (searchType: SearchType) => {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
  };

  const shouldShowViewAll = () => {
    if (type === "all") {
      return totalCount > 5;
    } else {
      return displayCount >= 5 && totalCount > displayCount;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderResultItem = (result: ResultWithType) => {
    const resultType = result.resultType || result.type;

    if (resultType === "course") {
      return (
        <div
          key={`course-${result.id}`}
          onClick={() => handleSelect(result)}
          className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-accent rounded-lg transition-colors"
        >
          <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={result.image || "/placeholder-course.jpg"}
              alt={result.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1 text-sm">
                  {result.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {result.subtitle}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm">${result.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {result.level}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current" />
                <span>{result.ratings?.average || 0}</span>
                <span>({result.ratings?.count || 0})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{result.studentsEnrolled}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <div className="relative w-4 h-4 rounded-full overflow-hidden">
                  <Image
                    src={result.instructor?.avatar || "/default-avatar.png"}
                    alt={result.instructor?.name || "Instructor"}
                    fill
                    className="object-cover"
                    sizes="16px"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {result.instructor?.name || "Unknown Instructor"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{result.totalHours || 0}h</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (resultType === "instructor") {
      return (
        <div
          key={`instructor-${result.id}`}
          onClick={() => handleSelect(result)}
          className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-accent rounded-lg transition-colors"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={result.avatar || "/default-avatar.png"}
              alt={result.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium line-clamp-1 text-sm">{result.name}</p>
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {(result.expertise || []).map((exp: string) => (
                <Badge key={exp} variant="secondary" className="text-xs">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (resultType === "lesson") {
      return (
        <div
          key={`lesson-${result.id}`}
          onClick={() => handleSelect(result)}
          className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-accent rounded-lg transition-colors"
        >
          <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent flex items-center justify-center">
            <Play className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium line-clamp-1 text-sm">{result.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {result.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(result.duration || 0)}</span>
              </div>
              {result.isPreview && (
                <Badge variant="secondary" className="text-xs">
                  Preview
                </Badge>
              )}
            </div>
            {result.course && (
              <p className="text-xs text-muted-foreground mt-1">
                From: {result.course.title}
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Search Input */}
      <div className="relative w-full max-w-sm lg:max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses, instructors, and lessons... (Press Ctrl + K)"
          className="pl-10 pr-4 h-11 text-base cursor-pointer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => setOpen(true)}
          readOnly
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-2xl">
            <div
              ref={modalRef}
              className="bg-background border rounded-lg shadow-lg overflow-hidden"
            >
              {/* Search Header */}
              <div className="flex items-center border-b px-4">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, and lessons..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 p-3 border-b">
                {(["all", "courses", "instructors", "lessons"] as const).map(
                  (t) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                        type === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => setType(t)}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar-thin">
                {!query && !isLoading && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Start typing to search...
                  </div>
                )}

                {query && isLoading && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}

                {query && !isLoading && !hasResults && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                )}

                {hasResults && !isLoading && (
                  <>
                    {/* Results Group */}
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {type === "all"
                          ? "All Results"
                          : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
                      </div>

                      {/* Results List */}
                      <div className="space-y-1">
                        {currentResults.map((result) =>
                          renderResultItem(result)
                        )}
                      </div>

                      {/* View All Button */}
                      {shouldShowViewAll() && (
                        <>
                          <div className="border-t my-2" />
                          <button
                            onClick={() =>
                              handleViewAll(type === "all" ? "all" : type)
                            }
                            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            View all {type === "all" ? "results" : type} (
                            {totalCount} results)
                          </button>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t text-center">
                      <p className="text-xs text-muted-foreground">
                        Showing {displayCount} of {totalCount} results • Page{" "}
                        {data?.page || 1} of {data?.totalPages || 1}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Add missing import
