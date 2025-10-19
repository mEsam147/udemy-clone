import CourseLessons from "@/components/dashboard/AddLesson";
import { useParams } from "next/navigation";

export default function AddLessonPage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CourseLessons courseId={params.courseId} />;
}
