import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { CourseStats } from "@/lib/types";


interface HeaderSectionProps {
  user: any;
  courseStats: CourseStats;
}

export function HeaderSection({ user, courseStats }: HeaderSectionProps) {
  console.log("courseStats" , courseStats)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Courses
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize your teaching content, {user?.name}!
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                value={courseStats.total}
                label="Total Courses"
                color="blue"
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                value={courseStats.totalStudents}
                label="Total Students"
                color="green"
              />
              <StatCard
                icon={<DollarSign className="h-5 w-5" />}
                // value={`$${courseStats.totalRevenue}`}
                value={courseStats.totalRevenue}
                label="Total Revenue"
                color="purple"
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                value={courseStats.published}
                label="Published"
                color="emerald"
              />
            </div>
          </div>

        </div>
          <div className="flex items-end justify-end gap-3 mt-6  ">
            <Link href="/dashboard/instructor/create-course">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 h-12 rounded-xl font-semibold text-white gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Course
                </Button>
              </motion.div>
            </Link>
          </div>
      </div>
    </motion.div>
  );
}
