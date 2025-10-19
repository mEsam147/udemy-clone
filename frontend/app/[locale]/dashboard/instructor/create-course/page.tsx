// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import { createCourse, addLesson } from "@/services/course.service";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Save,
//   Upload,
//   Video,
//   Image as ImageIcon,
//   Clock,
//   DollarSign,
//   BookOpen,
//   Layers,
//   CheckCircle,
//   Play,
//   X,
//   Rocket,
//   Loader,
//   FileText,
//   Target,
//   Award,
//   GraduationCap,
//   Lightbulb,
//   Zap,
//   Brain,
//   Star
// } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { toast } from "@/hooks/use-toast";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface LessonFormData {
//   id: string;
//   title: string;
//   video: File | null;
//   duration: number;
//   order: number;
//   progress?: number;
//   videoName?: string;
// }

// interface CourseFormData {
//   title: string;
//   description: string;
//   price: number;
//   category: string;
//   level: string;
//   requirements: string[];
//   whatYoullLearn: string[];
// }

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1, y: 0,
//     transition: {
//       duration: 0.6,
//       ease: "easeOut",
//     },
//   },
// };

// const cardHoverVariants = {
//   hover: {
//     y: -4,
//     scale: 1.02,
//     transition: {
//       duration: 0.2,
//       ease: "easeInOut",
//     },
//   },
// };

// const learningObjectiveVariants = {
//   hidden: { opacity: 0, scale: 0.8 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.3,
//       ease: "easeOut"
//     }
//   },
//   exit: {
//     opacity: 0,
//     scale: 0.8,
//     transition: {
//       duration: 0.2,
//       ease: "easeIn"
//     }
//   }
// };

// export default function CreateCourse() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//     trigger,
//   } = useForm<CourseFormData>({
//     defaultValues: {
//       level: "Beginner",
//       requirements: [],
//       whatYoullLearn: [],
//     },
//   });

//   const [lessons, setLessons] = useState<LessonFormData[]>([]);
//   const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
//   const [currentLesson, setCurrentLesson] = useState<LessonFormData>({
//     id: '',
//     title: "",
//     video: null,
//     duration: 0,
//     order: 0,
//     videoName: ""
//   });
//   const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string>("");
//   const [requirementInput, setRequirementInput] = useState("");
//   const [learningInput, setLearningInput] = useState("");
//   const [activeSection, setActiveSection] = useState("basic");
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isFormChanged, setIsFormChanged] = useState(false);

//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const videoInputRef = useRef<HTMLInputElement>(null);
//   const formRef = useRef<HTMLFormElement>(null);

//   // Generate unique ID for lessons
//   const generateId = () => Math.random().toString(36).substr(2, 9);

//   // Watch form changes
//   useEffect(() => {
//     const subscription = watch(() => setIsFormChanged(true));
//     return () => subscription.unsubscribe();
//   }, [watch]);

//   const createCourseMutation = useMutation({
//     mutationFn: async (data: CourseFormData) => {
//       const formData = new FormData();

//       formData.append("title", data.title);
//       formData.append("description", data.description);
//       formData.append("price", data.price.toString());
//       formData.append("category", data.category);
//       formData.append("level", data.level);

//       if (imageFile) {
//         formData.append("image", imageFile, imageFile.name);
//       }

//       if (data.requirements.length > 0) {
//         formData.append("requirements", JSON.stringify(data.requirements));
//       }

//       if (data.whatYoullLearn.length > 0) {
//         formData.append("whatYoullLearn", JSON.stringify(data.whatYoullLearn));
//       }

//       const courseResponse = await createCourse(formData);
//       const courseId = courseResponse.data._id;

//       // Upload lessons
//       const totalLessons = lessons.length;
//       let completedLessons = 0;

//       for (let index = 0; index < lessons.length; index++) {
//         const lesson = lessons[index];
//         if (!lesson.video) continue;

//         const lessonFormData = new FormData();
//         lessonFormData.append("title", lesson.title);
//         lessonFormData.append("duration", (lesson.duration * 60).toString());
//         lessonFormData.append("order", (index + 1).toString());
//         lessonFormData.append("video", lesson.video, lesson.video.name);

//         await addLesson(courseId, lessonFormData, (progressEvent) => {
//           const percent = Math.round(
//             (progressEvent.loaded * 100) / (progressEvent.total || 1)
//           );
//           setLessons(prev => prev.map((l, i) =>
//             i === index ? { ...l, progress: percent } : l
//           ));
//           setUploadProgress(((completedLessons + (percent / 100)) / totalLessons) * 100);
//         });

//         completedLessons++;
//         setUploadProgress((completedLessons / totalLessons) * 100);
//       }

//       return { course: courseResponse.data, lessonsCreated: lessons.length };
//     },
//     onSuccess: ({ course, lessonsCreated }) => {
//       queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
//       toast({
//         title: "🎉 Course Created Successfully!",
//         description: `Your course "${course.title}" is now live with ${lessonsCreated} lessons!`,
//       });
//       router.push("/instructor/courses");
//     },
//     onError: (error: any) => {
//       toast({
//         title: "❌ Creation Failed",
//         description: error.message || "Please try again later.",
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = async (data: CourseFormData) => {
//     const isValid = await trigger();

//     if (!isValid) {
//       toast({
//         title: "📝 Form Validation",
//         description: "Please fix the errors before submitting.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (lessons.length === 0) {
//       toast({
//         title: "📚 Lessons Required",
//         description: "Please add at least one lesson to your course.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!imageFile) {
//       toast({
//         title: "🖼️ Image Required",
//         description: "Please upload a course image.",
//         variant: "destructive",
//       });
//       return;
//     }

//     createCourseMutation.mutate(data);
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith('image/')) {
//         toast({
//           title: "Invalid File Type",
//           description: "Please upload an image file.",
//           variant: "destructive",
//         });
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         toast({
//           title: "File Too Large",
//           description: "Please upload an image smaller than 5MB.",
//           variant: "destructive",
//         });
//         return;
//       }

//       setImageFile(file);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//       setIsFormChanged(true);

//       toast({
//         title: "✅ Image Uploaded",
//         description: "Course image added successfully!",
//       });
//     }
//   };

//   const removeImage = () => {
//     setImageFile(null);
//     setImagePreview("");
//     if (imageInputRef.current) imageInputRef.current.value = "";
//     setIsFormChanged(true);
//   };

//   const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith('video/') && file.type !== 'application/octet-stream') {
//         toast({
//           title: "Invalid Video File",
//           description: "Please upload a valid video file.",
//           variant: "destructive",
//         });
//         return;
//       }

//       if (file.size > 100 * 1024 * 1024) {
//         toast({
//           title: "File Too Large",
//           description: "Please upload a video smaller than 100MB.",
//           variant: "destructive",
//         });
//         return;
//       }

//       setCurrentLesson(prev => ({
//         ...prev,
//         video: file,
//         videoName: file.name
//       }));
//       setIsFormChanged(true);

//       toast({
//         title: "✅ Video Ready",
//         description: "Lesson video added successfully!",
//       });
//     }
//   };

//   const openAddLessonModal = () => {
//     setCurrentLesson({
//       id: generateId(),
//       title: "",
//       video: null,
//       duration: 0,
//       order: lessons.length + 1,
//       videoName: ""
//     });
//     setEditingLessonId(null);
//     setIsLessonModalOpen(true);
//   };

//   const openEditLessonModal = (lessonId: string) => {
//     const lesson = lessons.find(l => l.id === lessonId);
//     if (lesson) {
//       setCurrentLesson(lesson);
//       setEditingLessonId(lessonId);
//       setIsLessonModalOpen(true);
//     }
//   };

//   const addOrUpdateLesson = () => {
//     if (!currentLesson.title || currentLesson.duration <= 0 || !currentLesson.video) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill all fields and upload a video.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (editingLessonId) {
//       // Update existing lesson
//       setLessons(prev => prev.map(lesson =>
//         lesson.id === editingLessonId ? currentLesson : lesson
//       ));
//     } else {
//       // Add new lesson
//       setLessons(prev => [...prev, { ...currentLesson, id: generateId() }]);
//     }

//     setIsLessonModalOpen(false);
//     setIsFormChanged(true);

//     toast({
//       title: editingLessonId ? "✅ Lesson Updated" : "✅ Lesson Added",
//       description: `Lesson "${currentLesson.title}" has been ${editingLessonId ? 'updated' : 'added'}.`,
//     });
//   };

//   const removeLesson = (lessonId: string) => {
//     const lesson = lessons.find(l => l.id === lessonId);
//     setLessons(prev => prev.filter(l => l.id !== lessonId));
//     setIsFormChanged(true);

//     toast({
//       title: "🗑️ Lesson Removed",
//       description: `Lesson "${lesson?.title}" has been removed.`,
//     });
//   };

//   const addRequirement = () => {
//     if (requirementInput.trim()) {
//       const newRequirements = [...watch("requirements"), requirementInput.trim()];
//       setValue("requirements", newRequirements);
//       setRequirementInput("");
//       setIsFormChanged(true);
//     }
//   };

//   const removeRequirement = (index: number) => {
//     const newRequirements = watch("requirements").filter((_, i) => i !== index);
//     setValue("requirements", newRequirements);
//     setIsFormChanged(true);
//   };

//   const addLearningObjective = () => {
//     if (learningInput.trim()) {
//       const newLearning = [...watch("whatYoullLearn"), learningInput.trim()];
//       setValue("whatYoullLearn", newLearning);
//       setLearningInput("");
//       setIsFormChanged(true);
//     }
//   };

//   const removeLearningObjective = (index: number) => {
//     const newLearning = watch("whatYoullLearn").filter((_, i) => i !== index);
//     setValue("whatYoullLearn", newLearning);
//     setIsFormChanged(true);
//   };

//   const sections = [
//     { id: "basic", label: "Basic Info", icon: BookOpen, completed: watch("title") && watch("description") },
//     { id: "details", label: "Course Details", icon: Target, completed: watch("category") && watch("level") },
//     { id: "content", label: "Content", icon: Video, completed: lessons.length > 0 },
//     { id: "goals", label: "Learning Goals", icon: Award, completed: watch("whatYoullLearn").length > 0 },
//   ];

//   const totalCompletion = Math.round(
//     (sections.filter(s => s.completed).length / sections.length) * 100
//   );

//   const totalDuration = lessons.reduce((acc, lesson) => acc + lesson.duration, 0);

//   // Sample learning goal icons for variety
//   const learningIcons = [Zap, Brain, Lightbulb, Star, GraduationCap, Target];
//   const getRandomIcon = () => learningIcons[Math.floor(Math.random() * learningIcons.length)];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-6xl mx-auto"
//       >
//         {/* Progress Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Create New Course
//                 </h1>
//                 <p className="text-gray-600 mt-1">Build your amazing course, {user?.name}! 🚀</p>
//               </div>
//               <div className="flex items-center gap-4">
//                 {isFormChanged && (
//                   <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
//                     Unsaved Changes
//                   </Badge>
//                 )}
//                 <Badge variant="secondary" className="text-lg px-4 py-2">
//                   {totalCompletion}% Complete
//                 </Badge>
//               </div>
//             </div>

//             <Progress value={totalCompletion} className="h-2 mb-4" />

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {sections.map((section) => (
//                 <motion.button
//                   key={section.id}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setActiveSection(section.id)}
//                   className={cn(
//                     "p-3 rounded-lg border-2 transition-all duration-200 text-left",
//                     activeSection === section.id
//                       ? "border-blue-500 bg-blue-50 shadow-md"
//                       : "border-gray-200 bg-white",
//                     section.completed && "border-green-200 bg-green-50"
//                   )}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className={cn(
//                       "p-2 rounded-lg",
//                       section.completed
//                         ? "bg-green-100 text-green-600"
//                         : "bg-gray-100 text-gray-600"
//                     )}>
//                       <section.icon className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-sm">{section.label}</div>
//                       <div className={cn(
//                         "text-xs",
//                         section.completed ? "text-green-600" : "text-gray-500"
//                       )}>
//                         {section.completed ? "Completed" : "Pending"}
//                       </div>
//                     </div>
//                     {section.completed && (
//                       <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
//                     )}
//                   </div>
//                 </motion.button>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Form */}
//           <div className="lg:col-span-2">
//             <motion.form
//               ref={formRef}
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//               onSubmit={handleSubmit(onSubmit)}
//               className="space-y-6"
//             >
//               {/* Course Image Upload */}
//               <motion.div variants={itemVariants}>
//                 <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                   <CardContent className="p-6">
//                     <Label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center gap-2">
//                       <ImageIcon className="h-5 w-5 text-blue-600" />
//                       Course Thumbnail
//                     </Label>

//                     <div
//                       className={cn(
//                         "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
//                         imagePreview
//                           ? "border-green-300 bg-green-50/50"
//                           : "border-gray-300 hover:border-blue-400 bg-white/50"
//                       )}
//                       onClick={() => imageInputRef.current?.click()}
//                     >
//                       <input
//                         ref={imageInputRef}
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         className="hidden"
//                       />

//                       {imagePreview ? (
//                         <motion.div
//                           initial={{ scale: 0.8 }}
//                           animate={{ scale: 1 }}
//                           className="relative"
//                         >
//                           <img
//                             src={imagePreview}
//                             alt="Course preview"
//                             className="mx-auto h-40 w-40 object-cover rounded-xl shadow-lg"
//                           />
//                           <motion.button
//                             type="button"
//                             whileHover={{ scale: 1.1 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               removeImage();
//                             }}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
//                           >
//                             <X className="h-4 w-4" />
//                           </motion.button>
//                           <p className="text-sm text-green-600 mt-3 font-medium">
//                             ✅ Image uploaded successfully!
//                           </p>
//                         </motion.div>
//                       ) : (
//                         <motion.div
//                           whileHover={{ scale: 1.02 }}
//                           className="space-y-4"
//                         >
//                           <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
//                             <ImageIcon className="h-8 w-8 text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="text-lg font-semibold text-gray-900">
//                               Upload Course Image
//                             </p>
//                             <p className="text-sm text-gray-500 mt-1">
//                               PNG, JPG, GIF up to 5MB
//                             </p>
//                           </div>
//                           <Button type="button" variant="outline" className="rounded-full">
//                             <Upload className="h-4 w-4 mr-2" />
//                             Choose File
//                           </Button>
//                         </motion.div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>

//               {/* Dynamic Sections */}
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={activeSection}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                 >
//                   {/* Basic Information Section */}
//                   {activeSection === "basic" && (
//                     <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                       <CardContent className="p-6">
//                         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//                           <BookOpen className="h-5 w-5 text-blue-600" />
//                           Basic Information
//                         </h3>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="space-y-2">
//                             <Label htmlFor="title" className="text-sm font-semibold">
//                               Course Title *
//                             </Label>
//                             <Input
//                               id="title"
//                               {...register("title", { required: "Course title is required" })}
//                               className="border-gray-300 focus:border-blue-500 rounded-lg"
//                               placeholder="e.g., Advanced Web Development"
//                             />
//                             {errors.title && (
//                               <p className="text-red-500 text-xs">{errors.title.message}</p>
//                             )}
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor="price" className="text-sm font-semibold">
//                               Price ($) *
//                             </Label>
//                             <Input
//                               id="price"
//                               type="number"
//                               {...register("price", {
//                                 required: "Price is required",
//                                 min: { value: 0, message: "Price must be positive" },
//                               })}
//                               className="border-gray-300 focus:border-blue-500 rounded-lg"
//                               placeholder="49.99"
//                             />
//                             {errors.price && (
//                               <p className="text-red-500 text-xs">{errors.price.message}</p>
//                             )}
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor="category" className="text-sm font-semibold">
//                               Category *
//                             </Label>
//                             <Input
//                               id="category"
//                               {...register("category", { required: "Category is required" })}
//                               className="border-gray-300 focus:border-blue-500 rounded-lg"
//                               placeholder="e.g., Web Development"
//                             />
//                             {errors.category && (
//                               <p className="text-red-500 text-xs">{errors.category.message}</p>
//                             )}
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor="level" className="text-sm font-semibold">
//                               Difficulty Level *
//                             </Label>
//                             <select
//                               id="level"
//                               {...register("level", { required: "Level is required" })}
//                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
//                             >
//                               <option value="Beginner">Beginner</option>
//                               <option value="Intermediate">Intermediate</option>
//                               <option value="Advanced">Advanced</option>
//                             </select>
//                             {errors.level && (
//                               <p className="text-red-500 text-xs">{errors.level.message}</p>
//                             )}
//                           </div>
//                         </div>

//                         <div className="space-y-2 mt-6">
//                           <Label htmlFor="description" className="text-sm font-semibold">
//                             Course Description *
//                           </Label>
//                           <Textarea
//                             id="description"
//                             {...register("description", {
//                               required: "Description is required",
//                               minLength: {
//                                 value: 50,
//                                 message: "Description must be at least 50 characters",
//                               },
//                             })}
//                             className="border-gray-300 focus:border-blue-500 rounded-lg min-h-[120px]"
//                             placeholder="Describe what students will learn in this course..."
//                           />
//                           {errors.description && (
//                             <p className="text-red-500 text-xs">{errors.description.message}</p>
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Course Details Section */}
//                   {activeSection === "details" && (
//                     <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                       <CardContent className="p-6">
//                         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//                           <Target className="h-5 w-5 text-blue-600" />
//                           Course Requirements
//                         </h3>

//                         <div className="space-y-4">
//                           <Label className="text-sm font-semibold text-gray-700">
//                             What students should know before taking this course
//                           </Label>
//                           <div className="flex gap-2">
//                             <Input
//                               value={requirementInput}
//                               onChange={(e) => setRequirementInput(e.target.value)}
//                               placeholder="e.g., Basic programming knowledge"
//                               className="flex-1 rounded-lg"
//                               onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
//                             />
//                             <Button
//                               type="button"
//                               onClick={addRequirement}
//                               variant="outline"
//                               className="rounded-lg"
//                             >
//                               <Plus className="h-4 w-4" />
//                             </Button>
//                           </div>

//                           <AnimatePresence>
//                             <div className="space-y-2">
//                               {watch("requirements").map((req, index) => {
//                                 const IconComponent = getRandomIcon();
//                                 return (
//                                   <motion.div
//                                     key={index}
//                                     variants={learningObjectiveVariants}
//                                     initial="hidden"
//                                     animate="visible"
//                                     exit="exit"
//                                     className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
//                                   >
//                                     <div className="flex items-center gap-3">
//                                       <div className="p-1 bg-blue-100 rounded">
//                                         <IconComponent className="h-3 w-3 text-blue-600" />
//                                       </div>
//                                       <span className="text-sm text-gray-700">• {req}</span>
//                                     </div>
//                                     <Button
//                                       type="button"
//                                       variant="ghost"
//                                       size="sm"
//                                       onClick={() => removeRequirement(index)}
//                                       className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
//                                     >
//                                       <Trash2 className="h-3 w-3" />
//                                     </Button>
//                                   </motion.div>
//                                 );
//                               })}
//                             </div>
//                           </AnimatePresence>

//                           {watch("requirements").length === 0 && (
//                             <motion.div
//                               initial={{ opacity: 0 }}
//                               animate={{ opacity: 1 }}
//                               className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
//                             >
//                               <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                               <p className="text-gray-500">No requirements added yet</p>
//                               <p className="text-sm text-gray-400 mt-1">
//                                 Add prerequisites for your course
//                               </p>
//                             </motion.div>
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Lessons Section */}
//                   {activeSection === "content" && (
//                     <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                       <CardContent className="p-6">
//                         <div className="flex justify-between items-center mb-6">
//                           <div>
//                             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                               <Video className="h-5 w-5 text-blue-600" />
//                               Course Lessons
//                             </h3>
//                             <p className="text-sm text-gray-600">
//                               {lessons.length} lessons • {totalDuration} minutes total
//                             </p>
//                           </div>

//                           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                             <Button
//                               onClick={openAddLessonModal}
//                               className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-lg"
//                             >
//                               <Plus className="h-4 w-4 mr-2" /> Add Lesson
//                             </Button>
//                           </motion.div>
//                         </div>

//                         <AnimatePresence>
//                           {lessons.length > 0 ? (
//                             <div className="space-y-4">
//                               {lessons.map((lesson, index) => (
//                                 <motion.div
//                                   key={lesson.id}
//                                   initial={{ opacity: 0, y: 20 }}
//                                   animate={{ opacity: 1, y: 0 }}
//                                   exit={{ opacity: 0, y: -20 }}
//                                   className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
//                                 >
//                                   <div className="flex items-center gap-4 flex-1">
//                                     <div className="flex items-center gap-3">
//                                       <div className="bg-blue-100 p-2 rounded-lg">
//                                         <Play className="h-4 w-4 text-blue-600" />
//                                       </div>
//                                       <div className="text-sm text-gray-500 font-mono">
//                                         {index + 1}.
//                                       </div>
//                                     </div>
//                                     <div className="flex-1">
//                                       <h4 className="font-semibold text-gray-800">
//                                         {lesson.title}
//                                       </h4>
//                                       <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
//                                         <span className="flex items-center gap-1">
//                                           <Clock className="h-3 w-3" />
//                                           {lesson.duration} min
//                                         </span>
//                                         {lesson.videoName && (
//                                           <span className="flex items-center gap-1">
//                                             <FileText className="h-3 w-3" />
//                                             {lesson.videoName}
//                                           </span>
//                                         )}
//                                       </div>
//                                       {lesson.progress !== undefined && lesson.progress > 0 && (
//                                         <div className="mt-2">
//                                           <Progress value={lesson.progress} className="h-1" />
//                                           <p className="text-xs text-gray-500 mt-1">
//                                             Uploading... {lesson.progress}%
//                                           </p>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                   <div className="flex gap-2">
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() => openEditLessonModal(lesson.id)}
//                                       className="text-blue-600 border-blue-200"
//                                     >
//                                       <Edit className="h-3 w-3" />
//                                     </Button>
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() => removeLesson(lesson.id)}
//                                       className="text-red-600 border-red-200"
//                                     >
//                                       <Trash2 className="h-3 w-3" />
//                                     </Button>
//                                   </div>
//                                 </motion.div>
//                               ))}
//                             </div>
//                           ) : (
//                             <motion.div
//                               initial={{ opacity: 0 }}
//                               animate={{ opacity: 1 }}
//                               className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg"
//                             >
//                               <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                               <p className="text-gray-500 font-medium">No lessons added yet</p>
//                               <p className="text-sm text-gray-400 mt-1">
//                                 Start by adding your first lesson
//                               </p>
//                               <Button
//                                 onClick={openAddLessonModal}
//                                 variant="outline"
//                                 className="mt-4"
//                               >
//                                 <Plus className="h-4 w-4 mr-2" /> Add First Lesson
//                               </Button>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Learning Goals Section */}
//                   {activeSection === "goals" && (
//                     <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                       <CardContent className="p-6">
//                         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//                           <Award className="h-5 w-5 text-blue-600" />
//                           Learning Goals & Objectives
//                         </h3>

//                         <div className="space-y-6">
//                           <div>
//                             <Label className="text-lg font-semibold text-gray-700 mb-4 block">
//                               What will students learn in your course?
//                             </Label>
//                             <p className="text-sm text-gray-600 mb-4">
//                               Add specific skills and knowledge that students will gain. This helps students understand the value of your course.
//                             </p>

//                             <div className="flex gap-2 mb-4">
//                               <Input
//                                 value={learningInput}
//                                 onChange={(e) => setLearningInput(e.target.value)}
//                                 placeholder="e.g., Build responsive web applications with React"
//                                 className="flex-1 rounded-lg"
//                                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningObjective())}
//                               />
//                               <Button
//                                 type="button"
//                                 onClick={addLearningObjective}
//                                 variant="outline"
//                                 className="rounded-lg"
//                               >
//                                 <Plus className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </div>

//                           <AnimatePresence>
//                             <div className="space-y-3">
//                               {watch("whatYoullLearn").map((learn, index) => {
//                                 const IconComponent = getRandomIcon();
//                                 return (
//                                   <motion.div
//                                     key={index}
//                                     variants={learningObjectiveVariants}
//                                     initial="hidden"
//                                     animate="visible"
//                                     exit="exit"
//                                     className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors"
//                                   >
//                                     <div className="flex items-center gap-4 flex-1">
//                                       <div className="p-2 bg-green-100 rounded-lg">
//                                         <IconComponent className="h-5 w-5 text-green-600" />
//                                       </div>
//                                       <div>
//                                         <span className="font-medium text-gray-800">{learn}</span>
//                                       </div>
//                                     </div>
//                                     <Button
//                                       type="button"
//                                       variant="ghost"
//                                       size="sm"
//                                       onClick={() => removeLearningObjective(index)}
//                                       className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                                     >
//                                       <Trash2 className="h-4 w-4" />
//                                     </Button>
//                                   </motion.div>
//                                 );
//                               })}
//                             </div>
//                           </AnimatePresence>

//                           {watch("whatYoullLearn").length === 0 && (
//                             <motion.div
//                               initial={{ opacity: 0 }}
//                               animate={{ opacity: 1 }}
//                               className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg"
//                             >
//                               <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                               <p className="text-gray-500 font-medium">No learning goals added yet</p>
//                               <p className="text-sm text-gray-400 mt-1">
//                                 Define what students will achieve in your course
//                               </p>
//                             </motion.div>
//                           )}

//                           {/* Learning Goals Tips */}
//                           {watch("whatYoullLearn").length > 0 && (
//                             <motion.div
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
//                             >
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Lightbulb className="h-4 w-4 text-blue-600" />
//                                 <span className="font-semibold text-blue-800">Tips for Great Learning Goals</span>
//                               </div>
//                               <ul className="text-sm text-blue-700 space-y-1">
//                                 <li>• Be specific about skills students will learn</li>
//                                 <li>• Focus on practical, actionable outcomes</li>
//                                 <li>• Use action verbs like "build", "create", "design"</li>
//                                 <li>• Keep each goal clear and measurable</li>
//                               </ul>
//                             </motion.div>
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </motion.div>
//               </AnimatePresence>
//             </motion.form>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Course Preview */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 }}
//             >
//               <Card className="border-0 shadow-lg sticky top-6">
//                 <CardContent className="p-6">
//                   <h3 className="font-semibold text-lg mb-4">Course Preview</h3>

//                   {imagePreview ? (
//                     <div className="space-y-4">
//                       <img
//                         src={imagePreview}
//                         alt="Course preview"
//                         className="w-full h-32 object-cover rounded-lg"
//                       />
//                       <div>
//                         <h4 className="font-semibold text-gray-900 truncate">
//                           {watch("title") || "Untitled Course"}
//                         </h4>
//                         <p className="text-sm text-gray-600 line-clamp-2">
//                           {watch("description") || "No description yet"}
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-8 text-gray-500">
//                       <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                       <p>Add a course image to see preview</p>
//                     </div>
//                   )}

//                   <div className="space-y-3 mt-4">
//                     <div className="flex justify-between text-sm">
//                       <span>Lessons:</span>
//                       <span className="font-semibold">{lessons.length}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span>Total Duration:</span>
//                       <span className="font-semibold">{totalDuration} min</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span>Learning Goals:</span>
//                       <span className="font-semibold">{watch("whatYoullLearn").length}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span>Price:</span>
//                       <span className="font-semibold">${watch("price") || 0}</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>

//             {/* Quick Actions */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <Card className="border-0 shadow-lg">
//                 <CardContent className="p-6">
//                   <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
//                   <div className="space-y-3">
//                     <Button
//                       onClick={openAddLessonModal}
//                       className="w-full justify-start"
//                       variant="outline"
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Lesson
//                     </Button>
//                     <Button
//                       onClick={() => setActiveSection("goals")}
//                       className="w-full justify-start"
//                       variant="outline"
//                     >
//                       <Award className="h-4 w-4 mr-2" />
//                       Set Learning Goals
//                     </Button>
//                     <Button
//                       onClick={() => imageInputRef.current?.click()}
//                       className="w-full justify-start"
//                       variant="outline"
//                     >
//                       <ImageIcon className="h-4 w-4 mr-2" />
//                       Change Image
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>

//             {/* Submit Section */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.5 }}
//             >
//               <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
//                 <CardContent className="p-6">
//                   <h3 className="font-semibold text-lg mb-2">Ready to Publish?</h3>
//                   <p className="text-blue-100 text-sm mb-4">
//                     {totalCompletion === 100
//                       ? "Your course is ready to go! 🎉"
//                       : `${100 - totalCompletion}% remaining to complete`
//                     }
//                   </p>

//                   {createCourseMutation.isPending && (
//                     <div className="space-y-2 mb-4">
//                       <Progress value={uploadProgress} className="h-2" />
//                       <p className="text-xs text-blue-200">
//                         Uploading... {Math.round(uploadProgress)}%
//                       </p>
//                     </div>
//                   )}

//                   <Button
//                     onClick={handleSubmit(onSubmit)}
//                     disabled={createCourseMutation.isPending || totalCompletion < 100}
//                     className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
//                     size="lg"
//                   >
//                     {createCourseMutation.isPending ? (
//                       <>
//                         <Loader className="h-4 w-4 mr-2 animate-spin" />
//                         Publishing...
//                       </>
//                     ) : (
//                       <>
//                         <Rocket className="h-4 w-4 mr-2" />
//                         Publish Course
//                       </>
//                     )}
//                   </Button>

//                   {totalCompletion < 100 && (
//                     <p className="text-xs text-blue-200 text-center mt-2">
//                       Complete all sections to publish
//                     </p>
//                   )}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Lesson Modal */}
//       <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
//         <DialogContent className="rounded-xl max-w-md border-0 shadow-2xl">
//           <DialogHeader>
//             <DialogTitle className="text-xl flex items-center gap-2">
//               <Video className="h-5 w-5 text-blue-600" />
//               {editingLessonId ? "Edit Lesson" : "Add New Lesson"}
//             </DialogTitle>
//           </DialogHeader>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4 py-4"
//           >
//             <div className="space-y-2">
//               <Label htmlFor="lesson-title">Lesson Title *</Label>
//               <Input
//                 id="lesson-title"
//                 value={currentLesson.title}
//                 onChange={(e) => setCurrentLesson(prev => ({
//                   ...prev,
//                   title: e.target.value
//                 }))}
//                 placeholder="e.g., Introduction to React"
//                 className="rounded-lg"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="lesson-video">Video File *</Label>
//               <div
//                 className={cn(
//                   "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300",
//                   currentLesson.video
//                     ? "border-green-300 bg-green-50"
//                     : "border-gray-300 hover:border-blue-400"
//                 )}
//                 onClick={() => videoInputRef.current?.click()}
//               >
//                 <input
//                   ref={videoInputRef}
//                   type="file"
//                   accept="video/*"
//                   onChange={handleVideoUpload}
//                   className="hidden"
//                 />

//                 {currentLesson.video ? (
//                   <div className="space-y-2">
//                     <Video className="h-8 w-8 text-green-500 mx-auto" />
//                     <p className="text-sm font-medium text-green-700">
//                       {currentLesson.videoName}
//                     </p>
//                     <p className="text-xs text-green-600">
//                       Click to change video file
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <Video className="h-8 w-8 text-gray-400 mx-auto" />
//                     <p className="text-sm">Click to upload video</p>
//                     <p className="text-xs text-gray-500">
//                       MP4, MOV, AVI up to 100MB
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="lesson-duration" className="flex items-center gap-2">
//                 <Clock className="h-4 w-4" />
//                 Duration (minutes) *
//               </Label>
//               <Input
//                 id="lesson-duration"
//                 type="number"
//                 value={currentLesson.duration}
//                 onChange={(e) => setCurrentLesson(prev => ({
//                   ...prev,
//                   duration: parseInt(e.target.value) || 0
//                 }))}
//                 min="1"
//                 placeholder="30"
//                 className="rounded-lg"
//               />
//             </div>

//             <Button
//               onClick={addOrUpdateLesson}
//               className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
//               disabled={!currentLesson.title || !currentLesson.video || currentLesson.duration <= 0}
//             >
//               <Save className="h-4 w-4 mr-2" />
//               {editingLessonId ? "Update Lesson" : "Add Lesson"}
//             </Button>
//           </motion.div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createCourse, addLesson } from "@/services/course.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Video,
  Image as ImageIcon,
  Clock,
  DollarSign,
  BookOpen,
  Layers,
  CheckCircle,
  Play,
  X,
  Rocket,
  Loader,
  FileText,
  Target,
  Award,
  GraduationCap,
  Lightbulb,
  Zap,
  Brain,
  Star,
  Languages,
  Tag,
  BarChart3,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonFormData {
  id: string;
  title: string;
  video: File | null;
  duration: number;
  order: number;
  progress?: number;
  videoName?: string;
}

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  level: string;
  language: string;
  requirements: string[];
  whatYoullLearn: string[];
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

const learningObjectiveVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Predefined options for dropdowns
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Portuguese",
];
const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Graphic Design",
  "Digital Marketing",
  "Business",
  "Finance",
  "Photography",
  "Music",
  "Health & Fitness",
  "Language Learning",
  "Personal Development",
];

export default function CreateCourse() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<CourseFormData>({
    defaultValues: {
      level: "Beginner",
      language: "English",
      requirements: [],
      whatYoullLearn: [],
      subtitle: "",
      subcategory: "",
    },
  });

  const [lessons, setLessons] = useState<LessonFormData[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonFormData>({
    id: "",
    title: "",
    video: null,
    duration: 0,
    order: 0,
    videoName: "",
  });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [requirementInput, setRequirementInput] = useState("");
  const [learningInput, setLearningInput] = useState("");
  const [activeSection, setActiveSection] = useState("basic");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Generate unique ID for lessons
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Watch form changes
  useEffect(() => {
    const subscription = watch(() => setIsFormChanged(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const formData = new FormData();

      // Append all course data including new fields
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle || "");
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory || "");
      formData.append("level", data.level);
      formData.append("language", data.language);

      if (imageFile) {
        formData.append("image", imageFile, imageFile.name);
      }

      if (data.requirements.length > 0) {
        formData.append("requirements", JSON.stringify(data.requirements));
      }

      if (data.whatYoullLearn.length > 0) {
        formData.append("whatYoullLearn", JSON.stringify(data.whatYoullLearn));
      }

      const courseResponse = await createCourse(formData);
      const courseId = courseResponse.data._id;

      // Upload lessons
      const totalLessons = lessons.length;
      let completedLessons = 0;

      for (let index = 0; index < lessons.length; index++) {
        const lesson = lessons[index];
        if (!lesson.video) continue;

        const lessonFormData = new FormData();
        lessonFormData.append("title", lesson.title);
        lessonFormData.append("duration", (lesson.duration * 60).toString());
        lessonFormData.append("order", (index + 1).toString());
        lessonFormData.append("video", lesson.video, lesson.video.name);

        await addLesson(courseId, lessonFormData, (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setLessons((prev) =>
            prev.map((l, i) => (i === index ? { ...l, progress: percent } : l))
          );
          setUploadProgress(
            ((completedLessons + percent / 100) / totalLessons) * 100
          );
        });

        completedLessons++;
        setUploadProgress((completedLessons / totalLessons) * 100);
      }

      return { course: courseResponse.data, lessonsCreated: lessons.length };
    },
    onSuccess: ({ course, lessonsCreated }) => {
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      toast({
        title: "🎉 Course Created Successfully!",
        description: `Your course "${course.title}" is now live with ${lessonsCreated} lessons!`,
      });
      router.push("/instructor/courses");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Creation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    const isValid = await trigger();

    if (!isValid) {
      toast({
        title: "📝 Form Validation",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (lessons.length === 0) {
      toast({
        title: "📚 Lessons Required",
        description: "Please add at least one lesson to your course.",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "🖼️ Image Required",
        description: "Please upload a course image.",
        variant: "destructive",
      });
      return;
    }

    createCourseMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsFormChanged(true);

      toast({
        title: "✅ Image Uploaded",
        description: "Course image added successfully!",
      });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (imageInputRef.current) imageInputRef.current.value = "";
    setIsFormChanged(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        !file.type.startsWith("video/") &&
        file.type !== "application/octet-stream"
      ) {
        toast({
          title: "Invalid Video File",
          description: "Please upload a valid video file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a video smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }

      setCurrentLesson((prev) => ({
        ...prev,
        video: file,
        videoName: file.name,
      }));
      setIsFormChanged(true);

      toast({
        title: "✅ Video Ready",
        description: "Lesson video added successfully!",
      });
    }
  };

  const openAddLessonModal = () => {
    setCurrentLesson({
      id: generateId(),
      title: "",
      video: null,
      duration: 0,
      order: lessons.length + 1,
      videoName: "",
    });
    setEditingLessonId(null);
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setEditingLessonId(lessonId);
      setIsLessonModalOpen(true);
    }
  };

  const addOrUpdateLesson = () => {
    if (
      !currentLesson.title ||
      currentLesson.duration <= 0 ||
      !currentLesson.video
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and upload a video.",
        variant: "destructive",
      });
      return;
    }

    if (editingLessonId) {
      // Update existing lesson
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === editingLessonId ? currentLesson : lesson
        )
      );
    } else {
      // Add new lesson
      setLessons((prev) => [...prev, { ...currentLesson, id: generateId() }]);
    }

    setIsLessonModalOpen(false);
    setIsFormChanged(true);

    toast({
      title: editingLessonId ? "✅ Lesson Updated" : "✅ Lesson Added",
      description: `Lesson "${currentLesson.title}" has been ${
        editingLessonId ? "updated" : "added"
      }.`,
    });
  };

  const removeLesson = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    setIsFormChanged(true);

    toast({
      title: "🗑️ Lesson Removed",
      description: `Lesson "${lesson?.title}" has been removed.`,
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      const newRequirements = [
        ...watch("requirements"),
        requirementInput.trim(),
      ];
      setValue("requirements", newRequirements);
      setRequirementInput("");
      setIsFormChanged(true);
    }
  };

  const removeRequirement = (index: number) => {
    const newRequirements = watch("requirements").filter((_, i) => i !== index);
    setValue("requirements", newRequirements);
    setIsFormChanged(true);
  };

  const addLearningObjective = () => {
    if (learningInput.trim()) {
      const newLearning = [...watch("whatYoullLearn"), learningInput.trim()];
      setValue("whatYoullLearn", newLearning);
      setLearningInput("");
      setIsFormChanged(true);
    }
  };

  const removeLearningObjective = (index: number) => {
    const newLearning = watch("whatYoullLearn").filter((_, i) => i !== index);
    setValue("whatYoullLearn", newLearning);
    setIsFormChanged(true);
  };

  const addCustomCategory = () => {
    if (customCategory.trim()) {
      setValue("category", customCategory.trim());
      setCustomCategory("");
    }
  };

  const addCustomSubcategory = () => {
    if (customSubcategory.trim()) {
      setValue("subcategory", customSubcategory.trim());
      setCustomSubcategory("");
    }
  };

  const sections = [
    {
      id: "basic",
      label: "Basic Info",
      icon: BookOpen,
      completed: watch("title") && watch("description"),
    },
    {
      id: "details",
      label: "Course Details",
      icon: Target,
      completed: watch("category") && watch("level"),
    },
    {
      id: "content",
      label: "Content",
      icon: Video,
      completed: lessons.length > 0,
    },
    {
      id: "goals",
      label: "Learning Goals",
      icon: Award,
      completed: watch("whatYoullLearn").length > 0,
    },
  ];

  const totalCompletion = Math.round(
    (sections.filter((s) => s.completed).length / sections.length) * 100
  );

  const totalDuration = lessons.reduce(
    (acc, lesson) => acc + lesson.duration,
    0
  );

  // Sample learning goal icons for variety
  const learningIcons = [Zap, Brain, Lightbulb, Star, GraduationCap, Target];
  const getRandomIcon = () =>
    learningIcons[Math.floor(Math.random() * learningIcons.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Course
                </h1>
                <p className="text-gray-600 mt-1">
                  Build your amazing course, {user?.name}! 🚀
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isFormChanged && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Unsaved Changes
                  </Badge>
                )}
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {totalCompletion}% Complete
                </Badge>
              </div>
            </div>

            <Progress value={totalCompletion} className="h-2 mb-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200 text-left",
                    activeSection === section.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white",
                    section.completed && "border-green-200 bg-green-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        section.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{section.label}</div>
                      <div
                        className={cn(
                          "text-xs",
                          section.completed ? "text-green-600" : "text-gray-500"
                        )}
                      >
                        {section.completed ? "Completed" : "Pending"}
                      </div>
                    </div>
                    {section.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.form
              ref={formRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Course Image Upload */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <Label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Course Thumbnail
                    </Label>

                    <div
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
                        imagePreview
                          ? "border-green-300 bg-green-50/50"
                          : "border-gray-300 hover:border-blue-400 bg-white/50"
                      )}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {imagePreview ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="relative"
                        >
                          <img
                            src={imagePreview}
                            alt="Course preview"
                            className="mx-auto h-40 w-40 object-cover rounded-xl shadow-lg"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                          <p className="text-sm text-green-600 mt-3 font-medium">
                            ✅ Image uploaded successfully!
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-4"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                            <ImageIcon className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              Upload Course Image
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dynamic Sections */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Basic Information Section */}
                  {activeSection === "basic" && (
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Basic Information
                        </h3>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="title"
                                className="text-sm font-semibold"
                              >
                                Course Title *
                              </Label>
                              <Input
                                id="title"
                                {...register("title", {
                                  required: "Course title is required",
                                })}
                                className="border-gray-300 focus:border-blue-500 rounded-lg"
                                placeholder="e.g., Advanced Web Development"
                                maxLength={100}
                              />
                              <p className="text-xs text-gray-500">
                                {watch("title")?.length || 0}/100 characters
                              </p>
                              {errors.title && (
                                <p className="text-red-500 text-xs">
                                  {errors.title.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="subtitle"
                                className="text-sm font-semibold"
                              >
                                Subtitle
                              </Label>
                              <Input
                                id="subtitle"
                                {...register("subtitle")}
                                className="border-gray-300 focus:border-blue-500 rounded-lg"
                                placeholder="e.g., Master modern web development techniques"
                                maxLength={200}
                              />
                              <p className="text-xs text-gray-500">
                                {watch("subtitle")?.length || 0}/200 characters
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="description"
                              className="text-sm font-semibold"
                            >
                              Course Description *
                            </Label>
                            <Textarea
                              id="description"
                              {...register("description", {
                                required: "Description is required",
                                minLength: {
                                  value: 50,
                                  message:
                                    "Description must be at least 50 characters",
                                },
                              })}
                              className="border-gray-300 focus:border-blue-500 rounded-lg min-h-[120px]"
                              placeholder="Describe what students will learn in this course..."
                            />
                            {errors.description && (
                              <p className="text-red-500 text-xs">
                                {errors.description.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Course Details Section */}
                  {activeSection === "details" && (
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          Course Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="price"
                              className="text-sm font-semibold"
                            >
                              Price ($) *
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              {...register("price", {
                                required: "Price is required",
                                min: {
                                  value: 0,
                                  message: "Price must be positive",
                                },
                              })}
                              className="border-gray-300 focus:border-blue-500 rounded-lg"
                              placeholder="49.99"
                            />
                            {errors.price && (
                              <p className="text-red-500 text-xs">
                                {errors.price.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="level"
                              className="text-sm font-semibold"
                            >
                              Difficulty Level *
                            </Label>
                            <select
                              id="level"
                              {...register("level", {
                                required: "Level is required",
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                              {LEVEL_OPTIONS.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                            {errors.level && (
                              <p className="text-red-500 text-xs">
                                {errors.level.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="language"
                              className="text-sm font-semibold flex items-center gap-2"
                            >
                              <Languages className="h-4 w-4" />
                              Course Language *
                            </Label>
                            <select
                              id="language"
                              {...register("language", {
                                required: "Language is required",
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                              {LANGUAGE_OPTIONS.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="category"
                              className="text-sm font-semibold flex items-center gap-2"
                            >
                              <Tag className="h-4 w-4" />
                              Category *
                            </Label>
                            <select
                              id="category"
                              {...register("category", {
                                required: "Category is required",
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="">Select a category</option>
                              {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={customCategory}
                                onChange={(e) =>
                                  setCustomCategory(e.target.value)
                                }
                                placeholder="Or enter custom category"
                                className="flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                onClick={addCustomCategory}
                                variant="outline"
                                size="sm"
                                disabled={!customCategory.trim()}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {errors.category && (
                              <p className="text-red-500 text-xs">
                                {errors.category.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="subcategory"
                              className="text-sm font-semibold"
                            >
                              Subcategory
                            </Label>
                            <Input
                              id="subcategory"
                              {...register("subcategory")}
                              className="border-gray-300 focus:border-blue-500 rounded-lg"
                              placeholder="e.g., React, Node.js, Python"
                            />
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={customSubcategory}
                                onChange={(e) =>
                                  setCustomSubcategory(e.target.value)
                                }
                                placeholder="Or enter custom subcategory"
                                className="flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                onClick={addCustomSubcategory}
                                variant="outline"
                                size="sm"
                                disabled={!customSubcategory.trim()}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lessons Section */}
                  {activeSection === "content" && (
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <Video className="h-5 w-5 text-blue-600" />
                              Course Lessons
                            </h3>
                            <p className="text-sm text-gray-600">
                              {lessons.length} lessons • {totalDuration} minutes
                              total
                            </p>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={openAddLessonModal}
                              className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-lg"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Lesson
                            </Button>
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {lessons.length > 0 ? (
                            <div className="space-y-4">
                              {lessons.map((lesson, index) => (
                                <motion.div
                                  key={lesson.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-blue-100 p-2 rounded-lg">
                                        <Play className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div className="text-sm text-gray-500 font-mono">
                                        {index + 1}.
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">
                                        {lesson.title}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {lesson.duration} min
                                        </span>
                                        {lesson.videoName && (
                                          <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {lesson.videoName}
                                          </span>
                                        )}
                                      </div>
                                      {lesson.progress !== undefined &&
                                        lesson.progress > 0 && (
                                          <div className="mt-2">
                                            <Progress
                                              value={lesson.progress}
                                              className="h-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                              Uploading... {lesson.progress}%
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openEditLessonModal(lesson.id)
                                      }
                                      className="text-blue-600 border-blue-200"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeLesson(lesson.id)}
                                      className="text-red-600 border-red-200"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg"
                            >
                              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 font-medium">
                                No lessons added yet
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                Start by adding your first lesson
                              </p>
                              <Button
                                onClick={openAddLessonModal}
                                variant="outline"
                                className="mt-4"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add First
                                Lesson
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning Goals Section */}
                  {activeSection === "goals" && (
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-600" />
                          Learning Goals & Objectives
                        </h3>

                        <div className="space-y-6">
                          {/* Requirements Section */}
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-700">
                              <Target className="h-4 w-4 inline mr-2" />
                              Course Requirements
                            </Label>
                            <p className="text-sm text-gray-600">
                              What students should know before taking this
                              course
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={requirementInput}
                                onChange={(e) =>
                                  setRequirementInput(e.target.value)
                                }
                                placeholder="e.g., Basic programming knowledge"
                                className="flex-1 rounded-lg"
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), addRequirement())
                                }
                              />
                              <Button
                                type="button"
                                onClick={addRequirement}
                                variant="outline"
                                className="rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <AnimatePresence>
                              <div className="space-y-2">
                                {watch("requirements").map((req, index) => {
                                  const IconComponent = getRandomIcon();
                                  return (
                                    <motion.div
                                      key={index}
                                      variants={learningObjectiveVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="p-1 bg-blue-100 rounded">
                                          <IconComponent className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">
                                          • {req}
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRequirement(index)}
                                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </AnimatePresence>
                          </div>

                          {/* What You'll Learn Section */}
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-700">
                              <GraduationCap className="h-4 w-4 inline mr-2" />
                              What Students Will Learn
                            </Label>
                            <p className="text-sm text-gray-600">
                              Add specific skills and knowledge that students
                              will gain
                            </p>

                            <div className="flex gap-2">
                              <Input
                                value={learningInput}
                                onChange={(e) =>
                                  setLearningInput(e.target.value)
                                }
                                placeholder="e.g., Build responsive web applications with React"
                                className="flex-1 rounded-lg"
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), addLearningObjective())
                                }
                              />
                              <Button
                                type="button"
                                onClick={addLearningObjective}
                                variant="outline"
                                className="rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <AnimatePresence>
                              <div className="space-y-3">
                                {watch("whatYoullLearn").map((learn, index) => {
                                  const IconComponent = getRandomIcon();
                                  return (
                                    <motion.div
                                      key={index}
                                      variants={learningObjectiveVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors"
                                    >
                                      <div className="flex items-center gap-4 flex-1">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                          <IconComponent className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-800">
                                            {learn}
                                          </span>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeLearningObjective(index)
                                        }
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </AnimatePresence>

                            {watch("whatYoullLearn").length === 0 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                              >
                                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">
                                  No learning goals added yet
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Define what students will achieve in your
                                  course
                                </p>
                              </motion.div>
                            )}
                          </div>

                          {/* Learning Goals Tips */}
                          {(watch("requirements").length > 0 ||
                            watch("whatYoullLearn").length > 0) && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-blue-800">
                                  Tips for Great Learning Goals
                                </span>
                              </div>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li>
                                  • Be specific about skills students will learn
                                </li>
                                <li>
                                  • Focus on practical, actionable outcomes
                                </li>
                                <li>
                                  • Use action verbs like "build", "create",
                                  "design"
                                </li>
                                <li>• Keep each goal clear and measurable</li>
                              </ul>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg sticky top-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Course Preview</h3>

                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 truncate">
                          {watch("title") || "Untitled Course"}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {watch("subtitle") ||
                            watch("description") ||
                            "No description yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Add a course image to see preview</p>
                    </div>
                  )}

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> Level:
                      </span>
                      <span className="font-semibold">{watch("level")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Languages className="h-3 w-3" /> Language:
                      </span>
                      <span className="font-semibold">{watch("language")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> Lessons:
                      </span>
                      <span className="font-semibold">{lessons.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Duration:
                      </span>
                      <span className="font-semibold">{totalDuration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> Learning Goals:
                      </span>
                      <span className="font-semibold">
                        {watch("whatYoullLearn").length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Price:
                      </span>
                      <span className="font-semibold">
                        ${watch("price") || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={openAddLessonModal}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                    <Button
                      onClick={() => setActiveSection("goals")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Set Learning Goals
                    </Button>
                    <Button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    Ready to Publish?
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    {totalCompletion === 100
                      ? "Your course is ready to go! 🎉"
                      : `${100 - totalCompletion}% remaining to complete`}
                  </p>

                  {createCourseMutation.isPending && (
                    <div className="space-y-2 mb-4">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-blue-200">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={
                      createCourseMutation.isPending || totalCompletion < 100
                    }
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    {createCourseMutation.isPending ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Publish Course
                      </>
                    )}
                  </Button>

                  {totalCompletion < 100 && (
                    <p className="text-xs text-blue-200 text-center mt-2">
                      Complete all sections to publish
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Lesson Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="rounded-xl max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              {editingLessonId ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title *</Label>
              <Input
                id="lesson-title"
                value={currentLesson.title}
                onChange={(e) =>
                  setCurrentLesson((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., Introduction to React"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-video">Video File *</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-300",
                  currentLesson.video
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-blue-400"
                )}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                {currentLesson.video ? (
                  <div className="space-y-2">
                    <Video className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-green-700">
                      {currentLesson.videoName}
                    </p>
                    <p className="text-xs text-green-600">
                      Click to change video file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Video className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm">Click to upload video</p>
                    <p className="text-xs text-gray-500">
                      MP4, MOV, AVI up to 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lesson-duration"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Duration (minutes) *
              </Label>
              <Input
                id="lesson-duration"
                type="number"
                value={currentLesson.duration}
                onChange={(e) =>
                  setCurrentLesson((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                min="1"
                placeholder="30"
                className="rounded-lg"
              />
            </div>

            <Button
              onClick={addOrUpdateLesson}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
              disabled={
                !currentLesson.title ||
                !currentLesson.video ||
                currentLesson.duration <= 0
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {editingLessonId ? "Update Lesson" : "Add Lesson"}
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
