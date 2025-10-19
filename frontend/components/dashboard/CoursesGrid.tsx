import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { EnhancedPagination } from "./EnhancedPagination";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { Course, PaginationInfo } from "@/lib/types";
import {CourseCardInstructor} from "./CourseCard-Instructor";

interface CoursesGridProps {
  error: any;
  courses: Course[];
  isFetching: boolean;
  debouncedSearchTerm: string;
  handleSearch: (term: string) => void;
  filteredCourses: Course[];
  viewMode: "grid" | "list";
  pagination: PaginationInfo;
  selectedCourses: string[];
  selectAllCourses: () => void;
  refetch: () => void;
  isFetchingData: boolean;
  openEditModal: (course: Course) => void;
  openDeleteModal: (course: Course) => void;
  openLessonsModal: (course: Course) => void;
  openAddLessonModal: (course: Course) => void;
  openStatusModal: (course: Course) => void;
  toggleCourseSelection: (courseId: string) => void;
  user: any;
  handlePageChange: (page: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

export function CoursesGrid({
  error,
  courses,
  isFetching,
  debouncedSearchTerm,
  handleSearch,
  filteredCourses,
  viewMode,
  pagination,
  selectedCourses,
  selectAllCourses,
  refetch,
  isFetchingData,
  openEditModal,
  openDeleteModal,
  openLessonsModal,
  openAddLessonModal,
  openStatusModal,
  toggleCourseSelection,
  user,
  handlePageChange,
}: CoursesGridProps) {
  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  console.log("courses from grid" , courses)
console.log("filteredCourses from grid", filteredCourses);

  if (courses.length === 0 && !isFetching) {
    return (
      <EmptyState
        hasSearch={!!debouncedSearchTerm}
        onClearSearch={() => handleSearch("")}
      />
    );
  }

  return (
    <>
      {/* Results Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}
            </span>{" "}
            of <span className="font-semibold">{pagination.totalCount}</span>{" "}
            courses
            {debouncedSearchTerm && (
              <span>
                {" "}
                for "
                <span className="font-semibold">{debouncedSearchTerm}</span>"
              </span>
            )}
          </p>

          {/* Select All Checkbox */}
          {filteredCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedCourses.length === filteredCourses.length &&
                  filteredCourses.length > 0
                }
                onCheckedChange={selectAllCourses}
              />
              <span className="text-sm text-gray-600">Select all</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
            disabled={isFetchingData}
          >
            <Zap className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Courses Display with Loading State */}
      <div className="relative">
        {/* Loading Overlay */}
        {isFetchingData && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading courses...</span>
            </div>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "mb-8",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course: Course) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                whileHover="hover"
                layout
                className={cn(
                  viewMode === "list" && "max-w-4xl mx-auto",
                  selectedCourses.includes(course?._id) &&
                    "ring-2 ring-blue-500 rounded-lg"
                )}
              >
                <CourseCardInstructor
                  course={course}
                  viewMode={viewMode}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onViewLessons={openLessonsModal}
                  onAddLesson={openAddLessonModal}
                  onStatusChange={() => openStatusModal(course)}
                  isSelected={selectedCourses.includes(course?._id)}
                  onSelect={() => toggleCourseSelection(course?._id)}
                  user={user}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Enhanced Pagination */}
      <EnhancedPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        isFetching={isFetchingData}
      />
    </>
  );
}
