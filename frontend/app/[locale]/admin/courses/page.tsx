"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCoursesAdmin } from "@/services/course.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminCourses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: () => getAllCoursesAdmin({ page: 1, limit: 10 }),
  });

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Course Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((course: any) => (
                <TableRow key={course._id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.instructor?.name}</TableCell>
                  <TableCell>
                    {course.isPublished ? "Published" : "Draft"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Toggle Publish
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-2">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
