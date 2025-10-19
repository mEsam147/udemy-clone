// components/landing/featured-courses-section.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface FeaturedCoursesSectionProps {
  courses: any[];
  language: string;
}

export function FeaturedCoursesSection({ courses, language }: FeaturedCoursesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
  const translations = {
    en: {
      title: "Featured Courses",
      subtitle: "Handpicked courses to get you started",
      viewAll: "View All Courses",
      showMore: "Show More",
      showLess: "Show Less",
      students: "students",
      hours: "h",
      enroll: "Enroll Now"
    },
    ar: {
      title: "الدورات المميزة",
      subtitle: "دورات مختارة بعناية لتبدأ بها",
      viewAll: "عرض جميع الدورات",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
      students: "طالب",
      hours: "س",
      enroll: "سجل الآن"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (!courses || courses.length === 0) return null;

  // Show 6 items initially, 9 when "show all" is clicked
  const displayedCourses = showAll ? courses.slice(0, 9) : courses.slice(0, 6);
  const canShowMore = courses.length > 6;
  const canShowLess = showAll && courses.length > 6;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12"
        >
          <div className="mb-6 lg:mb-0">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t.subtitle}
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="/courses">
              {t.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <AnimatePresence>
            {displayedCourses.map((course, index) => (
              <CourseCard 
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
              {showAll ? (
                <ChevronUp className="ml-2 w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              ) : (
                <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
              )}
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
            Showing {displayedCourses.length} of {courses.length} featured courses
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CourseCard({ 
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-border bg-card/50 backdrop-blur-sm group h-full">
          {/* Course Image */}
          <div className="relative overflow-hidden">
            <motion.img 
              src={course.image || "/api/placeholder/400/250"} 
              alt={course.title}
              className="w-full h-48 object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Overlay on hover */}
            <motion.div 
              className="absolute inset-0 bg-primary/90 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-primary-foreground p-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isHovered ? 1 : 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button className="bg-white text-primary hover:bg-white/90">
                    {translations.enroll}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Level Badge */}
            <Badge className={`absolute top-3 left-3 border-0 font-semibold ${
              course.level === 'Beginner' 
                ? 'bg-green-500 text-white' 
                : course.level === 'Intermediate'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {course.level}
            </Badge>

            {/* Category Badge */}
            <Badge className="absolute top-3 right-3 bg-black/80 text-white border-0 font-semibold">
              {course.category}
            </Badge>
          </div>
          
          <CardContent className="p-6">
            {/* Course Title */}
            <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[56px]">
              {course.title}
            </h3>
            
            {/* Course Subtitle */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[40px]">
              {course.subtitle}
            </p>
            
            {/* Rating and Students */}
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <div className="flex items-center mr-4">
                <span className="font-semibold text-foreground mr-1">
                  {course.ratings?.average?.toFixed(1) || '0.0'}
                </span>
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span className="ml-1">({course.ratings?.count || 0})</span>
              </div>
              <div className="flex items-center">
                <span>{course.studentsEnrolled?.toLocaleString() || 0} {translations.students}</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center mb-4">
              <img
                src={course.instructor?.avatar || "/api/placeholder/32/32"}
                alt={course.instructor?.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-muted-foreground truncate">
                {course.instructor?.name || 'Instructor'}
              </span>
            </div>

            {/* Price and Duration */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="font-bold text-2xl text-foreground">
                ${course.price || 0}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor(course.totalHours || 0)}{translations.hours}
                <span className="mx-1">•</span>
                {course.lecturesCount || 0} lectures
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}