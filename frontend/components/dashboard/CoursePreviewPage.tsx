"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getCourseDetails,
  getCourseLessons,
  updateCourseStatus,
  enrollCourse,
  getEnrollmentStatus,
  getCourseAnalytics,
  updateCourseDetails,
} from "@/services/course.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PlayCircle,
  Clock,
  Users,
  Star,
  BookOpen,
  Eye,
  Download,
  Bookmark,
  Calendar,
  Award,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  BarChart3,
  Edit3,
  ArrowLeft,
  Heart,
  MessageCircle,
  BookmarkCheck,
  TrendingUp,
  DollarSign,
  Target,
  FileText,
  Loader2,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { EditCourseModal } from "./modals/EditCourseModal";
import Link from "next/link";

// Define proper interfaces
interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  subcategory?: string;
  image: string;
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  price: number;
  level: "beginner" | "intermediate" | "advanced" | "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  totalHours: number;
  lecturesCount: number;
  studentsEnrolled: number;
  ratings?: {
    average: number;
    count: number;
  };
  whatYoullLearn: string[];
  requirements: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isEnrolled?: boolean;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  videoUrl: string;
  isPreview: boolean;
  isCompleted?: boolean;
  resources?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface AnalyticsData {
  course: {
    title: string;
    studentsEnrolled: number;
    revenue: number;
    averageRating: number;
    totalReviews: number;
  };
  progress: {
    averageProgress: number;
    completedStudents: number;
    activeStudents: number;
  };
  enrollmentTrends: Array<{ _id: string; count: number }>;
  lessons: {
    total: number;
    totalDuration: number;
  };
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
  status?: number;
}

// Safe data extraction helper
const extractData = <T,>(response: ApiResponse<T> | T | undefined): T | null => {
  if (!response) return null;
  
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as ApiResponse<T>).data || null;
  }
  
  return response as T;
};

export default function CoursePreviewPage({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State management
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [watchedImage, setWatchedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // React Hook Form for edit modal
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      level: "beginner",
      status: "draft",
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "❌ Unauthorized",
        description: "Please log in to view this course.",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, router]);

  // Data fetching queries
  const {
    data: courseResponse,
    isLoading: courseLoading,
    error: courseError,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetails(courseId),
    enabled: !!courseId && !!user,
    retry: 2,
    onSuccess: (response) => {
      const courseData = extractData<Course>(response);
      if (courseData) {
        // Set image preview
        setImagePreview(courseData.image || "");
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error loading course",
        description: error?.message || "Failed to load course details",
        variant: "destructive",
      });
    },
  });

  const {
    data: lessonsResponse,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useQuery({
    queryKey: ["courseLessons", courseId],
    queryFn: () => getCourseLessons(courseId),
    enabled: !!courseId && !!user,
    retry: 2,
  });

  const {
    data: analyticsResponse,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["courseAnalytics", courseId],
    queryFn: () => getCourseAnalytics(courseId),
    enabled: !!courseId && !!user && showAnalyticsModal,
    retry: 2,
  });

  const {
    data: enrollmentResponse,
    isLoading: enrollmentLoading,
    error: enrollmentError,
  } = useQuery({
    queryKey: ["enrollmentStatus", courseId, user?.id],
    queryFn: () => getEnrollmentStatus(courseId, user!.id),
    enabled: !!courseId && !!user?.id,
    retry: 2,
  });

  // Safe data extraction with fallbacks
  const courseData = extractData<Course>(courseResponse) || {} as Course;
  const lessonsData = extractData<Lesson[]>(lessonsResponse) || [];
  const analyticsData = extractData<AnalyticsData>(analyticsResponse) || {
    course: {
      title: "",
      studentsEnrolled: 0,
      revenue: 0,
      averageRating: 0,
      totalReviews: 0,
    },
    progress: { averageProgress: 0, completedStudents: 0, activeStudents: 0 },
    enrollmentTrends: [],
    lessons: { total: 0, totalDuration: 0 },
  };
  const enrollmentStatus = extractData<{ isEnrolled: boolean }>(enrollmentResponse) || { isEnrolled: false };

  // Watch for image changes
  const watchedImageFile = watch("image");
  useEffect(() => {
    if (watchedImageFile instanceof File) {
      const previewUrl = URL.createObjectURL(watchedImageFile);
      setImagePreview(previewUrl);
      setWatchedImage(watchedImageFile);
    }
  }, [watchedImageFile]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: "published" | "draft") =>
      updateCourseStatus(courseId, status),
    onSuccess: (data, variables) => {
      toast({
        title: "✅ Course status updated!",
        description: `Course has been ${
          variables === "published" ? "published" : "unpublished"
        }.`,
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      refetchCourse();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating course",
        description: error?.message || "Failed to update course status.",
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: any) => updateCourseDetails(courseId, data),
    onSuccess: () => {
      toast({
        title: "✅ Course updated successfully!",
        description: "Your course details have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setShowEditModal(false);
      // Clean up image preview URLs
      if (watchedImage) {
        URL.revokeObjectURL(imagePreview);
      }
      setWatchedImage(null);
      setImagePreview(courseData.image || "");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating course",
        description: error?.message || "Failed to update course details.",
        variant: "destructive",
      });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(courseId),
    onSuccess: () => {
      toast({
        title: "🎉 Successfully enrolled!",
        description: "You can now access all course content.",
      });
      setShowEnrollDialog(false);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({
        queryKey: ["enrollmentStatus", courseId, user?.id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Enrollment failed",
        description: error?.message || "Failed to enroll in course.",
        variant: "destructive",
      });
    },
  });

  // Video controls functions
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!lessonsData.length) return 0;
    const completed = lessonsData.filter(
      (lesson: Lesson) => lesson.isCompleted
    ).length;
    return (completed / lessonsData.length) * 100;
  };

  const handlePublishToggle = () => {
    if (courseData?.isPublished) {
      updateStatusMutation.mutate("draft");
    } else {
      updateStatusMutation.mutate("published");
    }
  };

  // Safe data access with fallbacks
  const isInstructorOrAdmin = user && ["instructor", "admin"].includes(user.role || "");
  const isEnrolled = enrollmentStatus?.isEnrolled || courseData.isEnrolled || false;
  const courseRatings = courseData.ratings || { average: 0, count: 0 };
  const instructor = courseData.instructor || { _id: "", name: "Instructor" };
  const whatYoullLearn = Array.isArray(courseData.whatYoullLearn) ? courseData.whatYoullLearn : [];
  const requirements = Array.isArray(courseData.requirements) ? courseData.requirements : [];

  if (!user) {
    return null;
  }

  if (courseLoading) {
    return <CoursePreviewSkeleton />;
  }

  if (courseError || !courseData._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild >
            <Link href="/dashboard/instructor/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-y-3.5  my-3 md:my-0 md:flex-row items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/instructor/courses")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <Badge
                variant={courseData.isPublished ? "default" : "secondary"}
                className={cn(
                  courseData.isPublished
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                )}
              >
                {courseData.isPublished ? "Published" : "Draft"}
              </Badge>
              {isEnrolled && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Enrolled
                </Badge>
              )}
              {isInstructorOrAdmin && (
                <Badge
                  variant={user.role === "admin" ? "destructive" : "secondary"}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
              )}
            </div>

            {isInstructorOrAdmin && (
              <div className="flex  flex-wrap md:flex-nowrap items-center gap-3">
                <Button
                  onClick={handlePublishToggle}
                  disabled={updateStatusMutation.isPending}
                  className={cn(
                    courseData.isPublished
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : courseData.isPublished ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {courseData.isPublished ? "Unpublish" : "Publish"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowAnalyticsModal(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {courseData.category}
                </Badge>
                <Badge variant="outline">{courseData.level}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{courseRatings.average.toFixed(1)}</span>
                  <span>({courseRatings.count} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {courseData.title}
              </h1>
              {courseData.subtitle && (
                <p className="text-lg text-gray-600 mb-4">
                  {courseData.subtitle}
                </p>
              )}
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {courseData.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{courseData.totalHours || 0} hours total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseData.lecturesCount || 0} lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{courseData.studentsEnrolled || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last updated{" "}
                    {new Date(courseData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {instructor.name?.charAt(0).toUpperCase() || "I"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {instructor.name}
                  </p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl border-0">
                <div className="relative h-48">
                  <img
                    src={courseData.image || ""}
                    alt={courseData.title}
                    className="w-full h-full object-cover rounded-t-lg"
                    // onError={(e) => {
                    //   e.currentTarget.src = "/api/placeholder/300/200";
                    // }}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
                  <Button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                    size="lg"
                    onClick={() => {
                      const previewLesson = lessonsData.find((l: Lesson) => l.isPreview) || lessonsData[0];
                      if (previewLesson) {
                        setSelectedLesson(previewLesson);
                      } else {
                        toast({
                          title: "No lessons available",
                          description: "This course doesn't have any lessons yet.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={!lessonsData.length}
                  >
                    <PlayCircle className="h-8 w-8 mr-2" />
                    Preview Course
                  </Button>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${courseData.price}
                    </span>
                    {courseData.price > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        ${(courseData.price * 1.5).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {!isEnrolled && (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-semibold"
                        onClick={() => setShowEnrollDialog(true)}
                        disabled={enrollMutation.isPending || isEnrolled}
                      >
                        {enrollMutation.isPending ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          "Enroll Now"
                        )}
                      </Button>
                    )}
                    {isEnrolled && (
                      <Badge
                        variant="outline"
                        className="w-full py-2 text-center text-green-700 bg-green-50"
                      >
                        Enrolled
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <Bookmark className="h-4 w-4 mr-2" />
                        )}
                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        {isLiked ? (
                          <Heart className="h-4 w-4 mr-2 text-red-600 fill-current" />
                        ) : (
                          <Heart className="h-4 w-4 mr-2" />
                        )}
                        Like
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="flex justify-between">
                      <span>Course level:</span>
                      <span className="font-medium capitalize">
                        {courseData.level}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {courseData.totalHours || 0} hours
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Lectures:</span>
                      <span className="font-medium">
                        {courseData.lecturesCount || 0}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-medium">
                        {courseData.language || "English"}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* Course Content Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b">
              <nav className="flex flex-wrap space-x-8 px-6">
                {["overview", "curriculum", "reviews", "instructor"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors",
                        activeTab === tab
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      {tab === "curriculum"
                        ? `Curriculum (${lessonsData.length})`
                        : tab}
                    </button>
                  )
                )}
              </nav>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        What you'll learn
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {whatYoullLearn.map(
                          (objective, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">{objective}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Requirements
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {requirements.map(
                          (requirement, index) => (
                            <li key={index}>{requirement}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === "curriculum" && (
                  <motion.div
                    key="curriculum"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Course Content
                        </h3>
                        <p className="text-gray-600">
                          {lessonsData.length} lessons •{" "}
                          {courseData.totalHours || 0} hours total length
                        </p>
                      </div>
                      {isEnrolled && (
                        <div className="flex items-center gap-4">
                          <Progress
                            value={getProgressPercentage()}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-600">
                            {Math.round(getProgressPercentage())}% complete
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {lessonsLoading ? (
                        <CurriculumSkeleton />
                      ) : lessonsData.length > 0 ? (
                        lessonsData.map((lesson: Lesson, index: number) => (
                          <LessonItem
                            key={lesson._id}
                            lesson={lesson}
                            index={index}
                            isSelected={selectedLesson?._id === lesson._id}
                            onSelect={() => {
                              if (
                                lesson.isPreview ||
                                isEnrolled ||
                                isInstructorOrAdmin
                              ) {
                                setSelectedLesson(lesson);
                              } else {
                                toast({
                                  title: "🔒 Locked Content",
                                  description:
                                    "Please enroll to access this lesson.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            isEnrolled={isEnrolled}
                            isInstructorOrAdmin={isInstructorOrAdmin}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No lessons available yet</p>
                          <p className="text-sm">Lessons will appear here once added</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ReviewsSection course={courseData} />
                  </motion.div>
                )}

                {activeTab === "instructor" && (
                  <motion.div
                    key="instructor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InstructorSection instructor={instructor} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Edit Course Modal */}
      <EditCourseModal
        isEditModalOpen={showEditModal}
        setIsEditModalOpen={setShowEditModal}
        selectedCourse={courseData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        imageInputRef={imageInputRef}
        watchedImage={watchedImage}
        setValue={setValue}
        register={register}
        errors={errors}
        watch={watch}
        handleSubmit={handleSubmit}
        updateCourseMutation={updateCourseMutation}
      />

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Course Analytics
            </DialogTitle>
            <DialogDescription>
              Detailed insights about your course performance and student engagement.
            </DialogDescription>
          </DialogHeader>

          {analyticsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : analyticsData.course.title ? (
            <div className="space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
              {/* Course Overview */}
              <Card className="overflow-y-auto bg-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {analyticsData.course.studentsEnrolled}
                      </div>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        ${analyticsData.course.revenue}
                      </div>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {analyticsData.course.averageRating.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {analyticsData.course.totalReviews}
                      </div>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Student Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Completion</span>
                      <span className="font-bold">
                        {analyticsData.progress.averageProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={analyticsData.progress.averageProgress}
                      className="h-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="font-bold">
                          {analyticsData.progress.completedStudents}
                        </div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="font-bold">
                          {analyticsData.progress.activeStudents}
                        </div>
                        <p className="text-sm text-gray-600">Active</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment Trends */}
              {analyticsData.enrollmentTrends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Enrollment Trends (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.enrollmentTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{trend._id}</span>
                          <span className="font-medium">{trend.count} enrollments</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lessons Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {analyticsData.lessons.total}
                      </div>
                      <p className="text-sm text-gray-600">Total Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {analyticsData.lessons.totalDuration}h
                      </div>
                      <p className="text-sm text-gray-600">Total Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No analytics data available</p>
              <p className="text-sm">
                Analytics will appear as students enroll and progress
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <Dialog
            open={!!selectedLesson}
            onOpenChange={() => setSelectedLesson(null)}
          >
            <DialogContent className="max-w-6xl w-full p-0 bg-black border-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                {/* Video Player */}
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    src={selectedLesson.videoUrl}
                    className="w-full h-[60vh] object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onClick={handlePlayPause}
                    autoPlay
                  />

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isVideoPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex items-center gap-2 text-white text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>

                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) =>
                            handleSeek(parseFloat(e.target.value))
                          }
                          className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsMuted(!isMuted);
                          handleVolumeChange(isMuted ? volume : 0);
                        }}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) =>
                          handleVolumeChange(parseFloat(e.target.value))
                        }
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lesson Info */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedLesson.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedLesson.description}
                  </p>

                  {selectedLesson.resources &&
                    selectedLesson.resources.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Resources</h4>
                        <div className="space-y-2">
                          {selectedLesson.resources.map((resource, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={resource.url}
                                download
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                {resource.name}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {courseData.title}</DialogTitle>
            <DialogDescription>
              You're about to enroll in this course. This will give you full
              access to all course content.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Course Price</span>
              <span className="text-2xl font-bold text-gray-900">
                ${courseData.price}
              </span>
            </div>
            {courseData.price > 0 && (
              <p className="text-sm text-gray-600">
                One-time payment • Lifetime access
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnrollDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending || isEnrolled}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component: Lesson Item
function LessonItem({
  lesson,
  index,
  isSelected,
  onSelect,
  isEnrolled,
  isInstructorOrAdmin,
}: {
  lesson: Lesson;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isEnrolled: boolean;
  isInstructorOrAdmin: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
        isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
        <p className="text-sm text-gray-600 truncate">{lesson.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline">{Math.round(lesson.duration / 60)}m</Badge>
        {lesson.isPreview ? (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Preview
          </Badge>
        ) : isEnrolled || isInstructorOrAdmin ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Unlocked
          </Badge>
        ) : (
          <Lock className="h-4 w-4 text-gray-400" />
        )}
        <Button variant="ghost" size="sm">
          <PlayCircle className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// Component: Reviews Section
function ReviewsSection({ course }: { course: Course }) {
  const ratings = course.ratings || { average: 0, count: 0 };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {ratings.average.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.floor(ratings.average)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">Course Rating</p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-600 w-8">{stars}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${(stars / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12">
                {((stars / 5) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-12 text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No reviews yet</p>
        <p className="text-sm">Be the first to review this course!</p>
      </div>
    </div>
  );
}

// Component: Instructor Section
function InstructorSection({
  instructor,
}: {
  instructor: Course["instructor"];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {instructor?.name?.charAt(0).toUpperCase() || "I"}
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">
            {instructor?.name || "Instructor"}
          </h3>
          <p className="text-gray-600 mb-4">Course Instructor</p>
          <p className="text-gray-700 leading-relaxed">
            {instructor?.bio ||
              "Experienced instructor passionate about sharing knowledge and helping students succeed."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">10K+</div>
            <p className="text-gray-600">Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">25</div>
            <p className="text-gray-600">Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-gray-600">Average Rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component: Course Preview Skeleton
function CoursePreviewSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Curriculum Skeleton
function CurriculumSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border rounded-lg animate-pulse"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}