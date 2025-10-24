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
    <section className="py-16 bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">{t.title}</h2>
              <p className="text-muted-foreground">{t.subtitle}</p>
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
    if (!course.createdAt) return false;
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
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card/50 backdrop-blur-sm group-hover:bg-card/80 h-full">
          {/* New Badge */}
          {isNew() && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-primary text-primary-foreground border-0 shadow-lg animate-pulse">
                {t.new}
              </Badge>
            </div>
          )}

          <div className="relative overflow-hidden">
            <img
              src={course.image || "/api/placeholder/300/200"}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>

          <CardContent className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
              {course.subtitle}
            </p>

            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <div className="flex items-center">
                <span className="font-semibold text-foreground">{course.ratings?.average || 0}</span>
                <Star className="w-3 h-3 fill-current text-yellow-500 ml-1" />
                <span className="ml-1 text-muted-foreground">({course.ratings?.count || 0})</span>
              </div>
              <span className="mx-2 text-border">•</span>
              <span>{course.studentsEnrolled?.toLocaleString() || 0} {t.students}</span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="font-bold text-lg text-foreground">
                {course.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${course.price}`
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
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
