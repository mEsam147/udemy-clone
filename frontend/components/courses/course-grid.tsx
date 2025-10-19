// components/courses/course-grid.tsx - UPDATED
"use client";

import { motion } from "framer-motion";
import { CourseCard } from "@/components/courses/course-card";
import type { Course } from "@/lib/types";
import { CoursePlaceholder } from "./course-placeholder";

interface CourseGridProps {
  courses: Course[];
  viewMode?: "grid" | "list";
  isLoading?: boolean;
  onCourseClick?: (course: Course) => void;
  canAccessCourse?: (course: Course) => boolean;
  isPremiumUser?: boolean;
  onAddToCompare?: (course: Course) => void;
  compareList?: Course[];
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function CourseGrid({
  courses,
  viewMode = "grid",
  isLoading = false,
  onCourseClick,
  canAccessCourse = () => true,
  isPremiumUser = false,
  onAddToCompare,
  compareList = [],
}: CourseGridProps) {
  console.log("CourseGrid - Received courses:", courses?.length);

  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <CoursePlaceholder key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  // Show empty state if no courses
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  // Filter out any invalid courses
  const validCourses = courses.filter(
    (course) => course && (course._id || course.id) && course.title
  );

  console.log("CourseGrid - Valid courses:", validCourses.length);

  if (validCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          No valid courses to display
        </h3>
        <p className="text-muted-foreground">
          The course data appears to be in an unexpected format.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Debug info:</p>
          <p>Total courses received: {courses.length}</p>
          <p>First course structure: {JSON.stringify(courses[0]?.title)}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {validCourses.map((course) => (
        <motion.div
          key={course._id || course.id}
          variants={itemVariants}
          className={viewMode === "grid" ? "h-full" : ""}
        >
          <div className={viewMode === "grid" ? "h-full flex flex-col" : ""}>
            <CourseCard 
              course={course} 
              viewMode={viewMode}
              onCourseClick={onCourseClick}
              canAccess={canAccessCourse(course)}
              isPremiumUser={isPremiumUser}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}