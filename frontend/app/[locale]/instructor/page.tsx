"use client";

import { useQuery } from "@tanstack/react-query";
import { getInstructorAnalytics } from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["instructorAnalytics"],
    queryFn: getInstructorAnalytics,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Data shape: { courses, enrollments, enrollmentTrends, totalRevenue, topCourses }
  const trendsData = data?.data?.enrollmentTrends || [];
  const revenueData =
    data?.data?.enrollments?.map((e: any) => ({
      month: e._id,
      revenue: e.revenue || 0,
    })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Instructor Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl">{data?.data?.courses?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl">{data?.data?.enrollments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl">${data?.data?.totalRevenue || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.data?.topCourses?.map((course: any) => (
              <div key={course._id} className="flex justify-between">
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-bold hover:underline"
                >
                  {course.title}
                </Link>
                <p>{course.studentsEnrolled} enrollments</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
