// components/courses/course-reviews.tsx - ENHANCED WITH PAGINATION
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Filter,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Review } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { reviewService } from "@/services/review.service";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface CourseReviewsProps {
  courseId: string;
  reviews: Review[];
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

type SortOption = "recent" | "helpful" | "highest" | "lowest";
type FilterOption = "all" | "5" | "4" | "3" | "2" | "1";

// Pagination configuration
const REVIEWS_PER_PAGE = 5;
const INITIAL_REVIEWS_COUNT = 5;

// Safe data validation functions
const safeReview = (review: any): Review | null => {
  if (!review || typeof review !== 'object') return null;

  return {
    _id: review._id || review.id || `review-${Date.now()}`,
    user: {
      _id: review.user?._id || review.user?.id || 'unknown-user',
      name: review.user?.name || 'Anonymous',
      avatar: review.user?.avatar || '',
    },
    course: review.course || 'unknown-course',
    rating: typeof review.rating === 'number' ? Math.max(1, Math.min(5, review.rating)) : 5,
    comment: review.comment || review.review || 'No review text provided.',
    helpful: {
      count: typeof review.helpful?.count === 'number' ? review.helpful.count : 0,
      users: Array.isArray(review.helpful?.users) ? review.helpful.users : [],
    },
    userHasMarkedHelpful: Boolean(review.userHasMarkedHelpful),
    createdAt: review.createdAt || review.ratedAt || new Date().toISOString(),
  };
};

const safeReviews = (reviews: any[]): Review[] => {
  if (!Array.isArray(reviews)) return [];
  return reviews.map(safeReview).filter((review): review is Review => review !== null);
};

export function CourseReviews({
  courseId,
  reviews: initialReviews,
  averageRating,
  totalRatings,
  ratingDistribution,
}: CourseReviewsProps) {
  const t = useTranslations("courses");
  const { toast } = useToast();

  const router = useRouter();
  const {user} = useAuth()
  const [allReviews, setAllReviews] = useState<Review[]>(() => safeReviews(initialReviews));
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [helpfulLoading, setHelpfulLoading] = useState<Set<string>>(new Set());

  // Calculate total pages and initialize displayed reviews
  useEffect(() => {
    const filteredReviews = allReviews.filter(review => {
      if (filterBy === "all") return true;
      const rating = parseInt(filterBy);
      return review.rating === rating;
    });

    const sortedReviews = filteredReviews.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "helpful":
          return (b.helpful?.count || 0) - (a.helpful?.count || 0);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
    const endIndex = Math.min(currentPage * REVIEWS_PER_PAGE, sortedReviews.length);

    setDisplayedReviews(sortedReviews.slice(0, endIndex));
    setHasMoreReviews(endIndex < sortedReviews.length);
  }, [allReviews, currentPage, sortBy, filterBy]);

  // Refresh reviews when component mounts or courseId changes
  useEffect(() => {
    const refreshReviews = async () => {
      if (courseId) {
        setIsLoading(true);
        setCurrentPage(1); // Reset to first page when refreshing
        try {
          const response = await reviewService.getCourseReviews(courseId);
          if (response.success) {
            const safeData = safeReviews(response.data);
            setAllReviews(safeData);
          } else {
            console.warn("Failed to load reviews:", response.message);
            setAllReviews(safeReviews(initialReviews));
          }
        } catch (error: any) {
          console.error("Failed to load reviews:", error);
          toast({
            title: "Error loading reviews",
            description: error.message || "Failed to load reviews",
            variant: "destructive",
          });
          setAllReviews(safeReviews(initialReviews));
        } finally {
          setIsLoading(false);
        }
      }
    };

    refreshReviews();
  }, [courseId, toast, initialReviews]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterBy]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  const handleShowLess = () => {
    setCurrentPage(1);
  };

  const handleHelpfulClick = async (reviewId: string) => {
    setHelpfulLoading(prev => new Set(prev).add(reviewId));

    if(!user){
      router.push(`/auth/signin`);
    }
    try {
      const response = await reviewService.markHelpful(reviewId);
      if (response.success) {
        // Update the local state
        setAllReviews(prev => prev.map(review => {
          if (review._id === reviewId) {
            const currentCount = review.helpful?.count || 0;
            const isHelpful = response.data.isHelpful;

            return {
              ...review,
              helpful: {
                count: isHelpful ? currentCount + 1 : Math.max(0, currentCount - 1),
                users: isHelpful
                  ? [...(review.helpful?.users || []), "current-user"]
                  : (review.helpful?.users || []).filter(id => id !== "current-user")
              },
              userHasMarkedHelpful: isHelpful
            };
          }
          return review;
        }));

        toast({
          title: response.data.isHelpful ? "Marked as helpful" : "Removed helpful mark",
          description: response.data.isHelpful
            ? "Thank you for your feedback!"
            : "Helpful mark removed",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update helpful status",
        variant: "destructive",
      });
    } finally {
      setHelpfulLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);


    if(!user){
      router.push(`/auth/signin`);
    }
    try {
      const response = await reviewService.addReview(courseId, {
        rating: newReview.rating,
        comment: newReview.comment,
      });

      if (response.success && response.data) {
        const newReviewData = safeReview(response.data);
        if (newReviewData) {
          setAllReviews(prev => [newReviewData, ...prev]);
          setCurrentPage(1); // Reset to first page to show new review
        }
        setNewReview({ rating: 0, comment: "" });
        setShowReviewForm(false);

        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const safeRating = Math.max(1, Math.min(5, rating));

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= safeRating ? "text-yellow-500 fill-current" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate visible reviews count
  const totalFilteredReviews = allReviews.filter(review => {
    if (filterBy === "all") return true;
    const rating = parseInt(filterBy);
    return review.rating === rating;
  }).length;

  const showingCount = displayedReviews.length;
  const totalCount = totalFilteredReviews;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Average Rating */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating || 0), "lg")}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalRatings || 0} {totalRatings === 1 ? "Review" : "Reviews"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution?.[rating as keyof typeof ratingDistribution] || 0;
                const total = totalRatings || 1;
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium w-4">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterBy}
            onValueChange={(value: FilterOption) => setFilterBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowReviewForm(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Results Count */}
      {displayedReviews.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {showingCount} of {totalCount} reviews
          {filterBy !== 'all' && ` (${filterBy}-star reviews)`}
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Your Rating</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setNewReview((prev) => ({ ...prev, rating: star }))
                          }
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= newReview.rating
                                ? "text-yellow-500 fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Your Review</h4>
                    <Textarea
                      placeholder="Share your experience with this course..."
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground mb-4">
                {filterBy === "all"
                  ? "Be the first to review this course!"
                  : `No ${filterBy}-star reviews found.`}
              </p>
              {filterBy !== "all" && (
                <Button variant="outline" onClick={() => setFilterBy("all")}>
                  Show All Reviews
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {displayedReviews.map((review, index) => {
              const isExpanded = expandedReviews.has(review._id);
              const reviewText = review.comment || '';
              const shouldTruncate = reviewText.length > 200 && !isExpanded;
              const isHelpfulLoading = helpfulLoading.has(review._id);
              const helpfulCount = review.helpful?.count || 0;

              return (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage
                            src={review.user?.avatar || "/placeholder.svg"}
                            alt={review.user?.name || 'User'}
                          />
                          <AvatarFallback>
                            {review.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {review.user?.name || 'Anonymous'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Review Text */}
                          <div className="text-sm text-muted-foreground">
                            <p className={shouldTruncate ? "line-clamp-3" : ""}>
                              {reviewText}
                            </p>
                            {reviewText.length > 200 && (
                              <button
                                onClick={() => toggleReviewExpansion(review._id)}
                                className="text-primary hover:text-primary/80 text-sm font-medium mt-1"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 gap-1 ${
                                review.userHasMarkedHelpful
                                  ? "text-green-600 bg-green-50 dark:bg-green-950"
                                  : ""
                              }`}
                              onClick={() => handleHelpfulClick(review._id)}
                              disabled={isHelpfulLoading}
                            >
                              {isHelpfulLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3 w-3" />
                              )}
                              <span>Helpful</span>
                              {helpfulCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className={`ml-1 ${
                                    review.userHasMarkedHelpful
                                      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                                      : ""
                                  }`}
                                >
                                  {helpfulCount}
                                </Badge>
                              )}
                              {review.userHasMarkedHelpful && !isHelpfulLoading && (
                                <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {displayedReviews.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Load More / Show Less Buttons */}
          <div className="flex gap-3">
            {hasMoreReviews && (
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="min-w-[140px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More Reviews
                  </>
                )}
              </Button>
            )}

            {currentPage > 1 && (
              <Button
                onClick={handleShowLess}
                variant="ghost"
                className="min-w-[120px]"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-32 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (showingCount / totalCount) * 100)}%`
                }}
              />
            </div>
            <span>
              {showingCount} of {totalCount} reviews
            </span>
          </div>

          {/* Quick Navigation */}
          {totalCount > REVIEWS_PER_PAGE * 2 && (
            <div className="flex gap-1">
              {[1, 2, 3].map(page => {
                if (page * REVIEWS_PER_PAGE > totalCount) return null;
                return (
                  <Button
                    key={page}
                    variant={currentPage >= page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              {totalCount > REVIEWS_PER_PAGE * 3 && (
                <span className="px-2 text-sm text-muted-foreground flex items-center">
                  ...
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
