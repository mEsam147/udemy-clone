import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Target, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  index: number;
}

export function CourseCard({ course, index }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 group bg-white"
    >
      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg relative overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {course.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          {(course.studentsEnrolled || 0).toLocaleString()} students • $
          {(course as any).revenue?.toFixed(2) || "0.00"}
        </p>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-700">
              {course.ratings?.average?.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-gray-500">
              ({(course.ratings?.count || 0).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-500">
              {(course as any).progress || 0}% complete
            </span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        asChild
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Link href={`/dashboard/instructor/courses/preview/${course._id}`}>Manage</Link>
      </Button>
    </motion.div>
  );
}