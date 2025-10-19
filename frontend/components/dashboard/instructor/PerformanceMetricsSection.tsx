import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { Progress } from "@/components/ui/progress";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceMetricsSectionProps {
  progressData: any[];
  averageRating: number;
  monthlyRevenue: number;
  totalRevenue: number;
  isLoading?: boolean;
}

const MetricsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export function PerformanceMetricsSection({
  progressData,
  averageRating,
  monthlyRevenue,
  totalRevenue,
  isLoading = false,
}: PerformanceMetricsSectionProps) {
  const averageProgress = progressData.length > 0
    ? Math.round(progressData.reduce((acc: number, p: any) => acc + p.avgProgress, 0) / progressData.length)
    : 0;

  const monthlyGoalPercentage = Math.round((monthlyRevenue / (totalRevenue || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
    >
      <DashboardCard title="Performance Metrics">
        {isLoading ? (
          <MetricsSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Course Completion</span>
              <span className="text-sm font-bold text-green-600">
                {averageProgress}%
              </span>
            </div>
            <Progress value={averageProgress} className="h-2" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Student Satisfaction</span>
              <span className="text-sm font-bold text-amber-600">
                {averageRating.toFixed(1)}/5
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= Math.round(averageRating)
                      ? "text-amber-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Goal</span>
              <span className="text-sm font-bold text-blue-600">
                {monthlyGoalPercentage}%
              </span>
            </div>
            <Progress value={monthlyGoalPercentage} className="h-2" />
          </div>
        )}
      </DashboardCard>
    </motion.div>
  );
}