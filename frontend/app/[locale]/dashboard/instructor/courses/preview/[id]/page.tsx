import CoursePreviewPage from "@/components/dashboard/CoursePreviewPage";



interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <CoursePreviewPage courseId={params.id} />;
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Course Preview',
    description: 'Preview your course',
  };
}