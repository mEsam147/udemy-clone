

"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Star,
  Clock,
  Users,
  Globe,
  Award,
  Play,
  Download,
  Share2,
  Heart,
  ChevronDown,
  CheckCircle,
  Lock,
  Loader2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Target,
  X,
} from "lucide-react";
import { VideoPlayer } from "@/components/courses/video-player";
import { CourseReviews } from "@/components/courses/course-reviews";
import { ReviewAnalytics } from "@/components/courses/review-analytics";
import type { Course, Review, CourseLesson, Enrollment } from "@/lib/types";
import { useCourseReviews, useWishlistActions } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/payment.service";
import { enrollmentsService } from "@/services/enrollment.service";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Animation variants
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

interface CourseDetailPageProps {
  slug: string;
  initialCourse: Course | null;
  initialReviews: Review[];
}

export default function CourseDetailPage({
  slug,
  initialCourse,
  initialReviews,
}: CourseDetailPageProps) {
  const t = useTranslations("courses");
  const locale = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const {user} = useAuth()

  console.log("initCourse", initialCourse);
  console.log("initialReviews", initialReviews);

  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    enrollment?: Enrollment;
  }>({ isEnrolled: false });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [currentPreviewLesson, setCurrentPreviewLesson] = useState<CourseLesson | null>(null);

  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);

  // Use initialCourse directly
  const course = initialCourse;

  // Fetch reviews data with initial data
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useCourseReviews({
    courseId: course?.id || "",
    enabled: !!course?.id,
    initialData: {
      reviews: initialReviews,
      averageRating: initialCourse?.ratings?.average || 0,
      totalRatings: initialCourse?.ratings?.count || 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
  });
  console.log("courseId data", course);
  console.log("reviewsData", reviewsData);

  // Extract reviews data
  const reviews: Review[] = reviewsData?.reviews || initialReviews || [];
  const averageRatingFromReviews: number =
    reviewsData?.averageRating || course?.ratings?.average || 0;
  const totalRatings: number =
    reviewsData?.totalRatings || course?.ratings?.count || 0;
  const ratingDistribution = reviewsData?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  // Check Enrollment Status
  useEffect(() => {
    if (course?.id) {
      setIsCheckingEnrollment(true);
      enrollmentsService
        .checkEnrollment(course.id)
        .then((response) => {
          console.log("Enrollment response:", response);

          // Fix: Check both response.success AND response.data.isEnrolled
          const isEnrolled = response?.success && response?.data?.isEnrolled === true;

          setEnrollmentStatus({
            isEnrolled: isEnrolled,
            enrollment: isEnrolled ? {
              ...response.data,
              completedLessons: response.data.completedLessons || [],
            } : undefined,
          });
        })
        .catch((error) => {
          console.error("Failed to check enrollment:", error);
          setEnrollmentStatus({ isEnrolled: false });
        })
        .finally(() => {
          setIsCheckingEnrollment(false);
        });
    }
  }, [course?.id]);


  // Wishlist functionality
const {
  isInWishlist,
  toggleWishlist,
  isLoading: wishlistLoading,
  wishlistCount = 0,
} = useWishlistActions(course?.id!);



  // Handle errors
  useEffect(() => {
    if (reviewsError) {
      console.error("Failed to load reviews:", reviewsError);
      toast({
        title: "Error loading reviews",
        description: "Could not load course reviews. Please try again.",
        variant: "destructive",
      });
    }
  }, [reviewsError, toast]);

  // Handle enrollment success
  const handleEnrollSuccess = (): void => {
    setEnrollmentStatus((prev) => ({
      ...prev,
      isEnrolled: true,
    }));
    toast({
      title: "🎉 Success!",
      description: "You have successfully enrolled in this course.",
    });
  };

  const handleEnrollError = (error: Error | unknown): void => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "There was an error enrolling in this course.";
    toast({
      title: "Enrollment Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Handle wishlist toggle with animation
// components/courses/course-detail-page.tsx - FIXED HANDLER
const handleWishlistToggle = async (): Promise<void> => {
  if (!course?.id) return;

  if (!user) {
    router.push('/auth/signin');
    return;
  }

  console.log("Toggling wishlist. Current state:", isInWishlist);
  console.log("course from det", course);

  try {
    // Use the current state to determine the action
    const currentState = isInWishlist;

    await toggleWishlist();

    // Show toast based on the action that was just performed (opposite of current state)
    toast({
      title: currentState
        ? "❤️ Removed from Wishlist"
        : "💝 Added to Wishlist",
      description: currentState
        ? "Course removed from your wishlist"
        : "Course added to your wishlist",
      duration: 3000,
    });
  } catch (error) {
    console.error("Wishlist toggle failed:", error);
    toast({
      title: "Error",
      description: "Failed to update wishlist. Please try again.",
      variant: "destructive",
    });
  }
};
  // Handle share functionality
  const handleShare = async (): Promise<void> => {
    if (!course) return;

    const shareUrl = `${window.location.origin}/${locale}/courses/${course.slug}`;
    const shareText = `${course.title} - ${course.subtitle || ""}`;

    try {
      if (
        navigator.share &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        await navigator.share({
          title: course.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toast({
          title: "🔗 Link Copied!",
          description: "Course link has been copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Share this course",
        description: shareUrl,
        duration: 5000,
      });
    }
  };

  // Handle purchase/enrollment
  const handlePurchase = async (): Promise<void> => {

    if (!course) return;

    setIsPurchasing(true);

    if (!user) {
      router.push(`/auth/signin`);
      return;
    }

    try {
      if (course.price === 0) {
        // Free course - direct enrollment
        const response = await enrollmentsService.enrollInCourse(course.id);
        if (response?.success) {
          handleEnrollSuccess();
        } else {
          throw new Error("Failed to enroll in free course");
        }
      } else {
        // Paid course - Stripe checkout
        const { sessionId } = await paymentService.createCheckoutSession({
          courseId: course.id,
        });

        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          });

          if (error) {
            throw new Error(error.message);
          }
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
      handleEnrollError(error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const toggleSection = (sectionId: string): void => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Handle lesson click - show preview modal for non-enrolled users
  // const handleLessonClick = (lesson: CourseLesson) => {
  //   if (enrollmentStatus.isEnrolled) {
  //     // Navigate to the learn page for enrolled users
  //     router.push(`/courses/${course?.id}/learn?lesson=${lesson._id}`);
  //   } else if (lesson.isPreview) {
  //     // Show preview modal for non-enrolled users
  //     setCurrentPreviewLesson(lesson);
  //     setIsPreviewModalOpen(true);
  //   } else {
  //     // Show enrollment prompt for non-preview lessons
  //     toast({
  //       title: "Enrollment Required",
  //       description: "Please enroll in the course to access this lesson.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleLessonClick = (lesson: CourseLesson) => {


  if (user) {
    // User is authenticated, handle the lesson click as before
    if (enrollmentStatus.isEnrolled) {
      // Navigate to the learn page for enrolled users
      router.push(`/courses/${course?.id}/learn?lesson=${lesson._id}`);
    } else if (lesson.isPreview) {
      // Show preview modal for non-enrolled users
      setCurrentPreviewLesson(lesson);
      setIsPreviewModalOpen(true);
    } else {
      // Show enrollment prompt for non-preview lessons
      toast({
        title: "Enrollment Required",
        description: "Please enroll in the course to access this lesson.",
        variant: "destructive",
      });
    }
  } else {
    // User is not authenticated, navigate to the signin page
    router.push('/auth/signin');
  }
};
  // Handle preview modal close
  const handlePreviewModalClose = () => {
    setIsPreviewModalOpen(false);
    setCurrentPreviewLesson(null);
  };

  // Handle enroll from preview modal
  const handleEnrollFromPreview = () => {
    handlePreviewModalClose();
    handlePurchase();
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes <= 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const totalDurationMinutes: number =
    course?.lessons?.reduce(
      (total: number, lesson: CourseLesson) => total + (lesson.duration || 0),
      0
    ) || 0;

  const previewLesson: CourseLesson | undefined = course?.lessons?.find(
    (lesson: CourseLesson) => lesson.isPreview
  );

  // Loading state
  if (reviewsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4 mb-4 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-1/2 mb-8" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 bg-muted rounded w-20 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="h-96 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-12 text-center"
      >
        <div className="max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold mb-4 text-destructive">
              Course Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild size="lg">
              <a href={`/${locale}/courses`}>
                <Sparkles className="h-4 w-4 mr-2" />
                Browse All Courses
              </a>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  console.log("status enroll ", enrollmentStatus);

  const progressPercentage = enrollmentStatus.enrollment?.progress || 0;
  const progressText =
    progressPercentage > 0
      ? `${progressPercentage}% complete`
      : "Start learning";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm font-medium bg-primary/10 border-primary/20"
            >
              {course.category}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {course.level}
            </Badge>
            {course.isFeatured && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </motion.div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-balance"
          >
            {course.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed"
          >
            {course.subtitle}
          </motion.p>

          {/* Enhanced Course Stats */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-wrap items-center gap-6"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border"
            >
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-semibold">
                {averageRatingFromReviews.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({totalRatings.toLocaleString()} reviews)
              </span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">
                {(course.studentsEnrolled || 0).toLocaleString()}
              </span>
              <span className="text-muted-foreground">students</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border"
            >
              <Clock className="h-5 w-5 text-green-500" />
              <span className="font-semibold">
                {formatDuration(totalDurationMinutes)}
              </span>
              <span className="text-muted-foreground">total</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border"
            >
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{course.language}</span>
              <span className="text-muted-foreground">language</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <VideoPlayer
                  videoUrl={
                    enrollmentStatus.isEnrolled
                      ? (course.lessons?.[0] as CourseLesson)?.videoUrl || ""
                      : previewLesson?.videoUrl || ""
                  }
                  thumbnailUrl={course.image}
                  title={course.title}
                  isPreview={!enrollmentStatus.isEnrolled}
                />
              </div>
              {!enrollmentStatus.isEnrolled && previewLesson && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-4 right-4"
                >
                  <Badge className="bg-primary text-primary-foreground backdrop-blur-sm px-3 py-1">
                    <Play className="h-3 w-3 mr-1" />
                    Preview Available
                  </Badge>
                </motion.div>
              )}
            </motion.div>

            {/* Course Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50 rounded-xl">
                  {[
                    { value: "overview", label: "Overview", icon: BookOpen },
                    { value: "curriculum", label: "Curriculum", icon: Target },
                    { value: "instructor", label: "Instructor", icon: Users },
                    { value: "reviews", label: "Reviews", icon: Star },
                  ].map((tab, index) => (
                    <TabsTrigger
                      key={`${tab.value}-${index}`}
                      value={tab.value}
                      className="relative rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="overview" className="mt-6">
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* What You'll Learn */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <Target className="h-6 w-6 text-primary" />
                          What You'll Learn
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {course.whatYoullLearn &&
                          course.whatYoullLearn.length > 0 ? (
                            course.whatYoullLearn
                              .filter(
                                (item: string) => item && item.trim() !== ""
                              )
                              .map((item: string, index: number) => (
                                <motion.div
                                  key={`whatYoullLearn-${index}-${item.slice(
                                    0,
                                    10
                                  )}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary border"
                                >
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm font-medium">
                                    {item}
                                  </span>
                                </motion.div>
                              ))
                          ) : (
                            <p className="text-muted-foreground col-span-full">
                              No learning objectives available
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <Separator />

                      {/* Course Description */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold mb-6">
                          Course Description
                        </h3>
                        <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                course.description || "No description available.",
                            }}
                          />
                        </div>
                      </motion.div>

                      <Separator />

                      {/* Requirements */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold mb-6">Requirements</h3>
                        <div className="grid gap-3">
                          {course.requirements &&
                          course.requirements.length > 0 ? (
                            course.requirements
                              .filter(
                                (item: string) => item && item.trim() !== ""
                              )
                              .map((requirement: string, index: number) => (
                                <motion.div
                                  key={`requirement-${index}-${requirement.slice(
                                    0,
                                    10
                                  )}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary border"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  <span className="text-sm">{requirement}</span>
                                </motion.div>
                              ))
                          ) : (
                            <p className="text-muted-foreground">
                              No specific requirements
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-6">
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">Course Content</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {course.lessons?.length || 0} lessons •{" "}
                            {formatDuration(totalDurationMinutes)}
                          </span>
                          {enrollmentStatus.isEnrolled && (
                            <Badge
                              variant="secondary"
                              className="text-primary font-medium"
                            >
                              {progressText}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {enrollmentStatus.isEnrolled && progressPercentage > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between text-sm">
                            <span>Your Progress</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </motion.div>
                      )}

                      <Card className="overflow-hidden border shadow-lg">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-all duration-300 bg-muted"
                          onClick={() => toggleSection("lessons")}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-primary" />
                              Course Curriculum
                            </CardTitle>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {course.lessons?.length || 0} lessons
                              </span>
                              <motion.div
                                animate={{
                                  rotate: expandedSections.has("lessons")
                                    ? 180
                                    : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </motion.div>
                            </div>
                          </div>
                        </CardHeader>
                        <AnimatePresence>
                          {expandedSections.has("lessons") && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  {course.lessons && course.lessons.length > 0 ? (
                                    course.lessons.map(
                                      (lesson: CourseLesson, index: number) => {
                                        const isCompleted =
                                          enrollmentStatus.isEnrolled &&
                                          enrollmentStatus.enrollment?.completedLessons?.includes?.(
                                            lesson._id
                                          ) === true;
                                        return (
                                          <motion.div
                                            key={lesson._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                                              enrollmentStatus.isEnrolled
                                                ? "cursor-pointer hover:bg-muted hover:shadow-md hover:scale-[1.02]"
                                                : lesson.isPreview
                                                ? "cursor-pointer hover:bg-muted hover:shadow-md"
                                                : "opacity-60"
                                            } ${
                                              isCompleted
                                                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 shadow-sm"
                                                : "bg-background"
                                            }`}
                                            onClick={() => handleLessonClick(lesson)}
                                          >
                                            <div className="flex items-center gap-4 flex-1">
                                              <div className="flex-shrink-0">
                                                {isCompleted ? (
                                                  <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center"
                                                  >
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                  </motion.div>
                                                ) : enrollmentStatus.isEnrolled ||
                                                  lesson.isPreview ? (
                                                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                                                    <Play className="h-3 w-3 text-white" />
                                                  </div>
                                                ) : (
                                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <span className="text-sm font-medium block">
                                                  {lesson.title}
                                                </span>
                                                {lesson.isPreview &&
                                                  !enrollmentStatus.isEnrolled && (
                                                    <Badge
                                                      variant="outline"
                                                      className="mt-1 text-xs"
                                                    >
                                                      Preview
                                                    </Badge>
                                                  )}
                                              </div>
                                              {isCompleted && (
                                                <Badge
                                                  variant="secondary"
                                                  className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                >
                                                  Completed
                                                </Badge>
                                              )}
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                              {formatDuration(
                                                lesson.duration || 0
                                              )}
                                            </span>
                                          </motion.div>
                                        );
                                      }
                                    )
                                  ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                      <p>No lessons available yet</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="instructor" className="mt-6">
                    <motion.div
                      key="instructor"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden border shadow-lg">
                        <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row items-start gap-6">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage
                                  src={
                                    course.instructor?.avatar ||
                                    "/placeholder.svg"
                                  }
                                  alt={course.instructor?.name || "Instructor"}
                                />
                                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                  {course.instructor?.name
                                    ?.split(" ")
                                    ?.map((n: string) => n[0])
                                    ?.join("")
                                    .toUpperCase() || "IN"}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div className="flex-1 space-y-4">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <h3 className="text-2xl font-bold">
                                  {course.instructor?.name ||
                                    "Unknown Instructor"}
                                </h3>
                                <p className="text-muted-foreground mt-2 leading-relaxed">
                                  {course.instructor?.bio || "No bio available"}
                                </p>
                              </motion.div>
                              {course.instructor?.expertise &&
                                course.instructor.expertise.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {course.instructor.expertise.map(
                                      (exp: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                        >
                                          {exp}
                                        </Badge>
                                      )
                                    )}
                                  </motion.div>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-6">
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourseReviews
                        courseId={course.id}
                        reviews={reviews}
                        averageRating={averageRatingFromReviews}
                        totalRatings={totalRatings}
                        ratingDistribution={ratingDistribution}
                      />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="sticky top-8 space-y-6"
            >
              {/* Course Info Card */}
              <Card className="border shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  {/* Price Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mb-8"
                  >
                    {course.price && course.price > 0 ? (
                      <>
                        <div className="text-4xl font-bold text-primary mb-2">
                          ${course.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          One-time payment • Lifetime access
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          Free
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Enroll now and start learning
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Action Button */}
                  {enrollmentStatus.isEnrolled ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-4 mb-6"
                    >
                      <Button
                        className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg"
                        asChild
                      >
                        <a href={`/courses/${course.id}/learn`}>
                          <Play className="h-5 w-5 mr-2" />
                          Continue Learning
                        </a>
                      </Button>
                      {progressPercentage > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="text-center space-y-2"
                        >
                          <div className="text-sm text-muted-foreground">
                            {progressText}
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mb-6"
                    >
                      <Button
                        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : course.price && course.price > 0 ? (
                          `Enroll for $${course.price.toFixed(2)}`
                        ) : (
                          <>
                            <TrendingUp className="h-5 w-5 mr-2" />
                            {t("enroll_now") || "Enroll Now"}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Enhanced Secondary Actions */}
                  {!enrollmentStatus.isEnrolled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-4 mb-8"
                    >
                      {/* Wishlist Button */}
                      <Button
                        variant={isInWishlist ? "secondary" : "outline"}
                        size="lg"
                        className="w-full justify-start group h-12 transition-all duration-300 cursor-pointer"
                        onClick={handleWishlistToggle}
                        disabled={wishlistLoading}
                      >
                        <motion.div
                          animate={{ scale: isInWishlist ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            className={`h-5 w-5 mr-3 transition-all duration-300 ${
                              isInWishlist
                                ? "fill-destructive text-destructive"
                                : "text-muted-foreground group-hover:text-destructive group-hover:fill-destructive"
                            }`}
                          />
                        </motion.div>
                        {wishlistLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isInWishlist ? "Removing..." : "Adding..."}
                          </>
                        ) : isInWishlist ? (
                          <span className="flex items-center">
                            Remove from Wishlist
                            {wishlistCount > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({wishlistCount})
                              </span>
                            )}
                          </span>
                        ) : (
                          "Add to Wishlist"
                        )}
                      </Button>

                      {/* Share Button */}
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start group h-12 transition-all duration-300"
                        onClick={handleShare}
                        disabled={isCopied}
                      >
                        <Share2
                          className={`h-5 w-5 mr-3 transition-colors ${
                            isCopied
                              ? "text-green-500"
                              : "text-muted-foreground group-hover:text-primary"
                          }`}
                        />
                        {isCopied ? (
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Copied to clipboard!
                          </span>
                        ) : (
                          "Share Course"
                        )}
                      </Button>

                      {/* Quick Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="pt-4 border-t border-border"
                      >
                        <ReviewAnalytics
                          averageRating={averageRatingFromReviews}
                          totalRatings={totalRatings}
                          ratingDistribution={ratingDistribution}
                          className="space-y-4"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Course Includes */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="space-y-6"
                  >
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground text-center">
                      This course includes
                    </h4>
                    <div className="space-y-4 text-sm">
                      {[
                        {
                          icon: Play,
                          text: `${
                            course.lessons?.length || 0
                          } hours on-demand video`,
                          color: "text-blue-500",
                        },
                        {
                          icon: Download,
                          text: "Downloadable resources",
                          color: "text-green-500",
                        },
                        {
                          icon: Award,
                          text: "Certificate of completion",
                          color: "text-yellow-500",
                        },
                        {
                          icon: Globe,
                          text: "Lifetime access",
                          color: "text-purple-500",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-secondary border"
                        >
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                          <span className="font-medium">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <Separator className="my-8" />

                  {/* Guarantee */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-center space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-green-500" />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 text-blue-500" />
                      <span>Full Lifetime Access</span>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Preview Lesson Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl min-w-6xl w-full h-[90vh] p-0 overflow-y-auto custom-scrollbar-thin">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="flex-shrink-0 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {currentPreviewLesson?.title}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1">
                    Preview Lesson • {formatDuration(currentPreviewLesson?.duration || 0)}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviewModalClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Video Player */}
            <div className="flex-1 bg-black">
              {currentPreviewLesson && (
                <VideoPlayer
                  videoUrl={currentPreviewLesson.videoUrl}
                  thumbnailUrl={course.image}
                  title={currentPreviewLesson.title}
                  isPreview={true}
                  className="h-full w-full"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t bg-background">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">
                    Ready to continue learning?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Enroll now to get full access to all {course.lessons?.length || 0} lessons,
                    downloadable resources, and a certificate of completion.
                  </p>
                </div>
                <div className="flex gap-3 ml-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviewModalClose}
                  >
                    Continue Preview
                  </Button>
                  <Button
                    onClick={handleEnrollFromPreview}
                    disabled={isPurchasing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : course.price && course.price > 0 ? (
                      `Enroll for $${course.price.toFixed(2)}`
                    ) : (
                      "Enroll for Free"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
