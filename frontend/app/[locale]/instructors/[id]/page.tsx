"use client";

import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  BookOpen,
  Award,
  MapPin,
  Calendar,
  CheckCircle,
  Globe,
  Youtube,
  Twitter,
  Linkedin,
  ArrowLeft,
  Share2,
  Bookmark,
  GraduationCap,
  Zap,
  Sparkles,
  User,
  Target,
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
import { useState, useEffect } from "react";

export default function InstructorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const instructorId = params.id as string;

  // Get active tab from URL or default to "courses"
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || "courses");
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    data: instructorData,
    isLoading,
    error,
  } = useInstructor(instructorId);

  useEffect(() => {
    setImageLoaded(false);
  }, [instructorId]);

  // Update tab when URL changes
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Instructor Not Found
            </h1>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
              The instructor you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto">
              <Link href="/instructors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Instructors
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <InstructorProfileSkeleton />;
  }

  const instructor = instructorData?.data;
  if (!instructor) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Simple tab configuration
  const tabs = [
    { value: "courses", label: "Courses", icon: BookOpen },
    { value: "about", label: "About", icon: User },
    { value: "reviews", label: "Reviews", icon: Star },
  ];

  // Stats configuration
  const stats = [
    {
      icon: Star,
      value: instructor.stats?.averageRating?.toFixed(1) || "4.5",
      label: "Rating",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      value: instructor.stats?.totalStudents?.toLocaleString() || "0",
      label: "Students",
      color: "text-green-500"
    },
    {
      icon: BookOpen,
      value: instructor.stats?.totalCourses || "0",
      label: "Courses",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      value: instructor.stats?.totalReviews?.toLocaleString() || "0",
      label: "Reviews",
      color: "text-purple-500"
    },
  ];

  // Social links configuration
  const socialLinks = [
    { icon: Globe, href: instructor.profile?.website, label: "Website" },
    { icon: Youtube, href: instructor.profile?.socialLinks?.youtube, label: "YouTube" },
    { icon: Twitter, href: instructor.profile?.socialLinks?.twitter, label: "Twitter" },
    { icon: Linkedin, href: instructor.profile?.socialLinks?.linkedin, label: "LinkedIn" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-80 md:h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6 md:mb-8 flex-wrap">
            <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
              <Link href="/instructors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Instructors</span>
              </Link>
            </Button>

            <div className="flex-1"></div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden xs:inline">Save</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden xs:inline">Share</span>
              </Button>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl overflow-hidden shadow-2xl">
                  {instructor.user?.avatar ? (
                    <>
                      <Image
                        src={instructor.user.avatar}
                        alt={instructor.user.name}
                        width={128}
                        height={128}
                        className={`rounded-2xl object-cover transition-opacity duration-500 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                      />
                      {!imageLoaded && (
                        <Skeleton className="w-full h-full absolute inset-0 rounded-2xl" />
                      )}
                    </>
                  ) : (
                    instructor.user?.name?.split(" ").map((n) => n[0]).join("") || "IN"
                  )}
                </div>

                {instructor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-1 md:p-2 shadow-lg border-2 border-background">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Mobile Social Links */}
              <div className="flex gap-2 lg:hidden">
                {socialLinks.map((social, index) =>
                  social.href && (
                    <Button key={social.label} variant="outline" size="sm" asChild className="p-2">
                      <Link href={social.href} target="_blank">
                        <social.icon className="w-4 h-4" />
                      </Link>
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
              {/* Name and Location */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary/90 to-purple-600 bg-clip-text text-transparent break-words">
                    {instructor.user?.name}
                  </h1>
                  {instructor.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-sm py-1 px-3">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{instructor.user?.country || "Global"}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {formatDate(instructor.joinedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 md:p-4 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50 shadow-sm"
                  >
                    <stat.icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-lg md:text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Desktop Social Links */}
              <div className="hidden lg:flex items-center gap-2 flex-wrap">
                {socialLinks.map((social, index) =>
                  social.href && (
                    <Button key={social.label} variant="outline" size="sm" asChild className="gap-2">
                      <Link href={social.href} target="_blank">
                        <social.icon className="w-4 h-4" />
                        {social.label}
                      </Link>
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
   <div className="container mx-auto min-h-[20px] max-h-[30px]">
  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
    {/* Tabs Navigation */}
    <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm p-1 rounded-xl md:rounded-2xl border border-border/50 flex items-center justify-center">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="flex items-center gap-2 py-2 md:py- rounded-lg data-[state=active]:text-primary data-[state=active]:font-bold text-xs md:text-sm"
        >
          <tab.icon className="w-3 h-0 md:w-4 md:h-4" />
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>

          <AnimatePresence mode="wait">
            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Courses
                </h2>
                <Badge variant="secondary" className="text-sm md:text-base py-1.5 px-3 md:px-4">
                  {instructor.courses?.length || 0} courses
                </Badge>
              </div>

              {instructor.courses && instructor.courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {instructor.courses.map((course, index) => (
                    <CourseCard key={course._id || course.id} course={course} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-8 md:p-12 text-center">
                    <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 md:mb-6" />
                    <h3 className="text-xl md:text-2xl font-bold mb-3">No Courses Yet</h3>
                    <p className="text-muted-foreground md:text-lg">
                      {instructor.user?.name} hasn't published any courses yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Bio */}
                <Card className="lg:col-span-2 border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      About Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {instructor.profile?.bio || "Passionate instructor dedicated to helping students achieve their learning goals."}
                    </p>
                  </CardContent>
                </Card>

                {/* Expertise */}
                <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(instructor.profile?.expertise || instructor.expertise || []).map((exp, index) => (
                        <Badge
                          key={exp}
                          variant="secondary"
                          className="text-sm py-1.5 px-2.5 bg-primary/10 text-primary border-primary/20"
                        >
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Target className="w-5 h-5 text-blue-500" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Availability", value: instructor.profile?.availability, icon: Calendar },
                      { label: "Response Time", value: instructor.profile?.responseTime, icon: TrendingUp },
                      { label: "Office Hours", value: instructor.profile?.officeHours, icon: Users },
                      { label: "Contact", value: instructor.profile?.contactEmail, icon: Globe },
                    ].map((detail, index) =>
                      detail.value && (
                        <div
                          key={detail.label}
                          className="text-center p-3 bg-muted/30 rounded-xl border border-border/50"
                        >
                          <detail.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-medium text-xs md:text-sm text-muted-foreground mb-1">
                            {detail.label}
                          </h4>
                          <p className="text-foreground font-medium text-sm">{detail.value}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                    Reviews & Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 md:py-12">
                    <TrendingUp className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-4 md:mb-6" />

                    <h3 className="text-xl md:text-2xl font-bold mb-4">Student Feedback</h3>
                    <p className="text-muted-foreground md:text-lg mb-6">
                      Average rating:{" "}
                      <span className="font-bold text-xl md:text-2xl text-yellow-500">
                        {instructor.stats?.averageRating?.toFixed(1) || "4.5"}
                      </span>{" "}
                      from {instructor.stats?.totalReviews?.toLocaleString() || "0"} reviews
                    </p>

                    <div className="flex items-center justify-center gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 md:w-8 md:h-8 ${
                            star <= Math.floor(instructor.stats?.averageRating || 4.5)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-muted-foreground md:text-lg max-w-md mx-auto">
                      Detailed reviews and ratings will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

// Simplified Course Card Component
function CourseCard({ course }: { course: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="h-full overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Course Image */}
        <div className="relative h-40 md:h-48 overflow-hidden">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            {course.isFeatured && (
              <Badge className="bg-yellow-500 text-white border-0 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant="secondary" className="bg-background/80 text-xs">
              {course.level}
            </Badge>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-4">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20 text-xs">
            {course.category}
          </Badge>

          <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight">
            {course.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {course.description || course.subtitle}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{(course.studentsEnrolled || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>{course.ratings?.average || course.rating || 4.5}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="font-bold text-lg text-primary">
              ${course.price || 0}
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ${course.originalPrice}
                </span>
              )}
            </div>
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Link href={`/courses/${course._id}`}>
                <span className="hidden xs:inline mr-2">View</span>
                Course
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified Skeleton
function InstructorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header Skeleton */}
      <div className="relative bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Navigation Skeleton */}
          <div className="flex items-center gap-3 mb-6 md:mb-8 flex-wrap">
            <Skeleton className="h-8 w-32 rounded-full" />
            <div className="flex-1"></div>
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>

          {/* Info Skeleton */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl" />
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 md:h-12 w-48 md:w-64 rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 md:h-20 rounded-xl" />
                ))}
              </div>

              <div className="hidden lg:flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Skeleton className="h-12 w-full max-w-2xl rounded-2xl mb-6 md:mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
