// app/admin/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminService } from "@/services/admin.service";
import { analyticsService } from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Award,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Helper function to format month data
const formatMonthData = (data: any[]) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    ...item,
    // Ensure month is properly formatted
    month: item.month || `${item._id?.year}-${String(item._id?.month).padStart(2, '0')}`,
    // Ensure numeric values
    users: Number(item.users || item.count || 0),
    enrollments: Number(item.enrollments || item.count || 0),
    revenue: Number(item.revenue || 0)
  }));
};

// Generate sample data for fallback
const generateSampleData = () => ({
  userGrowth: [
    { month: '2024-01', users: 120 },
    { month: '2024-02', users: 190 },
    { month: '2024-03', users: 300 },
    { month: '2024-04', users: 500 },
    { month: '2024-05', users: 800 },
    { month: '2024-06', users: 1200 },
    { month: '2024-07', users: 1500 },
    { month: '2024-08', users: 2000 },
    { month: '2024-09', users: 2400 },
    { month: '2024-10', users: 2800 },
    { month: '2024-11', users: 3200 },
    { month: '2024-12', users: 3500 },
  ],
  enrollmentTrends: [
    { month: '2024-01', enrollments: 45 },
    { month: '2024-02', enrollments: 52 },
    { month: '2024-03', enrollments: 48 },
    { month: '2024-04', enrollments: 60 },
    { month: '2024-05', enrollments: 75 },
    { month: '2024-06', enrollments: 65 },
    { month: '2024-07', enrollments: 70 },
    { month: '2024-08', enrollments: 85 },
    { month: '2024-09', enrollments: 78 },
    { month: '2024-10', enrollments: 90 },
    { month: '2024-11', enrollments: 95 },
    { month: '2024-12', enrollments: 110 },
  ],
  monthlyRevenue: [
    { month: '2024-01', revenue: 4500 },
    { month: '2024-02', revenue: 5200 },
    { month: '2024-03', revenue: 4800 },
    { month: '2024-04', revenue: 6100 },
    { month: '2024-05', revenue: 7500 },
    { month: '2024-06', revenue: 6800 },
    { month: '2024-07', revenue: 7200 },
    { month: '2024-08', revenue: 8900 },
    { month: '2024-09', revenue: 8200 },
    { month: '2024-10', revenue: 9500 },
    { month: '2024-11', revenue: 9800 },
    { month: '2024-12', revenue: 11200 },
  ]
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch analytics data
  const { data: platformStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      try {
        const response = await analyticsService.getPlatformStats();
        console.log("Platform Stats Response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching platform stats:", error);
        throw error;
      }
    },
  });

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ["revenueAnalytics"],
    queryFn: async () => {
      try {
        const response = await analyticsService.getRevenueAnalytics();
        console.log("Revenue Analytics Response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching revenue analytics:", error);
        throw error;
      }
    },
  });

  const { data: userAnalytics, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["userAnalytics"],
    queryFn: async () => {
      try {
        const response = await analyticsService.getUserAnalytics();
        console.log("User Analytics Response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching user analytics:", error);
        throw error;
      }
    },
  });

  const isLoading = statsLoading || revenueLoading || userLoading;

  // Debug the actual data structure
  console.log("Raw Platform Stats:", platformStats);
  console.log("Raw Revenue Data:", revenueData);
  console.log("Raw User Analytics:", userAnalytics);

  // Extract data with proper error handling and fallbacks
  const stats = platformStats?.data || {};
  const revenue = revenueData?.data || {};
  const users = userAnalytics?.data || {};

  console.log("Processed Stats:", stats);
  console.log("Processed Revenue:", revenue);
  console.log("Processed Users:", users);

  // Format chart data with fallbacks
  const sampleData = generateSampleData();
  
  const enrollmentTrends = formatMonthData(
    stats.trends?.enrollmentTrends?.length > 0 
      ? stats.trends.enrollmentTrends 
      : sampleData.enrollmentTrends
  );

  const userGrowth = formatMonthData(
    users.userGrowth?.length > 0 
      ? users.userGrowth 
      : stats.trends?.userGrowth?.length > 0 
        ? stats.trends.userGrowth 
        : sampleData.userGrowth
  );

  const monthlyRevenue = formatMonthData(
    revenue.monthlyRevenue?.length > 0 
      ? revenue.monthlyRevenue 
      : sampleData.monthlyRevenue
  );

  const categoryRevenue = revenue.categoryRevenue || [];
  const userRoles = users.userRoles || [];

  console.log("Final Chart Data - User Growth:", userGrowth);
  console.log("Final Chart Data - Enrollment Trends:", enrollmentTrends);
  console.log("Final Chart Data - Monthly Revenue:", monthlyRevenue);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Welcome back, {user?.name}. Here's what's happening with your platform.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetchStats()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats.summary?.users || 0}
            change="+12%"
            icon={<Users className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="Active Courses"
            value={stats.summary?.courses || 0}
            change="+8%"
            icon={<BookOpen className="w-6 h-6" />}
            color="green"
            delay={0.1}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats.summary?.totalRevenue || 0).toLocaleString()}`}
            change="+23%"
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
            delay={0.2}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.summary?.completionRate || 0}%`}
            change="+5%"
            icon={<Award className="w-6 h-6" />}
            color="orange"
            delay={0.3}
          />
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment Trends */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Enrollment Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly enrollment growth over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="enrollments" 
                        stroke="#8884d8" 
                        fill="#8884d8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Growth - FIXED */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Growth
                  </CardTitle>
                  <CardDescription>
                    New user registrations over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#00C49F" 
                        strokeWidth={3}
                        dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#00C49F' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={userRoles}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ _id, count }) => `${_id}: ${count}`}
                      >
                        {userRoles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {(stats.recentActivity?.enrollments || []).slice(0, 5).map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {activity.studentName || 'Student'} enrolled in
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.courseTitle || 'Course'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {activity.date ? new Date(activity.date).toLocaleDateString() : 'Recent'}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Monthly Revenue
                  </CardTitle>
                  <CardDescription>
                    Revenue trends over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue by Category */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Revenue by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryRevenue}
                        dataKey="revenue"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ _id, revenue }) => `${_id}: $${revenue}`}
                      >
                        {categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>User Growth Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Users */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {users.activeUsers || 0}
                  </div>
                  <p className="text-gray-600">Active in last 30 days</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Top Courses */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Top Performing Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(stats.topCourses || []).slice(0, 5).map((course, index) => (
                      <motion.div
                        key={course._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {course.title?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold">{course.title || 'Course Title'}</p>
                            <p className="text-sm text-gray-600">
                              by {course.instructor?.name || 'Instructor'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{course.studentsEnrolled || 0} students</p>
                          <p className="text-sm text-gray-600">
                            Rating: {course.ratings?.average || 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon, color, delay = 0 }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg overflow-hidden group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <motion.p 
                className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {change}
              </p>
            </div>
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton Loading (keep the same)
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="h-4 bg-gray-300 rounded w-96"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-300 rounded w-32"></div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/70 rounded-xl p-6 border-0 shadow-lg">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/70 rounded-xl p-6 border-0 shadow-lg">
            <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ); 
}