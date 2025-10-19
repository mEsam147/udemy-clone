import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { StatBadge } from "./StatBadge";

interface WelcomeSectionProps {
  userName: string;
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  revenueTrend: number;
}

export function WelcomeSection({
  userName,
  totalCourses,
  totalStudents,
  totalRevenue,
  revenueTrend,
}: WelcomeSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl">
        <div className="p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl border border-white/30">
                  <Rocket className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    Welcome back, {userName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {totalCourses > 0 ? (
                      <>
                        You've earned{" "}
                        <span className="font-semibold">
                          ${totalRevenue.toLocaleString()}
                        </span>{" "}
                        from {totalCourses} courses
                      </>
                    ) : (
                      "Start creating your first course to share your knowledge"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <StatBadge
                  icon={<BookOpen className="h-4 w-4" />}
                  value={totalCourses}
                  label="Courses"
                />
                <StatBadge
                  icon={<Users className="h-4 w-4" />}
                  value={totalStudents}
                  label="Students"
                />
                <StatBadge
                  icon={<DollarSign className="h-4 w-4" />}
                  value={`$${totalRevenue.toLocaleString()}`}
                  label="Earned"
                />
                <StatBadge
                  icon={<TrendingUp className="h-4 w-4" />}
                  value={`${revenueTrend}%`}
                  label="Trend"
                  trend={revenueTrend}
                />
              </div>
            </div>
            <Button
              className="bg-white text-blue-600 hover:bg-gray-50 mt-6 lg:mt-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 h-auto rounded-xl font-semibold text-base"
              asChild
            >
              <Link
                href="/instructor/create-course"
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create New Course
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
