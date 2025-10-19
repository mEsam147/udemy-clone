// services/review.service.ts
import { fetchWrapper } from "@/lib/api";
import { Review } from "@/lib/types";

export const reviewService = {
  // Get course reviews
  getCourseReviews: (courseId: string) => 
    fetchWrapper(`/reviews/${courseId}/reviews`, "GET"),

  // Add review
  addReview: (courseId: string, data: { rating: number; comment: string }) =>
    fetchWrapper(`/reviews/${courseId}/reviews`, "POST", data),

  // Update review
  updateReview: (reviewId: string, data: { rating: number; comment: string }) =>
    fetchWrapper(`/reviews/${reviewId}`, "PUT", data),

  // Delete review
  deleteReview: (reviewId: string) =>
    fetchWrapper(`/reviews/${reviewId}`, "DELETE"),

  // Mark review as helpful
  markHelpful: (reviewId: string) =>
    fetchWrapper(`/reviews/${reviewId}/helpful`, "POST"),
};
