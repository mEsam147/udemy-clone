"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { instructorService } from "@/services/instructor.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  MessageSquare,
  Award,
  Clock,
  BookOpen,
  Star,
  ChevronDown,
  MoreHorizontal,
  UserCheck,
  Target,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Bookmark,
  CheckCircle2,
  User,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

// Types based on your API response
interface StudentEnrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  course: {
    _id: string;
    title: string;
  };
  completedLessons: string[];
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
  rating?: {
    score: number;
    review: string;
    ratedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StudentsResponse {
  success: boolean;
  count: number;
  data: StudentEnrollment[];
}

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

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const progressBarVariants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.3,
    },
  }),
};

export default function InstructorStudents() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const { data, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ["instructorStudents"],
    queryFn: instructorService.getInstructorStudents,
  });

  // Process and filter data
  const processedData = useMemo(() => {
    if (!data?.data) return [];

    return data.data
      .filter((enrollment: StudentEnrollment) => {
        const matchesSearch =
          enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = selectedCourse === "all" || enrollment.course._id === selectedCourse;

        let matchesFilter = true;
        if (filter === "completed") matchesFilter = enrollment.progress === 100;
        if (filter === "active") matchesFilter = enrollment.progress > 0 && enrollment.progress < 100;
        if (filter === "new") matchesFilter = enrollment.progress === 0;
        if (filter === "rated") matchesFilter = !!enrollment.rating;

        return matchesSearch && matchesFilter && matchesCourse;
      })
      .sort((a: StudentEnrollment, b: StudentEnrollment) => {
        if (sortBy === "progress") return b.progress - a.progress;
        if (sortBy === "name") return a.student.name.localeCompare(b.student.name);
        if (sortBy === "course") return a.course.title.localeCompare(b.course.title);
        if (sortBy === "recent") return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        if (sortBy === "enrollment") return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        return 0;
      });
  }, [data, searchTerm, filter, sortBy, selectedCourse]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.data) {
      return {
        total: 0,
        completed: 0,
        active: 0,
        new: 0,
        rated: 0,
        avgProgress: 0,
        totalCourses: 0,
        totalEnrollments: data?.count || 0,
      };
    }

    const students = data.data;
    const uniqueCourses = new Set(students.map(s => s.course._id)).size;

    return {
      total: students.length,
      completed: students.filter(s => s.progress === 100).length,
      active: students.filter(s => s.progress > 0 && s.progress < 100).length,
      new: students.filter(s => s.progress === 0).length,
      rated: students.filter(s => s.rating).length,
      avgProgress: students.reduce((acc, s) => acc + s.progress, 0) / students.length || 0,
      totalCourses: uniqueCourses,
      totalEnrollments: data.count,
    };
  }, [data]);

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    if (!data?.data) return [];
    const courses = data.data.map(enrollment => enrollment.course);
    return Array.from(new Map(courses.map(course => [course._id, course])).values());
  }, [data]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <HeaderSection
          user={user}
          stats={stats}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
          courses={uniqueCourses}
        />

        {/* Students Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {processedData.length > 0 ? (
              processedData.map((enrollment: StudentEnrollment, index: number) => (
                <StudentCard
                  key={enrollment._id}
                  enrollment={enrollment}
                  index={index}
                />
              ))
            ) : (
              <EmptyState searchTerm={searchTerm} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More and Export Options */}
        {processedData.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {processedData.length} of {stats.totalEnrollments} enrollments
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Users className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Header Section Component
function HeaderSection({
  user,
  stats,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  selectedCourse,
  onCourseChange,
  courses,
}: any) {
  return (
    <motion.div variants={itemVariants} className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl" />
      <div className="absolute inset-0 bg-black/10 rounded-3xl" />
      <div className="relative p-8 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Student Management
                </h1>
                <p className="text-blue-100 text-lg">
                  Monitor student progress and engagement across all courses, {user?.name}!
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="flex flex-wrap gap-4 mt-6">
              <StatBadge
                icon={<Users className="h-6 w-6" />}
                value={stats.totalEnrollments}
                label="Total Enrollments"
                color="blue"
              />
              <StatBadge
                icon={<BookOpen className="h-6 w-6" />}
                value={stats.totalCourses}
                label="Courses"
                color="purple"
              />
              <StatBadge
                icon={<Award className="h-6 w-6" />}
                value={stats.completed}
                label="Completed"
                color="green"
              />
              <StatBadge
                icon={<TrendingUp className="h-6 w-6" />}
                value={stats.active}
                label="Active"
                color="orange"
              />
              <StatBadge
                icon={<Star className="h-6 w-6" />}
                value={stats.rated}
                label="Rated"
                color="yellow"
              />
              <StatBadge
                icon={<BarChart3 className="h-6 w-6" />}
                value={`${stats.avgProgress.toFixed(1)}%`}
                label="Avg Progress"
                color="indigo"
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
            {/* Search Input */}
            <div className="flex-1 relative block my-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                placeholder="Search students, courses, or emails..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white/20 border-0 text-white placeholder:text-white "
              />
            </div>
          <div className="flex flex-col lg:flex-row gap-4 mx-auto items-center justify-center">

            {/* Course Filter */}
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger className="bg-white/20 border-0 text-white">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All", icon: Users },
                { value: "completed", label: "Completed", icon: Award },
                { value: "active", label: "Active", icon: TrendingUp },
                { value: "new", label: "New", icon: Target },
                { value: "rated", label: "Rated", icon: Star },
              ].map((filterOption) => (
                <Button
                  key={filterOption.value}
                  variant={filter === filterOption.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange(filterOption.value)}
                  className={cn(
                    "backdrop-blur-sm whitespace-nowrap",
                    filter === filterOption.value
                      ? "bg-white text-blue-600"
                      : "bg-white/10 text-white border-white/20"
                  )}
                >
                  <filterOption.icon className="h-4 w-4 mr-2" />
                  {filterOption.label}
                </Button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="bg-white/20 border-0 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Sort: Progress</SelectItem>
                <SelectItem value="name">Sort: Name</SelectItem>
                <SelectItem value="course">Sort: Course</SelectItem>
                <SelectItem value="recent">Sort: Recent Activity</SelectItem>
                <SelectItem value="enrollment">Sort: Enrollment Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Student Card Component
function StudentCard({ enrollment, index }: { enrollment: StudentEnrollment; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600 bg-green-100";
    if (progress >= 75) return "text-blue-600 bg-blue-100";
    if (progress >= 50) return "text-yellow-600 bg-yellow-100";
    if (progress >= 25) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 100) return { label: "Completed", color: "bg-green-100 text-green-800 border-green-200" };
    if (progress > 0) return { label: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { label: "Not Started", color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const status = getStatusBadge(enrollment.progress);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index * 0.1}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div variants={cardHoverVariants} className="relative group ">
        <Card className="border-0 h-[67vh] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white/80 backdrop-blur-sm">
          {/* Progress Bar Background */}
          <div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
            style={{ width: `${enrollment.progress}%` }}
          />

          <CardContent className="p-6">
            {/* Student Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={enrollment.student.avatar}
                    alt={enrollment.student.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.student.name)}&background=6366f1&color=fff`;
                    }}
                  />
                  {enrollment.progress === 100 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {enrollment.student.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {enrollment.student.email}
                  </p>
                  <Badge variant="outline" className={cn("mt-1", status.color)}>
                    {status.label}
                  </Badge>
                </div>
              </div>

              <motion.div
                animate={{ opacity: isHovered ? 1 : 0.5 }}
                className="flex gap-1"
              >
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Course Info */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="font-medium truncate flex-1">
                  {enrollment.course.title}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Active {getTimeSince(enrollment.lastAccessed)}</span>
                </div>
              </div>

              {enrollment.rating && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < enrollment.rating!.score
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    Rated {enrollment.rating.score}/5
                  </span>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Course Progress
                </span>
                <span
                  className={cn(
                    "text-sm font-bold px-2 py-1 rounded-full",
                    getProgressColor(enrollment.progress)
                  )}
                >
                  {enrollment.progress}%
                </span>
              </div>

              <div className="relative">
                <Progress
                  value={enrollment.progress}
                  className={cn(
                    "h-2",
                    enrollment.progress === 100
                      ? "bg-green-500"
                      : enrollment.progress >= 75
                      ? "bg-blue-500"
                      : enrollment.progress >= 50
                      ? "bg-yellow-500"
                      : enrollment.progress >= 25
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                />
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {enrollment.completedLessons.length}
                  </div>
                  <div>Lessons Done</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {enrollment.progress}%
                  </div>
                  <div>Progress</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {enrollment.rating ? `${enrollment.rating.score}/5` : "No rating"}
                  </div>
                  <div>Rating</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="flex gap-2 mt-4 pt-4 border-t border-gray-100"
            >
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Stat Badge Component
function StatBadge({ icon, value, label, color = "blue" }: any) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-100 border-blue-400/30",
    green: "bg-green-500/20 text-green-100 border-green-400/30",
    orange: "bg-orange-500/20 text-orange-100 border-orange-400/30",
    purple: "bg-purple-500/20 text-purple-100 border-purple-400/30",
    yellow: "bg-yellow-500/20 text-yellow-100 border-yellow-400/30",
    indigo: "bg-indigo-500/20 text-indigo-100 border-indigo-400/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border min-w-[200px]",
        colorClasses[color]
      )}
    >
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="font-bold text-xl">{value}</div>
        <div className="text-sm opacity-90">{label}</div>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full text-center py-16"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm ? "No matching students found" : "No students yet"}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {searchTerm 
          ? "Try adjusting your search terms or filters to find what you're looking for."
          : "Students will appear here once they enroll in your courses. Share your course links to get started!"
        }
      </p>
      <div className="flex gap-3 justify-center">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Share Courses
        </Button>
        <Button variant="outline">
          View Analytics
        </Button>
      </div>
    </motion.div>
  );
}

// Error State Component
function ErrorState({ error }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center"
    >
      <Card className="border-0 shadow-lg max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Students
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || "There was an error loading your students data."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Skeleton Loader
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-300 to-gray-400 h-48 animate-pulse" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
            <div className="h-10 bg-gray-300 rounded w-24"></div>
            <div className="h-10 bg-gray-300 rounded w-40"></div>
          </div>
        </div>

        {/* Students Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}