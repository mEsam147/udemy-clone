"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { instructorService } from "@/services/instructor.service";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function InstructorCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["instructorCourses"],
    queryFn: instructorService.getInstructorCourses,
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({
      courseId,
      isPublished,
    }: {
      courseId: string;
      isPublished: boolean;
    }) => adminService.toggleCoursePublishStatus(courseId, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      toast({ title: "Course publish status updated" });
    },
  });

  if (isLoading) return <PageSkeleton />;
  if (error)
    return (
      <div className="text-center text-red-600">Error: {error.message}</div>
    );

  const courses = data?.data || [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-green-100">Manage your courses, {user?.name}!</p>
        <Button
          className="mt-4 bg-white text-green-600 hover:bg-gray-100"
          asChild
        >
          <Link href="/dashboard/instructor/create-course">
            Create New Course
          </Link>
        </Button>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course: Course, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="relative h-32 bg-gray-200">
                    {course.image && (
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover rounded-t-md"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {course.enrollments?.length || 0} students
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Button size="sm" asChild>
                        <Link
                          href={`/dashboard/instructor/courses/${course._id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          togglePublishMutation.mutate({
                            courseId: course._id,
                            isPublished: !course.isPublished,
                          })
                        }
                      >
                        {course.isPublished ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses yet
              </h3>
              <Button asChild>
                <Link href="/dashboard/instructor/create-course">
                  Create Course
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl p-8">
        <div className="h-8 bg-green-500 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-green-500 rounded w-1/2"></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
