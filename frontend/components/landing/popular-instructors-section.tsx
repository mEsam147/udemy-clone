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

interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  expertise: string[];
  stats: {
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    totalCourses: number;
  };
}

interface PopularInstructorsSectionProps {
  instructors: User[];
}

export function PopularInstructorsSection({ instructors }: PopularInstructorsSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden w-full mx-auto flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
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
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Learn from Industry Experts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join millions of students learning from our world-class instructors.
            Get real-world insights and practical knowledge from industry
            leaders who are passionate about teaching.
          </p>
        </motion.div>

        {/* Instructors Grid */}
        {(!instructors || instructors.length === 0) && (
          <div className="flex flex-col justify-center items-center h-[25vh]">
            <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg shadow-sm text-foreground">
              <AlertCircle className="w-24 h-24 text-muted-foreground" />
              <h4 className="text-lg font-bold uppercase">
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
            <h3 className="text-2xl font-bold mb-4 text-foreground">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
  instructor: User;
  index: number;
}) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString();
  };

  // Get first 2 expertise items for display
  const displayExpertise = instructor.expertise?.slice(0, 2) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="h-full overflow-hidden border-border bg-card hover:bg-card/80 transition-all duration-500 relative shadow-sm hover:shadow-lg">
        {/* Featured Badge - You can add logic to determine featured instructors */}
        {instructor.stats?.averageRating >= 4.5 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              Top Rated
            </Badge>
          </div>
        )}

        {/* Instructor Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar with Gradient Border */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/70 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-background bg-background">
                <Image
                  src={instructor.avatar || "/api/placeholder/150/150"}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = "/api/placeholder/150/150";
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {instructor.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                {instructor.expertise?.[0] || "Professional Instructor"}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-semibold text-foreground">
                    {instructor.stats?.averageRating?.toFixed(1) || "4.5"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{formatNumber(instructor.stats?.totalStudents || 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" />
                  <span>{instructor.stats?.totalCourses || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {instructor.bio || "Professional instructor with years of experience in their field."}
          </p>

          {/* Expertise */}
          {displayExpertise.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {displayExpertise.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className="px-6 pb-4">
          <div className="border border-border rounded-lg p-4 bg-muted/30 group-hover:bg-muted/50 transition-colors">
            <p className="text-sm font-semibold mb-3 flex items-center text-foreground">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Teaching Stats
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(instructor.stats?.totalStudents || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {instructor.stats?.totalCourses || 0}
                </p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 text-sm h-9">
              {/* Navigate to profile page with about tab activated */}
              <Link href={`/instructors/${instructor.id}?tab=about`}>
                View Profile
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 text-sm h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {/* Navigate to profile page with courses tab activated */}
              <Link href={`/instructors/${instructor.id}?tab=courses`}>
                View Courses
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
