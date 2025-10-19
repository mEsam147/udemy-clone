"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { analyticsService } from "@/services/analytics.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  Clock,
  ChevronLeft,
  Filter,
  Download,
  Search,
  Calendar,
  BookOpen,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format, parseISO } from "date-fns";

export default function ActivityPage() {
  const [timeRange, setTimeRange] = useState<"all" | "7d" | "30d" | "90d">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activityType, setActivityType] = useState<
    "all" | "enrolled" | "completed" | "progress"
  >("all");

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["instructorAnalytics", timeRange],
    queryFn: () =>
      analyticsService.getInstructorAnalytics({
        timeRange: timeRange === "all" ? "90d" : timeRange,
      }),
  });

  // Get recent activity from analytics data
  const recentActivity = analytics?.data?.recentActivity || [];
  const courses = analytics?.data?.courses || [];

  // Filter activities based on search and type
  const filteredActivities = recentActivity.filter((activity: any) => {
    const matchesSearch =
      activity.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      activityType === "all" || activity.action === activityType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "enrolled":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "completed":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-purple-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "enrolled":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "enrolled":
        return "Enrolled";
      case "completed":
        return "Completed";
      default:
        return "Progress";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border border-gray-200 shadow-sm max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Failed to load activity
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              We couldn't load the activity data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/instructor">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                Recent Activity
              </h1>
              <p className="text-gray-600 mt-1 text-center ">
                Track all student activities and progress across your courses
              </p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Activities
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentActivity.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enrollments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      recentActivity.filter((a: any) => a.action === "enrolled")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      new Set(recentActivity.map((a: any) => a.studentName))
                        .size
                    }
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-6 bg-white rounded-lg border shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={activityType}
              onValueChange={(value: any) => setActivityType(value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="enrolled">Enrollments</SelectItem>
                <SelectItem value="completed">Completions</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredActivities.length} of {recentActivity.length}{" "}
            activities
          </div>
        </motion.div>

        {/* Activity List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Student Activities</CardTitle>
              <CardDescription>
                Recent student enrollments, progress, and course completions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 border rounded-lg animate-pulse"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-6 border rounded-lg hover:shadow-md transition-all duration-300 bg-white"
                    >
                      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                        {getActionIcon(activity.action)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {activity.studentName}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {activity.courseTitle}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActionColor(
                              activity.action
                            )}`}
                          >
                            {getActionLabel(activity.action)}
                          </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${activity.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {activity.progress}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(
                                  parseISO(activity.time),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </div>
                            <span>
                              {format(parseISO(activity.time), "hh:mm a")}
                            </span>
                          </div>
                        </div>

                        {activity.action === "completed" && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-medium">
                              🎉 Course completed successfully!
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    {searchQuery || activityType !== "all"
                      ? "No activities match your current filters. Try adjusting your search criteria."
                      : "No student activities recorded yet. Activities will appear here when students enroll and progress in your courses."}
                  </p>
                  {(searchQuery || activityType !== "all") && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setActivityType("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
