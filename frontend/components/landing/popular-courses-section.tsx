// components/landing/popular-courses-section.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight, TrendingUp, Users, PlayCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface PopularCoursesSectionProps {
  courses: any[];
  language: string;
}

export function PopularCoursesSection({
  courses,
  language,
}: PopularCoursesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
  const translations = {
    en: {
      title: "Most Popular Courses",
      subtitle: "Courses loved by thousands of students worldwide. Join the learning revolution.",
      viewAll: "View All Courses",
      showMore: "Show More",
      showLess: "Show Less",
      students: "students",
      hours: "h",
      bestseller: "BESTSELLER",
      trending: "TRENDING",
      enrolled: "enrolled",
      thisMonth: "this month"
    },
    ar: {
      title: "الدورات الأكثر شيوعًا",
      subtitle: "الدورات التي أحبها الآلاف من الطلاب حول العالم. انضم إلى ثورة التعلم.",
      viewAll: "عرض جميع الدورات",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
      students: "طالب",
      hours: "س",
      bestseller: "الأكثر مبيعًا",
      trending: "رائج",
      enrolled: "مسجل",
      thisMonth: "هذا الشهر"
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (!courses || courses.length === 0) return null;

  // Show 8 items initially, all when "show all" is clicked
  const displayedCourses = showAll ? courses.slice(0, 12) : courses.slice(0, 8);
  const canShowMore = courses.length > 8;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-24 h-24 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12"
        >
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <Badge variant="secondary" className="text-sm font-semibold bg-red-500/10 text-red-600 border-red-200">
                {t.trending}
              </Badge>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-red-500 bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t.subtitle}
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="border-red-200 text-red-600 hover:bg-red-500 hover:text-white">
            <Link href="/courses?sort=popular">
              {t.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatePresence>
            {displayedCourses.map((course, index) => (
              <PopularCourseCard
                key={course.id}
                course={course}
                index={index}
                language={language}
                translations={t}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Show More/Less Button */}
        {canShowMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              size="lg"
              className="border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
            >
              {showAll ? t.showLess : t.showMore}
              <ArrowRight className={`ml-2 w-4 h-4 transition-transform ${showAll ? 'rotate-90' : 'rotate-0'}`} />
            </Button>
          </motion.div>
        )}

        {/* Course Count Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            Showing {displayedCourses.length} of {courses.length} popular courses
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PopularCourseCard({
  course,
  index,
  language,
  translations
}: {
  course: any;
  index: number;
  language: string;
  translations: any;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Check if course is a bestseller (high enrollment or rating)
  const isBestseller = course.studentsEnrolled > 1000 || course.ratings?.average > 4.5;
  const isTrending = course.studentsEnrolled > 500 && course.ratings?.average > 4.0;

  // Calculate popularity percentage
  const popularityPercentage = Math.min((course.studentsEnrolled / 5000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-border bg-card/50 backdrop-blur-sm h-full relative">
          {/* Bestseller & Trending Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {isBestseller && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-0 font-bold text-xs shadow-lg">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                {translations.bestseller}
              </Badge>
            )}
            {isTrending && !isBestseller && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 font-bold text-xs shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                {translations.trending}
              </Badge>
            )}
          </div>

          {/* Course Image */}
          <div className="relative overflow-hidden">
            <motion.img
              src={course.image || "/api/placeholder/400/250"}
              alt={course.title}
              className="w-full h-48 object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Hover Overlay */}
            <motion.div 
              className="absolute inset-0 bg-primary/90 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-primary-foreground">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isHovered ? 1 : 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlayCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Preview Course</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Level Badge */}
            <Badge className={`absolute top-3 right-3 border-0 font-semibold ${
              course.level === 'Beginner' 
                ? 'bg-green-500 text-white' 
                : course.level === 'Intermediate'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {course.level}
            </Badge>

            {/* Lectures Count */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-black/80 text-white border-0 text-xs">
                <PlayCircle className="w-3 h-3 mr-1" />
                {course.lecturesCount || 0} lectures
              </Badge>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Course Title */}
            <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[48px]">
              {course.title}
            </h3>
            
            {/* Course Subtitle */}
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2 min-h-[40px]">
              {course.subtitle}
            </p>

            {/* Instructor */}
            <div className="flex items-center mb-3">
              <img
                src={course.instructor?.avatar || "/api/placeholder/32/32"}
                alt={course.instructor?.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-xs text-muted-foreground truncate">
                {course.instructor?.name || 'Instructor'}
              </span>
            </div>

            {/* Rating and Students */}
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="ml-1 font-semibold text-foreground">
                    {course.ratings?.average?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-muted-foreground">({course.ratings?.count || 0})</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span className="font-semibold text-green-600">
                  {course.studentsEnrolled?.toLocaleString() || 0}+
                </span>
              </div>
            </div>

            {/* Popularity Progress Bar */}
            {(isBestseller || isTrending) && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Popularity</span>
                  <span>{Math.round(popularityPercentage)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      isBestseller ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${popularityPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.min(course.studentsEnrolled, 5000)}+ {translations.enrolled} {translations.thisMonth}
                </p>
              </div>
            )}

            {/* Price and Duration */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="font-bold text-2xl text-foreground">
                ${course.price || 0}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor(course.totalHours || 0)}
                {translations.hours}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}