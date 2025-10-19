"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  Filter, 
  MoreVertical,
  Users,
  Star,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  PlayCircle,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/lib/types";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const cardHoverVariants = {
  hover: {
    y: -6,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

export default function AdminCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: adminService.getAllCourses,
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({
      courseId,
      isPublished,
    }: {
      courseId: string;
      isPublished: boolean;
    }) => adminService.toggleCoursePublishStatus(courseId, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      toast.success(`Course ${variables.isPublished ? 'published' : 'unpublished'} successfully`);
    },
    onError: (error) => {
      toast.error("Failed to update course status");
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete course");
    },
  });

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(course => {
        if (statusFilter === "published") return course.isPublished;
        if (statusFilter === "draft") return !course.isPublished;
        return true;
      });
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    return filtered;
  }, [data, searchQuery, statusFilter, categoryFilter]);

  // Course statistics
  const courseStats = useMemo(() => {
    if (!data?.data) return { total: 0, published: 0, draft: 0, categories: 0 };

    const courses = data.data;
    const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
    
    return {
      total: courses.length,
      published: courses.filter(c => c.isPublished).length,
      draft: courses.filter(c => !c.isPublished).length,
      categories: categories.length,
    };
  }, [data]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!data?.data) return [];
    return [...new Set(data.data.map(c => c.category).filter(Boolean))];
  }, [data]);

  const handleTogglePublish = (courseId: string, currentStatus: boolean) => {
    togglePublishMutation.mutate({
      courseId,
      isPublished: !currentStatus
    });
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const handleViewCourse = (courseId: string) => {
    // Navigate to course detail page
    window.open(`/courses/${courseId}`, '_blank');
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  const courses = filteredCourses;

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
              Course Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Review and moderate platform courses, {user?.name}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Download className="w-4 h-4" />
              Export Courses
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Courses"
            value={courseStats.total}
            icon={<BookOpen className="w-6 h-6" />}
            color="purple"
            delay={0}
          />
          <StatCard
            title="Published"
            value={courseStats.published}
            icon={<Eye className="w-6 h-6" />}
            color="green"
            delay={0.1}
          />
          <StatCard
            title="Draft"
            value={courseStats.draft}
            icon={<Edit className="w-6 h-6" />}
            color="blue"
            delay={0.2}
          />
          <StatCard
            title="Categories"
            value={courseStats.categories}
            icon={<BarChart3 className="w-6 h-6" />}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses by title, instructor, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40 bg-white/50 backdrop-blur-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-40 bg-white/50 backdrop-blur-sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Grid */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {courses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery || statusFilter !== "all" ? "No courses found" : "No courses available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "There are no courses in the system yet"
                }
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard 
                    course={course} 
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDeleteCourse}
                    onView={handleViewCourse}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Course Card Component
function CourseCard({ course, onTogglePublish, onDelete, onView }: { 
  course: Course; 
  onTogglePublish: (courseId: string, currentStatus: boolean) => void;
  onDelete: (courseId: string, courseTitle: string) => void;
  onView: (courseId: string) => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return "bg-blue-100 text-blue-800";
      case 'intermediate':
        return "bg-purple-100 text-purple-800";
      case 'advanced':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      className="group h-full"
    >
      <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Course Image */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <BookOpen className="w-12 h-12 opacity-50" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(course.isPublished)}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>

          {/* Level Badge */}
          {course.level && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
            </div>
          )}

          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onView(course._id)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={() => onTogglePublish(course._id, course.isPublished)}
            >
              {course.isPublished ? (
                <ToggleRight className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <ToggleLeft className="w-4 h-4 mr-1 text-gray-500" />
              )}
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Course Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {course.subtitle || course.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.studentsEnrolled || 0} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.ratings?.average?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>

            {/* Course Meta */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span>Instructor</span>
                <span className="font-medium text-gray-800">{course.instructor?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Category</span>
                <Badge variant="outline" className="text-xs">
                  {course.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Price</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatPrice(course.price || 0)}
                </span>
              </div>
              {course.totalHours && (
                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.totalHours}h
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTogglePublish(course._id, course.isPublished)}
              className="flex-1 gap-2"
            >
              {course.isPublished ? (
                <>
                  <ToggleRight className="w-4 h-4 text-green-500" />
                  Published
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-gray-500" />
                  Draft
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-3">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onClick={() => onView(course._id)}
                >
                  <Eye className="w-4 h-4" />
                  Preview Course
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600"
                  onClick={() => onDelete(course._id, course.title)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, delay = 0 }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
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

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full backdrop-blur-sm bg-white/70 border-0 shadow-lg text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load courses</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton Loading
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white/70 rounded-xl p-4 border-0 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="h-10 bg-gray-300 rounded flex-1"></div>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="h-10 bg-gray-300 rounded w-40"></div>
              <div className="h-10 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/70 rounded-xl border-0 shadow-lg overflow-hidden">
            <div className="h-40 bg-gray-300"></div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-gray-300 rounded flex-1"></div>
                <div className="h-9 bg-gray-300 rounded w-9"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}