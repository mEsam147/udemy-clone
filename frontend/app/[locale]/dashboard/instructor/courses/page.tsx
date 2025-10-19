// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   getInstructorCourses,
//   updateCourse,
//   deleteCourse,
//   getCourseLessons,
//   addLesson,
//   deleteLesson,
//   updateCourseStatus,
//   bulkUpdateCourseStatus,
//   updateLesson,
// } from "@/services/course.service";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   BookOpen,
//   Clock,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   Edit2,
//   Trash2,
//   Video,
//   Eye,
//   Users,
//   Star,
//   FileText,
//   Upload,
//   X,
//   AlertCircle,
//   CheckCircle2,
//   Loader2,
//   MoreVertical,
//   PlayCircle,
//   Search,
//   Grid3X3,
//   List,
//   DollarSign,
//   Shield,
//   Zap,
//   Sparkles,
//   TrendingUp,
//   Image as ImageIcon,
//   Settings,
//   CheckSquare,
//   Square,
//   Filter,
//   BarChart3,
//   Archive,
//   EyeOff,
//   Info,
//   AlertTriangle,
//   XCircle,
// } from "lucide-react";
// import Link from "next/link";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "@/hooks/use-toast";
// import { useForm } from "react-hook-form";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";

// interface Course {
//   _id: string;
//   title: string;
//   category: string;
//   image: string;
//   lecturesCount: number;
//   totalHours: number;
//   description: string;
//   price: number;
//   level: string;
//   enrollments?: number;
//   rating?: number;
//   status?: "draft" | "published" | "archived";
//   createdAt: string;
//   isPublished: boolean;
//   studentsEnrolled: number;
//   instructor: string;
//   requirements?: string[];
//   whatYoullLearn?: string[];
// }

// interface Lesson {
//   _id: string;
//   title: string;
//   duration: number;
//   order: number;
//   videoUrl?: string;
//   description?: string;
//   createdAt?: string;
// }

// interface LessonFormData {
//   title: string;
//   video: File | null;
//   duration: number;
//   description?: string;
// }

// interface CourseFormData {
//   title: string;
//   description: string;
//   category: string;
//   price: number;
//   level: string;
//   status: string;
//   image?: File | null;
// }

// interface PaginationInfo {
//   currentPage: number;
//   totalPages: number;
//   totalCount: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
//   limit: number;
// }

// const statusConfig = {
//   draft: {
//     label: "Draft",
//     color: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
//     icon: EyeOff,
//     description: "Course is not visible to students",
//   },
//   published: {
//     label: "Published",
//     color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
//     icon: Eye,
//     description: "Course is live and visible to students",
//   },
//   archived: {
//     label: "Archived",
//     color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
//     icon: Archive,
//     description: "Course is hidden from students",
//   },
// };

// export default function InstructorCourses() {
//   const { user } = useAuth();
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(9);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [sortBy, setSortBy] = useState<string>("newest");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

//   // Modal states
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
//   const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
//   const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
//   const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
//   const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

//   // Data states
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [currentLesson, setCurrentLesson] = useState<LessonFormData>({
//     title: "",
//     video: null,
//     duration: 0,
//     description: "",
//   });
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [imagePreview, setImagePreview] = useState<string>("");
//   const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
//   const [bulkStatus, setBulkStatus] = useState<string>("");

//   const videoInputRef = useRef<HTMLInputElement>(null);
//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const lessonVideoInputRef = useRef<HTMLInputElement>(null);

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setPage(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<CourseFormData>();

//   const watchedImage = watch("image");

//   // Handle image preview
//   useEffect(() => {
//     if (watchedImage instanceof File) {
//       const previewUrl = URL.createObjectURL(watchedImage);
//       setImagePreview(previewUrl);
//       return () => URL.revokeObjectURL(previewUrl);
//     }
//   }, [watchedImage]);

//   // Modal opening functions
//   const openEditModal = (course: Course) => {
//     setSelectedCourse(course);
//     setImagePreview(course.image || "");
//     reset({
//       title: course.title,
//       description: course.description,
//       category: course.category,
//       price: course.price,
//       level: course.level,
//       status: course.status || (course.isPublished ? "published" : "draft"),
//       image: null,
//     });
//     setIsEditModalOpen(true);
//   };

//   const openDeleteModal = (course: Course) => {
//     setSelectedCourse(course);
//     setIsDeleteModalOpen(true);
//   };

//   const openLessonsModal = async (course: Course) => {
//     setSelectedCourse(course);
//     try {
//       const response = await getCourseLessons(course._id);
//       setLessons(response.data || []);
//       setIsLessonsModalOpen(true);
//     } catch (err: any) {
//       toast({
//         title: "❌ Error loading lessons",
//         description: err.message || "Please try again",
//         variant: "destructive",
//       });
//     }
//   };

//   const openAddLessonModal = (course: Course) => {
//     setSelectedCourse(course);
//     setCurrentLesson({
//       title: "",
//       video: null,
//       duration: 0,
//       description: "",
//     });
//     setUploadProgress(0);
//     if (videoInputRef.current) videoInputRef.current.value = "";
//     setIsAddLessonModalOpen(true);
//   };

//   const openEditLessonModal = (lesson: Lesson) => {
//     setSelectedLesson(lesson);
//     setCurrentLesson({
//       title: lesson.title,
//       video: null,
//       duration: lesson.duration,
//       description: lesson.description || "",
//     });
//     setIsEditLessonModalOpen(true);
//   };

//   const openStatusModal = (course: Course) => {
//     setSelectedCourse(course);
//     setIsStatusModalOpen(true);
//   };

//   const openBulkStatusModal = () => {
//     if (selectedCourses.length === 0) {
//       toast({
//         title: "❌ No courses selected",
//         description: "Please select courses to update status in bulk.",
//         variant: "destructive",
//       });
//       return;
//     }
//     setIsBulkStatusModalOpen(true);
//   };

//   // Build query parameters
//   const queryParams = {
//     page,
//     limit,
//     ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
//     ...(statusFilter !== "all" && { status: statusFilter }),
//     ...(sortBy && { sort: sortBy }),
//   };

//   const { data, isLoading, error, refetch, isFetching } = useQuery({
//     queryKey: ["instructorCourses", queryParams],
//     queryFn: () => getInstructorCourses(queryParams),
//     select: (response) => ({
//       courses: response.data || [],
//       pagination: {
//         currentPage: response.currentPage || 1,
//         totalPages: response.totalPages || 1,
//         totalCount: response.totalCount || 0,
//         hasNextPage: (response.currentPage || 1) < (response.totalPages || 1),
//         hasPrevPage: (response.currentPage || 1) > 1,
//         limit: response.limit || limit,
//       } as PaginationInfo,
//     }),
//     onError: (err: any) => {
//       toast({
//         title: "❌ Error fetching courses",
//         description: err.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const { courses, pagination } = data || {
//     courses: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalCount: 0,
//       hasNextPage: false,
//       hasPrevPage: false,
//       limit: limit,
//     },
//   };

//   // Mutations
//   const updateCourseMutation = useMutation({
//     mutationFn: async (data: CourseFormData) => {
//       const formData = new FormData();
//       formData.append("title", data.title);
//       formData.append("description", data.description);
//       formData.append("category", data.category);
//       formData.append("price", data.price.toString());
//       formData.append("level", data.level);
//       formData.append("status", data.status);

//       if (data.image instanceof File) {
//         formData.append("image", data.image);
//       }

//       return updateCourse(selectedCourse!._id, formData);
//     },
//     onSuccess: () => {
//       toast({
//         title: "🎉 Course updated successfully!",
//         description: "Your course has been updated with new changes.",
//       });
//       setIsEditModalOpen(false);
//       setImagePreview("");
//       refetch();
//     },
//     onError: (err: any) => {
//       toast({
//         title: "❌ Error updating course",
//         description: err.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteCourseMutation = useMutation({
//     mutationFn: (courseId: string) => deleteCourse(courseId),
//     onSuccess: () => {
//       toast({
//         title: "✅ Course deleted successfully!",
//         description: "The course has been removed from your list.",
//       });
//       setIsDeleteModalOpen(false);
//       refetch();
//     },
//     onError: (err: any) => {
//       toast({
//         title: "❌ Error deleting course",
//         description: err.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const addLessonMutation = useMutation({
//     mutationFn: async () => {
//       if (!currentLesson.title || !currentLesson.duration) {
//         throw new Error("Lesson title and duration are required");
//       }

//       const lessonFormData = new FormData();
//       lessonFormData.append("title", currentLesson.title);
//       lessonFormData.append("duration", currentLesson.duration.toString());
//       lessonFormData.append("order", ((lessons.length || 0) + 1).toString());
//       lessonFormData.append("description", currentLesson.description || "");

//       if (currentLesson.video) {
//         lessonFormData.append("video", currentLesson.video, currentLesson.video.name);
//       }

//       // Simulate upload progress
//       const interval = setInterval(() => {
//         setUploadProgress((prev) => {
//           if (prev >= 90) {
//             clearInterval(interval);
//             return 90;
//           }
//           return prev + 10;
//         });
//       }, 200);

//       try {
//         const result = await addLesson(selectedCourse!._id, lessonFormData);
//         clearInterval(interval);
//         setUploadProgress(100);
//         return result;
//       } catch (error) {
//         clearInterval(interval);
//         setUploadProgress(0);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       setTimeout(() => {
//         setUploadProgress(0);
//         toast({
//           title: "✅ Lesson added successfully!",
//           description: "The lesson has been added to your course.",
//         });
//         setCurrentLesson({
//           title: "",
//           video: null,
//           duration: 0,
//           description: "",
//         });
//         setIsAddLessonModalOpen(false);
//         if (videoInputRef.current) videoInputRef.current.value = "";
//         refetch();
//       }, 500);
//     },
//     onError: (error: any) => {
//       setUploadProgress(0);
//       toast({
//         title: "❌ Error adding lesson",
//         description: error.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const updateLessonMutation = useMutation({
//     mutationFn: async () => {
//       if (!currentLesson.title || !currentLesson.duration) {
//         throw new Error("Lesson title and duration are required");
//       }

//       const lessonFormData = new FormData();
//       lessonFormData.append("title", currentLesson.title);
//       lessonFormData.append("duration", currentLesson.duration.toString());
//       lessonFormData.append("description", currentLesson.description || "");

//       if (currentLesson.video) {
//         lessonFormData.append("video", currentLesson.video, currentLesson.video.name);
//       }

//       return updateLesson(selectedCourse!._id, selectedLesson!._id, lessonFormData);
//     },
//     onSuccess: () => {
//       toast({
//         title: "✅ Lesson updated successfully!",
//         description: "The lesson has been updated.",
//       });
//       setIsEditLessonModalOpen(false);
//       setCurrentLesson({
//         title: "",
//         video: null,
//         duration: 0,
//         description: "",
//       });
//       refetch();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "❌ Error updating lesson",
//         description: error.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteLessonMutation = useMutation({
//     mutationFn: (lessonId: string) =>
//       deleteLesson(selectedCourse!._id, lessonId),
//     onSuccess: () => {
//       toast({
//         title: "✅ Lesson deleted successfully!",
//         description: "The lesson has been removed from your course.",
//       });
//       refetch();
//     },
//     onError: (err: any) => {
//       toast({
//         title: "❌ Error deleting lesson",
//         description: err.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: ({ courseId, status }: { courseId: string; status: string }) =>
//       updateCourseStatus(courseId, status),
//     onSuccess: () => {
//       toast({
//         title: "✅ Status updated successfully!",
//         description: `Course status has been updated.`,
//       });
//       setIsStatusModalOpen(false);
//       refetch();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "❌ Error updating status",
//         description: error.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   const bulkUpdateStatusMutation = useMutation({
//     mutationFn: ({ courseIds, status }: { courseIds: string[]; status: string }) =>
//       bulkUpdateCourseStatus(courseIds, status),
//     onSuccess: () => {
//       toast({
//         title: "✅ Status updated successfully!",
//         description: `${selectedCourses.length} courses have been updated.`,
//       });
//       setIsBulkStatusModalOpen(false);
//       setSelectedCourses([]);
//       setBulkStatus("");
//       refetch();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "❌ Error updating status",
//         description: error.message || "Please try again",
//         variant: "destructive",
//       });
//     },
//   });

//   // Selection handlers
//   const toggleCourseSelection = (courseId: string) => {
//     setSelectedCourses(prev =>
//       prev.includes(courseId)
//         ? prev.filter(id => id !== courseId)
//         : [...prev, courseId]
//     );
//   };

//   const selectAllCourses = () => {
//     if (selectedCourses.length === filteredCourses.length) {
//       setSelectedCourses([]);
//     } else {
//       setSelectedCourses(filteredCourses.map(course => course._id));
//     }
//   };

//   // Filter courses based on permissions and filters
//   const editableCourses = courses.filter(course =>
//     user?.role === "admin" || (user?.role === "instructor" && course.instructor === user?.id)
//   );

//   const filteredCourses = statusFilter === "all"
//     ? editableCourses
//     : editableCourses.filter(course => course.status === statusFilter);

//   // Pagination handlers
//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages) {
//       setPage(newPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleLimitChange = (newLimit: number) => {
//     setLimit(newLimit);
//     setPage(1);
//   };

//   const handleSearch = (term: string) => {
//     setSearchTerm(term);
//   };

//   const handleFilterChange = (filter: string) => {
//     setStatusFilter(filter);
//     setPage(1);
//   };

//   const handleSortChange = (sort: string) => {
//     setSortBy(sort);
//     setPage(1);
//   };

//   // Calculate statistics
//   const courseStats = {
//     total: pagination.totalCount,
//     published: courses.filter((c) => c.status === "published" || c.isPublished).length,
//     draft: courses.filter((c) => c.status === "draft").length,
//     archived: courses.filter((c) => c.status === "archived").length,
//     totalStudents: courses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0),
//     totalRevenue: courses.reduce((acc, course) => acc + course.price * (course.studentsEnrolled || 0), 0),
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: {
//         duration: 0.4,
//         ease: "easeOut",
//       },
//     },
//     hover: {
//       y: -8,
//       scale: 1.02,
//       boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
//       transition: {
//         duration: 0.3,
//         ease: "easeInOut",
//       },
//     },
//   };

//   // Status management functions
//   const handleStatusChange = (newStatus: string) => {
//     if (selectedCourse && selectedCourse.status !== newStatus) {
//       updateStatusMutation.mutate({
//         courseId: selectedCourse._id,
//         status: newStatus,
//       });
//     }
//   };

//   const handleBulkStatusChange = () => {
//     if (bulkStatus && selectedCourses.length > 0) {
//       bulkUpdateStatusMutation.mutate({
//         courseIds: selectedCourses,
//         status: bulkStatus,
//       });
//     }
//   };

//   const getPublishingRequirements = (course: Course) => {
//     const requirements = [
//       {
//         condition: !!course.image && course.image.trim() !== "",
//         message: "Course must have a cover image",
//         met: !!course.image && course.image.trim() !== "",
//       },
//       {
//         condition: !!course.description && course.description.length >= 50,
//         message: "Course description must be at least 50 characters",
//         met: !!course.description && course.description.length >= 50,
//       },
//       {
//         condition: (course.lecturesCount || 0) > 0,
//         message: "Course must have at least one lesson",
//         met: (course.lecturesCount || 0) > 0,
//       },
//       {
//         condition: (course.requirements?.length || 0) > 0,
//         message: "Course should have requirements listed",
//         met: (course.requirements?.length || 0) > 0,
//       },
//       {
//         condition: (course.whatYoullLearn?.length || 0) > 0,
//         message: "Course should have learning objectives",
//         met: (course.whatYoullLearn?.length || 0) > 0,
//       },
//     ];

//     const unmetRequirements = requirements.filter(req => !req.met);
//     const canPublish = unmetRequirements.length === 0;

//     return { requirements, unmetRequirements, canPublish };
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-7xl mx-auto"
//       >
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//               <div className="flex-1">
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
//                     <BookOpen className="h-8 w-8 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       My Courses
//                     </h1>
//                     <p className="text-gray-600 mt-1">
//                       Manage and organize your teaching content, {user?.name}!
//                     </p>
//                   </div>
//                 </div>

//                 {/* Statistics Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <StatCard
//                     icon={<BookOpen className="h-5 w-5" />}
//                     value={courseStats.total}
//                     label="Total Courses"
//                     color="blue"
//                   />
//                   <StatCard
//                     icon={<Users className="h-5 w-5" />}
//                     value={courseStats.totalStudents}
//                     label="Total Students"
//                     color="green"
//                   />
//                   <StatCard
//                     icon={<DollarSign className="h-5 w-5" />}
//                     value={`$${courseStats.totalRevenue}`}
//                     label="Total Revenue"
//                     color="purple"
//                   />
//                   <StatCard
//                     icon={<TrendingUp className="h-5 w-5" />}
//                     value={courseStats.published}
//                     label="Published"
//                     color="emerald"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-3">
//                 <Link href="/instructor/create-course">
//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 h-12 rounded-xl font-semibold text-white gap-2">
//                       <Plus className="h-5 w-5" />
//                       Create New Course
//                     </Button>
//                   </motion.div>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Bulk Actions Bar */}
//         {selectedCourses.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
//           >
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <CheckSquare className="h-5 w-5 text-blue-600" />
//                 <span className="font-medium text-blue-900">
//                   {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
//                 </span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Select value={bulkStatus} onValueChange={setBulkStatus}>
//                   <SelectTrigger className="w-40">
//                     <SelectValue placeholder="Set status..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="published">Publish</SelectItem>
//                     <SelectItem value="draft">Set as Draft</SelectItem>
//                     <SelectItem value="archived">Archive</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button
//                   onClick={openBulkStatusModal}
//                   disabled={!bulkStatus}
//                   className="gap-2"
//                 >
//                   <Zap className="h-4 w-4" />
//                   Apply to {selectedCourses.length}
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() => setSelectedCourses([])}
//                 >
//                   <X className="h-4 w-4" />
//                   Clear
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Filters and Search Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
//         >
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
//             {/* Search Bar */}
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search courses..."
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="pl-10 pr-4 h-11 rounded-lg border-gray-300 focus:border-blue-500"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => handleSearch("")}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Filters and View Controls */}
//             <div className="flex flex-wrap items-center gap-3">
//               {/* Status Filter */}
//               <Select value={statusFilter} onValueChange={handleFilterChange}>
//                 <SelectTrigger className="w-40 h-11 rounded-lg">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="published">Published</SelectItem>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="archived">Archived</SelectItem>
//                 </SelectContent>
//               </Select>

//               {/* Sort By */}
//               <Select value={sortBy} onValueChange={handleSortChange}>
//                 <SelectTrigger className="w-40 h-11 rounded-lg">
//                   <SelectValue placeholder="Sort by" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="newest">Newest First</SelectItem>
//                   <SelectItem value="oldest">Oldest First</SelectItem>
//                   <SelectItem value="popular">Most Popular</SelectItem>
//                   <SelectItem value="price-high">Price: High to Low</SelectItem>
//                   <SelectItem value="price-low">Price: Low to High</SelectItem>
//                 </SelectContent>
//               </Select>

//               {/* View Mode Toggle */}
//               <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
//                 <Button
//                   variant={viewMode === "grid" ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => setViewMode("grid")}
//                   className="h-8 w-8 p-0 rounded-md"
//                 >
//                   <Grid3X3 className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant={viewMode === "list" ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => setViewMode("list")}
//                   className="h-8 w-8 p-0 rounded-md"
//                 >
//                   <List className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Results Per Page */}
//               <Select
//                 value={limit.toString()}
//                 onValueChange={(value) => handleLimitChange(parseInt(value))}
//               >
//                 <SelectTrigger className="w-28 h-11 rounded-lg">
//                   <SelectValue placeholder="Per page" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="6">6 per page</SelectItem>
//                   <SelectItem value="9">9 per page</SelectItem>
//                   <SelectItem value="12">12 per page</SelectItem>
//                   <SelectItem value="18">18 per page</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </motion.div>

//         {/* Courses Grid/List */}
//         {error ? (
//           <ErrorState onRetry={refetch} />
//         ) : courses.length === 0 && !isFetching ? (
//           <EmptyState
//             hasSearch={!!debouncedSearchTerm}
//             onClearSearch={() => handleSearch("")}
//           />
//         ) : (
//           <>
//             {/* Results Info */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex items-center justify-between mb-6"
//             >
//               <div className="flex items-center gap-4">
//                 <p className="text-sm text-gray-600">
//                   Showing{" "}
//                   <span className="font-semibold">
//                     {(pagination.currentPage - 1) * pagination.limit + 1}
//                   </span>{" "}
//                   to{" "}
//                   <span className="font-semibold">
//                     {Math.min(
//                       pagination.currentPage * pagination.limit,
//                       pagination.totalCount
//                     )}
//                   </span>{" "}
//                   of{" "}
//                   <span className="font-semibold">{pagination.totalCount}</span>{" "}
//                   courses
//                   {debouncedSearchTerm && (
//                     <span>
//                       {" "}
//                       for "
//                       <span className="font-semibold">{debouncedSearchTerm}</span>
//                       "
//                     </span>
//                   )}
//                 </p>

//                 {/* Select All Checkbox */}
//                 {filteredCourses.length > 0 && (
//                   <div className="flex items-center gap-2">
//                     <Checkbox
//                       checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
//                       onCheckedChange={selectAllCourses}
//                     />
//                     <span className="text-sm text-gray-600">Select all</span>
//                   </div>
//                 )}
//               </div>

//               {/* Quick Actions */}
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => refetch()}
//                   className="gap-2"
//                   disabled={isFetching}
//                 >
//                   <Zap className="h-4 w-4" />
//                   Refresh
//                 </Button>
//               </div>
//             </motion.div>

//             {/* Courses Display with Loading State */}
//             <div className="relative">
//               {/* Loading Overlay */}
//               {isFetching && (
//                 <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Loader2 className="h-6 w-6 animate-spin" />
//                     <span>Loading courses...</span>
//                   </div>
//                 </div>
//               )}

//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className={cn(
//                   "mb-8",
//                   viewMode === "grid"
//                     ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
//                     : "space-y-4"
//                 )}
//               >
//                 <AnimatePresence mode="popLayout">
//                   {filteredCourses.map((course: Course) => (
//                     <motion.div
//                       key={course._id}
//                       variants={cardVariants}
//                       whileHover="hover"
//                       layout
//                       className={cn(
//                         viewMode === "list" && "max-w-4xl mx-auto",
//                         selectedCourses.includes(course._id) && "ring-2 ring-blue-500 rounded-lg"
//                       )}
//                     >
//                       <CourseCard
//                         course={course}
//                         viewMode={viewMode}
//                         onEdit={openEditModal}
//                         onDelete={openDeleteModal}
//                         onViewLessons={openLessonsModal}
//                         onAddLesson={openAddLessonModal}
//                         onStatusChange={() => openStatusModal(course)}
//                         isSelected={selectedCourses.includes(course._id)}
//                         onSelect={() => toggleCourseSelection(course._id)}
//                         user={user}
//                       />
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               </motion.div>
//             </div>

//             {/* Enhanced Pagination */}
//             <EnhancedPagination
//               pagination={pagination}
//               onPageChange={handlePageChange}
//               isFetching={isFetching}
//             />
//           </>
//         )}

//         {/* Edit Course Modal */}
//         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Edit Course</DialogTitle>
//               <DialogDescription>
//                 Update your course information below.
//               </DialogDescription>
//             </DialogHeader>
//             <form
//               onSubmit={handleSubmit((data) =>
//                 updateCourseMutation.mutate(data)
//               )}
//               className="space-y-6"
//             >
//               {/* Image Upload Section */}
//               <div className="space-y-4">
//                 <Label htmlFor="courseImage">Course Image</Label>
//                 <div className="flex flex-col sm:flex-row gap-6 items-start">
//                   {/* Image Preview */}
//                   <div className="flex-shrink-0">
//                     <div className="relative w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
//                       {imagePreview ? (
//                         <img
//                           src={imagePreview}
//                           alt="Course preview"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : selectedCourse?.image ? (
//                         <img
//                           src={selectedCourse.image}
//                           alt="Current course"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                           <ImageIcon className="h-8 w-8 text-gray-400" />
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Upload Controls */}
//                   <div className="flex-1 space-y-3">
//                     <div className="flex gap-3">
//                       <Input
//                         id="courseImage"
//                         type="file"
//                         accept="image/*"
//                         ref={imageInputRef}
//                         onChange={(e) => {
//                           const file = e.target.files?.[0];
//                           if (file) {
//                             setValue("image", file);
//                           }
//                         }}
//                         className="flex-1"
//                       />
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => {
//                           setValue("image", null);
//                           setImagePreview("");
//                           if (imageInputRef.current) {
//                             imageInputRef.current.value = "";
//                           }
//                         }}
//                         disabled={!watchedImage && !selectedCourse?.image}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                     <p className="text-sm text-gray-500">
//                       Recommended: 1280x720px JPG or PNG. Max 5MB.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Course Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Course Title *</Label>
//                   <Input
//                     id="title"
//                     {...register("title", { required: "Title is required" })}
//                     placeholder="Enter course title"
//                   />
//                   {errors.title && (
//                     <p className="text-sm text-red-500">{errors.title.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="category">Category *</Label>
//                   <Input
//                     id="category"
//                     {...register("category", {
//                       required: "Category is required",
//                     })}
//                     placeholder="Enter category"
//                   />
//                   {errors.category && (
//                     <p className="text-sm text-red-500">
//                       {errors.category.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="price">Price ($) *</Label>
//                   <Input
//                     id="price"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     {...register("price", {
//                       required: "Price is required",
//                       min: { value: 0, message: "Price must be positive" },
//                     })}
//                     placeholder="0.00"
//                   />
//                   {errors.price && (
//                     <p className="text-sm text-red-500">{errors.price.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="level">Level *</Label>
//                   <Select
//                     onValueChange={(value) =>
//                       setValue("level", value, { shouldValidate: true })
//                     }
//                     defaultValue={selectedCourse?.level}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select level" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="beginner">Beginner</SelectItem>
//                       <SelectItem value="intermediate">Intermediate</SelectItem>
//                       <SelectItem value="advanced">Advanced</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="status">Status *</Label>
//                   <Select
//                     onValueChange={(value) =>
//                       setValue("status", value, { shouldValidate: true })
//                     }
//                     defaultValue={selectedCourse?.status || (selectedCourse?.isPublished ? "published" : "draft")}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="draft">Draft</SelectItem>
//                       <SelectItem value="published">Published</SelectItem>
//                       <SelectItem value="archived">Archived</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="description">Description *</Label>
//                 <Textarea
//                   id="description"
//                   {...register("description", {
//                     required: "Description is required",
//                     minLength: {
//                       value: 50,
//                       message: "Description must be at least 50 characters",
//                     },
//                   })}
//                   placeholder="Enter course description (minimum 50 characters)"
//                   rows={4}
//                 />
//                 {errors.description && (
//                   <p className="text-sm text-red-500">
//                     {errors.description.message}
//                   </p>
//                 )}
//                 <p className="text-sm text-gray-500">
//                   {watch("description")?.length || 0}/50 characters minimum
//                 </p>
//               </div>

//               <DialogFooter>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setIsEditModalOpen(false);
//                     setImagePreview("");
//                   }}
//                   disabled={updateCourseMutation.isPending}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={updateCourseMutation.isPending}
//                   className="gap-2"
//                 >
//                   {updateCourseMutation.isPending ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Updating...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle2 className="h-4 w-4" />
//                       Update Course
//                     </>
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>

//         {/* Delete Course Confirmation Modal */}
//         <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2 text-red-600">
//                 <AlertCircle className="h-5 w-5" />
//                 Delete Course
//               </DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to delete "
//                 <strong>{selectedCourse?.title}</strong>"? This action cannot be
//                 undone and all course data will be permanently removed.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 disabled={deleteCourseMutation.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={() => deleteCourseMutation.mutate(selectedCourse!._id)}
//                 disabled={deleteCourseMutation.isPending}
//               >
//                 {deleteCourseMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete Course
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* View Lessons Modal */}
//         <Dialog open={isLessonsModalOpen} onOpenChange={setIsLessonsModalOpen}>
//           <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Video className="h-5 w-5" />
//                 Lessons for {selectedCourse?.title}
//               </DialogTitle>
//               <DialogDescription>
//                 Manage the lessons in your course. You can add, edit, or remove
//                 lessons.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               {lessons.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                   <p>No lessons added yet.</p>
//                   <p className="text-sm">
//                     Start by adding your first lesson to this course.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {lessons.map((lesson, index) => (
//                     <div
//                       key={lesson._id}
//                       className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
//                           {index + 1}
//                         </div>
//                         <div>
//                           <h4 className="font-medium">{lesson.title}</h4>
//                           <p className="text-sm text-gray-500">
//                             Duration: {lesson.duration} minutes
//                             {lesson.description && ` • ${lesson.description}`}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => openEditLessonModal(lesson)}
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() =>
//                             deleteLessonMutation.mutate(lesson._id)
//                           }
//                           disabled={deleteLessonMutation.isPending}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsLessonsModalOpen(false)}
//               >
//                 Close
//               </Button>
//               <Button
//                 onClick={() => {
//                   setIsLessonsModalOpen(false);
//                   openAddLessonModal(selectedCourse!);
//                 }}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Lesson
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Add Lesson Modal */}
//         <Dialog
//           open={isAddLessonModalOpen}
//           onOpenChange={setIsAddLessonModalOpen}
//         >
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Plus className="h-5 w-5" />
//                 Add New Lesson
//               </DialogTitle>
//               <DialogDescription>
//                 Add a new lesson to "{selectedCourse?.title}"
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="lessonTitle">Lesson Title *</Label>
//                 <Input
//                   id="lessonTitle"
//                   placeholder="Enter lesson title"
//                   value={currentLesson.title}
//                   onChange={(e) =>
//                     setCurrentLesson({ ...currentLesson, title: e.target.value })
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="lessonDescription">Description (Optional)</Label>
//                 <Textarea
//                   id="lessonDescription"
//                   placeholder="Enter lesson description"
//                   value={currentLesson.description}
//                   onChange={(e) =>
//                     setCurrentLesson({
//                       ...currentLesson,
//                       description: e.target.value,
//                     })
//                   }
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="lessonDuration">Duration (minutes) *</Label>
//                   <Input
//                     id="lessonDuration"
//                     type="number"
//                     placeholder="Enter duration"
//                     value={currentLesson.duration || ""}
//                     onChange={(e) =>
//                       setCurrentLesson({
//                         ...currentLesson,
//                         duration: parseInt(e.target.value) || 0,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="lessonVideo">Video File (Optional)</Label>
//                   <Input
//                     id="lessonVideo"
//                     type="file"
//                     accept="video/*"
//                     ref={videoInputRef}
//                     onChange={(e) =>
//                       setCurrentLesson({
//                         ...currentLesson,
//                         video: e.target.files?.[0] || null,
//                       })
//                     }
//                   />
//                 </div>
//               </div>

//               {uploadProgress > 0 && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Uploading video...</span>
//                     <span>{uploadProgress}%</span>
//                   </div>
//                   <Progress value={uploadProgress} className="h-2" />
//                 </div>
//               )}
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsAddLessonModalOpen(false)}
//                 disabled={addLessonMutation.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => addLessonMutation.mutate()}
//                 disabled={
//                   addLessonMutation.isPending ||
//                   !currentLesson.title ||
//                   !currentLesson.duration
//                 }
//               >
//                 {addLessonMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Adding Lesson...
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Lesson
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Edit Lesson Modal */}
//         <Dialog open={isEditLessonModalOpen} onOpenChange={setIsEditLessonModalOpen}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Edit2 className="h-5 w-5" />
//                 Edit Lesson
//               </DialogTitle>
//               <DialogDescription>
//                 Update the lesson details for "{selectedCourse?.title}"
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="editLessonTitle">Lesson Title *</Label>
//                 <Input
//                   id="editLessonTitle"
//                   placeholder="Enter lesson title"
//                   value={currentLesson.title}
//                   onChange={(e) =>
//                     setCurrentLesson({ ...currentLesson, title: e.target.value })
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="editLessonDescription">Description (Optional)</Label>
//                 <Textarea
//                   id="editLessonDescription"
//                   placeholder="Enter lesson description"
//                   value={currentLesson.description}
//                   onChange={(e) =>
//                     setCurrentLesson({
//                       ...currentLesson,
//                       description: e.target.value,
//                     })
//                   }
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="editLessonDuration">Duration (minutes) *</Label>
//                   <Input
//                     id="editLessonDuration"
//                     type="number"
//                     placeholder="Enter duration"
//                     value={currentLesson.duration || ""}
//                     onChange={(e) =>
//                       setCurrentLesson({
//                         ...currentLesson,
//                         duration: parseInt(e.target.value) || 0,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="editLessonVideo">Video File (Optional)</Label>
//                   <Input
//                     id="editLessonVideo"
//                     type="file"
//                     accept="video/*"
//                     ref={lessonVideoInputRef}
//                     onChange={(e) =>
//                       setCurrentLesson({
//                         ...currentLesson,
//                         video: e.target.files?.[0] || null,
//                       })
//                     }
//                   />
//                   {selectedLesson?.videoUrl && (
//                     <p className="text-sm text-gray-500">
//                       Current video: {selectedLesson.videoUrl.split('/').pop()}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsEditLessonModalOpen(false)}
//                 disabled={updateLessonMutation.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => updateLessonMutation.mutate()}
//                 disabled={
//                   updateLessonMutation.isPending ||
//                   !currentLesson.title ||
//                   !currentLesson.duration
//                 }
//               >
//                 {updateLessonMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Updating Lesson...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 className="h-4 w-4 mr-2" />
//                     Update Lesson
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Status Management Modal */}
//         <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Settings className="h-5 w-5" />
//                 Change Course Status
//               </DialogTitle>
//               <DialogDescription>
//                 Update the status for "{selectedCourse?.title}"
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               {/* Current Status */}
//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <span className="text-sm font-medium">Current Status:</span>
//                 {selectedCourse && (
//                   <Badge className={cn("px-2 py-1", statusConfig[selectedCourse.status as keyof typeof statusConfig]?.color)}>
//                     {statusConfig[selectedCourse.status as keyof typeof statusConfig]?.icon && (
//                       <statusConfig[selectedCourse.status as keyof typeof statusConfig].icon className="h-3 w-3 mr-1" />
//                     )}
//                     {statusConfig[selectedCourse.status as keyof typeof statusConfig]?.label || selectedCourse.status}
//                   </Badge>
//                 )}
//               </div>

//               {/* Status Options */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-sm">Select New Status:</h4>
//                 <div className="grid gap-2">
//                   <Button
//                     variant={selectedCourse?.status === "draft" ? "default" : "outline"}
//                     onClick={() => handleStatusChange("draft")}
//                     disabled={selectedCourse?.status === "draft" || updateStatusMutation.isPending}
//                     className="justify-start gap-2 h-11"
//                   >
//                     <EyeOff className="h-4 w-4" />
//                     Set as Draft
//                     <span className="text-xs text-muted-foreground ml-auto">
//                       Not visible to students
//                     </span>
//                   </Button>

//                   <Button
//                     variant={selectedCourse?.status === "published" ? "default" : "outline"}
//                     onClick={() => handleStatusChange("published")}
//                     disabled={selectedCourse?.status === "published" || updateStatusMutation.isPending}
//                     className="justify-start gap-2 h-11"
//                   >
//                     <Eye className="h-4 w-4" />
//                     Publish Course
//                     <span className="text-xs text-muted-foreground ml-auto">
//                       Visible to students
//                     </span>
//                   </Button>

//                   <Button
//                     variant={selectedCourse?.status === "archived" ? "default" : "outline"}
//                     onClick={() => handleStatusChange("archived")}
//                     disabled={selectedCourse?.status === "archived" || updateStatusMutation.isPending}
//                     className="justify-start gap-2 h-11"
//                   >
//                     <Archive className="h-4 w-4" />
//                     Archive Course
//                     <span className="text-xs text-muted-foreground ml-auto">
//                       Hidden from students
//                     </span>
//                   </Button>
//                 </div>
//               </div>

//               {/* Publishing Requirements */}
//               {selectedCourse && (
//                 <div className="space-y-2">
//                   <h4 className="font-medium text-sm flex items-center gap-2">
//                     <Info className="h-4 w-4" />
//                     Publishing Requirements
//                   </h4>
//                   <div className="space-y-2 max-h-40 overflow-y-auto">
//                     {getPublishingRequirements(selectedCourse).requirements.map((req, index) => (
//                       <div
//                         key={index}
//                         className={cn(
//                           "flex items-center gap-3 p-2 rounded text-sm",
//                           req.met ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
//                         )}
//                       >
//                         {req.met ? (
//                           <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
//                         ) : (
//                           <XCircle className="h-4 w-4 flex-shrink-0" />
//                         )}
//                         <span>{req.message}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsStatusModalOpen(false)}
//                 disabled={updateStatusMutation.isPending}
//               >
//                 Cancel
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Bulk Status Update Modal */}
//         <Dialog open={isBulkStatusModalOpen} onOpenChange={setIsBulkStatusModalOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-yellow-500" />
//                 Bulk Status Update
//               </DialogTitle>
//               <DialogDescription>
//                 You are about to update {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} to{" "}
//                 <strong>{bulkStatus}</strong>.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               {/* Status Preview */}
//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <span className="text-sm font-medium">New Status:</span>
//                 <Badge className={cn("px-2 py-1", statusConfig[bulkStatus as keyof typeof statusConfig]?.color)}>
//                   {statusConfig[bulkStatus as keyof typeof statusConfig]?.icon && (
//                     <statusConfig[bulkStatus as keyof typeof statusConfig].icon className="h-3 w-3 mr-1" />
//                   )}
//                   {statusConfig[bulkStatus as keyof typeof statusConfig]?.label || bulkStatus}
//                 </Badge>
//               </div>

//               {/* Affected Courses */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-sm flex items-center gap-2">
//                   <Info className="h-4 w-4" />
//                   Affected Courses ({selectedCourses.length})
//                 </h4>
//                 <div className="space-y-1 max-h-32 overflow-y-auto">
//                   {filteredCourses
//                     .filter(course => selectedCourses.includes(course._id))
//                     .slice(0, 5)
//                     .map(course => (
//                       <div key={course._id} className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded">
//                         <div className="w-2 h-2 rounded-full bg-gray-400" />
//                         <span className="truncate">{course.title}</span>
//                       </div>
//                     ))}
//                   {selectedCourses.length > 5 && (
//                     <div className="text-sm text-gray-500 text-center">
//                       +{selectedCourses.length - 5} more courses
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <DialogFooter className="gap-2 sm:gap-0">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsBulkStatusModalOpen(false)}
//                 disabled={bulkUpdateStatusMutation.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleBulkStatusChange}
//                 disabled={bulkUpdateStatusMutation.isPending}
//                 className="gap-2"
//               >
//                 {bulkUpdateStatusMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle2 className="h-4 w-4" />
//                     Confirm Update
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </motion.div>
//     </div>
//   );
// }

// // Course Card Component
// function CourseCard({
//   course,
//   viewMode,
//   onEdit,
//   onDelete,
//   onViewLessons,
//   onAddLesson,
//   onStatusChange,
//   isSelected,
//   onSelect,
//   user
// }: any) {
//   const getStatusConfig = (status: string) => {
//     const config = {
//       published: {
//         color: "bg-green-100 text-green-800 border-green-200",
//         label: "Published",
//         icon: Eye,
//       },
//       draft: {
//         color: "bg-yellow-100 text-yellow-800 border-yellow-200",
//         label: "Draft",
//         icon: FileText,
//       },
//       archived: {
//         color: "bg-gray-100 text-gray-800 border-gray-200",
//         label: "Archived",
//         icon: Shield,
//       },
//     };
//     return config[status as keyof typeof config] || config.draft;
//   };

//   const statusConfig = getStatusConfig(
//     course.status || (course.isPublished ? "published" : "draft")
//   );
//   const StatusIcon = statusConfig.icon;

//   const formatDuration = (hours: number) => {
//     if (hours < 1) return `${Math.round(hours * 60)}m`;
//     return `${hours.toFixed(1)}h`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (viewMode === "list") {
//     return (
//       <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
//         <CardContent className="p-6">
//           <div className="flex items-start gap-4">
//             {/* Course Image */}
//             <div className="relative flex-shrink-0">
//               <img
//                 src={course.image || "/api/placeholder/300/200"}
//                 alt={course.title}
//                 className="w-32 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
//               />
//               <div className="absolute -top-2 -left-2">
//                 <Checkbox
//                   checked={isSelected}
//                   onCheckedChange={onSelect}
//                   className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//                 />
//               </div>
//             </div>

//             {/* Course Info */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start justify-between mb-2">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
//                     {course.title}
//                   </h3>
//                   <p className="text-sm text-gray-600 line-clamp-2 mt-1">
//                     {course.description}
//                   </p>
//                 </div>
//                 <div className="text-right flex-shrink-0 ml-4">
//                   <p className="text-lg font-bold text-gray-900">
//                     ${course.price || 0}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {formatDate(course.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
//                 <span className="flex items-center gap-1">
//                   <Video className="h-4 w-4" />
//                   {course.lecturesCount} lessons
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {formatDuration(course.totalHours || 0)}
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Users className="h-4 w-4" />
//                   {course.studentsEnrolled || 0} students
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                   {(course.rating || 0).toFixed(1)}
//                 </span>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-2">
//                 <Button size="sm" asChild variant="outline">
//                   <Link href={`/instructor/courses/${course._id}`}>
//                     <Eye className="h-4 w-4 mr-2" />
//                     Preview
//                   </Link>
//                 </Button>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline" size="sm">
//                       <MoreVertical className="h-4 w-4" />
//                       Manage
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-48">
//                     <DropdownMenuItem onClick={() => onEdit(course)}>
//                       <Edit2 className="h-4 w-4 mr-2" />
//                       Edit Course
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => onViewLessons(course)}>
//                       <Video className="h-4 w-4 mr-2" />
//                       View Lessons
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => onAddLesson(course)}>
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Lesson
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={() => onStatusChange(course)}>
//                       <Settings className="h-4 w-4 mr-2" />
//                       Change Status
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem
//                       onClick={() => onDelete(course)}
//                       className="text-red-600 focus:text-red-600"
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Delete Course
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   // Grid View
//   return (
//     <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
//       {/* Course Image */}
//       <div className="relative h-48 overflow-hidden">
//         <img
//           src={course.image || "/api/placeholder/300/200"}
//           alt={course.title}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//         {/* Selection Checkbox */}
//         <div className="absolute top-3 left-3">
//           <Checkbox
//             checked={isSelected}
//             onCheckedChange={onSelect}
//             className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//           />
//         </div>

//         {/* Status Badge */}
//         <Badge className={cn("absolute top-3 right-3", statusConfig.color)}>
//           <StatusIcon className="h-3 w-3 mr-1" />
//           {statusConfig.label}
//         </Badge>

//         {/* Category Badge */}
//         <Badge className="absolute bottom-3 left-3 bg-black/60 text-white border-0">
//           {course.category}
//         </Badge>

//         {/* Hover Actions */}
//         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               asChild
//               className="bg-white/90 text-gray-900 hover:bg-white"
//             >
//               <Link href={`/instructor/courses/${course._id}`}>
//                 <PlayCircle className="h-4 w-4 mr-2" />
//                 Preview
//               </Link>
//             </Button>
//             <Button
//               size="sm"
//               variant="secondary"
//               className="bg-black/60 text-white hover:bg-black/80"
//               onClick={() => onEdit(course)}
//             >
//               <Edit2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <CardContent className="p-5">
//         {/* Course Title */}
//         <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-200">
//           {course.title}
//         </h3>

//         {/* Course Description */}
//         <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
//           {course.description}
//         </p>

//         {/* Course Stats */}
//         <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
//           <div className="flex items-center gap-4">
//             <span className="flex items-center gap-1">
//               <Video className="h-4 w-4" />
//               {course.lecturesCount}
//             </span>
//             <span className="flex items-center gap-1">
//               <Clock className="h-4 w-4" />
//               {formatDuration(course.totalHours || 0)}
//             </span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Star className="h-4 w-4 text-yellow-400 fill-current" />
//             <span>{(course.rating || 0).toFixed(1)}</span>
//           </div>
//         </div>

//         {/* Enrollment and Price */}
//         <div className="flex items-center justify-between mb-4">
//           <span className="text-lg font-bold text-gray-900">
//             ${course.price || 0}
//           </span>
//           <span className="text-sm text-gray-600 flex items-center gap-1">
//             <Users className="h-4 w-4" />
//             {course.studentsEnrolled || 0}
//           </span>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm" className="flex-1">
//                 <MoreVertical className="h-4 w-4" />
//                 Manage
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               <DropdownMenuItem onClick={() => onEdit(course)}>
//                 <Edit2 className="h-4 w-4 mr-2" />
//                 Edit Course
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => onViewLessons(course)}>
//                 <Video className="h-4 w-4 mr-2" />
//                 View Lessons
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => onAddLesson(course)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Lesson
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => onStatusChange(course)}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Change Status
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem
//                 onClick={() => onDelete(course)}
//                 className="text-red-600 focus:text-red-600"
//               >
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Delete Course
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button size="sm" asChild className="flex-1">
//             <Link href={`/instructor/courses/${course._id}`}>
//               <PlayCircle className="h-4 w-4 mr-2" />
//               Preview
//             </Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Enhanced Pagination Component
// function EnhancedPagination({ pagination, onPageChange, isFetching }: any) {
//   const { currentPage, totalPages, totalCount, limit } = pagination;

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//       if (startPage > 1) pages.push(1, "...");
//       for (let i = startPage; i <= endPage; i++) pages.push(i);
//       if (endPage < totalPages) pages.push("...", totalPages);
//     }

//     return pages;
//   };

//   const startItem = (currentPage - 1) * limit + 1;
//   const endItem = Math.min(currentPage * limit, totalCount);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.3 }}
//       className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
//     >
//       <div className="text-sm text-gray-600">
//         Showing <span className="font-semibold">{startItem}</span> to{" "}
//         <span className="font-semibold">{endItem}</span> of{" "}
//         <span className="font-semibold">{totalCount}</span> courses
//       </div>

//       <div className="flex items-center gap-2">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1 || isFetching}
//           className="gap-1 h-10 px-4"
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Previous
//         </Button>

//         <div className="flex items-center gap-1">
//           {getPageNumbers().map((page, index) =>
//             page === "..." ? (
//               <span key={index} className="px-3 py-2 text-gray-500">
//                 ...
//               </span>
//             ) : (
//               <Button
//                 key={index}
//                 variant={page === currentPage ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => onPageChange(page)}
//                 disabled={isFetching}
//                 className={cn(
//                   "h-10 w-10 p-0 font-medium",
//                   page === currentPage && "shadow-lg"
//                 )}
//               >
//                 {page}
//               </Button>
//             )
//           )}
//         </div>

//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages || isFetching}
//           className="gap-1 h-10 px-4"
//         >
//           Next
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>

//       <div className="text-sm text-gray-500">
//         Page {currentPage} of {totalPages}
//       </div>
//     </motion.div>
//   );
// }

// // Stat Card Component
// function StatCard({ icon, value, label, color }: any) {
//   const colorClasses = {
//     blue: "from-blue-500 to-blue-600",
//     green: "from-green-500 to-green-600",
//     purple: "from-purple-500 to-purple-600",
//     emerald: "from-emerald-500 to-emerald-600",
//   };

//   return (
//     <motion.div
//       whileHover={{ scale: 1.05 }}
//       className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
//     >
//       <div className="flex items-center gap-3">
//         <div
//           className={`p-2 bg-gradient-to-r ${colorClasses[color]} rounded-lg`}
//         >
//           {icon}
//         </div>
//         <div>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//           <p className="text-sm text-gray-600">{label}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // Error State Component
// function ErrorState({ onRetry }: any) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
//     >
//       <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
//       <h3 className="text-xl font-semibold text-gray-900 mb-2">
//         Error Loading Courses
//       </h3>
//       <p className="text-gray-600 mb-6 max-w-md mx-auto">
//         We couldn't load your courses. This might be due to a network issue or
//         server problem.
//       </p>
//       <Button onClick={onRetry} variant="outline" className="gap-2">
//         <Zap className="h-4 w-4" />
//         Try Again
//       </Button>
//     </motion.div>
//   );
// }

// // Empty State Component
// function EmptyState({ hasSearch, onClearSearch }: any) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
//     >
//       <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
//       <h3 className="text-xl font-semibold text-gray-900 mb-2">
//         {hasSearch ? "No courses found" : "No courses yet"}
//       </h3>
//       <p className="text-gray-600 mb-6 max-w-md mx-auto">
//         {hasSearch
//           ? "Try adjusting your search terms or filters to find what you're looking for."
//           : "Start your teaching journey by creating your first course. Share your knowledge with students around the world."}
//       </p>
//       <div className="flex gap-3 justify-center">
//         {hasSearch ? (
//           <Button onClick={onClearSearch} variant="outline">
//             Clear Search
//           </Button>
//         ) : (
//           <Link href="/instructor/create-course">
//             <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
//               <Plus className="h-5 w-5" />
//               Create Your First Course
//             </Button>
//           </Link>
//         )}
//         <Link href="/instructor">
//           <Button variant="outline">
//             <Sparkles className="h-4 w-4 mr-2" />
//             Dashboard
//           </Button>
//         </Link>
//       </div>
//     </motion.div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getCourseLessons,
  addLesson,
  deleteLesson,
  updateCourseStatus,
  bulkUpdateCourseStatus,
  updateLesson,
} from "@/services/course.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

// Import all components

// Import types
import type {
  Course,
  Lesson,
  CourseFormData,
  LessonFormData,
  PaginationInfo,
} from "@/lib/types";
import { HeaderSection } from "@/components/dashboard/HeaderSection";
import { BulkActionsBar } from "@/components/dashboard/BulkActionsBar";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { CoursesGrid } from "@/components/dashboard/CoursesGrid";
import { EditCourseModal } from "@/components/dashboard/modals/EditCourseModal";
import { DeleteCourseModal } from "@/components/dashboard/modals/DeleteCourseModal";
import { LessonsModal } from "@/components/dashboard/modals/LessonsModal";
import { AddLessonModal } from "@/components/dashboard/modals/AddLessonModal";
import { EditLessonModal } from "@/components/dashboard/modals/EditLessonModal";
import { StatusModal } from "@/components/dashboard/modals/StatusModal";
import { BulkStatusModal } from "@/components/dashboard/modals/BulkStatusModal";

const statusConfig = {
  draft: {
    label: "Draft",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    icon: "EyeOff",
    description: "Course is not visible to students",
  },
  published: {
    label: "Published",
    color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: "Eye",
    description: "Course is live and visible to students",
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    icon: "Archive",
    description: "Course is hidden from students",
  },
};

export default function InstructorCourses() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  // Data states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonFormData>({
    title: "",
    video: null,
    duration: 0,
    description: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>();

  const watchedImage = watch("image");

  // Handle image preview
  useEffect(() => {
    if (watchedImage instanceof File) {
      const previewUrl = URL.createObjectURL(watchedImage);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [watchedImage]);

  // Modal opening functions
  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setImagePreview(course.image || "");
    reset({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      level: course.level,
      status: course.status || (course.isPublished ? "published" : "draft"),
      image: null,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const openLessonsModal = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const response = await getCourseLessons(course._id);
      setLessons(response.data || []);
      setIsLessonsModalOpen(true);
    } catch (err: any) {
      toast({
        title: "❌ Error loading lessons",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const openAddLessonModal = (course: Course) => {
    setSelectedCourse(course);
    setCurrentLesson({
      title: "",
      video: null,
      duration: 0,
      description: "",
    });
    setUploadProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = "";
    setIsAddLessonModalOpen(true);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentLesson({
      title: lesson.title,
      video: null,
      duration: lesson.duration,
      description: lesson.description || "",
    });
    setIsEditLessonModalOpen(true);
  };

  const openStatusModal = (course: Course) => {
    setSelectedCourse(course);
    setIsStatusModalOpen(true);
  };

  const openBulkStatusModal = () => {
    if (selectedCourses.length === 0) {
      toast({
        title: "❌ No courses selected",
        description: "Please select courses to update status in bulk.",
        variant: "destructive",
      });
      return;
    }
    setIsBulkStatusModalOpen(true);
  };

  // Build query parameters
  const queryParams = {
    page,
    limit,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sortBy && { sort: sortBy }),
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["instructorCourses", queryParams],
    queryFn: () => getInstructorCourses(queryParams),
    select: (response) => ({
      courses: response.data as Course[] || [],
      pagination : {
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        hasNextPage: (response.currentPage || 1) < (response.totalPages || 1),
        hasPrevPage: (response.currentPage || 1) > 1,
        limit: response.limit || limit,
      } as PaginationInfo,
    }),
    onError: (err: any) => {
      toast({
        title: "❌ Error fetching courses",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  console.log("data coures" , data)

  const { courses, pagination } = data || {
    courses: [] ,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: limit,
    },
  };

  // Mutations
  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price.toString());
      formData.append("level", data.level);
      formData.append("status", data.status);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      return updateCourse(selectedCourse!._id!, formData);
    },
    onSuccess: () => {
      toast({
        title: "🎉 Course updated successfully!",
        description: "Your course has been updated with new changes.",
      });
      setIsEditModalOpen(false);
      setImagePreview("");
      refetch();
    },
    onError: (err: any) => {
      toast({
        title: "❌ Error updating course",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      toast({
        title: "✅ Course deleted successfully!",
        description: "The course has been removed from your list.",
      });
      setIsDeleteModalOpen(false);
      refetch();
    },
    onError: (err: any) => {
      toast({
        title: "❌ Error deleting course",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: async () => {
      if (!currentLesson.title || !currentLesson.duration) {
        throw new Error("Lesson title and duration are required");
      }

      const lessonFormData = new FormData();
      lessonFormData.append("title", currentLesson.title);
      lessonFormData.append("duration", currentLesson.duration.toString());
      lessonFormData.append("order", ((lessons.length || 0) + 1).toString());
      lessonFormData.append("description", currentLesson.description || "");

      if (currentLesson.video) {
        lessonFormData.append(
          "video",
          currentLesson.video,
          currentLesson.video.name
        );
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const result = await addLesson(selectedCourse!._id!, lessonFormData);
        clearInterval(interval);
        setUploadProgress(100);
        return result;
      } catch (error) {
        clearInterval(interval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        setUploadProgress(0);
        toast({
          title: "✅ Lesson added successfully!",
          description: "The lesson has been added to your course.",
        });
        setCurrentLesson({
          title: "",
          video: null,
          duration: 0,
          description: "",
        });
        setIsAddLessonModalOpen(false);
        if (videoInputRef.current) videoInputRef.current.value = "";
        refetch();
      }, 500);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: "❌ Error adding lesson",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });


  console.log("selectedLesson" , selectedLesson)

  const updateLessonMutation = useMutation({
    mutationFn: async () => {
      if (!currentLesson.title || !currentLesson.duration) {
        throw new Error("Lesson title and duration are required");
      }

      const lessonFormData = new FormData();
      lessonFormData.append("title", currentLesson.title);
      lessonFormData.append("duration", currentLesson.duration.toString());
      lessonFormData.append("description", currentLesson.description || "");

      if (currentLesson.video) {
        lessonFormData.append(
          "video",
          currentLesson.video,
          currentLesson.video.name
        );
      }

      return updateLesson(
        selectedCourse!._id!,
        selectedLesson!._id,
        lessonFormData
      );
    },
    onSuccess: () => {
      toast({
        title: "✅ Lesson updated successfully!",
        description: "The lesson has been updated.",
      });
      setIsEditLessonModalOpen(false);
      setCurrentLesson({
        title: "",
        video: null,
        duration: 0,
        description: "",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating lesson",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) =>
      deleteLesson(selectedCourse!._id!, lessonId),
    onSuccess: () => {
      toast({
        title: "✅ Lesson deleted successfully!",
        description: "The lesson has been removed from your course.",
      });
      refetch();
    },
    onError: (err: any) => {
      toast({
        title: "❌ Error deleting lesson",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) =>
      updateCourseStatus(courseId, status),
    onSuccess: () => {
      toast({
        title: "✅ Status updated successfully!",
        description: `Course status has been updated.`,
      });
      setIsStatusModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating status",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      courseIds,
      status,
    }: {
      courseIds: string[];
      status: string;
    }) => bulkUpdateCourseStatus(courseIds, status),
    onSuccess: () => {
      toast({
        title: "✅ Status updated successfully!",
        description: `${selectedCourses.length} courses have been updated.`,
      });
      setIsBulkStatusModalOpen(false);
      setSelectedCourses([]);
      setBulkStatus("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating status",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Selection handlers
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAllCourses = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map((course:Course) => course._id));
    }
  };

  // Filter courses based on permissions and filters
 const editableCourses = courses.filter(
  (course:Course) =>
    user?.role === "admin" ||
    (user?.role === "instructor" && course.instructor === user?._id)
);
console.log("editableCourses:", editableCourses);

const filteredCourses =
  statusFilter === "all"
    ? editableCourses
    : editableCourses.filter((course:Course) => course.status === statusFilter);
console.log("filteredCourses:", filteredCourses);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  // Calculate statistics
  const courseStats = {
    total: courses?.length,
    published: courses?.filter((c:Course) => c.status === "published" || c.isPublished)
      .length,
    draft: courses.filter((c:Course) => c.status === "draft").length,
    archived: courses.filter((c:Course) => c.status === "archived").length,
    totalStudents: courses.reduce(
      (acc:any, course:Course) => acc + (course.studentsEnrolled || 0),
      0
    ),
    totalRevenue: courses.reduce(
      (acc:any, course:Course) => acc + course.price * (course.studentsEnrolled || 0),
      0
    ),
  };

  // Status management functions
  const handleStatusChange = (newStatus: string) => {
    if (selectedCourse && selectedCourse.status !== newStatus) {
      updateStatusMutation.mutate({
        courseId: selectedCourse._id as string,
        status: newStatus,
      });
    }
  };

  const handleBulkStatusChange = () => {
    if (bulkStatus && selectedCourses.length > 0) {
      bulkUpdateStatusMutation.mutate({
        courseIds: selectedCourses,
        status: bulkStatus,
      });
    }
  };

  const getPublishingRequirements = (course: Course) => {
    const requirements = [
      {
        condition: !!course.image && course.image.trim() !== "",
        message: "Course must have a cover image",
        met: !!course.image && course.image.trim() !== "",
      },
      {
        condition: !!course.description && course.description.length >= 50,
        message: "Course description must be at least 50 characters",
        met: !!course.description && course.description.length >= 50,
      },
      {
        condition: (course.lecturesCount || 0) > 0,
        message: "Course must have at least one lesson",
        met: (course.lecturesCount || 0) > 0,
      },
      {
        condition: (course.requirements?.length || 0) > 0,
        message: "Course should have requirements listed",
        met: (course.requirements?.length || 0) > 0,
      },
      {
        condition: (course.whatYoullLearn?.length || 0) > 0,
        message: "Course should have learning objectives",
        met: (course.whatYoullLearn?.length || 0) > 0,
      },
    ];

    const unmetRequirements = requirements.filter((req) => !req.met);
    const canPublish = unmetRequirements.length === 0;

    return { requirements, unmetRequirements, canPublish };
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <HeaderSection user={user} courseStats={courseStats} />

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCourses={selectedCourses}
          bulkStatus={bulkStatus}
          setBulkStatus={setBulkStatus}
          openBulkStatusModal={openBulkStatusModal}
          setSelectedCourses={setSelectedCourses}
        />

        {/* Filters and Search Section */}
        <FiltersSection
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          statusFilter={statusFilter}
          handleFilterChange={handleFilterChange}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          limit={limit}
          handleLimitChange={handleLimitChange}
        />

        {/* Courses Grid/List */}
        <CoursesGrid
          error={error}
          courses={courses}
          isFetching={isFetching}
          debouncedSearchTerm={debouncedSearchTerm}
          handleSearch={handleSearch}
          filteredCourses={filteredCourses}
          viewMode={viewMode}
          pagination={pagination}
          selectedCourses={selectedCourses}
          selectAllCourses={selectAllCourses}
          refetch={refetch}
          isFetchingData={isFetching}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
          openLessonsModal={openLessonsModal}
          openAddLessonModal={openAddLessonModal}
          openStatusModal={openStatusModal}
          toggleCourseSelection={toggleCourseSelection}
          user={user}
          handlePageChange={handlePageChange}
        />

        {/* Modals */}
        <EditCourseModal
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          selectedCourse={selectedCourse}
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

        <DeleteCourseModal
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          selectedCourse={selectedCourse}
          deleteCourseMutation={deleteCourseMutation}
        />

        <LessonsModal
          isLessonsModalOpen={isLessonsModalOpen}
          setIsLessonsModalOpen={setIsLessonsModalOpen}
          selectedCourse={selectedCourse}
          lessons={lessons}
          openEditLessonModal={openEditLessonModal}
          deleteLessonMutation={deleteLessonMutation}
          openAddLessonModal={openAddLessonModal}
        />

        <AddLessonModal
          isAddLessonModalOpen={isAddLessonModalOpen}
          setIsAddLessonModalOpen={setIsAddLessonModalOpen}
          selectedCourse={selectedCourse}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
          videoInputRef={videoInputRef}
          uploadProgress={uploadProgress}
          addLessonMutation={addLessonMutation}
        />

        <EditLessonModal
          isEditLessonModalOpen={isEditLessonModalOpen}
          setIsEditLessonModalOpen={setIsEditLessonModalOpen}
          selectedCourse={selectedCourse}
          selectedLesson={selectedLesson}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
          lessonVideoInputRef={lessonVideoInputRef}
          updateLessonMutation={updateLessonMutation}
        />

        <StatusModal
          isStatusModalOpen={isStatusModalOpen}
          setIsStatusModalOpen={setIsStatusModalOpen}
          selectedCourse={selectedCourse}
          handleStatusChange={handleStatusChange}
          updateStatusMutation={updateStatusMutation}
          getPublishingRequirements={getPublishingRequirements}
        />

        <BulkStatusModal
          isBulkStatusModalOpen={isBulkStatusModalOpen}
          setIsBulkStatusModalOpen={setIsBulkStatusModalOpen}
          selectedCourses={selectedCourses}
          bulkStatus={bulkStatus}
          filteredCourses={filteredCourses}
          handleBulkStatusChange={handleBulkStatusChange}
          bulkUpdateStatusMutation={bulkUpdateStatusMutation}
        />
      </motion.div>
    </div>
  );
}
