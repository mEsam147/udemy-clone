"use client";

import { useQuery } from "@tanstack/react-query";
import {analyticsService}  from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentAnalytics"],
    queryFn: analyticsService.getStudentAnalytics,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Data shape: { enrolledCourses, averageProgress, recentCourses, recommendedCourses, progressTrends }
  const progressData = data?.data?.progressTrends || [];
  const pieData = [
    { name: "Completed", value: data?.data?.averageProgress || 0 },
    { name: "Remaining", value: 100 - (data?.data?.averageProgress || 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl">{data?.data?.enrolledCourses || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={data?.data?.averageProgress || 0}
              className="w-full"
            />
            <p className="text-center mt-2">
              {data?.data?.averageProgress || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl">{data?.data?.recentCourses?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completion Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.data?.recentCourses?.map((course: any) => (
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
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {data?.data?.recommendedCourses?.map((course: any) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
