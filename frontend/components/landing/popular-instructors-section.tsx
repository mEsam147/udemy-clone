"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  PlayCircle,
  Award,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/lib/types";

interface Instructor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  studentsCount: number;
  coursesCount: number;
  bio: string;
  featuredCourse: {
    id: string;
    title: string;
    thumbnail: string;
    rating: number;
    studentsCount: number;
    level: string;
    duration: string;
  };
  achievements: string[];
  isFeatured?: boolean;
}

const mockInstructors: Instructor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/api/placeholder/150/150",
    specialty: "Web Development Expert",
    rating: 4.9,
    studentsCount: 158432,
    coursesCount: 12,
    bio: "Award-winning web developer with 10+ years of experience. Specializing in React, Next.js, and modern JavaScript frameworks. Passionate about teaching and mentoring the next generation of developers.",
    featuredCourse: {
      id: "react-2024",
      title: "Complete React Developer Course 2024",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.8,
      studentsCount: 45231,
      level: "Advanced",
      duration: "28h",
    },
    achievements: ["Google Developer Expert", "React Core Contributor"],
    isFeatured: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "/api/placeholder/150/150",
    specialty: "Data Science & AI",
    rating: 4.8,
    studentsCount: 142785,
    coursesCount: 8,
    bio: "Machine learning engineer and data scientist with 8+ years of experience. Former tech lead at FAANG companies. Focused on practical, real-world applications of AI and machine learning.",
    featuredCourse: {
      id: "python-ds",
      title: "Python Data Science Bootcamp",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.9,
      studentsCount: 38654,
      level: "Intermediate",
      duration: "35h",
    },
    achievements: ["PhD in Computer Science", "TensorFlow Certified"],
  },
  {
    id: "3",
    name: "Emily Davis",
    avatar: "/api/placeholder/150/150",
    specialty: "UX/UI Design",
    rating: 4.9,
    studentsCount: 98654,
    coursesCount: 15,
    bio: "Design leader with 12+ years of expertise in user experience and interface design. Worked with Fortune 500 companies to create award-winning digital products and design systems.",
    featuredCourse: {
      id: "ux-master",
      title: "Master UX/UI Design 2024",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.7,
      studentsCount: 28943,
      level: "Beginner",
      duration: "42h",
    },
    achievements: ["Adobe Creative Ambassador", "Awwwards Judge"],
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    avatar: "/api/placeholder/150/150",
    specialty: "Mobile Development",
    rating: 4.7,
    studentsCount: 75632,
    coursesCount: 9,
    bio: "Senior mobile developer specializing in React Native and Flutter. Created multiple successful apps with millions of downloads. Focused on performance and user experience.",
    featuredCourse: {
      id: "react-native-pro",
      title: "React Native Pro Development",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.8,
      studentsCount: 21567,
      level: "Advanced",
      duration: "31h",
    },
    achievements: ["App Store Featured", "Open Source Contributor"],
  },
  {
    id: "5",
    name: "Jessica Wang",
    avatar: "/api/placeholder/150/150",
    specialty: "Digital Marketing",
    rating: 4.8,
    studentsCount: 112543,
    coursesCount: 11,
    bio: "Digital marketing strategist with expertise in SEO, social media, and growth hacking. Helped businesses grow from startups to market leaders through data-driven marketing strategies.",
    featuredCourse: {
      id: "growth-marketing",
      title: "Advanced Growth Marketing",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.6,
      studentsCount: 18765,
      level: "Intermediate",
      duration: "24h",
    },
    achievements: ["Google Analytics Certified", "Forbes 30 Under 30"],
  },
  {
    id: "6",
    name: "David Kim",
    avatar: "/api/placeholder/150/150",
    specialty: "Cloud & DevOps",
    rating: 4.9,
    studentsCount: 89321,
    coursesCount: 7,
    bio: "DevOps engineer and cloud architect with AWS, Azure, and GCP expertise. Specialized in scalable infrastructure, containerization, and CI/CD pipelines for enterprise applications.",
    featuredCourse: {
      id: "aws-master",
      title: "AWS Solutions Architect",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.9,
      studentsCount: 32456,
      level: "Advanced",
      duration: "38h",
    },
    achievements: ["AWS Hero", "Kubernetes Certified"],
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function PopularInstructorsSection({ instructors }) {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden w-full mx-auto flex  items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-sm font-semibold">
              Top Rated Instructors
            </Badge>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Learn from Industry Experts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join millions of students learning from our world-class instructors.
            Get real-world insights and practical knowledge from industry
            leaders who are passionate about teaching.
          </p>
        </motion.div>

        {/* Instructors Grid */}
        {instructors?.length === 0 && (
          <div className="flex flex-col justify-center items-center h-[25vh]">
            <div className="flex flex-col items-center gap-2 p-4 bg-secondary/40 rounded-lg shadow-sm text-foreground hover:bg-muted/90 transition-colors duration-200">
              {" "}
              <AlertCircle className="w-24 h-24 text-destructive" />
              <h4 className="text-lg font-bold uppercase  ">
                {" "}
                No instructors available at this time
              </h4>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 mx-auto place-items-center w-full">
          {instructors?.map((instructor: User, index: number) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              index={index}
            />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Learning?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore all our expert instructors and find the perfect mentor for
              your learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/instructors">
                  <Users className="w-5 h-5 mr-2" />
                  Browse All Instructors
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/courses">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Explore Courses
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function InstructorCard({
  instructor,
  index,
}: {
  instructor: Instructor;
  index: number;
}) {
  return (
    <motion.div
      key={instructor.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 relative">
        {/* Featured Badge */}
        {instructor.isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Instructor Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar with Gradient Border */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-background">
                <Image
                  src={instructor.avatar}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                {instructor.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                {instructor.specialty}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-semibold">{instructor.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span>{formatNumber(instructor.studentsCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-muted-foreground" />
                  <span>{instructor.coursesCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {instructor.bio}
          </p>

          {/* Achievements */}
          {instructor.achievements.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {instructor.achievements.slice(0, 2).map((achievement, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {achievement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Course */}
        <div className="px-6 pb-4">
          <div className="border border-border rounded-xl p-4 bg-muted/20 group-hover:bg-muted/40 transition-colors">
            <p className="text-sm font-semibold mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Featured Course
            </p>
            <div className="flex gap-3">
              <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 group/course">
                <Image
                  src={instructor.featuredCourse.thumbnail}
                  alt={instructor.featuredCourse.title}
                  fill
                  className="object-cover group-hover/course:scale-110 transition-transform duration-300"
                  sizes="80px"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/course:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {instructor.featuredCourse.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">
                      {instructor.featuredCourse.rating}
                    </span>
                  </div>
                  <span>•</span>
                  <div>
                    {formatNumber(instructor.featuredCourse.studentsCount)}{" "}
                    students
                  </div>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {instructor.featuredCourse.level}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 text-sm h-9">
              <Link href={`/instructor/${instructor.id}`}>View Profile</Link>
            </Button>
            <Button
              asChild
              className="flex-1 text-sm h-9 bg-primary hover:bg-primary/90"
            >
              <Link href={`/courses?instructor=${instructor.id}`}>
                View Courses
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
