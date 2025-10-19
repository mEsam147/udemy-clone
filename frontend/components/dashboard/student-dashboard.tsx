"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  Target,
  Zap,
  Award,
  PlayCircle,
  BarChart3,
  Users,
  Bookmark,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const progressBarVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.5,
    },
  }),
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<
    "overview" | "progress" | "courses"
  >("overview");

  const {
    data: enrollmentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["studentEnrollments"],
    queryFn: analyticsService.getEnrollments,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Transform API data into analytics format
  const analytics = useMemo(() => {
    if (!enrollmentsData?.data) return null;

    const enrollments = enrollmentsData.data;

    // Calculate summary statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(
      (e: any) => e.progress === 100
    ).length;
    const inProgressCourses = enrollments.filter(
      (e: any) => e.progress > 0 && e.progress < 100
    ).length;
    const notStartedCourses = enrollments.filter(
      (e: any) => e.progress === 0
    ).length;
    const averageProgress =
      totalCourses > 0
        ? enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / totalCourses
        : 0;
    const totalCompletedLessons = enrollments.reduce(
      (sum: number, e: any) => sum + e.completedLessons.length,
      0
    );

    // Generate progress trends (last 6 months)
    const progressTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        progress: Math.max(
          0,
          Math.min(100, averageProgress - i * 5 + (Math.random() * 20 - 10))
        ),
        enrollments: Math.floor(Math.random() * 5) + 1,
      };
    }).reverse();

    // Category distribution (mock - you'd need course categories from your API)
    const categoryDistribution = [
      { category: "Development", count: 3, avgProgress: 65 },
      { category: "Business", count: 2, avgProgress: 45 },
      { category: "Design", count: 1, avgProgress: 80 },
      { category: "Marketing", count: 1, avgProgress: 30 },
    ];

    // Progress distribution
    const progressDistribution = [
      { range: "0%", count: notStartedCourses, color: "#ef4444" },
      {
        range: "1-25%",
        count: enrollments.filter((e: any) => e.progress > 0 && e.progress <= 25)
          .length,
        color: "#f59e0b",
      },
      {
        range: "26-50%",
        count: enrollments.filter((e: any) => e.progress > 25 && e.progress <= 50)
          .length,
        color: "#eab308",
      },
      {
        range: "51-75%",
        count: enrollments.filter((e: any) => e.progress > 50 && e.progress <= 75)
          .length,
        color: "#84cc16",
      },
      {
        range: "76-99%",
        count: enrollments.filter((e: any) => e.progress > 75 && e.progress < 100)
          .length,
        color: "#22c55e",
      },
      { range: "100%", count: completedCourses, color: "#15803d" },
    ];

    // Weekly activity
    const weeklyActivity = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ].map((day) => ({
      day,
      sessions: Math.floor(Math.random() * 8) + 1,
      progress: Math.floor(Math.random() * 20) + 5,
    }));

    // Achievements
    const achievements = [
      {
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "👣",
        earned: totalCompletedLessons > 0,
        progress: totalCompletedLessons > 0 ? 100 : 0,
      },
      {
        name: "Course Collector",
        description: "Enroll in 5+ courses",
        icon: "📚",
        earned: totalCourses >= 5,
        progress: Math.min(100, (totalCourses / 5) * 100),
      },
      {
        name: "Perfect Score",
        description: "Complete a course with 100% progress",
        icon: "⭐",
        earned: completedCourses > 0,
        progress: completedCourses > 0 ? 100 : 0,
      },
      {
        name: "Learning Streak",
        description: "Learn for 7 consecutive days",
        icon: "🔥",
        earned: false,
        progress: 30,
      },
      {
        name: "Review Master",
        description: "Rate 3 courses",
        icon: "💬",
        earned: enrollments.filter((e: any) => e.rating).length >= 3,
        progress: Math.min(
          100,
          (enrollments.filter((e: any) => e.rating).length / 3) * 100
        ),
      },
    ];

    return {
      enrollments,
      summary: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        averageProgress: Math.round(averageProgress),
        totalLearningHours: Math.round(totalCompletedLessons * 0.5), // Estimate
        totalCompletedLessons,
      },
      progressTrends,
      categoryDistribution,
      progressDistribution,
      weeklyActivity,
      achievements,
    };
  }, [enrollmentsData]);

  // Handle course navigation
  const handleCourseNavigation = (enrollment: any) => {
    if (enrollment.progress === 100) {
      // Navigate to course review page
      router.push(`/courses/${enrollment.course._id}`);
    } else {
      // Navigate to course learning page
      router.push(`/courses/${enrollment.course._id}/learn`);
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState />;
  if (!analytics) return <div>No data available</div>;

  return (
    <motion.div
      className="min-h-screen bg-background p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4"
      >
        <div className="flex-1">
          <motion.h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome back, {user?.name}! 🎉
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Continue your learning journey and achieve your goals
          </motion.p>
        </div>

        <motion.div
          className="flex flex-wrap gap-2 w-full lg:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant={activeView === "overview" ? "default" : "outline"}
            onClick={() => setActiveView("overview")}
            className="gap-2 flex-1 lg:flex-none min-w-[100px]"
            size="sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </Button>
          <Button
            variant={activeView === "progress" ? "default" : "outline"}
            onClick={() => setActiveView("progress")}
            className="gap-2 flex-1 lg:flex-none min-w-[100px]"
            size="sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </Button>
          <Button
            variant={activeView === "courses" ? "default" : "outline"}
            onClick={() => setActiveView("courses")}
            className="gap-2 flex-1 lg:flex-none min-w-[100px]"
            size="sm"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Courses</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Content - Remove AnimatePresence to prevent re-mounting */}
      <div className="relative">
        {activeView === "overview" && (
          <OverviewView
            analytics={analytics}
            onCourseNavigate={handleCourseNavigation}
            key="overview"
          />
        )}
        {activeView === "progress" && (
          <ProgressView analytics={analytics} key="progress" />
        )}
        {activeView === "courses" && (
          <CoursesView
            analytics={analytics}
            onCourseNavigate={handleCourseNavigation}
            key="courses"
          />
        )}
      </div>
    </motion.div>
  );
}

// Overview View Component - FIXED: Remove exit animations and use simpler approach
function OverviewView({
  analytics,
  onCourseNavigate
}: {
  analytics: any;
  onCourseNavigate: (enrollment: any) => void;
}) {
  const [isVisible] = useState(true); // Remove animation state management

  if (!isVisible) return null;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Courses"
          value={analytics.summary.totalCourses}
          icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          description="Courses enrolled"
          trend="+2 this month"
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Average Progress"
          value={`${analytics.summary.averageProgress}%`}
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          description="Overall completion"
          progress={analytics.summary.averageProgress}
          color="green"
          delay={0.2}
        />
        <StatCard
          title="Completed"
          value={analytics.summary.completedCourses}
          icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          description="Courses finished"
          color="purple"
          delay={0.3}
        />
        <StatCard
          title="Learning Hours"
          value={analytics.summary.totalLearningHours}
          icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
          description="Time invested"
          trend="+5h this week"
          color="orange"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Learning Progress
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your progress over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.progressTrends}>
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#8884d8"
                      fill="url(#progressGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Progress Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                How your courses are progressing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.progressDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="range" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analytics.progressDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                Recent Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analytics.enrollments
                  .slice(0, 4)
                  .map((enrollment: any, index: number) => (
                    <motion.div
                      key={enrollment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <CourseProgressCard
                        enrollment={enrollment}
                        onNavigate={() => onCourseNavigate(enrollment)}
                      />
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analytics.achievements.map(
                  (achievement: any, index: number) => (
                    <motion.div
                      key={achievement.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.6 }}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${
                        achievement.earned
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                          : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`text-xl sm:text-2xl ${
                            achievement.earned ? "scale-110" : "opacity-60"
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm sm:text-base ${
                              achievement.earned
                                ? "text-green-700"
                                : "text-foreground"
                            }`}
                          >
                            {achievement.name}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {achievement.description}
                          </p>
                          {!achievement.earned && (
                            <Progress
                              value={achievement.progress}
                              className="h-1.5 sm:h-2 mt-2"
                            />
                          )}
                        </div>
                        {achievement.earned && (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Progress View Component - FIXED: Remove exit animations
function ProgressView({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Weekly Learning Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your study patterns this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="progress" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Learning by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your course distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, count }: { category: string; count: number }) => `${category}: ${count}`}
                  >
                    {analytics.categoryDistribution.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Courses View Component - FIXED: Remove exit animations
function CoursesView({
  analytics,
  onCourseNavigate
}: {
  analytics: any;
  onCourseNavigate: (enrollment: any) => void;
}) {
  return (
    <motion.div
      key="courses"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">All Your Courses</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage and continue your learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {analytics.enrollments.map((enrollment: any, index: number) => (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <CourseCard
                  enrollment={enrollment}
                  onNavigate={() => onCourseNavigate(enrollment)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  progress,
  color = "blue",
  delay = 0,
}: {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: string;
  progress?: number;
  color?: string;
  delay?: number;
}) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      light: "bg-blue-50 text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      light: "bg-green-50 text-green-700",
      badge: "bg-green-100 text-green-700",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      light: "bg-purple-50 text-purple-700",
      badge: "bg-purple-100 text-purple-700",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      light: "bg-orange-50 text-orange-700",
      badge: "bg-orange-100 text-orange-700",
    },
  };

  const currentColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      whileTap="tap"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden group h-full border hover:shadow-lg transition-all duration-300 max-w-[400px] ">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

        <CardContent className="p-4 sm:p-6 relative z-10">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${currentColor.gradient} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {icon}
              </motion.div>

              {/* Title for mobile */}
              <div className="block sm:hidden">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {trend && (
                  <Badge variant="secondary" className={`${currentColor.badge} text-xs mt-1`}>
                    {trend}
                  </Badge>
                )}
              </div>
            </div>

            {/* Trend badge for desktop */}
            {trend && (
              <div className="hidden sm:block">
                <Badge variant="secondary" className={currentColor.badge}>
                  {trend}
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-1 sm:space-y-2">
            {/* Value */}
            <motion.h3
              className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.h3>

            {/* Title for desktop */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{title}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 sm:mb-2">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${currentColor.gradient} rounded-full shadow-sm`}
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                  custom={progress}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component for course progress cards
function CourseProgressCard({
  enrollment,
  onNavigate
}: {
  enrollment: any;
  onNavigate: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent transition-all cursor-pointer group"
      onClick={onNavigate}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {enrollment.course.title.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
          {enrollment.course.title}
        </h4>
        <div className="mt-1 sm:mt-2">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{enrollment.progress}%</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${enrollment.progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="flex-shrink-0 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate();
        }}
      >
        {enrollment.progress === 100 ? "Review" : "Continue"}
      </Button>
    </motion.div>
  );
}

// Component for course cards
function CourseCard({
  enrollment,
  onNavigate
}: {
  enrollment: any;
  onNavigate: () => void;
}) {
  const getStatusColor = (progress: number) => {
    if (progress === 0) return "bg-muted-foreground";
    if (progress === 100) return "bg-green-500";
    return "bg-blue-500";
  };

  const getStatusText = (progress: number) => {
    if (progress === 0) return "Not Started";
    if (progress === 100) return "Completed";
    return "In Progress";
  };

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      whileTap="tap"
      className="group cursor-pointer"
      onClick={onNavigate}
    >
      <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300 h-full">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold flex-shrink-0">
              {enrollment.course.title.charAt(0)}
            </div>
            <Badge
              className={`${getStatusColor(enrollment.progress)} text-white text-xs`}
            >
              {getStatusText(enrollment.progress)}
            </Badge>
          </div>

          <h4 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm sm:text-base group-hover:text-primary transition-colors flex-1">
            {enrollment.course.title}
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{enrollment.progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getStatusColor(enrollment.progress)}`}
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              {enrollment.completedLessons.length} lessons
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
            >
              {enrollment.progress === 100 ? "Review" : "Continue"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Skeleton loading component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-4 w-32 sm:w-48" />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Skeleton className="h-9 sm:h-10 flex-1 lg:flex-none lg:w-32" />
            <Skeleton className="h-9 sm:h-10 flex-1 lg:flex-none lg:w-32" />
            <Skeleton className="h-9 sm:h-10 flex-1 lg:flex-none lg:w-32" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                  <Skeleton className="w-12 h-5 sm:w-16 sm:h-6" />
                </div>
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-1 sm:mb-2" />
                <Skeleton className="h-4 w-24 sm:w-32 mb-1" />
                <Skeleton className="h-3 w-20 sm:w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
              <Skeleton className="h-4 w-24 sm:w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 sm:h-60 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
              <Skeleton className="h-4 w-24 sm:w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 sm:h-60 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Error state component
function ErrorState() {
  return (
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
            We couldn't load your dashboard data. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} size="sm" className="text-sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
