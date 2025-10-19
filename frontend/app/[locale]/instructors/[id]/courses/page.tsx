// app/instructors/[id]/courses/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  Filter,
  Search,
  Grid3X3,
  List,
  PlayCircle,
  CheckCircle,
  Eye,
  Share2,
  Bookmark,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstructorCourses } from "@/hooks/useInstructorQueries";
import { useState } from "react";

const levelOptions = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "duration", label: "Duration" },
];

export default function InstructorCoursesPage() {
  const params = useParams();
  const instructorId = params.id as string;

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: "",
    level: "all",
    sort: "popular",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: coursesData,
    isLoading,
    isFetching,
    error,
  } = useInstructorCourses(instructorId, filters);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      level: "all",
      sort: "popular",
    });
  };

  const hasActiveFilters = filters.search || filters.level !== "all";

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
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
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

  const CourseCardGrid = ({
    course,
    index,
  }: {
    course: any;
    index: number;
  }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
    >
      <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 cursor-pointer h-full flex flex-col bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm overflow-hidden relative">
        {/* Bestseller Badge */}
        {course.isBestseller && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg">
              <Zap className="w-3 h-3 mr-1 fill-current" />
              Bestseller
            </Badge>
          </div>
        )}

        {/* Course Image */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          <div className="absolute bottom-4 right-4">
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
              {course.level}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 flex-1">
          <div className="space-y-3">
            {/* Category and Level */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {course.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {course.duration}h
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-foreground">
                  {course.rating}
                </span>
                <span>({course.totalReviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{course.studentsEnrolled.toLocaleString()}</span>
              </div>
            </div>

            {/* Course Details */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <PlayCircle className="w-3 h-3" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{course.projects} projects</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0 mt-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${course.price}
              </span>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Enroll Now
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const CourseCardList = ({
    course,
    index,
  }: {
    course: any;
    index: number;
  }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/30 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Course Image */}
            <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {course.image ? (
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white/80" />
                </div>
              )}
              {course.isBestseller && (
                <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs">
                  <Zap className="w-2 h-2 mr-1 fill-current" />
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Course Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                    {course.isBestseller && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs">
                        <Zap className="w-2 h-2 mr-1 fill-current" />
                        Bestseller
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-foreground">
                      {course.rating}
                    </span>
                    <span>({course.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>
                      {course.studentsEnrolled.toLocaleString()} students
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{course.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4 text-purple-500" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ${course.price}
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Courses</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load instructor courses. Please try again later.
          </p>
          <Button asChild>
            <Link href="/instructors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Instructors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const instructor = coursesData?.instructor;
  const courses = coursesData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/instructors/${instructorId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Courses
            </Button>
          </div>

          {/* Instructor Header */}
          {instructor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {instructor.avatar ? (
                  <Image
                    src={instructor.avatar}
                    alt={instructor.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Courses by {instructor.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {coursesData?.totalCount || 0} courses available •{" "}
                  {instructor.stats.totalStudents.toLocaleString()} total
                  students
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.level}
              onValueChange={(value) => handleFilterChange("level", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 w-9 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.level !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Level: {filters.level}
                <button
                  onClick={() => handleFilterChange("level", "all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
              Clear All
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        )}

        {/* Courses Grid/List */}
        {!isLoading && courses.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`courses-${viewMode}-${filters.sort}-${filters.level}-${filters.page}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {courses.map((course, index) =>
                viewMode === "grid" ? (
                  <CourseCardGrid
                    key={course._id}
                    course={course}
                    index={index}
                  />
                ) : (
                  <CourseCardList
                    key={course._id}
                    course={course}
                    index={index}
                  />
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* No Results */}
        {!isLoading && courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "This instructor hasn't published any courses yet"}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {coursesData && coursesData.totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground mx-4">
              Page {filters.page} of {coursesData.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === coursesData.totalPages}
            >
              Next
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </motion.div>
        )}

        {/* Instructor Stats */}
        {instructor && (
          <motion.div
            className="mt-12 pt-8 border-t border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-center">
              Instructor Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {instructor.stats.totalCourses}
                </div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {instructor.stats.totalStudents.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {instructor.stats.averageRating}
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {instructor.stats.totalReviews.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
