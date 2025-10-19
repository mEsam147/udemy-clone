"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Search,
  Filter,
  PlayCircle,
  Star,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -6,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const progressBarVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.2,
      ease: "easeOut",
      delay: 0.3,
    },
  }),
};

type EnrollmentStatus = "all" | "in-progress" | "completed" | "not-started";
type SortOption = "recent" | "progress" | "title" | "enrollment-date";
type ViewMode = "grid" | "list";

export default function MyLearningPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const {
    data: enrollmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studentEnrollments"],
    queryFn: analyticsService.getEnrollments,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get the most recent course for "Continue Learning" button
  const mostRecentCourse = useMemo(() => {
    if (!enrollmentsData?.data?.length) return null;

    return enrollmentsData.data.reduce((latest: any, current: any) => {
      if (!latest) return current;
      return new Date(current.lastAccessed) > new Date(latest.lastAccessed)
        ? current
        : latest;
    }, null);
  }, [enrollmentsData]);

  // Enhanced filtering and sorting logic
  const filteredEnrollments = useMemo(() => {
    if (!enrollmentsData?.data) return [];

    let filtered = enrollmentsData.data;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((enrollment: any) =>
        enrollment.course.title.toLowerCase().includes(query) ||
        enrollment.course.description?.toLowerCase().includes(query) ||
        enrollment.course.instructor?.name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((enrollment: any) => {
        switch (statusFilter) {
          case "completed":
            return enrollment.progress === 100;
          case "in-progress":
            return enrollment.progress > 0 && enrollment.progress < 100;
          case "not-started":
            return enrollment.progress === 0;
          default:
            return true;
        }
      });
    }

    // Apply bookmark filter
    if (showBookmarkedOnly) {
      filtered = filtered.filter((enrollment: any) => enrollment.isBookmarked);
    }

    // Apply sorting with better logic
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case "progress":
          // Sort by progress, but put completed courses at the bottom
          if (a.progress === 100 && b.progress !== 100) return 1;
          if (b.progress === 100 && a.progress !== 100) return -1;
          return b.progress - a.progress;
        case "title":
          return a.course.title.localeCompare(b.course.title);
        case "enrollment-date":
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [enrollmentsData, searchQuery, statusFilter, sortBy, showBookmarkedOnly]);

  // Enhanced statistics with more insights
  const stats = useMemo(() => {
    if (!enrollmentsData?.data) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        averageProgress: 0,
        totalLearningHours: 0,
        bookmarked: 0,
      };
    }

    const enrollments = enrollmentsData.data;
    const total = enrollments.length;
    const completed = enrollments.filter((e: any) => e.progress === 100).length;
    const inProgress = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
    const notStarted = enrollments.filter((e: any) => e.progress === 0).length;
    const bookmarked = enrollments.filter((e: any) => e.isBookmarked).length;

    const averageProgress = total > 0
      ? enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / total
      : 0;

    // Estimate learning hours based on completed lessons
    const totalLearningHours = enrollments.reduce((sum: number, e: any) => {
      return sum + (e.completedLessons.length * 0.5); // 30 minutes per lesson
    }, 0);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      bookmarked,
      averageProgress: Math.round(averageProgress),
      totalLearningHours: Math.round(totalLearningHours),
    };
  }, [enrollmentsData]);

  // Auto-clear search after 30 seconds of inactivity
  useEffect(() => {
    if (!searchQuery) return;

    const timer = setTimeout(() => {
      setSearchQuery("");
    }, 30000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (isLoading) return <MyLearningSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <motion.div
      className="min-h-screen bg-background p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Learning Journey
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {stats.total === 0
                ? "Start your learning journey by enrolling in courses"
                : `You're mastering ${stats.total} courses with ${stats.averageProgress}% average progress`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {mostRecentCourse && (
              <Button
                asChild
                className="gap-2 bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Link href={`/courses/${mostRecentCourse.course._id}/learn`}>
                  <PlayCircle className="w-4 h-4" />
                  Continue Learning
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <Link href="/courses">
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            title="All Courses"
            value={stats.total}
            color="blue"
            icon={<BookOpen className="w-4 h-4" />}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            color="orange"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            color="green"
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
          <StatCard
            title="Avg Progress"
            value={`${stats.averageProgress}%`}
            color="purple"
            icon={<Target className="w-4 h-4" />}
          />
          <StatCard
            title="Learning Hours"
            value={stats.totalLearningHours}
            color="cyan"
            icon={<Clock className="w-4 h-4" />}
            suffix="h"
          />
          <StatCard
            title="Bookmarked"
            value={stats.bookmarked}
            color="yellow"
            icon={<Bookmark className="w-4 h-4" />}
          />
          <StatCard
            title="Not Started"
            value={stats.notStarted}
            color="gray"
            icon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses, instructors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Controls */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Bookmark Toggle */}
                <Button
                  variant={showBookmarkedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className="gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
                  Bookmarks
                </Button>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg p-1 bg-background">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filters */}
                <Select value={statusFilter} onValueChange={(value: EnrollmentStatus) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full lg:w-40 bg-background">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-full lg:w-40 bg-background">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Accessed</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="enrollment-date">Enrollment Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== "all" || showBookmarkedOnly) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-wrap gap-2 mt-3 pt-3 border-t"
              >
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {showBookmarkedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Bookmarked only
                    <button onClick={() => setShowBookmarkedOnly(false)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setShowBookmarkedOnly(false);
                  }}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Grid/List */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {filteredEnrollments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== "all" || showBookmarkedOnly
                  ? "No courses match your filters"
                  : "No courses enrolled yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all" || showBookmarkedOnly
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : "Start your learning journey by exploring our course catalog and enrolling in courses that interest you."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
                {(searchQuery || statusFilter !== "all" || showBookmarkedOnly) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setShowBookmarkedOnly(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4"
              }
            >
              {filteredEnrollments.map((enrollment: any, index: number) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                >
                  {viewMode === "grid" ? (
                    <CourseCard enrollment={enrollment} />
                  ) : (
                    <ListCourseCard enrollment={enrollment} index={index} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Stat Card Component with Shadcn colors
function StatCard({
  title,
  value,
  color = "blue",
  icon,
  suffix = ""
}: {
  title: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
  suffix?: string;
}) {
  const colorConfig = {
    blue: { gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10" },
    orange: { gradient: "from-orange-500 to-orange-600", bg: "bg-orange-500/10" },
    green: { gradient: "from-green-500 to-green-600", bg: "bg-green-500/10" },
    purple: { gradient: "from-purple-500 to-purple-600", bg: "bg-purple-500/10" },
    cyan: { gradient: "from-cyan-500 to-cyan-600", bg: "bg-cyan-500/10" },
    yellow: { gradient: "from-yellow-500 to-yellow-600", bg: "bg-yellow-500/10" },
    gray: { gradient: "from-gray-500 to-gray-600", bg: "bg-gray-500/10" },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden group">
        <CardContent className="p-4 relative">
          {/* Background accent */}
          <div className={`absolute inset-0 ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.p
                className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {value}{suffix}
              </motion.p>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white`}>
                {icon}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Course Card Component with proper Shadcn colors
function CourseCard({ enrollment }: { enrollment: any }) {
  const getStatusConfig = (progress: number) => {
    if (progress === 0) return {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-muted",
      badge: "bg-muted text-muted-foreground",
    };
    if (progress === 100) return {
      bg: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      badge: "bg-green-500 text-white",
    };
    return {
      bg: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      badge: "bg-blue-500 text-white",
    };
  };

  const getStatusText = (progress: number) => {
    if (progress === 0) return "Not Started";
    if (progress === 100) return "Completed";
    return "In Progress";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getEnrollmentDuration = () => {
    const enrolledDate = new Date(enrollment.enrolledAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - enrolledDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  const status = getStatusConfig(enrollment.progress);

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      whileTap="tap"
      className="group h-full"
    >
      <Card
        className={`overflow-hidden border-2 ${status.border} bg-card hover:shadow-lg transition-all duration-300 h-full flex flex-col`}
      >
        {/* Course Header */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-primary text-3xl font-bold">
              {enrollment.course.title.charAt(0)}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={status.badge}>
              {getStatusText(enrollment.progress)}
            </Badge>
          </div>

          {/* Bookmark Indicator */}
          {enrollment.isBookmarked && (
            <div className="absolute top-3 left-3">
              <Bookmark className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </div>
          )}

          {/* Progress Overlay */}
          {enrollment.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
              <motion.div
                className={`h-full ${status.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Course Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
            {enrollment.course.title}
          </h3>

          {/* Instructor */}
          {enrollment.course.instructor?.name && (
            <p className="text-sm text-muted-foreground mb-3">
              by {enrollment.course.instructor.name}
            </p>
          )}

          {/* Progress Section */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-semibold ${status.text}`}>
                {enrollment.progress}%
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${status.bg}`}
                variants={progressBarVariants}
                initial="initial"
                animate="animate"
                custom={enrollment.progress}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {enrollment.completedLessons.length} lessons
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {getEnrollmentDuration()}
              </span>
            </div>
          </div>

          {/* Last Accessed */}
          <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last accessed {formatTimeAgo(enrollment.lastAccessed)}
          </div>

          {/* Rating if exists */}
          {enrollment.rating && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  {enrollment.rating.score}/5
                </span>
              </div>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Rated</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              asChild
              size="sm"
              className="flex-1 gap-2"
              variant={enrollment.progress === 100 ? "outline" : "default"}
            >
              <Link
                href={`/courses/${enrollment.course._id}/learn`}
              >
                <PlayCircle className="w-4 h-4" />
                {enrollment.progress === 100 ? "Review" : "Continue"}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-3"
              onClick={() => {/* Handle bookmark toggle */}}
            >
              <Bookmark className={`w-4 h-4 ${enrollment.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Enhanced List Course Card
function ListCourseCard({ enrollment }: { enrollment: any; index: number }) {
  const getStatusColor = (progress: number) => {
    if (progress === 0) return "bg-muted";
    if (progress === 100) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0 shadow-lg">
        {enrollment.course.title.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {enrollment.course.title}
            </h4>
            {enrollment.course.instructor?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                by {enrollment.course.instructor.name}
              </p>
            )}
          </div>
          <Badge
            className={`${getStatusColor(enrollment.progress)} text-white`}
          >
            {enrollment.progress === 100
              ? "Completed"
              : enrollment.progress > 0
              ? "In Progress"
              : "Not Started"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            {enrollment.completedLessons.length} lessons completed
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last accessed {new Date(enrollment.lastAccessed).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{enrollment.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getStatusColor(enrollment.progress)}`}
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>

          <Button size="sm" className="flex-shrink-0" asChild>
            <Link href={`/learn/${enrollment.course._id}`}>
              {enrollment.progress === 100 ? "Review" : "Continue"}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Skeleton Loading
function MyLearningSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2 w-full lg:w-auto">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden border">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Error State
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full text-center border">
        <CardContent className="p-6 sm:p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Failed to load courses
          </h3>
          <p className="text-muted-foreground mb-6">
            We couldn't load your learning data. This might be due to network issues or server problems.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
