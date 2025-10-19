"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { instructorService } from "@/services/instructor.service";
import { analyticsService } from "@/services/analytics.service";
import * as courseService from "@/services/course.service";
import { useAuth } from "@/context/AuthContext";
import { WelcomeSection } from "@/components/dashboard/instructor/WelcomeSection";
import { StatsOverview } from "@/components/dashboard/instructor/StatsOverview";
import { MyCoursesSection } from "@/components/dashboard/instructor/MyCoursesSection";
import { AnalyticsTabsSection } from "@/components/dashboard/instructor/AnalyticsTabsSection";
import { StudentEngagementSection } from "@/components/dashboard/instructor/StudentEngagementSection";
import { QuickActionsSection } from "@/components/dashboard/instructor/QuickActionsSection";
import { RecentActivitySection } from "@/components/dashboard/instructor/RecentActivitySection";
import { PerformanceMetricsSection } from "@/components/dashboard/instructor/PerformanceMetricsSection";
import { DashboardSkeleton } from "@/components/dashboard/instructor/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/instructor/DashboardError";
import { useState } from "react";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["instructorDashboard"],
    queryFn: instructorService.getInstructorDashboard,
  });

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["instructorCourses"],
    queryFn: () => courseService.getInstructorCourses({ page: 1, limit: 10 }),
  });

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    isFetching: analyticsFetching, // This is true when refetching for timeRange changes
  } = useQuery({
    queryKey: ["instructorAnalytics", timeRange],
    queryFn: () => analyticsService.getInstructorAnalytics({ timeRange }),
    keepPreviousData: true, // This keeps the old data while fetching new data
  });

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["instructorStudents"],
    queryFn: instructorService.getInstructorStudents,
  });

  const {
    data: earnings,
    isLoading: earningsLoading,
    error: earningsError,
  } = useQuery({
    queryKey: ["instructorEarnings"],
    queryFn: instructorService.getInstructorEarnings,
  });

  const isLoading =
    dashboardLoading ||
    coursesLoading ||
    analyticsLoading ||
    studentsLoading ||
    earningsLoading;

  const hasError =
    dashboardError ||
    coursesError ||
    analyticsError ||
    studentsError ||
    earningsError;

  if (hasError) {
    return <DashboardError />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Safe data extraction with defaults
  const dashboard = dashboardData?.data || {};
  const coursesData = courses?.data || [];
  const studentsData = students?.data || [];
  const earningsData = earnings?.data || {};
  const analyticsData = analytics?.data || {};

  console.log("Courses data:", coursesData); // Debug log to check courses

  // Extract data from different responses
  const totalCourses = dashboard.totalCourses || coursesData.length || 0;
  const totalStudents =
    dashboard.totalStudents ||
    studentsData.length ||
    earningsData.totalStudents ||
    0;
  const totalRevenue = dashboard.totalRevenue || earningsData.totalRevenue || 0;
  const averageRating =
    dashboard.averageRating || analyticsData.summary?.avgRating || 0;

  // Calculate monthly revenue trend
  const monthlyRevenue = analyticsData.summary?.monthlyRevenue || 0;
  const revenueTrend =
    totalRevenue > 0 ? Math.round((monthlyRevenue / totalRevenue) * 100) : 0;

  // Process enrollment trends
  const enrollmentTrends =
    analyticsData.enrollmentTrends || earningsData.enrollmentsByMonth || [];
  const processedEnrollmentTrends = enrollmentTrends.map((item: any) => ({
    month: item.month || `Month ${item._id || item.month}`,
    enrollments: item.enrollments || item.count || 0,
    revenue: item.revenue || 0,
  }));

  // Process category data
  const categoryData = analyticsData.categoryData || [];
  const progressData = analyticsData.progressData || [];
  const recentActivity = analyticsData.recentActivity || [];

  // Top performing courses
  const topCourses = coursesData.slice(0, 4).map((course: any) => ({
    ...course,
    revenue: (course.studentsEnrolled || 0) * (course.price || 0),
    progress:
      progressData.find((p: any) => p._id === course._id)?.avgProgress || 0,
  }));

  // Student engagement data
  const engagementData = coursesData.slice(0, 5).map((course: any) => {
    const progress =
      progressData.find((p: any) => p._id === course._id)?.avgProgress || 0;
    return {
      name:
        course.title.substring(0, 20) + (course.title.length > 20 ? "..." : ""),
      completion: progress,
      engagement: Math.min(
        100,
        (course.studentsEnrolled /
          Math.max(...coursesData.map((c: any) => c.studentsEnrolled || 1))) *
          100
      ),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <WelcomeSection
          userName={user?.name || "Instructor"}
          totalCourses={totalCourses}
          totalStudents={totalStudents}
          totalRevenue={totalRevenue}
          revenueTrend={revenueTrend}
        />

        <StatsOverview
          totalRevenue={totalRevenue}
          totalStudents={totalStudents}
          totalCourses={totalCourses}
          averageRating={averageRating}
          revenueTrend={revenueTrend}
          publishedCourses={analyticsData.summary?.publishedCourses}
          totalReviews={analyticsData.summary?.totalReviews}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <MyCoursesSection
              courses={coursesData}
              isLoading={coursesLoading}
            />

            <AnalyticsTabsSection
              enrollmentTrends={processedEnrollmentTrends}
              categoryData={categoryData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              isLoading={analyticsFetching} // Pass loading state for timeRange changes
            />

            <StudentEngagementSection
              engagementData={engagementData}
              isLoading={analyticsFetching}
            />
          </div>

          <div className="space-y-8">
            <QuickActionsSection
              totalStudents={totalStudents}
              isLoading={analyticsFetching}
            />
            <RecentActivitySection
              recentActivity={recentActivity}
              isLoading={analyticsFetching}
            />
            <PerformanceMetricsSection
              progressData={progressData}
              averageRating={averageRating}
              monthlyRevenue={monthlyRevenue}
              totalRevenue={totalRevenue}
              isLoading={analyticsFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
