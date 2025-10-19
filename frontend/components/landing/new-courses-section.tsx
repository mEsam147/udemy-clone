// components/landing/new-courses-section.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NewCoursesSectionProps {
  courses: any[];
  language: string;
}

export function NewCoursesSection({ courses, language }: NewCoursesSectionProps) {
  const translations = {
    en: {
      title: "New & Noteworthy",
      subtitle: "Recently published courses that are making waves",
      viewAll: "View All New Courses",
      students: "students",
      hours: "h",
      new: "NEW"
    },
    ar: {
      title: "جديد وملحوظ",
      subtitle: "الدورات المنشورة حديثًا والتي تثير الإعجاب",
      viewAll: "عرض جميع الدورات الجديدة",
      students: "طالب",
      hours: "س",
      new: "جديد"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold mb-2">{t.title}</h2>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/courses?sort=newest">
              {t.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <NewCourseCard key={course.id} course={course} index={index} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewCourseCard({ course, index, language }: { course: any; index: number; language: string }) {
  const translations = {
    en: {
      students: "students",
      hours: "h",
      new: "NEW"
    },
    ar: {
      students: "طالب",
      hours: "س",
      new: "جديد"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Calculate how new the course is (within 7 days)
  const isNew = () => {
    const courseDate = new Date(course.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - courseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm relative">
          {/* New Badge */}
          {isNew() && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 animate-pulse">
                {t.new}
              </Badge>
            </div>
          )}
          
          <div className="relative">
            <img 
              src={course.image || "/api/placeholder/300/200"} 
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-black/80 text-white border-0">
              {course.level}
            </Badge>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{course.subtitle}</p>
            
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <span className="font-semibold text-orange-500">{course.ratings?.average || 0}</span>
              <Star className="w-3 h-3 fill-current text-orange-500 ml-1" />
              <span className="ml-1">({course.ratings?.count || 0})</span>
              <span className="mx-2">•</span>
              <span>{course.studentsEnrolled?.toLocaleString() || 0} {t.students}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="font-bold text-lg">${course.price}</div>
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(course.totalHours || 0)}{t.hours}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}