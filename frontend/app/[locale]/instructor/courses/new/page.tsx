import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-client";
import { CreateCourseForm } from "@/components/courses/create-course-form";

export default async function NewCoursePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "instructor") {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      <CreateCourseForm />
    </div>
  );
}
