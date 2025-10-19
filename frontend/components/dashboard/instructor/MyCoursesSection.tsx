import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { CourseCard } from "./CourseCard";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Video, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Course } from "@/lib/types";

interface MyCoursesSectionProps {
  courses: Course[];
  isLoading?: boolean;
}

export function MyCoursesSection({ courses, isLoading }: MyCoursesSectionProps) {
  if (isLoading) {
    return (
      <DashboardCard
        title="My Courses"
        action={
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        }
      >
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <DashboardCard
        title="My Courses"
        action={
          <Link
            href="/dashboard/instructor/courses"
            className="group flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View all{" "}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        }
      >
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.slice(0, 4).map((course, index) => (
              <CourseCard
                key={course._id}
                course={course}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Video className="h-12 w-12" />}
            title="No courses yet"
            description="Create your first course to start teaching and earning"
            action={
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/instructor/create-course">
                  Create First Course
                </Link>
              </Button>
            }
          />
        )}
      </DashboardCard>
    </motion.section>
  );
}