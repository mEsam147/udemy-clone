// components/courses/review-analytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface ReviewAnalyticsProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
  className?: string;
}

export function ReviewAnalytics({
  averageRating,
  totalRatings,
  ratingDistribution,
  className = "",
}: ReviewAnalyticsProps) {
  // Calculate percentages for each rating
  const getPercentage = (count: number): number => {
    return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Rating Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating), "lg")}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalRatings} {totalRatings === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof RatingDistribution];
            const percentage = getPercentage(count);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                {/* Rating Label */}
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-medium w-4">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1">
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-gray-200"
                  />
                </div>
                
                {/* Count and Percentage */}
                <div className="text-right w-16">
                  <div className="text-sm font-medium">{count}</div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {ratingDistribution[5]}
              </div>
              <div className="text-xs text-muted-foreground">5 Star</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {ratingDistribution[4] + ratingDistribution[3]}
              </div>
              <div className="text-xs text-muted-foreground">4-3 Star</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {ratingDistribution[2] + ratingDistribution[1]}
              </div>
              <div className="text-xs text-muted-foreground">2-1 Star</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}