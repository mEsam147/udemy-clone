"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Code,
  PenTool,
  Database,
  TrendingUp,
  Users,
  Briefcase,
  Star,
  ChevronRight,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  level: string;
  rating: number;
  studentsCount: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  duration: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  courses: Course[];
}

const mockLearningPaths: LearningPath[] = [
  {
    id: "fullstack-web",
    title: "Full-Stack Web Development",
    description:
      "Master both frontend and backend development to become a complete web developer",
    category: "Web Development",
    icon: Code,
    duration: "6 months",
    coursesCount: 8,
    studentsCount: 45231,
    rating: 4.8,
    difficulty: "Intermediate",
    courses: [
      {
        id: "1",
        title: "HTML & CSS Fundamentals",
        thumbnail: "/placeholder.jpg",
        duration: "20 hours",
        level: "Beginner",
        rating: 4.7,
        studentsCount: 12500,
      },
      {
        id: "2",
        title: "JavaScript Essential Training",
        thumbnail: "/javascript-course.png",
        duration: "25 hours",
        level: "Intermediate",
        rating: 4.9,
        studentsCount: 18400,
      },
      {
        id: "3",
        title: "React - The Complete Guide",
        thumbnail: "/react-course-thumbnail.jpg",
        duration: "40 hours",
        level: "Intermediate",
        rating: 4.8,
        studentsCount: 15200,
      },
    ],
  },
  {
    id: "data-science",
    title: "Data Science & Analytics",
    description: "Learn to analyze data and make data-driven decisions",
    category: "Data Science",
    icon: Database,
    duration: "8 months",
    coursesCount: 10,
    studentsCount: 32154,
    rating: 4.7,
    difficulty: "Advanced",
    courses: [
      {
        id: "4",
        title: "Python for Data Science",
        thumbnail: "/python-data-science-course.png",
        duration: "30 hours",
        level: "Beginner",
        rating: 4.8,
        studentsCount: 9800,
      },
      {
        id: "5",
        title: "Machine Learning Fundamentals",
        thumbnail: "/placeholder.jpg",
        duration: "35 hours",
        level: "Intermediate",
        rating: 4.6,
        studentsCount: 7500,
      },
    ],
  },
  // Add more learning paths as needed
];

export default function LearningPathsPage() {
  const t = useTranslations("paths");
  const [selectedPath, setSelectedPath] = useState(mockLearningPaths[0]);

  const PathCard = ({ path }: { path: LearningPath }) => {
    const Icon = path.icon;
    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedPath.id === path.id ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => setSelectedPath(path)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-primary/10 text-primary`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="mb-1">{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{path.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{path.coursesCount} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{path.studentsCount.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{path.rating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Paths List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">{t("availablePaths")}</h2>
          {mockLearningPaths.map((path) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PathCard path={path} />
            </motion.div>
          ))}
        </div>

        {/* Selected Path Details */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Path Overview</CardTitle>
              <CardDescription>
                Complete these courses in order to master {selectedPath.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedPath.courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex gap-6 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="relative w-full md:w-48 h-24 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{course.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {course.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {course.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.studentsCount.toLocaleString()} students
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button asChild>
                          <Link href={`/courses/${course.id}`}>
                            Start Course
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t">
                <Button size="lg" className="w-full">
                  Enroll in Learning Path
                </Button>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Get access to all courses in this path and track your progress
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
