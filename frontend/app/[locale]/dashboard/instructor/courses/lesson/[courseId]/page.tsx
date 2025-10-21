// app/dashboard/instructor/courses/lesson/[lessonId]/page.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Clock,
  Download,
  FileText,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getLessonById, deleteLesson } from "@/services/course.service";
import type { Lesson, Course } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";

interface LessonWithCourse {
  lesson: Lesson;
  course: Course;
}

export default function InstructorLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const lessonId = params.lessonId as string;
  const [data, setData] = useState<LessonWithCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const response = await getLessonById(lessonId);
      setData(response);
    } catch (error: any) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load lesson data.",
        variant: "destructive",
      });

      // Redirect if lesson not found
      if (error.message?.includes("not found")) {
        router.push("/dashboard/instructor/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!data) return;

    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteLesson(data.course._id, data.lesson._id || data.lesson.id);

      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully.",
      });

      router.push(`/dashboard/instructor/courses/${data.course._id}`);
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete lesson.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditLesson = () => {
    if (!data) return;
    router.push(`/dashboard/instructor/courses/${data.course._id}/lessons/${data.lesson._id || data.lesson.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lesson Not Found</h1>
          <Button onClick={() => router.push("/dashboard/instructor/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const { lesson, course } = data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/instructor/courses/${course._id}`)}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
                <p className="text-muted-foreground mt-1">
                  From:{" "}
                  <Link
                    href={`/dashboard/instructor/courses/${course._id}`}
                    className="text-primary hover:underline"
                  >
                    {course.title}
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleEditLesson}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Lesson</span>
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteLesson}
                disabled={deleting}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lesson Content</span>
                    <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                      {lesson.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Placeholder */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                    {lesson.videoUrl ? (
                      <video
                        controls
                        className="w-full h-full rounded-lg"
                        poster={lesson.thumbnail}
                      >
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>No video uploaded</p>
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={handleEditLesson}
                        >
                          Upload Video
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Lesson Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-lg font-bold">
                        {lesson.duration ? formatDuration(lesson.duration) : "Not set"}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">Views</p>
                      <p className="text-lg font-bold">
                        {lesson.views || 0}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">Completion</p>
                      <p className="text-lg font-bold">
                        {lesson.completionRate || 0}%
                      </p>
                    </div>

                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">Resources</p>
                      <p className="text-lg font-bold">
                        {lesson.resources?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lesson Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.description ? (
                    <div className="prose prose-sm max-w-none text-foreground">
                      {lesson.description}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No description provided for this lesson.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lesson.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">
                                {resource.name || `Resource ${index + 1}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {resource.type || "File"} • {resource.size || "Unknown size"}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Lesson Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                        {lesson.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <Badge variant="outline">
                        {lesson.type || "Video"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium">
                        {lesson.duration ? formatDuration(lesson.duration) : "Not set"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Order:</span>
                      <span className="text-sm font-medium">
                        {lesson.order || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Preview:</span>
                      <Badge variant={lesson.isPreviewable ? "default" : "secondary"}>
                        {lesson.isPreviewable ? "Available" : "Locked"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleEditLesson}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Lesson Details
                    </Button>

                    {lesson.resources && lesson.resources.length > 0 && (
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Download All Resources
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/dashboard/instructor/courses/${course._id}`)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Lessons:</span>
                      <span className="font-medium">{course.lessonsCount || 0}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">{course.studentsEnrolled || 0}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium">
                        {course.ratings?.average ? `${course.ratings.average}/5` : "No ratings"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/instructor/courses/${course._id}`)}
                  >
                    View Course Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
