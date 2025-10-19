
// // pages/courses/[slug]/learn.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import {
//   PlayCircle,
//   Clock,
//   BookOpen,
//   CheckCircle,
//   Lock,
//   Loader2,
//   AlertCircle,
//   ArrowLeft,
//   Download,
//   Award,
// } from "lucide-react";
// import { VideoPlayer } from "@/components/video/VideoPlayer";
// import { getCourse, getCourseLessons } from "@/services/course.service";
// import { enrollmentsService } from "@/services/enrollment.service";
// import { useAuth } from "@/context/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface Lesson {
//   _id: string;
//   title: string;
//   description?: string;
//   video: {
//     url: string;
//     public_id: string;
//     format?: string;
//     bytes?: number;
//   };
//   duration: number;
//   order: number;
//   isPreview: boolean;
//   resources?: Array<{
//     title: string;
//     url: string;
//     type: string;
//   }>;
// }

// interface Course {
//   _id: string;
//   title: string;
//   description: string;
//   thumbnail: string;
//   isFree: boolean;
//   price: number;
//   category?: string;
//   level?: string;
//   instructor?: {
//     name: string;
//     avatar?: string;
//   };
// }

// interface Enrollment {
//   _id: string;
//   student: string;
//   course: Course;
//   completedLessons: string[];
//   progress: number;
//   enrolledAt: string;
//   lastAccessed: string;
// }

// const fadeInUp = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -20 },
// };

// const staggerContainer = {
//   animate: {
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// export default function CourseLearnPage() {
//   const { slug } = useParams();
//   const router = useRouter();
//   const { isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
//   const [showResources, setShowResources] = useState(false);
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const playerRef = useRef<any>(null);

//   // Fetch course, lessons, and enrollment using TanStack Query
//   const { data: course, isLoading: isCourseLoading, error: courseError } = useQuery({
//     queryKey: ["course", slug],
//     queryFn: () => getCourse(slug as string),
//     enabled: !!slug,
//   });

//   const { data: lessons, isLoading: isLessonsLoading, error: lessonsError } = useQuery({
//     queryKey: ["lessons", slug],
//     queryFn: () => getCourseLessons(slug as string),
//     enabled: !!slug,
//   });

//   const { data: enrollmentData, isLoading: isEnrollmentLoading, error: enrollmentError } = useQuery({
//     queryKey: ["enrollment", slug],
//     queryFn: () => enrollmentsService.getEnrollmentByCourse(slug as string),
//     enabled: !!slug && isAuthenticated,
//   });

//   const enrollment = enrollmentData?.data;

//   // Check enrollment status
//   const { data: enrollmentCheck, isLoading: isCheckLoading } = useQuery({
//     queryKey: ["enrollmentCheck", slug],
//     queryFn: () => enrollmentsService.checkEnrollment(slug as string),
//     enabled: !!slug,
//   });

//   // Mutation for marking lesson as completed
//   const markLessonCompletedMutation = useMutation({
//     mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
//       enrollmentsService.markLessonCompleted(courseId, lessonId),
//     onMutate: async ({ lessonId }) => {
//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries({ queryKey: ["enrollment", slug] });

//       // Snapshot the previous enrollment data
//       const previousEnrollment = queryClient.getQueryData(["enrollment", slug]) as { data: Enrollment };

//       // Optimistically update the enrollment
//       if (previousEnrollment && lessons) {
//         const totalLessons = lessons.length;
//         const updatedCompletedLessons = [...(previousEnrollment.data.completedLessons || []), lessonId];
//         const updatedProgress = Math.round((updatedCompletedLessons.length / totalLessons) * 100);

//         queryClient.setQueryData(["enrollment", slug], {
//           ...previousEnrollment,
//           data: {
//             ...previousEnrollment.data,
//             completedLessons: updatedCompletedLessons,
//             progress: updatedProgress,
//             lastAccessed: new Date().toISOString(),
//           },
//         });

//         return { previousEnrollment, lessonId, updatedProgress };
//       }
//     },
//     onSuccess: (result, variables, context) => {
//       if (result.success) {
//         const lessonTitle = lessons?.find((l) => l._id === variables.lessonId)?.title;
//         toast({
//           title: result.message === "Course completed!" ? "Course Completed!" : "Lesson Completed!",
//           description:
//             result.message === "Course completed!"
//               ? `Congratulations! You have completed "${course?.title}".`
//               : `You have completed "${lessonTitle}".`,
//           action: result.message === "Course completed!" ? (
//             <Award className="w-5 h-5 text-yellow-500" />
//           ) : undefined,
//         });

//         // Only select the next lesson if the course is not fully completed
//         if (result.data.progress < 100 && lessons) {
//           const currentLessonIndex = lessons.findIndex((l) => l._id === variables.lessonId);
//           if (currentLessonIndex < lessons.length - 1) {
//             setSelectedLesson(lessons[currentLessonIndex + 1]);
//           }
//         }
//       }
//     },
//     onError: (error: any, variables, context) => {
//       // Revert to previous state on error
//       if (context?.previousEnrollment) {
//         queryClient.setQueryData(["enrollment", slug], context.previousEnrollment);
//       }
//       let errorMessage = error.message || "An error occurred";
//       if (error.message.includes("Lesson not found")) {
//         errorMessage = "This lesson is not available in the course.";
//       } else if (error.message.includes("Enrollment not found")) {
//         errorMessage = "You are not enrolled in this course.";
//       } else if (error.message.includes("Lesson already completed")) {
//         errorMessage = `The lesson "${selectedLesson?.title}" is already marked as completed.`;
//       }
//       toast({
//         variant: "destructive",
//         title: "Failed to mark lesson as completed",
//         description: errorMessage,
//       });
//     },
//     onSettled: () => {
//       setShowCompleteModal(false);
//     },
//   });

//   useEffect(() => {
//     if (!slug) {
//       toast({
//         title: "Error",
//         description: "Invalid course ID",
//         variant: "destructive",
//       });
//       return;
//     }

//     // if (!isAuthenticated) {
//       // router.push(`/auth/signin?redirect=/courses/${slug}/learn`);
//     //   return;
//     // }

//     if (enrollmentCheck && !enrollmentCheck.success) {
//       toast({
//         title: "Error",
//         description: "You are not enrolled in this course.",
//         variant: "destructive",
//       });
//       // router.push(`/courses/${slug}`);
//       return;
//     }

//     // Set initial selected lesson
//     if (lessons && enrollment && !selectedLesson) {
//       const firstIncomplete = lessons.find(
//         (lesson: Lesson) => !enrollment.completedLessons.includes(lesson._id)
//       );
//       setSelectedLesson(firstIncomplete || lessons[0] || null);
//     }

//     // Show course completion toast on initial load if progress is 100%
//     if (enrollment?.progress === 100 && course) {
//       toast({
//         title: "Course Completed!",
//         description: `Congratulations! You have completed "${course.title}".`,
//         action: <Award className="w-5 h-5 text-yellow-500" />,
//       });
//     }
//   }, [slug, isAuthenticated, enrollmentCheck, lessons, enrollment, course, router, toast, selectedLesson]);

//   const handleLessonSelect = (lesson: Lesson) => {
//     if (!isAuthenticated && !lesson.isPreview) {
//       router.push(`/auth/signin?redirect=/courses/${slug}/learn`);
//       return;
//     }
//     setSelectedLesson(lesson);
//     setShowResources(false);
//   };

//   const handleMarkLessonCompleted = (lessonId: string) => {
//     if (isLessonCompleted(lessonId)) {
//       toast({
//         title: "Lesson Already Completed",
//         description: `The lesson "${selectedLesson?.title}" is already marked as completed.`,
//         variant: "default",
//       });
//       return;
//     }
//     setShowCompleteModal(true);
//   };

//   const confirmMarkLessonCompleted = () => {
//     if (!selectedLesson || markLessonCompletedMutation.isPending) return;
//     markLessonCompletedMutation.mutate({ courseId: slug as string, lessonId: selectedLesson._id });
//   };

//   const formatDuration = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const getTotalDuration = (): string => {
//     const totalSeconds = lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0;
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
//   };

//   const isLessonCompleted = (lessonId: string): boolean => {
//     return enrollment?.completedLessons?.includes(lessonId) || false;
//   };

//   const renderVideoPlayer = (lesson: Lesson) => {
//     if (!lesson?.video?.url) {
//       return (
//         <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
//           <div className="text-white text-center">
//             <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//             <p className="text-lg">Video not available</p>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <VideoPlayer
//         url={lesson.video.url}
//         duration={lesson.duration}
//         autoPlay={true}
//         controls={true}
//         muted={false}
//         className="w-full h-full rounded-lg overflow-hidden"
//         playerRef={playerRef}
//         onPlay={() => console.log(`Started playing: ${lesson.title}`)}
//         onPause={() => console.log(`Paused: ${lesson.title}`)}
//         onEnded={() => {
//           console.log(`Completed: ${lesson.title}`);
//           if (!isLessonCompleted(lesson._id)) {
//             handleMarkLessonCompleted(lesson._id);
//           }
//         }}
//       />
//     );
//   };

//   const renderContentPlaceholder = () => {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="aspect-video relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30"
//       >
//         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
//           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//             {enrollment?.progress === 100 ? (
//               <Award className="w-10 h-10 text-yellow-500" />
//             ) : (
//               <PlayCircle className="w-10 h-10 text-primary" />
//             )}
//           </div>
//           <h3 className="text-xl font-semibold mb-2">
//             {enrollment?.progress === 100 ? "Course Completed!" : "Start Learning"}
//           </h3>
//           <p className="text-muted-foreground mb-6 max-w-md">
//             {isCourseLoading || isLessonsLoading || isEnrollmentLoading
//               ? "Loading course content..."
//               : enrollment?.progress === 100
//               ? `Congratulations! You have completed "${course?.title}".`
//               : "Select a lesson from the sidebar to continue your learning journey"}
//           </p>
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <Clock className="w-4 h-4" />
//               {getTotalDuration()} total
//             </div>
//             <div className="flex items-center gap-1">
//               <BookOpen className="w-4 h-4" />
//               {lessons?.length || 0} lessons
//             </div>
//             {enrollment && (
//               <div className="flex items-center gap-1">
//                 <CheckCircle className="w-4 h-4 text-green-600" />
//                 {enrollment.progress || 0}% complete
//               </div>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

//   if (isCourseLoading || isLessonsLoading || isEnrollmentLoading || isCheckLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="text-center"
//         >
//           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
//           <p className="text-muted-foreground">Loading course content...</p>
//         </motion.div>
//       </div>
//     );
//   }

//   if (courseError || lessonsError || enrollmentError) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-4xl mx-auto p-4 sm:p-6"
//       >
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {courseError?.message || lessonsError?.message || enrollmentError?.message || "Failed to load course content"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => router.push(`/courses/${slug}`)}>
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Course
//         </Button>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-background">
//       <div className="flex-1 p-4 sm:p-6">
//         <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <Button variant="ghost" onClick={() => router.push(`/courses/${slug}`)} className="mb-4">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Course
//             </Button>
//             {course?.category && <Badge variant="secondary">{course.category}</Badge>}
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-bold">{course?.title}</h1>
//           <p className="text-muted-foreground mt-2">{course?.description}</p>
//         </motion.div>

//         <div className="mb-6">
//           {selectedLesson ? (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               {renderVideoPlayer(selectedLesson)}
//             </motion.div>
//           ) : (
//             renderContentPlaceholder()
//           )}
//         </div>

//         {selectedLesson && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <h3 className="font-semibold text-lg">{selectedLesson.title}</h3>
//                       {isLessonCompleted(selectedLesson._id) && (
//                         <CheckCircle className="w-5 h-5 text-green-600" />
//                       )}
//                     </div>
//                     <p className="text-muted-foreground mb-3">
//                       {selectedLesson.description || "No description available."}
//                     </p>
//                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                       <div className="flex items-center gap-1">
//                         <Clock className="w-4 h-4" />
//                         {formatDuration(selectedLesson.duration)}
//                       </div>
//                       <span>Lesson {selectedLesson.order}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {selectedLesson.resources && selectedLesson.resources.length > 0 && (
//                       <Button variant="outline" onClick={() => setShowResources(!showResources)}>
//                         <Download className="w-4 h-4 mr-2" />
//                         Resources
//                       </Button>
//                     )}
//                     {!isLessonCompleted(selectedLesson._id) && (
//                       <Button
//                         onClick={() => handleMarkLessonCompleted(selectedLesson._id)}
//                         disabled={markLessonCompletedMutation.isPending || enrollment?.progress === 100}
//                         variant={isLessonCompleted(selectedLesson._id) ? "secondary" : "default"}
//                         className={isLessonCompleted(selectedLesson._id) ? "bg-green-500 hover:bg-green-600 text-white" : ""}
//                       >
//                         {markLessonCompletedMutation.isPending ? (
//                           <>
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                             Updating...
//                           </>
//                         ) : isLessonCompleted(selectedLesson._id) ? (
//                           <>
//                             <CheckCircle className="w-4 h-4 mr-2" />
//                             Completed
//                           </>
//                         ) : (
//                           <>
//                             <PlayCircle className="w-4 h-4 mr-2" />
//                             Mark as Completed
//                           </>
//                         )}
//                       </Button>
//                     )}
//                   </div>
//                 </div>

//                 <AnimatePresence>
//                   {showResources && selectedLesson.resources && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="mt-4 pt-4 border-t"
//                     >
//                       <h4 className="font-medium mb-3">Lesson Resources</h4>
//                       <div className="space-y-2">
//                         {selectedLesson.resources.map((resource, index) => (
//                           <a
//                             key={index}
//                             href={resource.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
//                           >
//                             <span className="text-sm">{resource.title}</span>
//                             <Download className="w-4 h-4 text-muted-foreground" />
//                           </a>
//                         ))}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </CardContent>
//             </Card>

//             <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Mark Lesson as Completed?</DialogTitle>
//                   <DialogDescription>
//                     Are you sure you want to mark "{selectedLesson?.title}" as completed? This action cannot be undone.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <DialogFooter>
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowCompleteModal(false)}
//                     disabled={markLessonCompletedMutation.isPending}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={confirmMarkLessonCompleted}
//                     disabled={markLessonCompletedMutation.isPending}
//                   >
//                     {markLessonCompletedMutation.isPending ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Updating...
//                       </>
//                     ) : (
//                       "Mark as Completed"
//                     )}
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </motion.div>
//         )}
//       </div>

//       <div className="w-full lg:w-80 border-t lg:border-l lg:border-t-0 bg-muted/20 flex flex-col">
//         <div className="p-4 border-b bg-background">
//           <h3 className="font-semibold text-lg mb-2">Course Content</h3>
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <Clock className="w-4 h-4" />
//               {getTotalDuration()}
//             </div>
//             <div className="flex items-center gap-1">
//               <BookOpen className="w-4 h-4" />
//               {lessons?.length || 0} lessons
//             </div>
//             {enrollment && (
//               <div className="flex items-center gap-1">
//                 <CheckCircle className="w-4 h-4 text-green-600" />
//                 {enrollment.progress || 0}%
//               </div>
//             )}
//           </div>
//           {enrollment && (
//             <div className="mt-3">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Course Progress</span>
//                 <span>{enrollment.progress || 0}%</span>
//               </div>
//               <Progress value={enrollment.progress || 0} className="h-2" />
//             </div>
//           )}
//         </div>

//         <div className="flex-1 overflow-y-auto p-4">
//           <motion.div
//             variants={staggerContainer}
//             initial="initial"
//             animate="animate"
//             className="space-y-2"
//           >
//             {lessons?.map((lesson) => (
//               <motion.button
//                 key={lesson._id}
//                 variants={fadeInUp}
//                 className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
//                   selectedLesson?._id === lesson._id
//                     ? "border-primary bg-primary/5 shadow-sm"
//                     : "border-border hover:border-primary/50 hover:bg-accent/50"
//                 } ${!isAuthenticated && !lesson.isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => handleLessonSelect(lesson)}
//                 disabled={!isAuthenticated && !lesson.isPreview}
//               >
//                 <div className="flex items-start gap-3">
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
//                       isLessonCompleted(lesson._id)
//                         ? "bg-green-100 text-green-600"
//                         : "bg-primary/10 text-primary"
//                     }`}
//                   >
//                     {isLessonCompleted(lesson._id) ? (
//                       <CheckCircle className="w-4 h-4" />
//                     ) : !isAuthenticated && !lesson.isPreview ? (
//                       <Lock className="w-4 h-4" />
//                     ) : (
//                       <PlayCircle className="w-4 h-4" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="font-medium text-sm truncate">{lesson.title}</span>
//                       {isLessonCompleted(lesson._id) && (
//                         <Badge variant="secondary" className="text-xs">
//                           Completed
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                       <span>Lesson {lesson.order}</span>
//                       <span>•</span>
//                       <span>{formatDuration(lesson.duration)}</span>
//                       {lesson.resources && lesson.resources.length > 0 && (
//                         <>
//                           <span>•</span>
//                           <Download className="w-3 h-3" />
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </motion.button>
//             ))}
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }


// pages/courses/[slug]/learn.tsx - UPDATED VERSION
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Download,
  Award,
} from "lucide-react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { getCourse, getCourseLessons } from "@/services/course.service";
import { enrollmentsService } from "@/services/enrollment.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  video: {
    url: string;
    public_id: string;
    format?: string;
    bytes?: number;
  };
  duration: number;
  order: number;
  isPreview: boolean;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  isFree: boolean;
  price: number;
  category?: string;
  level?: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
}

interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  completedLessons: string[];
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CourseLearnPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showResources, setShowResources] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const playerRef = useRef<any>(null);

  // Get lesson ID from URL parameters
  const lessonIdFromUrl = searchParams.get('lesson');

  // Fetch course, lessons, and enrollment using TanStack Query
  const { data: course, isLoading: isCourseLoading, error: courseError } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => getCourse(slug as string),
    enabled: !!slug,
  });

  const { data: lessons, isLoading: isLessonsLoading, error: lessonsError } = useQuery({
    queryKey: ["lessons", slug],
    queryFn: () => getCourseLessons(slug as string),
    enabled: !!slug,
  });

  const { data: enrollmentData, isLoading: isEnrollmentLoading, error: enrollmentError } = useQuery({
    queryKey: ["enrollment", slug],
    queryFn: () => enrollmentsService.getEnrollmentByCourse(slug as string),
    enabled: !!slug && isAuthenticated,
  });

  const enrollment = enrollmentData?.data;

  // Check enrollment status
  const { data: enrollmentCheck, isLoading: isCheckLoading } = useQuery({
    queryKey: ["enrollmentCheck", slug],
    queryFn: () => enrollmentsService.checkEnrollment(slug as string),
    enabled: !!slug,
  });

  // Auto-select lesson based on URL parameter or first incomplete lesson
  useEffect(() => {
    if (lessons && enrollment) {
      let lessonToSelect: Lesson | null = null;

      // 1. Try to find lesson from URL parameter
      if (lessonIdFromUrl) {
        lessonToSelect = lessons.find((lesson: Lesson) => lesson._id === lessonIdFromUrl) || null;
      }

      // 2. If no lesson from URL, find first incomplete lesson
      if (!lessonToSelect) {
        lessonToSelect = lessons.find(
          (lesson: Lesson) => !enrollment.completedLessons.includes(lesson._id)
        ) || null;
      }

      // 3. Fallback to first lesson
      if (!lessonToSelect && lessons.length > 0) {
        lessonToSelect = lessons[0];
      }

      setSelectedLesson(lessonToSelect);
    }
  }, [lessons, enrollment, lessonIdFromUrl]);

  // Update URL when selected lesson changes (without page reload)
  useEffect(() => {
    if (selectedLesson && slug) {
      const newUrl = `/courses/${slug}/learn?lesson=${selectedLesson._id}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedLesson, slug]);

  // Mutation for marking lesson as completed
  const markLessonCompletedMutation = useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      enrollmentsService.markLessonCompleted(courseId, lessonId),
    onMutate: async ({ lessonId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["enrollment", slug] });

      // Snapshot the previous enrollment data
      const previousEnrollment = queryClient.getQueryData(["enrollment", slug]) as { data: Enrollment };

      // Optimistically update the enrollment
      if (previousEnrollment && lessons) {
        const totalLessons = lessons.length;
        const updatedCompletedLessons = [...(previousEnrollment.data.completedLessons || []), lessonId];
        const updatedProgress = Math.round((updatedCompletedLessons.length / totalLessons) * 100);

        queryClient.setQueryData(["enrollment", slug], {
          ...previousEnrollment,
          data: {
            ...previousEnrollment.data,
            completedLessons: updatedCompletedLessons,
            progress: updatedProgress,
            lastAccessed: new Date().toISOString(),
          },
        });

        return { previousEnrollment, lessonId, updatedProgress };
      }
    },
    onSuccess: (result, variables, context) => {
      if (result.success) {
        const lessonTitle = lessons?.find((l) => l._id === variables.lessonId)?.title;
        toast({
          title: result.message === "Course completed!" ? "Course Completed!" : "Lesson Completed!",
          description:
            result.message === "Course completed!"
              ? `Congratulations! You have completed "${course?.title}".`
              : `You have completed "${lessonTitle}".`,
          action: result.message === "Course completed!" ? (
            <Award className="w-5 h-5 text-yellow-500" />
          ) : undefined,
        });

        // Auto-advance to next lesson if not completed
        if (result.data.progress < 100 && lessons) {
          const currentLessonIndex = lessons.findIndex((l) => l._id === variables.lessonId);
          if (currentLessonIndex < lessons.length - 1) {
            const nextLesson = lessons[currentLessonIndex + 1];
            setSelectedLesson(nextLesson);
          }
        }
      }
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(["enrollment", slug], context.previousEnrollment);
      }
      let errorMessage = error.message || "An error occurred";
      if (error.message.includes("Lesson not found")) {
        errorMessage = "This lesson is not available in the course.";
      } else if (error.message.includes("Enrollment not found")) {
        errorMessage = "You are not enrolled in this course.";
      } else if (error.message.includes("Lesson already completed")) {
        errorMessage = `The lesson "${selectedLesson?.title}" is already marked as completed.`;
      }
      toast({
        variant: "destructive",
        title: "Failed to mark lesson as completed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setShowCompleteModal(false);
    },
  });

  useEffect(() => {
    if (!slug) {
      toast({
        title: "Error",
        description: "Invalid course ID",
        variant: "destructive",
      });
      return;
    }

    if (enrollmentCheck && !enrollmentCheck.success) {
      toast({
        title: "Error",
        description: "You are not enrolled in this course.",
        variant: "destructive",
      });
      return;
    }

    // Show course completion toast on initial load if progress is 100%
    if (enrollment?.progress === 100 && course) {
      toast({
        title: "Course Completed!",
        description: `Congratulations! You have completed "${course.title}".`,
        action: <Award className="w-5 h-5 text-yellow-500" />,
      });
    }
  }, [slug, isAuthenticated, enrollmentCheck, lessons, enrollment, course, router, toast]);

  const handleLessonSelect = (lesson: Lesson) => {
    if (!isAuthenticated && !lesson.isPreview) {
      router.push(`/auth/signin?redirect=/courses/${slug}/learn`);
      return;
    }
    setSelectedLesson(lesson);
    setShowResources(false);
  };

  const handleMarkLessonCompleted = (lessonId: string) => {
    if (isLessonCompleted(lessonId)) {
      toast({
        title: "Lesson Already Completed",
        description: `The lesson "${selectedLesson?.title}" is already marked as completed.`,
        variant: "default",
      });
      return;
    }
    setShowCompleteModal(true);
  };

  const confirmMarkLessonCompleted = () => {
    if (!selectedLesson || markLessonCompletedMutation.isPending) return;
    markLessonCompletedMutation.mutate({ courseId: slug as string, lessonId: selectedLesson._id });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getTotalDuration = (): string => {
    const totalSeconds = lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return enrollment?.completedLessons?.includes(lessonId) || false;
  };

  const isCurrentLesson = (lessonId: string): boolean => {
    return selectedLesson?._id === lessonId;
  };

  const renderVideoPlayer = (lesson: Lesson) => {
    if (!lesson?.video?.url) {
      return (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Video not available</p>
          </div>
        </div>
      );
    }

    return (
      <VideoPlayer
        url={lesson.video.url}
        duration={lesson.duration}
        autoPlay={true}
        controls={true}
        muted={false}
        className="w-full h-full rounded-lg overflow-hidden"
        playerRef={playerRef}
        onPlay={() => console.log(`Started playing: ${lesson.title}`)}
        onPause={() => console.log(`Paused: ${lesson.title}`)}
        onEnded={() => {
          console.log(`Completed: ${lesson.title}`);
          if (!isLessonCompleted(lesson._id)) {
            handleMarkLessonCompleted(lesson._id);
          }
        }}
      />
    );
  };

  const renderContentPlaceholder = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="aspect-video relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {enrollment?.progress === 100 ? (
              <Award className="w-10 h-10 text-yellow-500" />
            ) : (
              <PlayCircle className="w-10 h-10 text-primary" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {enrollment?.progress === 100 ? "Course Completed!" : "Start Learning"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isCourseLoading || isLessonsLoading || isEnrollmentLoading
              ? "Loading course content..."
              : enrollment?.progress === 100
              ? `Congratulations! You have completed "${course?.title}".`
              : "Select a lesson from the sidebar to continue your learning journey"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTotalDuration()} total
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {lessons?.length || 0} lessons
            </div>
            {enrollment && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {enrollment.progress || 0}% complete
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isCourseLoading || isLessonsLoading || isEnrollmentLoading || isCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
        </motion.div>
      </div>
    );
  }

  if (courseError || lessonsError || enrollmentError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 sm:p-6"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {courseError?.message || lessonsError?.message || enrollmentError?.message || "Failed to load course content"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push(`/courses/${slug}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <div className="flex-1 p-4 sm:p-6">
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => router.push(`/courses/${slug}`)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            {course?.category && <Badge variant="secondary">{course.category}</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{course?.title}</h1>
          <p className="text-muted-foreground mt-2">{course?.description}</p>
        </motion.div>

        <div className="mb-6">
          {selectedLesson ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderVideoPlayer(selectedLesson)}
            </motion.div>
          ) : (
            renderContentPlaceholder()
          )}
        </div>

        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{selectedLesson.title}</h3>
                      {isLessonCompleted(selectedLesson._id) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {/* Current Lesson Badge */}
                      <Badge variant="default" className="bg-blue-500 text-white">
                        Current Lesson
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {selectedLesson.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(selectedLesson.duration)}
                      </div>
                      <span>Lesson {selectedLesson.order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                      <Button variant="outline" onClick={() => setShowResources(!showResources)}>
                        <Download className="w-4 h-4 mr-2" />
                        Resources
                      </Button>
                    )}
                    {!isLessonCompleted(selectedLesson._id) && (
                      <Button
                        onClick={() => handleMarkLessonCompleted(selectedLesson._id)}
                        disabled={markLessonCompletedMutation.isPending || enrollment?.progress === 100}
                        variant={isLessonCompleted(selectedLesson._id) ? "secondary" : "default"}
                        className={isLessonCompleted(selectedLesson._id) ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                      >
                        {markLessonCompletedMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : isLessonCompleted(selectedLesson._id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Mark as Completed
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showResources && selectedLesson.resources && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <h4 className="font-medium mb-3">Lesson Resources</h4>
                      <div className="space-y-2">
                        {selectedLesson.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <span className="text-sm">{resource.title}</span>
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Lesson as Completed?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to mark "{selectedLesson?.title}" as completed? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompleteModal(false)}
                    disabled={markLessonCompletedMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmMarkLessonCompleted}
                    disabled={markLessonCompletedMutation.isPending}
                  >
                    {markLessonCompletedMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Mark as Completed"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </div>

      <div className="w-full lg:w-80 border-t lg:border-l lg:border-t-0 bg-muted/20 flex flex-col">
        <div className="p-4 border-b bg-background">
          <h3 className="font-semibold text-lg mb-2">Course Content</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTotalDuration()}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {lessons?.length || 0} lessons
            </div>
            {enrollment && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {enrollment.progress || 0}%
              </div>
            )}
          </div>
          {enrollment && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Course Progress</span>
                <span>{enrollment.progress || 0}%</span>
              </div>
              <Progress value={enrollment.progress || 0} className="h-2" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {lessons?.map((lesson) => (
              <motion.button
                key={lesson._id}
                variants={fadeInUp}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  isCurrentLesson(lesson._id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md ring-2 ring-blue-500 ring-opacity-20"
                    : selectedLesson?._id === lesson._id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                } ${!isAuthenticated && !lesson.isPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handleLessonSelect(lesson)}
                disabled={!isAuthenticated && !lesson.isPreview}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isLessonCompleted(lesson._id)
                        ? "bg-green-100 text-green-600"
                        : isCurrentLesson(lesson._id)
                        ? "bg-blue-100 text-blue-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isLessonCompleted(lesson._id) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : !isAuthenticated && !lesson.isPreview ? (
                      <Lock className="w-4 h-4" />
                    ) : isCurrentLesson(lesson._id) ? (
                      <PlayCircle className="w-4 h-4 fill-blue-600 text-blue-600" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{lesson.title}</span>
                      {isLessonCompleted(lesson._id) && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                      {isCurrentLesson(lesson._id) && (
                        <Badge variant="default" className="bg-blue-500 text-white text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Lesson {lesson.order}</span>
                      <span>•</span>
                      <span>{formatDuration(lesson.duration)}</span>
                      {lesson.resources && lesson.resources.length > 0 && (
                        <>
                          <span>•</span>
                          <Download className="w-3 h-3" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}