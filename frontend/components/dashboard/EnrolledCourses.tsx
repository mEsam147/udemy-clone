"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "@/services/course.service";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function EnrolledCourses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: getEnrolledCourses,
  });

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Enrolled Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.data?.map((course: any) => (
          <Card key={course._id}>
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-32 object-cover rounded-t-md"
            />
            <CardContent className="pt-4">
              <Link
                href={`/courses/${course.slug}`}
                className="font-bold hover:underline"
              >
                {course.title}
              </Link>
              <Progress value={course.progress || 0} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {course.progress}% Complete
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
