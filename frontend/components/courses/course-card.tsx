// components/courses/course-card.tsx - CLEANED VERSION
"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  Users,
  FileText,
  Crown,
  Lock,
  CheckCircle,
  Download,
} from "lucide-react";
import { CoursePreview } from "@/components/courses/course-preview";
import type { Course, Lesson } from "@/lib/types";
import {
  getSafeValue,
  formatNumber,
  getInitials,
  formatDuration,
} from "@/lib/utils";
import { useCourseLessons } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
  viewMode?: "grid" | "list";
  onCourseClick?: (course: Course) => void;
  canAccess?: boolean;
  isPremiumUser?: boolean;
}

export function CourseCard({
  course,
  viewMode = "grid",
  onCourseClick,
  canAccess = true,
  isPremiumUser = false,
}: CourseCardProps) {
  const locale = useLocale();
  const { toast } = useToast();

  console.log("🔄 CourseCard - Rendered for course:", course)

  // Course data with safe defaults
  const title = getSafeValue(course.title, "Untitled Course");
  const description = getSafeValue(
    course.description,
    "No description available"
  );
  const shortDescription = getSafeValue(
    course.subtitle || course.description,
    "No description available"
  );
  const price = getSafeValue(course.price, 0);
  const rating = getSafeValue(course.ratings?.average, 0);
  const totalRatings = getSafeValue(course.ratings?.count, 0);
  const totalStudents = getSafeValue(course.studentsEnrolled, 0);
  const durationHours = getSafeValue(course.totalHours, 0);
  const category = getSafeValue(course.category, "Uncategorized");
  const level = getSafeValue(course.level, "Beginner");
  const thumbnailUrl = getSafeValue(course.image, "/placeholder-course.jpg");
  const isPremiumCourse = course.isPremium || false;
  const courseSlug =
    course.slug || course.title?.toLowerCase().replace(/\s+/g, "-") || "course";

  // Instructor data
  const instructorName = course.instructor?.name || "Unknown Instructor";
  const instructorAvatar = course.instructor?.avatar || "";

  // Get course ID
  const courseId = course._id ?? course.id;

  // Fetch lessons for this course
  const { data: lessonsData, isLoading: lessonsLoading } = useCourseLessons(
    courseId,
    {
      enabled: !!courseId && courseId.length === 24,
    }
  );

  // Transform lessons data to match your Lesson model
  const lessons: Lesson[] =
    lessonsData?.data?.map((lesson: any) => ({
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      type: "video",
      isPreviewable: lesson.isPreview || false,
      videoUrl: lesson.video?.url,
      thumbnail: course.image,
      resources: lesson.resources || [],
      order: lesson.order,
      course: lesson.course,
    })) ||
    course.lessons ||
    [];

  // Calculate total duration from lessons if available
  const totalDurationSeconds = lessons.reduce(
    (total, lesson) => total + (lesson.duration || 0),
    0
  );
  const calculatedDurationHours =
    totalDurationSeconds > 0 ? totalDurationSeconds / 3600 : durationHours;

  // Get previewable lessons
  const previewLessons = lessons
    .filter((lesson: Lesson) => lesson.isPreviewable)
    .slice(0, 2)
    .map((lesson: Lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson?.duration
        ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : "5:00",
      type: lesson.type as "video" | "article",
      isPreviewable: lesson.isPreviewable,
      videoUrl: lesson.videoUrl,
      thumbnail: thumbnailUrl,
    }));

  // If no preview lessons, use first few lessons as fallback
  const fallbackPreview = lessons.slice(0, 2).map((lesson: Lesson) => ({
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration
      ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60)
          .toString()
          .padStart(2, "0")}`
      : "5:00",
    type: lesson.type as "video" | "article",
    isPreviewable: true,
    videoUrl: lesson.videoUrl,
    thumbnail: thumbnailUrl,
  }));

  const previewContent =
    previewLessons.length > 0 ? previewLessons : fallbackPreview;

  // Handle course click
  const handleClick = () => {
    if (onCourseClick) {
      onCourseClick(course);
    } else {
      window.location.href = `/${locale}/courses/${courseSlug}`;
    }
  };

  const getButtonText = () => {
    if (!canAccess && isPremiumCourse) {
      return "Upgrade to Access";
    }
    if (price === 0) {
      return "Start Free";
    }
    if (isPremiumCourse && isPremiumUser) {
      return "Included";
    }
    return "Explore Course";
  };

  const getButtonVariant = () => {
    if (!canAccess && isPremiumCourse) {
      return "outline";
    }
    if (isPremiumCourse && isPremiumUser) {
      return "secondary";
    }
    return "default";
  };

  // Format resources count
  const totalResources = lessons.reduce(
    (total, lesson) => total + (lesson.resources?.length || 0),
    0
  );

  // List View
  if (viewMode === "list") {
    return (
      <Card
        className={`h-full hover:shadow-lg transition-all duration-300 overflow-hidden group ${
          !canAccess && isPremiumCourse ? "opacity-80" : ""
        }`}
        onClick={handleClick}
      >
        <div className="flex h-full">
          {/* Course Image */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={thumbnailUrl}
              alt={title}
              width={192}
              height={128}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Premium Badge */}
            {isPremiumCourse && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* Access Overlay for Premium Courses */}
            {!canAccess && isPremiumCourse && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Premium</p>
                  <p className="text-xs">Upgrade to access</p>
                </div>
              </div>
            )}

            {/* Preview Overlay */}
            {previewContent.length > 0 && canAccess && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CoursePreview
                  courseId={courseId}
                  title={title}
                  description={shortDescription}
                  thumbnail={thumbnailUrl}
                  previewContent={previewContent}
                  totalDuration={formatDuration(calculatedDurationHours)}
                  totalLectures={lessons.length}
                />
              </div>
            )}

            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              {level}
            </Badge>
          </div>

          {/* Course Content */}
          <div className="flex-1 flex flex-col">
            <CardContent className="flex-1 p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1 mb-2 cursor-pointer">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {shortDescription}
                  </p>
                </div>
                <div className="text-right ml-4 flex flex-col items-end gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {isPremiumCourse && isPremiumUser ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Included</span>
                      </div>
                    ) : price === 0 ? (
                      "Free"
                    ) : (
                      `$${price.toFixed(2)}`
                    )}
                  </div>
                </div>
              </div>

              {/* Instructor and Rating */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={instructorAvatar} alt={instructorName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(instructorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {instructorName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatNumber(totalRatings)})
                  </span>
                </div>

                {/* Course Preview */}
                {previewContent.length > 0 && canAccess && (
                  <CoursePreview
                    courseId={courseId}
                    title={title}
                    description={shortDescription}
                    thumbnail={thumbnailUrl}
                    previewContent={previewContent}
                    totalDuration={formatDuration(calculatedDurationHours)}
                    totalLectures={lessons.length}
                  />
                )}
              </div>

              {/* Course Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(calculatedDurationHours)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {formatNumber(totalStudents)} students
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {lessons.length} lessons
                  </div>
                  {totalResources > 0 && (
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {totalResources} resources
                    </div>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {level}
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 border-t">
              <Button
                size="sm"
                variant={getButtonVariant()}
                onClick={handleClick}
                className="w-full"
              >
                {getButtonText()}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden group ${
          !canAccess && isPremiumCourse ? "opacity-80" : ""
        }`}
      >
        <CardHeader className="p-0 flex-1">
          <div className="relative">
            <Image
              src={thumbnailUrl}
              alt={title}
              width={300}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Premium Badge */}
            {isPremiumCourse && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* Access Overlay for Premium Courses */}
            {!canAccess && isPremiumCourse && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Premium Course</p>
                  <p className="text-sm">Upgrade to access</p>
                </div>
              </div>
            )}

            {/* Price/Included Badge */}
            <div className="absolute top-3 right-3 text-xl font-bold text-white bg-black/70 px-2 py-1 rounded">
              {isPremiumCourse && isPremiumUser ? (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Included</span>
                </div>
              ) : price === 0 ? (
                "Free"
              ) : (
                `$${price.toFixed(2)}`
              )}
            </div>

            {/* Preview Overlay */}
            {previewContent.length > 0 && canAccess && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CoursePreview
                  courseId={courseId}
                  title={title}
                  description={shortDescription}
                  thumbnail={thumbnailUrl}
                  previewContent={previewContent}
                  totalDuration={formatDuration(calculatedDurationHours)}
                  totalLectures={lessons.length}
                />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Instructor */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={instructorAvatar} alt={instructorName} />
                <AvatarFallback className="text-xs">
                  {getInitials(instructorName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {instructorName}
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2 cursor-pointer"
              onClick={handleClick}
            >
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {shortDescription}
            </p>

            {/* Rating and Category */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({formatNumber(totalRatings)})
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </div>

            {/* Course Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(calculatedDurationHours)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {formatNumber(totalStudents)}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {lessons.length}
              </div>
              {totalResources > 0 && (
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {totalResources}
                </div>
              )}
            </div>
          </CardContent>
        </CardHeader>

        {/* Action Button */}
        <CardFooter className="p-4 pt-0 border-t">
          <Button
            variant={getButtonVariant()}
            onClick={handleClick}
            className="w-full"
          >
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
