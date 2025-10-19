// Placeholder functions for the wishlist API
// TODO: Replace with actual API calls

import { Course } from "./types";

export async function getWishlist(userId: string): Promise<Course[]> {
  // TODO: Implement actual API call to fetch user's wishlist
  return []; // Temporary return empty array until API integration
}

export async function toggleWishlist(courseId: string): Promise<void> {
  // TODO: Implement actual API call to toggle course in wishlist
}
