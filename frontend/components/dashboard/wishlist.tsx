import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Course {
  _id: string;
  title: string;
  slug: string;
  image: string;
}

export default function Wishlist({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div key={course._id} className="border p-4 rounded-md">
          <img src={course.image} alt={course.title} className="w-full h-32 object-cover mb-2 rounded" />
          <h3 className="font-medium">{course.title}</h3>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={`/courses/${course.slug}`}>View Course</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}