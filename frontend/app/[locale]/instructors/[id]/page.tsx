// app/instructors/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  Youtube,
  Twitter,
  Linkedin,
  ArrowLeft,
  Share2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructor } from "@/hooks/useInstructorQueries";
import Link from "next/link";
import Image from "next/image";

export default function InstructorProfilePage() {
  const params = useParams();
  const instructorId = params.id as string;
  const {
    data: instructorData,
    isLoading,
    error,
  } = useInstructor(instructorId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Instructor Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The instructor you're looking for doesn't exist or may have been
            removed.
          </p>
          <Button asChild>
            <Link href="/instructors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Instructors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <InstructorProfileSkeleton />;
  }

  const instructor = instructorData?.data;

  if (!instructor) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const CourseCard = ({ course, index }: { course: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
            {course.image ? (
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/80" />
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>
          <div className="p-6">
            <Badge variant="outline" className="mb-2">
              {course.category}
            </Badge>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.studentsEnrolled.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {course.rating} ({course.totalReviews})
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration}h
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">${course.price}</span>
              <Button size="sm">Enroll Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/instructors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Instructors
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>

          {/* Instructor Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden shadow-2xl">
                {instructor.user.avatar ? (
                  <Image
                    src={instructor.user.avatar}
                    alt={instructor.user.name}
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                  />
                ) : (
                  instructor.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 rounded-full" />
              </div>
              {instructor.isVerified && (
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
              )}
              {instructor.featured && (
                <motion.div
                  className="absolute -top-2 -left-2"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Award className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {instructor.user.name}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {instructor.user.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(instructor.joinedAt)}
                    </div>
                  </div>
                </div>
                {instructor.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg text-lg py-1 px-3">
                    Featured Instructor
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold">
                      {instructor.stats.averageRating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold mb-1">
                    {instructor.stats.totalStudents.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold mb-1">
                    {instructor.stats.totalCourses}
                  </div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-2xl font-bold mb-1">
                    {instructor.stats.totalReviews.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {instructor.profile.website && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={instructor.profile.website} target="_blank">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </Link>
                  </Button>
                )}
                {instructor.profile.socialLinks?.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={instructor.profile.socialLinks.youtube}
                      target="_blank"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Link>
                  </Button>
                )}
                {instructor.profile.socialLinks?.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={instructor.profile.socialLinks.twitter}
                      target="_blank"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Link>
                  </Button>
                )}
                {instructor.profile.socialLinks?.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={instructor.profile.socialLinks.linkedin}
                      target="_blank"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Courses by {instructor.user.name}
              </h2>
              <span className="text-muted-foreground">
                {instructor.courses?.length || 0} courses
              </span>
            </div>

            {instructor.courses && instructor.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructor.courses.map((course, index) => (
                  <CourseCard key={course._id} course={course} index={index} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground">
                    This instructor hasn't published any courses yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {instructor.profile.bio}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas of Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {instructor.profile.expertise.map((exp) => (
                    <Badge
                      key={exp}
                      variant="secondary"
                      className="text-sm py-1.5 px-3"
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Details */}
            {(instructor.profile.availability ||
              instructor.profile.responseTime) && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instructor.profile.availability && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Availability
                        </h4>
                        <p className="text-foreground">
                          {instructor.profile.availability}
                        </p>
                      </div>
                    )}
                    {instructor.profile.responseTime && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Response Time
                        </h4>
                        <p className="text-foreground">
                          {instructor.profile.responseTime}
                        </p>
                      </div>
                    )}
                    {instructor.profile.officeHours && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Office Hours
                        </h4>
                        <p className="text-foreground">
                          {instructor.profile.officeHours}
                        </p>
                      </div>
                    )}
                    {instructor.profile.contactEmail && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Contact Email
                        </h4>
                        <p className="text-foreground">
                          {instructor.profile.contactEmail}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Student Feedback
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Average rating:{" "}
                    <span className="font-bold text-foreground">
                      {instructor.stats.averageRating}
                    </span>{" "}
                    from {instructor.stats.totalReviews} reviews
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.floor(instructor.stats.averageRating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    Detailed reviews and ratings coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InstructorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-40 mb-6" />
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
