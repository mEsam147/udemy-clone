import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { EmptyState } from "./EmptyState";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivitySectionProps {
  recentActivity: any[];
  isLoading?: boolean;
}

const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border animate-pulse">
        <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-32" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-1.5 w-16 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export function RecentActivitySection({ recentActivity, isLoading = false }: RecentActivitySectionProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'enrolled':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
    >
      <DashboardCard
        title="Recent Activity"
        action={
          isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Link
              href="/dashboard/instructor/activity"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          )
        }
      >
        {isLoading ? (
          <ActivitySkeleton />
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity
              .slice(0, 5)
              .map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.studentName}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                      >
                        {activity.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {activity.courseTitle}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{activity.progress}%</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(activity.time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={<Clock className="h-8 w-8" />}
            title="No recent activity"
            description="Activity will appear here when students enroll"
            compact
          />
        )}
      </DashboardCard>
    </motion.div>
  );
}