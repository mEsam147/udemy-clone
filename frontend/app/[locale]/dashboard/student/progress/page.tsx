"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  Star,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Trophy,
  CalendarDays,
  PlayCircle,
  Bookmark,
  Users,
  Sparkles,
  TargetIcon
} from "lucide-react";

import { learnService } from "@/services/learn.service";
import { analyticsService } from "@/services/analytics.service";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 15,
      duration: 0.8
    }
  }
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("all-time");

  // Fetch all analytics data using the analytics service
  const { data: studentAnalytics, isLoading: studentAnalyticsLoading, error: studentAnalyticsError } = useQuery({
    queryKey: ["studentAnalytics"],
    queryFn: () => analyticsService.getStudentAnalytics(),
  });

  // Fallback to learn service if analytics service fails
  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["learningProgress", timeRange],
    queryFn: () => learnService.getLearningProgress(),
    enabled: !!studentAnalyticsError, // Only fetch if analytics service fails
  });

  const { data: streaksData, isLoading: streaksLoading, error: streaksError } = useQuery({
    queryKey: ["learningStreaks"],
    queryFn: learnService.getLearningStreaks,
  });

  const { data: timelineData, isLoading: timelineLoading, error: timelineError } = useQuery({
    queryKey: ["learningTimeline"],
    queryFn: learnService.getLearningTimeline,
  });

  const { data: enrolledData, isLoading: enrolledLoading, error: enrolledError } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: learnService.getEnrolledCourses,
  });

  const isLoading = studentAnalyticsLoading || progressLoading || streaksLoading || timelineLoading || enrolledLoading;
  const hasError = studentAnalyticsError || progressError || streaksError || timelineError || enrolledError;

  // Transform data for analytics with proper fallbacks
// Update the main data transformation in your ProgressPage component
// Update the main data transformation in your ProgressPage component
const analytics = useMemo(() => {
  console.log('Raw enrolledData:', enrolledData);

  // Priority 1: Use enrolled courses data from /learn endpoint
  if (enrolledData && enrolledData.success && enrolledData.data) {
    console.log('Using enrolled courses data:', enrolledData);
    const transformed = transformEnrolledData(enrolledData);
    console.log('Transformed analytics:', transformed);
    return transformed;
  }

  // Priority 2: Use student analytics data if available
  if (studentAnalytics?.data) {
    console.log('Using student analytics data:', studentAnalytics.data);
    return transformStudentAnalytics(studentAnalytics.data);
  }

  // Priority 3: Use progress data if available
  if (progressData?.data) {
    console.log('Using progress data:', progressData.data);
    return transformProgressData(progressData.data);
  }

  // Final fallback: Mock data
  console.log('Using mock data due to missing API data');
  return createMockAnalytics();
}, [studentAnalytics, enrolledData, progressData, hasError]);

// Fix the transformEnrolledData function
function transformEnrolledData(data: any) {
  console.log('Transforming enrolled data - raw data:', data);

  if (!data || !data.success || !data.data) {
    console.log('No valid enrolled data available');
    return createMockAnalytics();
  }

  // Extract the courses array from the response
  const enrollments = data.data;
  console.log('Found enrollments:', enrollments);

  if (!Array.isArray(enrollments) || enrollments.length === 0) {
    console.log('No enrollments found in data');
    return createMockAnalytics();
  }

  // Calculate statistics from the actual data
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((course: any) => course.progress === 100).length;
  const inProgressCourses = enrollments.filter((course: any) => course.progress > 0 && course.progress < 100).length;
  const averageProgress = enrollments.reduce((sum: number, course: any) => sum + (course.progress || 0), 0) / totalCourses;
  const totalLearningHours = enrollments.reduce((sum: number, course: any) => sum + (course.totalHours || 0), 0);
  const completionRate = (completedCourses / totalCourses) * 100;

  const statistics = {
    totalEnrolled: totalCourses,
    totalCompleted: completedCourses,
    totalInProgress: inProgressCourses,
    averageProgress: averageProgress,
    totalHoursCompleted: Math.round(totalLearningHours),
    completionRate: completionRate
  };

  console.log('Calculated statistics:', statistics);

  // Create progress trends based on actual data
  const progressTrends = generateProgressTrendsFromEnrollments(enrollments, averageProgress);



  // Update the generateProgressTrendsFromEnrollments function
function generateProgressTrendsFromEnrollments(enrollments: any[], averageProgress: number) {
  const trends = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get the current month
  const currentMonth = new Date().getMonth();

  // Calculate completed courses count
  const completedCourses = enrollments.filter((course: any) => course.progress === 100).length;

  // Generate trends for last 6 months with realistic progression
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    // Start from 0 and gradually increase to current average progress
    const progressValue = (averageProgress / 6) * (6 - i) + (Math.random() * 10 - 5);

    trends.push({
      month: months[monthIndex],
      progress: Math.max(0, Math.min(100, Math.round(progressValue))),
      courses: Math.max(1, Math.round(enrollments.length * (0.3 + (i * 0.12)))),
      completed: Math.round(completedCourses * (0.1 + (i * 0.15)))
    });
  }

  return trends;
}

  const transformedData = {
    summary: {
      totalCourses: statistics.totalEnrolled,
      completedCourses: statistics.totalCompleted,
      inProgressCourses: statistics.totalInProgress,
      averageProgress: Math.round(statistics.averageProgress),
      totalLearningHours: statistics.totalHoursCompleted,
      completionRate: Math.round(statistics.completionRate)
    },
    progressTrends: progressTrends,
    progressDistribution: generateProgressDistribution(enrollments),
    coursePerformance: transformCoursePerformance(enrollments),
    weeklyActivity: generateWeeklyActivity(),
    learningGoals: generateLearningGoals(statistics),
    achievements: generateAchievements(enrollments, statistics),
    streaks: { currentStreak: 0, maxStreak: 0, dailyActivity: [] },
    timeline: generateTimelineFromEnrollments(enrollments),
    enrollments: enrollments
  };

  console.log('Final transformed data:', transformedData);
  return transformedData;
}

// Update the generateProgressTrendsFromEnrollments function
function generateProgressTrendsFromEnrollments(enrollments: any[], averageProgress: number) {
  const trends = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get the current month
  const currentMonth = new Date().getMonth();

  // Generate trends for last 6 months with realistic progression
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    // Start from 0 and gradually increase to current average progress
    const progressValue = (averageProgress / 6) * (6 - i) + (Math.random() * 10 - 5);

    trends.push({
      month: months[monthIndex],
      progress: Math.max(0, Math.min(100, Math.round(progressValue))),
      courses: Math.max(1, Math.round(enrollments.length * (0.3 + (i * 0.12)))),
      completed: Math.round(completedCourses * (0.1 + (i * 0.15)))
    });
  }

  return trends;
}

// Update the transformCoursePerformance function
function transformCoursePerformance(courses: any[]) {
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    console.log('No course data available for performance chart');
    return [];
  }

  const performanceData = courses.map((course, index) => {
    const courseName = course.title || course.courseTitle || `Course ${index + 1}`;

    return {
      name: courseName.length > 12
        ? courseName.substring(0, 12) + '...'
        : courseName,
      progress: course.progress || 0,
      lessons: course.completedLessons || course.lessonsCompleted || 0,
      duration: course.totalHours || course.timeSpent || 0,
      fullName: courseName
    };
  });

  console.log('Transformed course performance data:', performanceData);
  return performanceData;
}

// Update the generateProgressDistribution function to use actual data
function generateProgressDistribution(enrollments: any[] = []) {
  console.log('Generating progress distribution from:', enrollments);

  const distribution = [
    { range: '0%', count: enrollments.filter((course: any) => (course.progress || 0) === 0).length, color: '#ef4444' },
    { range: '1-25%', count: enrollments.filter((course: any) => (course.progress || 0) > 0 && (course.progress || 0) <= 25).length, color: '#f59e0b' },
    { range: '26-50%', count: enrollments.filter((course: any) => (course.progress || 0) > 25 && (course.progress || 0) <= 50).length, color: '#eab308' },
    { range: '51-75%', count: enrollments.filter((course: any) => (course.progress || 0) > 50 && (course.progress || 0) <= 75).length, color: '#84cc16' },
    { range: '76-99%', count: enrollments.filter((course: any) => (course.progress || 0) > 75 && (course.progress || 0) < 100).length, color: '#22c55e' },
    { range: '100%', count: enrollments.filter((course: any) => (course.progress || 0) === 100).length, color: '#15803d' }
  ];

  console.log('Progress distribution:', distribution);
  return distribution;
}

// Update the generateAchievements function to use actual progress
function generateAchievements(enrollments: any[] = [], statistics: any = {}) {
  const hasStartedLearning = enrollments.some((course: any) => (course.progress || 0) > 0);
  const hasCompletedCourse = enrollments.some((course: any) => (course.progress || 0) === 100);
  const totalEnrolled = statistics.totalEnrolled || enrollments.length;
  const totalHours = statistics.totalHoursCompleted || 0;

  return [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "👣",
      progress: hasStartedLearning ? 100 : 0,
      earned: hasStartedLearning
    },
    {
      title: "Course Collector",
      description: "Enroll in 3+ courses",
      icon: "📚",
      progress: Math.min(100, (totalEnrolled / 3) * 100),
      earned: totalEnrolled >= 3
    },
    {
      title: "Perfect Score",
      description: "Complete a course with 100% progress",
      icon: "⭐",
      progress: hasCompletedCourse ? 100 : 0,
      earned: hasCompletedCourse
    },
    {
      title: "Learning Streak",
      description: "Learn for 3 consecutive days",
      icon: "🔥",
      progress: totalHours > 10 ? 66 : 33,
      earned: totalHours > 20
    }
  ];
}

// Update the generateLearningGoals function
function generateLearningGoals(statistics: any = {}) {
  return [
    { subject: 'Completion Rate', value: Math.round(statistics.completionRate || 0), goal: 75 },
    { subject: 'Average Progress', value: Math.round(statistics.averageProgress || 0), goal: 80 },
    { subject: 'Weekly Activity', value: Math.min(100, Math.round((statistics.totalHoursCompleted || 0) * 3)), goal: 70 },
    { subject: 'Course Diversity', value: Math.min(100, ((statistics.totalEnrolled || 0) * 20)), goal: 80 }
  ];
}

// Update the generateTimelineFromEnrollments function
function generateTimelineFromEnrollments(enrollments: any[]) {
  const timeline = [];

  enrollments.forEach((course: any) => {
    if (course.enrolledAt) {
      timeline.push({
        eventType: 'enrolled',
        eventDate: course.enrolledAt,
        courseTitle: course.title,
        progress: 0
      });
    }

    if (course.progress > 0 && course.lastAccessed) {
      timeline.push({
        eventType: 'in_progress',
        eventDate: course.lastAccessed,
        courseTitle: course.title,
        progress: course.progress
      });
    }

    if (course.progress === 100 && course.lastAccessed) {
      timeline.push({
        eventType: 'completed',
        eventDate: course.lastAccessed,
        courseTitle: course.title,
        progress: 100
      });
    }
  });

  // Sort by date, most recent first
  const sortedTimeline = timeline.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()).slice(0, 10);
  console.log('Generated timeline:', sortedTimeline);
  return sortedTimeline;
}

// Also add this debugging to your component to see what's happening
useEffect(() => {
  console.log('=== DEBUGGING ANALYTICS ===');
  console.log('enrolledData:', enrolledData);
  console.log('analytics:', analytics);
  console.log('hasError:', hasError);
  console.log('isLoading:', isLoading);
}, [enrolledData, analytics, hasError, isLoading]);
// Fix the transformEnrolledData function to properly handle your API response



// Add debugging to see what's happening
console.log('Enrolled Data:', enrolledData);
console.log('Processed Analytics:', analytics);

  if (isLoading) return <ProgressSkeleton />;
  if (!analytics) return <EmptyState />;

  return (
    <motion.div
      className="min-h-screen bg-background p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Learning Progress
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Track your learning journey and achievements
            </p>
            {hasError && (
              <Badge variant="outline" className="mt-2 bg-yellow-500/10 text-yellow-700 border-yellow-300">
                Using demo data - API connection issue
              </Badge>
            )}
            {studentAnalytics?.data && (
              <Badge variant="outline" className="mt-2 bg-green-500/10 text-green-700 border-green-300">
                Live Analytics Data
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={timeRange === "30-days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30-days")}
            >
              30D
            </Button>
            <Button
              variant={timeRange === "90-days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("90-days")}
            >
              90D
            </Button>
            <Button
              variant={timeRange === "all-time" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("all-time")}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            title="Overall Progress"
            value={`${Math.round(analytics.summary.averageProgress)}%`}
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            description="Average across all courses"
            color="blue"
          />
          <StatCard
            title="Completed"
            value={analytics.summary.completedCourses}
            icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            description="Courses finished"
            color="green"
          />
          <StatCard
            title="Learning Hours"
            value={analytics.summary.totalLearningHours}
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
            description="Time invested"
            color="purple"
          />
          <StatCard
            title="Active Courses"
            value={analytics.summary.inProgressCourses}
            icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
            description="Currently learning"
            color="orange"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <OverviewTab analytics={analytics} />
          )}

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <TrendsTab analytics={analytics} />
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <CoursesTab analytics={analytics} />
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <AchievementsTab analytics={analytics} />
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

// Data transformation functions
function transformStudentAnalytics(data: any) {
  console.log('Transforming student analytics:', data);

  const {
    summary,
    progressTrends,
    categoryDistribution,
    recentCourses,
    recommendedCourses,
    timeDistribution,
    achievements,
    recentActivity,
    streaks
  } = data;

  return {
    summary: {
      totalCourses: summary?.totalCourses || summary?.totalEnrolled || 0,
      completedCourses: summary?.completedCourses || summary?.totalCompleted || 0,
      inProgressCourses: summary?.inProgressCourses || summary?.totalInProgress || 0,
      averageProgress: summary?.averageProgress || 0,
      totalLearningHours: summary?.totalLearningHours || summary?.totalHoursCompleted || 0,
      completionRate: summary?.completionRate || 0
    },
    progressTrends: progressTrends || generateProgressTrends(summary?.averageProgress || 0),
    progressDistribution: transformCategoryDistribution(categoryDistribution),
    coursePerformance: transformCoursePerformance(recentCourses || []),
    weeklyActivity: generateWeeklyActivity(timeDistribution),
    learningGoals: generateLearningGoals(summary),
    achievements: transformAchievements(achievements),
    streaks: streaks || { currentStreak: 0, maxStreak: 0, dailyActivity: [] },
    timeline: recentActivity || [],
    enrollments: recentCourses || []
  };
}

function transformProgressData(data: any) {
  console.log('Transforming progress data:', data);

  const enrollments = data.enrollments || data.courses || [];
  const statistics = data.statistics || data.summary || {};

  return {
    summary: {
      totalCourses: statistics.totalEnrolled || enrollments.length || 0,
      completedCourses: statistics.totalCompleted || enrollments.filter((e: any) => e.progress === 100).length || 0,
      inProgressCourses: statistics.totalInProgress || enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length || 0,
      averageProgress: statistics.averageProgress ||
        (enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / Math.max(enrollments.length, 1)) || 0,
      totalLearningHours: statistics.totalHoursCompleted || statistics.totalLearningHours || 0,
      completionRate: statistics.completionRate || 0
    },
    progressTrends: data.progressTrends || generateProgressTrends(statistics.averageProgress || 0),
    progressDistribution: data.progressDistribution || generateProgressDistribution(enrollments),
    coursePerformance: transformCoursePerformance(enrollments),
    weeklyActivity: data.weeklyActivity || generateWeeklyActivity(),
    learningGoals: generateLearningGoals(statistics),
    achievements: data.achievements || generateAchievements(enrollments, statistics),
    streaks: data.streaks || { currentStreak: 0, maxStreak: 0, dailyActivity: [] },
    timeline: data.timeline || [],
    enrollments: enrollments
  };
}

function transformEnrolledData(data: any) {
  console.log('Transforming enrolled data:', data);

  const enrollments = data.data || data.courses || data.enrollments || [];

  const statistics = {
    totalEnrolled: enrollments.length,
    totalCompleted: enrollments.filter((e: any) => e.progress === 100).length,
    totalInProgress: enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length,
    averageProgress: enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / Math.max(enrollments.length, 1),
    totalHoursCompleted: Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.timeSpent || 0), 0)),
    completionRate: (enrollments.filter((e: any) => e.progress === 100).length / Math.max(enrollments.length, 1)) * 100
  };

  return transformProgressData({ enrollments, statistics });
}

function transformCategoryDistribution(categoryData: any[]) {
  if (!categoryData || !Array.isArray(categoryData)) {
    return generateDefaultDistribution();
  }

  return categoryData.map((category, index) => ({
    range: category._id || category.range || `Category ${index + 1}`,
    count: category.count || category.courseCount || 0,
    color: COLORS[index % COLORS.length]
  }));
}

function transformCoursePerformance(courses: any[]) {
  if (!courses || !Array.isArray(courses)) return generateDefaultPerformance();

  return courses.slice(0, 8).map((course, index) => ({
    name: course.title?.length > 12
      ? course.title.substring(0, 12) + '...'
      : course.title || course.courseTitle || `Course ${index + 1}`,
    progress: course.progress || 0,
    lessons: course.completedLessons || course.lessonsCompleted || 0,
    duration: course.timeSpent || course.duration || 0
  }));
}

function generateProgressTrends(averageProgress: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));

    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      progress: Math.max(0, Math.min(100, averageProgress + (i * 12) + (Math.random() * 10 - 5))),
      courses: Math.floor(Math.random() * 3) + 1,
      completed: Math.floor(Math.random() * 2)
    };
  });
}

function generateProgressDistribution(enrollments: any[] = []) {
  const distribution = [
    { range: '0%', count: enrollments.filter((e: any) => (e.progress || 0) === 0).length, color: '#ef4444' },
    { range: '1-25%', count: enrollments.filter((e: any) => (e.progress || 0) > 0 && (e.progress || 0) <= 25).length, color: '#f59e0b' },
    { range: '26-50%', count: enrollments.filter((e: any) => (e.progress || 0) > 25 && (e.progress || 0) <= 50).length, color: '#eab308' },
    { range: '51-75%', count: enrollments.filter((e: any) => (e.progress || 0) > 50 && (e.progress || 0) <= 75).length, color: '#84cc16' },
    { range: '76-99%', count: enrollments.filter((e: any) => (e.progress || 0) > 75 && (e.progress || 0) < 100).length, color: '#22c55e' },
    { range: '100%', count: enrollments.filter((e: any) => (e.progress || 0) === 100).length, color: '#15803d' }
  ].filter(item => item.count > 0);

  return distribution.length > 0 ? distribution : generateDefaultDistribution();
}

function generateDefaultDistribution() {
  return [
    { range: '0%', count: 2, color: '#ef4444' },
    { range: '1-25%', count: 3, color: '#f59e0b' },
    { range: '26-50%', count: 1, color: '#eab308' },
    { range: '51-75%', count: 2, color: '#84cc16' },
    { range: '76-99%', count: 1, color: '#22c55e' },
    { range: '100%', count: 1, color: '#15803d' }
  ];
}

function generateDefaultPerformance() {
  return [
    { name: 'React Basics', progress: 85, lessons: 12, duration: 8 },
    { name: 'Advanced JS', progress: 60, lessons: 8, duration: 6 },
    { name: 'Node.js', progress: 45, lessons: 6, duration: 4 },
    { name: 'Database Design', progress: 30, lessons: 4, duration: 3 }
  ];
}

function generateWeeklyActivity(timeDistribution?: any[]) {
  const baseActivity = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    hours: Math.floor(Math.random() * 3) + 1,
    lessons: Math.floor(Math.random() * 6) + 1,
    progress: Math.floor(Math.random() * 20) + 10
  }));

  if (!timeDistribution || !Array.isArray(timeDistribution)) return baseActivity;

  return baseActivity.map((day, index) => ({
    ...day,
    hours: timeDistribution[index]?.sessions || timeDistribution[index]?.hours || day.hours
  }));
}

function generateLearningGoals(summary: any = {}) {
  return [
    { subject: 'Completion Rate', value: summary.completionRate || 25, goal: 75 },
    { subject: 'Average Progress', value: summary.averageProgress || 30, goal: 80 },
    { subject: 'Weekly Activity', value: 45, goal: 70 },
    { subject: 'Course Diversity', value: Math.min(100, (summary.totalCourses || 1) * 20), goal: 80 }
  ];
}

function transformAchievements(achievements: any[]) {
  if (!achievements || !Array.isArray(achievements)) {
    return generateDefaultAchievements();
  }

  return achievements.map(achievement => ({
    title: achievement.name || achievement.title,
    description: achievement.description,
    icon: achievement.icon || "🏆",
    progress: achievement.earned ? 100 : achievement.progress || 0,
    earned: achievement.earned || false
  }));
}

function generateAchievements(enrollments: any[] = [], statistics: any = {}) {
  return [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "👣",
      progress: enrollments.some((e: any) => (e.progress || 0) > 0) ? 100 : 0,
      earned: enrollments.some((e: any) => (e.progress || 0) > 0)
    },
    {
      title: "Course Collector",
      description: "Enroll in 3+ courses",
      icon: "📚",
      progress: Math.min(100, ((statistics.totalEnrolled || 0) / 3) * 100),
      earned: (statistics.totalEnrolled || 0) >= 3
    },
    {
      title: "Perfect Score",
      description: "Complete a course with 100% progress",
      icon: "⭐",
      progress: enrollments.some((e: any) => (e.progress || 0) === 100) ? 100 : 0,
      earned: enrollments.some((e: any) => (e.progress || 0) === 100)
    },
    {
      title: "Learning Streak",
      description: "Learn for 3 consecutive days",
      icon: "🔥",
      progress: 66,
      earned: false
    }
  ];
}

function generateDefaultAchievements() {
  return [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "👣",
      progress: 100,
      earned: true
    },
    {
      title: "Course Collector",
      description: "Enroll in 3+ courses",
      icon: "📚",
      progress: 100,
      earned: true
    },
    {
      title: "Perfect Score",
      description: "Complete a course with 100% progress",
      icon: "⭐",
      progress: 50,
      earned: false
    },
    {
      title: "Learning Streak",
      description: "Learn for 3 consecutive days",
      icon: "🔥",
      progress: 66,
      earned: false
    }
  ];
}

function createMockAnalytics() {
  return {
    summary: {
      totalCourses: 8,
      completedCourses: 2,
      inProgressCourses: 4,
      averageProgress: 45,
      totalLearningHours: 24,
      completionRate: 25
    },
    progressTrends: [
      { month: 'Jan', progress: 20, courses: 3, completed: 0 },
      { month: 'Feb', progress: 35, courses: 4, completed: 1 },
      { month: 'Mar', progress: 45, courses: 6, completed: 1 },
      { month: 'Apr', progress: 60, courses: 7, completed: 1 },
      { month: 'May', progress: 55, courses: 8, completed: 2 },
      { month: 'Jun', progress: 65, courses: 8, completed: 2 }
    ],
    progressDistribution: generateDefaultDistribution(),
    coursePerformance: generateDefaultPerformance(),
    weeklyActivity: generateWeeklyActivity(),
    learningGoals: generateLearningGoals({ completionRate: 25, averageProgress: 45, totalCourses: 8 }),
    achievements: generateDefaultAchievements(),
    streaks: {
      currentStreak: 2,
      maxStreak: 5,
      dailyActivity: Array.from({ length: 14 }, (_, i) => ({
        streakDay: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: i % 3 !== 0
      }))
    },
    timeline: [
      { eventType: 'completed_lesson', eventDate: new Date().toISOString(), courseTitle: 'React Basics', progress: 25 }
    ],
    enrollments: [
      { _id: '1', courseTitle: 'React Basics', progress: 85, completedLessons: 12 },
      { _id: '2', courseTitle: 'Advanced JS', progress: 60, completedLessons: 8 }
    ]
  };
}

// Tab Components (keep all your existing UI components)
function OverviewTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Trend Chart */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              Progress Overview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your learning progress over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.progressTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="progress"
                    fill="#8884d8"
                    stroke="#8884d8"
                    fillOpacity={0.3}
                    name="Progress %"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="courses"
                    fill="#82ca9d"
                    name="Active Courses"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Progress Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              How your courses are progressing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.progressDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ range, count }: { range: string; count: number }) => `${range}: ${count}`}
                    labelLine={false}
                  >
                    {analytics.progressDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} courses`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Learning Goals */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Learning Goals
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your progress towards learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.learningGoals.map((goal: any, index: number) => (
                <motion.div
                  key={goal.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.subject}</span>
                    <span className="text-muted-foreground">
                      {goal.value}% / {goal.goal}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        goal.value >= goal.goal ? 'bg-green-500' : 'bg-primary'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.value / goal.goal) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your learning activity in recent weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#8884d8" name="Learning Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lessons" fill="#82ca9d" name="Lessons Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function TrendsTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="trends"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Trend Line */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Progress Trend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your learning progress over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.progressTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Progress %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Completion Trend */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Course Completion</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Course enrollment and completion trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.progressTrends}>
                  <defs>
                    <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="courses"
                    stroke="#8884d8"
                    fill="url(#colorCourses)"
                    name="Total Courses"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#82ca9d"
                    fill="url(#colorCompleted)"
                    name="Completed Courses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Timeline */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Learning Timeline</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your recent learning activities and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.timeline.slice(0, 10).map((event: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background"
              >
                <div className={`w-2 h-2 rounded-full ${
                  event.eventType === 'completed' ? 'bg-green-500' :
                  event.eventType === 'in_progress' ? 'bg-blue-500' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm capitalize">{event.eventType?.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{event.courseTitle}</p>
                  {event.progress && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={event.progress} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground">{event.progress}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CoursesTab({ analytics }: { analytics: any }) {
  const hasCourseData = analytics.coursePerformance && analytics.coursePerformance.length > 0;
  const hasEnrollmentData = analytics.enrollments && analytics.enrollments.length > 0;

  return (
    <motion.div
      key="courses"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Course Performance */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Course Performance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Progress across your top courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasCourseData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.coursePerformance}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={12}
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Progress']}
                      labelFormatter={(label) => `Course: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="progress"
                      fill="#8884d8"
                      name="Progress %"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyCourseState
                title="No Course Performance Data"
                description="Start learning to see your course performance analytics"
                icon={<BarChart3 className="w-8 h-8" />}
              />
            )}
          </CardContent>
        </Card>

        {/* Detailed Progress List */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Course Progress Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Detailed view of all your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasEnrollmentData ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {analytics.enrollments.map((enrollment: any, index: number) => (
                  <motion.div
                    key={enrollment._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {enrollment.courseTitle || 'Unknown Course'}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {enrollment.completedLessons || 0} lessons
                        </span>
                        {enrollment.enrolledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              enrollment.progress === 100 ? 'bg-green-500' :
                              enrollment.progress > 0 ? 'bg-primary' : 'bg-muted-foreground'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress || 0}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                      <Badge variant={
                        enrollment.progress === 100 ? "default" :
                        enrollment.progress > 0 ? "secondary" : "outline"
                      } className="text-xs">
                        {enrollment.progress === 100 ? 'Completed' :
                         enrollment.progress > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyCourseState
                title="No Enrolled Courses"
                description="You haven't enrolled in any courses yet"
                icon={<BookOpen className="w-8 h-8" />}
                action={
                  <Button asChild size="sm">
                    <Link href="/courses">
                      Browse Courses
                    </Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Course Insights */}
      {hasCourseData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Stats */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(analytics.summary.completionRate)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall course completion
              </p>
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.summary.inProgressCourses}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Courses in progress
              </p>
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Learning Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.summary.totalLearningHours}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total time invested
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

// New Empty State Component for Courses
function EmptyCourseState({
  title,
  description,
  icon,
  action
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced data transformation functions to ensure course data is properly formatted




// Update the main analytics transformation to ensure course data is included


// Enhanced mock data with better course examples


function AchievementsTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="achievements"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Achievements Grid */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Your Achievements
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Milestones in your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {analytics.achievements.map((achievement: any, index: number) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    achievement.earned
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20'
                      : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${achievement.earned ? 'scale-110' : 'opacity-60'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${
                        achievement.earned ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      {!achievement.earned && (
                        <Progress value={achievement.progress} className="h-1.5" />
                      )}
                    </div>
                    {achievement.earned && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Streaks and Stats */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Learning Streaks</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your consistency and dedication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {analytics.streaks.currentStreak || 0}
                </div>
                <p className="text-sm text-muted-foreground">Current Streak (days)</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {analytics.streaks.maxStreak || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Longest Streak</p>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {analytics.streaks.dailyActivity?.length || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Days</p>
                </div>
              </div>

              {/* Daily Activity Calendar */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Recent Activity</h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (27 - i));
                    const dateKey = date.toISOString().split('T')[0];
                    const hasActivity = analytics.streaks.dailyActivity?.some(
                      (day: any) => day.streakDay === dateKey || day.active
                    );

                    return (
                      <div
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded text-xs flex items-center justify-center ${
                          hasActivity
                            ? 'bg-green-500'
                            : 'bg-muted'
                        }`}
                        title={date.toLocaleDateString()}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, icon, description, color = "blue" }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color?: string;
}) {
  const colorConfig = {
    blue: { gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10" },
    green: { gradient: "from-green-500 to-green-600", bg: "bg-green-500/10" },
    purple: { gradient: "from-purple-500 to-purple-600", bg: "bg-purple-500/10" },
    orange: { gradient: "from-orange-500 to-orange-600", bg: "bg-orange-500/10" }
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="border bg-card/50 overflow-hidden group">
        <CardContent className="p-3 sm:p-4 relative">
          {/* Background accent */}
          <div className={`absolute inset-0 ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />

          <div className="relative z-10 text-center">
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white mb-2`}>
              {icon}
            </div>
            <motion.p
              className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.p>
            <p className="text-sm font-medium text-foreground mt-1">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Skeleton Loading
function ProgressSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
            <Skeleton className="h-4 w-48 sm:w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12 sm:w-16" />
            <Skeleton className="h-8 w-12 sm:w-16" />
            <Skeleton className="h-8 w-16 sm:w-20" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="p-3 sm:p-4 text-center">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mx-auto mb-2" />
                <Skeleton className="h-6 sm:h-7 w-12 sm:w-16 mx-auto mb-1" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 sm:w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-full" />

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-40 sm:w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 sm:h-60 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card className="border">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-40 sm:w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 sm:h-60 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Empty State
function EmptyState() {
  return (
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full text-center border">
        <CardContent className="p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">No Progress Data Yet</h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
            Start your learning journey by enrolling in courses and tracking your progress.
          </p>
          <Button asChild>
            <Link href="/courses">
              Browse Courses
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Error State
function ErrorState({ hasData }: { hasData: boolean }) {
  return (
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full text-center border">
        <CardContent className="p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            {hasData ? "Partial Data Loaded" : "Failed to Load Data"}
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
            {hasData
              ? "Some data couldn't be loaded, but you can still view available progress information."
              : "We couldn't load your progress data. This might be due to network issues."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Export the data transformation functions for testing
export {
  transformStudentAnalytics,
  transformProgressData,
  createMockAnalytics
};
