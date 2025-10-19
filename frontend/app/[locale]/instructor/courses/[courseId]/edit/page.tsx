import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-client";
import { mockCourses } from "@/lib/mock-data";
import { CourseEditor } from "@/components/courses/course-editor";

interface EditCoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "instructor") {
    redirect("/auth/signin");
  }

  // In a real app, this would be a database query
  const course = mockCourses.find((c) => c.id === params.courseId);

  if (!course) {
    redirect("/instructor/courses");
  }

  if (course.instructor_id !== user.id) {
    redirect("/instructor/courses");
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Course</h1>
      <CourseEditor course={course} />
    </div>
  );
}
