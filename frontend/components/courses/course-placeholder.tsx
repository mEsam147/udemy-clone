// components/courses/course-placeholder.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

export function CoursePlaceholder({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="animate-pulse">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-16 ml-4" />
            </div>
            <div className="flex items-center gap-4 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full animate-pulse">
      <div className="relative">
        <Skeleton className="w-full h-48" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}