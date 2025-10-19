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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  Star,
  Eye,
  Target,
  BarChart3,
  Calendar,
  Clock,
  Award,
  Zap,
  Rocket,
  ChartBar,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw,
  MessageSquare,
  PlayCircle,
  Clock4,
  Bookmark,
  Share2,
  UserCheck,
  BarChart4,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as Recharts from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];
const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function InstructorAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["instructorAnalytics", timeRange],
    queryFn: () => analyticsService.getInstructorAnalytics({ timeRange }),
    refetchInterval: 60000,
  });

  if (isLoading || !isMounted) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const analytics = data?.data || {
    summary: {
      totalCourses: 0,
      publishedCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      avgRating: 0,
      totalReviews: 0,
    },
    courses: [],
    enrollments: [],
    enrollmentTrends: [],
    progressData: [],
    categoryData: [],
    ratingDistribution: [],
    recentActivity: [],
    reviews: [],
  };

  // Process data for charts
  const processedCourses = analytics.courses.map(course => {
    const courseEnrollments = analytics.enrollments.filter(
      (enrollment: any) => enrollment.course._id === course._id
    );
    const courseRevenue = courseEnrollments.length * course.price;
    const progress = analytics.progressData.find(
      (p: any) => p._id === course._id
    )?.avgProgress || 0;

    return {
      ...course,
      revenue: courseRevenue,
      progress,
      enrollmentCount: courseEnrollments.length,
    };
  });

  const enrollmentTrendsWithRevenue = analytics.enrollmentTrends.map((trend: any) => {
    const monthEnrollments = analytics.enrollments.filter((enrollment: any) => {
      const enrolledMonth = new Date(enrollment.enrolledAt).toISOString().slice(0, 7);
      return enrolledMonth === trend.month;
    });
    
    const monthRevenue = monthEnrollments.reduce((sum: number, enrollment: any) => {
      return sum + enrollment.course.price;
    }, 0);

    return {
      ...trend,
      revenue: monthRevenue,
    };
  });

  const progressRadarData = analytics.progressData.map((item: any) => {
    const course = analytics.courses.find((c: any) => c._id === item._id);
    return {
      subject: course?.title?.substring(0, 15) + (course?.title?.length > 15 ? "..." : "") || "Unknown",
      progress: item.avgProgress,
      fullMark: 100,
    };
  });

  const engagementData = analytics.courses.slice(0, 5).map((course: any) => {
    const progress = analytics.progressData.find((p: any) => p._id === course._id)?.avgProgress || 0;
    return {
      name: course.title.substring(0, 20) + (course.title.length > 20 ? "..." : ""),
      completion: progress,
      engagement: Math.min(100, (course.studentsEnrolled / Math.max(...analytics.courses.map((c: any) => c.studentsEnrolled))) * 100),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        <HeaderSection
          summary={analytics.summary}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={refetch}
        />
        
        <KeyMetricsGrid summary={analytics.summary} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <RevenueEnrollmentSection
              enrollmentTrends={enrollmentTrendsWithRevenue}
              timeRange={timeRange}
            />
            <CoursePerformanceSection
              courses={processedCourses}
            />
            <CategoryPerformanceSection categoryData={analytics.categoryData} />
          </div>
          
          <div className="space-y-8">
            <StudentProgressRadar progressData={progressRadarData} />
            <RatingDistributionSection
              ratingDistribution={analytics.ratingDistribution}
            />
            <RecentActivitySection recentActivity={analytics.recentActivity} />
            <QuickActionsSection />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReviewAnalyticsSection reviews={analytics.reviews} />
          <StudentEngagementSection engagementData={engagementData} />
        </div>
      </motion.div>
    </div>
  );
}

function HeaderSection({
  summary,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}: any) {
  return (
    <motion.div variants={itemVariants} className="relative">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl">
        <div className="p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl border border-white/30">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    Instructor Analytics
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Track your teaching performance and revenue growth
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {summary.monthlyRevenue > 0
                    ? `+${Math.round(
                        (summary.monthlyRevenue / summary.totalRevenue) * 100
                      )}%`
                    : "0%"}{" "}
                  This Month
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Users className="h-3 w-3 mr-1" />
                  {summary.totalStudents} Total Students
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1" />
                  {summary.avgRating.toFixed(1)} Average Rating
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {summary.totalCourses} Courses
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white h-11 w-11 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white h-11 px-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KeyMetricsGrid({ summary }: any) {
  const metrics = [
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: summary.monthlyRevenue > 0 ? Math.round((summary.monthlyRevenue / summary.totalRevenue) * 100) : 0,
      description: "Total earnings from all courses",
      color: "from-emerald-500 to-emerald-600",
      trendColor: "text-emerald-400",
    },
    {
      title: "Total Students",
      value: summary.totalStudents.toLocaleString(),
      icon: Users,
      trend: 12,
      description: "Active students enrolled",
      color: "from-blue-500 to-blue-600",
      trendColor: "text-blue-400",
    },
    {
      title: "Course Portfolio",
      value: summary.totalCourses,
      icon: BookOpen,
      subtitle: `${summary.publishedCourses} Published`,
      description: "Total courses created",
      color: "from-violet-500 to-violet-600",
      trendColor: "text-violet-400",
    },
    {
      title: "Student Satisfaction",
      value: summary.avgRating.toFixed(1),
      icon: Star,
      subtitle: `${summary.totalReviews} Reviews`,
      description: "Average course rating",
      color: "from-amber-500 to-amber-600",
      trendColor: "text-amber-400",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {metrics.map((metric, index) => (
        <motion.div key={metric.title} variants={itemVariants}>
          <Card
            className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[30vh]",
              `bg-gradient-to-br ${metric.color} text-white`
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium mb-1">{metric.title}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    {metric.trend > 0 && (
                      <span className={cn("text-xs font-medium flex items-center", metric.trendColor)}>
                        <TrendingUp className="h-3 w-3 mr-1" />+{metric.trend}%
                      </span>
                    )}
                  </div>
                  {metric.subtitle && (
                    <p className="text-white/70 text-sm mb-1">{metric.subtitle}</p>
                  )}
                  <p className="text-white/60 text-xs">{metric.description}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20">
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function RevenueEnrollmentSection({ enrollmentTrends, timeRange }: any) {
  if (enrollmentTrends.length === 0) {
    return (
      <motion.div variants={chartVariants}>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-blue-600" />
              Enrollment & Revenue Trends
            </CardTitle>
            <CardDescription>No data available for trends</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={chartVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-blue-600" />
            Enrollment & Revenue Trends
          </CardTitle>
          <CardDescription>Student enrollment and revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.ComposedChart data={enrollmentTrends}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <Recharts.XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => value.slice(5)}
                />
                <Recharts.YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  fontSize={12}
                />
                <Recharts.YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b" 
                  fontSize={12}
                />
                <Recharts.Tooltip 
                  formatter={(value, name) => {
                    if (name === "revenue") return [`$${Number(value).toFixed(2)}`, "Revenue"];
                    return [value, "Enrollments"];
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Recharts.Legend />
                <Recharts.Bar
                  yAxisId="left"
                  dataKey="enrollments"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Enrollments"
                />
                <Recharts.Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  name="Revenue"
                />
              </Recharts.ComposedChart>
            </Recharts.ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CoursePerformanceSection({ courses }: any) {
  if (courses.length === 0) {
    return (
      <motion.div variants={chartVariants}>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Course Performance
            </CardTitle>
            <CardDescription>No courses available</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  const performanceData = courses.slice(0, 6).map((course: any) => ({
    name: course.title.substring(0, 25) + (course.title.length > 25 ? "..." : ""),
    revenue: course.revenue || 0,
    students: course.studentsEnrolled || 0,
    progress: course.progress || 0,
    rating: course.ratings?.average || 0,
  }));

  return (
    <motion.div variants={chartVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Course Performance
          </CardTitle>
          <CardDescription>
            Top performing courses by revenue and student engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.BarChart data={performanceData} layout="vertical">
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <Recharts.XAxis type="number" stroke="#64748b" fontSize={12} />
                <Recharts.YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11}
                  width={120}
                  tick={{ dy: 0 }}
                />
                <Recharts.Tooltip
                  formatter={(value, name) => {
                    if (name === "revenue") return [`$${value}`, "Revenue"];
                    if (name === "students") return [value, "Students"];
                    if (name === "progress") return [`${value}%`, "Progress"];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Recharts.Legend />
                <Recharts.Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                />
                <Recharts.Bar
                  dataKey="students"
                  name="Students"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                />
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CategoryPerformanceSection({ categoryData }: any) {
  if (categoryData.length === 0) {
    return (
      <motion.div variants={chartVariants}>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              Category Performance
            </CardTitle>
            <CardDescription>No category data available</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  const totalRevenue = categoryData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0);

  return (
    <motion.div variants={chartVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-orange-600" />
            Category Performance
          </CardTitle>
          <CardDescription>
            Revenue distribution across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.PieChart>
                <Recharts.Pie
                  data={categoryData}
                  dataKey="totalRevenue"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ _id, totalRevenue }) => 
                    `${_id}: $${totalRevenue.toFixed(2)}`
                  }
                  labelLine={false}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Recharts.Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Recharts.Pie>
                <Recharts.Tooltip
                  formatter={(value: number) => [
                    `$${value.toFixed(2)} (${((value / totalRevenue) * 100).toFixed(1)}%)`,
                    "Revenue"
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Recharts.Legend />
              </Recharts.PieChart>
            </Recharts.ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StudentProgressRadar({ progressData }: any) {
  if (progressData.length === 0) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChartBar className="h-5 w-5 text-indigo-600" />
              Student Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 py-8">
              No progress data available
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChartBar className="h-5 w-5 text-indigo-600" />
            Student Progress Radar
          </CardTitle>
          <CardDescription>Average progress across courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.RadarChart data={progressData}>
                <Recharts.PolarGrid stroke="#e2e8f0" />
                <Recharts.PolarAngleAxis dataKey="subject" stroke="#64748b" />
                <Recharts.PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" />
                <Recharts.Radar
                  name="Progress"
                  dataKey="progress"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Recharts.Tooltip 
                  formatter={(value) => [`${value}%`, "Progress"]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </Recharts.RadarChart>
            </Recharts.ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RatingDistributionSection({ ratingDistribution }: any) {
  const totalReviews = ratingDistribution.reduce((sum: number, item: any) => sum + item.count, 0);
  
  const ratingData = [5, 4, 3, 2, 1].map((rating) => {
    const ratingItem = ratingDistribution.find((r: any) => r._id === rating);
    const count = ratingItem?.count || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    return {
      rating,
      count,
      percentage,
    };
  });

  return (
    <motion.div variants={itemVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-600" />
            Rating Distribution
          </CardTitle>
          <CardDescription>Based on {totalReviews} reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ratingData.map((item) => (
            <div key={item.rating} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{item.rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentActivitySection({ recentActivity }: any) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'enrolled':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <Award className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock4 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'enrolled':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock4 className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No recent activity</p>
          ) : (
            recentActivity.slice(0, 8).map((activity: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.studentName}
                    </p>
                    <Badge variant="outline" className={cn("text-xs", getActionColor(activity.action))}>
                      {activity.action}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {activity.courseTitle}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${activity.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{activity.progress}%</span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(activity.time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickActionsSection() {
  const actions = [
    { icon: Download, label: "Export Report", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Share2, label: "Share Analytics", color: "text-green-600", bg: "bg-green-50" },
    { icon: Filter, label: "Filter Data", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Bookmark, label: "Save View", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              variant="outline"
              className={cn(
                "h-16 flex-col gap-2 border-2 hover:border-current transition-all duration-300",
                action.bg
              )}
            >
              <action.icon className={cn("h-5 w-5", action.color)} />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReviewAnalyticsSection({ reviews }: any) {
  return (
    <motion.div variants={chartVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Recent Reviews
          </CardTitle>
          <CardDescription>Latest student feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No reviews available</p>
            ) : (
              reviews.slice(0, 6).map((review: any, index: number) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-medium text-sm">{review.user?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {review.course?.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StudentEngagementSection({ engagementData }: any) {
  if (engagementData.length === 0) {
    return (
      <motion.div variants={chartVariants}>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Student Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 py-8">No engagement data available</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={chartVariants}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Student Engagement
          </CardTitle>
          <CardDescription>Course completion vs student engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.ComposedChart data={engagementData}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <Recharts.XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <Recharts.YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Recharts.Tooltip 
                  formatter={(value) => [`${value}%`, ""]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Recharts.Legend />
                <Recharts.Bar
                  dataKey="completion"
                  name="Completion Rate"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Recharts.Line
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement Score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </Recharts.ComposedChart>
            </Recharts.ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ErrorState({ error, onRetry }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="border border-gray-200 shadow-sm max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || "Failed to load analytics data"}
          </p>
          <Button 
            onClick={onRetry} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl h-40 animate-pulse" />
        
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-gray-200 shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-gray-300" />
                    <Skeleton className="h-8 w-16 bg-gray-300" />
                    <Skeleton className="h-3 w-24 bg-gray-300" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl bg-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-sm animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-40 bg-gray-300" />
                  <Skeleton className="h-4 w-60 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full bg-gray-300 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-sm animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full bg-gray-300 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}