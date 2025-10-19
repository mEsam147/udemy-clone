"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  thumbnail: string;
  instructor: string;
  lastAccessed: string;
  totalLectures: number;
  completedLectures: number;
  estimatedTime: string;
  achievements: string[];
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Complete React Developer Course",
    description: "Master modern React with Redux, Hooks, and best practices",
    progress: 75,
    thumbnail: "/react-course-thumbnail.jpg",
    instructor: "Sarah Johnson",
    lastAccessed: "2025-09-18",
    totalLectures: 156,
    completedLectures: 117,
    estimatedTime: "3h 45m remaining",
    achievements: [
      "First Quiz Completed",
      "25% Milestone",
      "50% Milestone",
      "Active Learner",
    ],
  },
  {
    id: "2",
    title: "Python Data Science Bootcamp",
    description:
      "Learn data analysis, visualization, and machine learning with Python",
    progress: 35,
    thumbnail: "/python-data-science-course.png",
    instructor: "Michael Chen",
    lastAccessed: "2025-09-17",
    totalLectures: 189,
    completedLectures: 66,
    estimatedTime: "8h 15m remaining",
    achievements: [
      "First Quiz Completed",
      "25% Milestone",
      "Most Active Discussion",
    ],
  },
  // Add more mock courses as needed
];

export default function ProgressPage() {
  const t = useTranslations("progress");
  const [activeTab, setActiveTab] = useState("in-progress");

  const inProgressCourses = mockCourses.filter(
    (course) => course.progress < 100
  );
  const completedCourses = mockCourses.filter(
    (course) => course.progress === 100
  );

  const CourseCard = ({ course }: { course: Course }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-lg shadow-md overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-48 md:h-auto">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {course.completedLectures}/{course.totalLectures} lectures
                  </span>
                  <Clock className="w-4 h-4 ml-4" />
                  <span>{course.estimatedTime}</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {course.progress}% complete
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Last accessed:{" "}
                    {new Date(course.lastAccessed).toLocaleDateString()}
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />

                {course.achievements.length > 0 && (
                  <div className="mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {course.achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("activeCourses")}
              </p>
              <p className="text-2xl font-semibold">
                {inProgressCourses.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("completedCourses")}
              </p>
              <p className="text-2xl font-semibold">
                {completedCourses.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("achievements")}
              </p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("certificates")}
              </p>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="in-progress">
            {t("inProgress")} ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("completed")} ({completedCourses.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="space-y-6">
          {inProgressCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>
        <TabsContent value="completed" className="space-y-6">
          {completedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
