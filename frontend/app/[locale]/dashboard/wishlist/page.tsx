"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserWishlist } from "@/services/course.service";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Wishlist() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getUserWishlist,
  });

  if (isLoading) return <div>Loading wishlist...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Wishlist</h1>
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
              <p className="text-sm text-muted-foreground">
                By {course.instructor?.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
