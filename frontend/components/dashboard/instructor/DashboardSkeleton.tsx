import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl h-40 animate-pulse" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="border border-gray-200 shadow-sm animate-pulse"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-gray-300" />
                    <Skeleton className="h-8 w-16 bg-gray-300" />
                    <Skeleton className="h-3 w-24 bg-gray-300" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl bg-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {[...Array(2)].map((_, i) => (
              <Card
                key={i}
                className="border border-gray-200 shadow-sm animate-pulse"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-40 bg-gray-300" />
                  <Skeleton className="h-4 w-60 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full bg-gray-300 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="border border-gray-200 shadow-sm animate-pulse"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full bg-gray-300 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}