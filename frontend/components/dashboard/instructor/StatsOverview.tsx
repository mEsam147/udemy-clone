import { StatCard } from "./StatCard";
import { DollarSign, Users, BookOpen, Star } from "lucide-react";

interface StatsOverviewProps {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  revenueTrend: number;
  publishedCourses?: number;
  totalReviews?: number;
}

export function StatsOverview({
  totalRevenue,
  totalStudents,
  totalCourses,
  averageRating,
  revenueTrend,
  publishedCourses,
  totalReviews,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
        icon={<DollarSign className="h-6 w-6 text-green-600" />}
        trend={revenueTrend}
        description="Total earnings from all courses"
        color="from-emerald-500 to-emerald-600"
        delay={0.1}
      />
      <StatCard
        title="Total Students"
        value={totalStudents.toLocaleString()}
        icon={<Users className="h-6 w-6 text-blue-600" />}
        trend={12}
        description="Active students enrolled"
        color="from-blue-500 to-blue-600"
        delay={0.2}
      />
      <StatCard
        title="Course Portfolio"
        value={totalCourses.toString()}
        icon={<BookOpen className="h-6 w-6 text-purple-600" />}
        subtitle={`${publishedCourses || totalCourses} Published`}
        description="Total courses created"
        color="from-purple-500 to-purple-600"
        delay={0.3}
      />
      <StatCard
        title="Student Satisfaction"
        value={averageRating.toFixed(1)}
        icon={<Star className="h-6 w-6 text-amber-600" />}
        subtitle={`${totalReviews || 0} Reviews`}
        description="Average course rating"
        color="from-amber-500 to-amber-600"
        delay={0.4}
      />
    </div>
  );
}