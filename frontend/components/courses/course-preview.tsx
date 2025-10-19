// components/courses/course-preview.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Lock, Clock, BookOpen, X, Loader2, CheckCircle } from "lucide-react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { getCourseLessons } from "@/services/course.service";
import { enrollmentsService } from "@/services/enrollment.service";
import { paymentService } from "@/services/payment.service";
import ReactPlayer from "react-player";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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

interface CoursePreviewProps {
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  totalDuration: string;
  totalLectures: number;
  price?: number;
  isFree?: boolean;
}

export function CoursePreview({
  courseId,
  title,
  description,
  thumbnail,
  totalDuration,
  totalLectures,
  price = 0,
  isFree = false,
}: CoursePreviewProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    isLoading: boolean;
    enrollmentData?: any;
  }>({ isEnrolled: false, isLoading: true });

  const playerRef = useRef<ReactPlayer>(null);


  console.log("desc" , description)
  // Fetch lessons and check enrollment when dialog opens
  useEffect(() => {
    if (isOpen && courseId) {
      fetchLessons();
      checkEnrollmentStatus();
    }
  }, [isOpen, courseId]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCourseLessons(courseId);
      const lessonsData = Array.isArray(response) ? response : response.data || [];
      setLessons(lessonsData);

      // Auto-select the first previewable lesson
      const firstPreview = lessonsData.find((lesson: Lesson) => lesson.isPreview) || lessonsData[0];
      setSelectedLesson(firstPreview || null);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setError("Failed to load course content");
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated) {
      setEnrollmentStatus({ isEnrolled: false, isLoading: false });
      return;
    }

    try {
      setEnrollmentStatus((prev) => ({ ...prev, isLoading: true }));
      const enrollmentCheck = await enrollmentsService.checkEnrollment(courseId);
      const enrollmentData = await enrollmentsService.getEnrollmentByCourse(courseId);

      setEnrollmentStatus({
        isEnrolled: enrollmentCheck.data?.isEnrolled || false,
        isLoading: false,
        enrollmentData: enrollmentData.data,
      });
    } catch (err) {
      console.error("Error checking enrollment:", err);
      setEnrollmentStatus({ isEnrolled: false, isLoading: false });
    }
  };

  const handleStartPreview = () => {
    setIsOpen(true);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.isPreview || enrollmentStatus.isEnrolled) {
      setSelectedLesson(lesson);
    }
  };

  const handleEnrollClick = async () => {
    // Validate courseId
    if (!courseId || courseId === "undefined") {
      setError("Invalid course ID");
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: "Invalid course ID",
      });
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/courses/${courseId}&action=enroll`);
      return;
    }

    // If already enrolled, redirect to course player
    if (enrollmentStatus.isEnrolled) {
      router.push(`/courses/${courseId}/learn`);
      return;
    }

    // Handle purchase (free or paid course)
    await handlePurchase();
  };

  const handlePurchase = async (): Promise<void> => {
    if (enrollmentStatus.isEnrolled) {
      router.push(`/courses/${courseId}/learn`);
      return;
    }

    setIsEnrolling(true);
    try {
      if (isFree || price === 0) {
        // Enroll in free course
        const result = await enrollmentsService.enrollInCourse(courseId);
        if (result.success) {
          await checkEnrollmentStatus();
          toast({
            title: "Successfully enrolled!",
            description: "You have been enrolled in the course.",
          });
          setTimeout(() => {
            router.push(`/courses/${courseId}/learn`);
          }, 1500);
        } else {
          throw new Error(result.message || "Failed to enroll");
        }
      } else {
        // Create checkout session for paid course
        const { sessionId } = await paymentService.createCheckoutSession({
          courseId,
        });

        // Redirect to Stripe Checkout
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
        } else {
          throw new Error("Failed to initialize Stripe");
        }
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setError(error.message || "Failed to enroll in the course");
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "Failed to enroll in the course",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getTotalDuration = (): string => {
    const totalSeconds = lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getPreviewLessonsCount = (): number => {
    return lessons.filter((lesson) => lesson.isPreview).length;
  };

  const renderVideoPlayer = (lesson: Lesson) => {
    if (!lesson.video?.url) {
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
        className="w-full h-full"
        playerRef={playerRef}
        onPlay={() => console.log(`Started playing: ${lesson.title}`)}
        onPause={() => console.log(`Paused: ${lesson.title}`)}
        onEnded={() => {
          console.log(`Completed: ${lesson.title}`);
          if (enrollmentStatus.isEnrolled && !lesson.isPreview) {
            handleMarkLessonCompleted(lesson._id);
          }
        }}
      />
    );
  };

  const handleMarkLessonCompleted = async (lessonId: string) => {
    try {
      const result = await enrollmentsService.markLessonCompleted(courseId, lessonId);
      if (result.success) {
        setEnrollmentStatus((prev) => ({
          ...prev,
          enrollmentData: result.data,
        }));
        toast({
          title: "Lesson completed!",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error marking lesson completed:", error);
    }
  };

  const renderContentPlaceholder = () => {
    return (
      <div className="aspect-video relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PlayCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {enrollmentStatus.isEnrolled ? "Continue Learning" : "Start Course Preview"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isLoading
              ? "Loading course content..."
              : enrollmentStatus.isEnrolled
              ? "Select a lesson from the sidebar to continue your learning journey"
              : "Select a lesson from the sidebar to begin previewing this course content"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTotalDuration()} total
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {lessons.length} lessons
            </div>
            {enrollmentStatus.isEnrolled && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {enrollmentStatus.enrollmentData?.progress || 0}% complete
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getLessonTypeIcon = (lesson: Lesson) => {
    return <PlayCircle className="w-4 h-4" />;
  };

  const getLessonTypeColor = (lesson: Lesson) => {
    return "bg-red-100 text-red-600";
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return enrollmentStatus.enrollmentData?.completedLessons?.some(
      (completed: any) => completed._id === lessonId
    ) || false;
  };

  const renderEnrollmentButton = () => {
    if (enrollmentStatus.isLoading) {
      return (
        <Button className="w-full" size="lg" disabled>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Checking Enrollment...
        </Button>
      );
    }

    if (enrollmentStatus.isEnrolled) {
      return (
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(`/courses/${courseId}/learn`)}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Continue Learning
        </Button>
      );
    }

    if (!isAuthenticated) {
      return (
        <Button className="w-full" size="lg" onClick={handleEnrollClick}>
          Sign In to Enroll
        </Button>
      );
    }

    if (!isFree && price > 0) {
      return (
        <Button className="w-full" size="lg" onClick={handleEnrollClick}>
          Enroll Now - ${price}
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        size="lg"
        onClick={handleEnrollClick}
        disabled={isEnrolling}
      >
        {isEnrolling ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Enrolling...
          </>
        ) : (
          "Enroll for Free"
        )}
      </Button>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStartPreview}
        className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlayCircle className="w-4 h-4" />
        )}
        {isLoading ? "Loading..." : "Start Preview"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-[98vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] p-0 overflow-y-auto custom-scrollbar">
          <DialogHeader className="p-4 sm:p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  {description}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            <div className="order-1 lg:order-none flex-1 flex flex-col p-4 sm:p-6 min-w-0 overflow-hidden">
              <div className="flex-1 mb-6 min-h-0">
                {selectedLesson && (selectedLesson.isPreview || enrollmentStatus.isEnrolled) && selectedLesson.video?.url ? (
                  <div className="w-full h-full">{renderVideoPlayer(selectedLesson)}</div>
                ) : (
                  renderContentPlaceholder()
                )}
              </div>

              {selectedLesson && (
                <Card className="flex-shrink-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{selectedLesson.title}</h3>
                          {enrollmentStatus.isEnrolled && isLessonCompleted(selectedLesson._id) && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {selectedLesson.description || "No description available."}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(selectedLesson.duration)}
                          </div>
                          <Badge
                            variant={selectedLesson.isPreview || enrollmentStatus.isEnrolled ? "default" : "secondary"}
                            className={
                              selectedLesson.isPreview || enrollmentStatus.isEnrolled
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {selectedLesson.isPreview
                              ? "Free Preview"
                              : enrollmentStatus.isEnrolled
                              ? "Full Access"
                              : "Enroll to Access"}
                          </Badge>
                          <span>Lesson {selectedLesson.order}</span>
                        </div>
                      </div>
                      {!selectedLesson.isPreview && !enrollmentStatus.isEnrolled && (
                        <Button size="sm" onClick={handleEnrollClick}>
                          Enroll to Unlock
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="order-2 lg:order-none w-full lg:w-80 border-t lg:border-l lg:border-t-0 bg-muted/20 flex flex-col">
              <div className="p-4 border-b bg-background">
                <h3 className="font-semibold text-lg mb-2">Course Content</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getTotalDuration()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {lessons.length} lessons
                  </div>
                  {enrollmentStatus.isEnrolled && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {enrollmentStatus.enrollmentData?.progress || 0}%
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {lessons.map((lesson) => {
                      const canAccess = lesson.isPreview || enrollmentStatus.isEnrolled;
                      const isCompleted = isLessonCompleted(lesson._id);

                      return (
                        <button
                          key={lesson._id}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                            selectedLesson?._id === lesson._id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          } ${!canAccess ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          onClick={() => handleLessonSelect(lesson)}
                          disabled={!canAccess}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isCompleted ? "bg-green-100 text-green-600" : getLessonTypeColor(lesson)
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                getLessonTypeIcon(lesson)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`font-medium text-sm truncate ${
                                    !canAccess ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                {!canAccess && (
                                  <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Lesson {lesson.order}</span>
                                <span>•</span>
                                <span>{formatDuration(lesson.duration)}</span>
                                {lesson.isPreview && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600 font-medium">Free Preview</span>
                                  </>
                                )}
                                {isCompleted && (
                                  <span className="text-green-600 font-medium">Completed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-background">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {enrollmentStatus.isEnrolled
                      ? `Your progress: ${enrollmentStatus.enrollmentData?.progress || 0}% complete`
                      : `Previewing ${getPreviewLessonsCount()} of ${lessons.length} lessons`}
                  </p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    🎁 30-day money-back guarantee
                  </Badge>
                </div>

                {renderEnrollmentButton()}

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span>Q&A support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}