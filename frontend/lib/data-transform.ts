// lib/data-transform.ts
import { Course, Category } from "@/lib/types";

export const transformCoursesResponse = (response: any): Course[] => {
  console.log("transformCoursesResponse input:", response); // Debug

  // Handle flat array of courses
  if (Array.isArray(response)) {
    return response.map((course: any) => transformSingleCourse(course));
  }

  // Handle paginated response (backend format)
  if (response?.data && Array.isArray(response.data)) {
    return response.data.map((course: any) => transformSingleCourse(course));
  }

  // Handle single course object
  if (response && typeof response === "object") {
    return [transformSingleCourse(response)];
  }

  console.error("Invalid response structure:", response);
  return [];
};

const transformSingleCourse = (course: any): Course => {
  return {
    id: course.id || course._id || "",
    title: course.title || "",
    slug: course.slug || course.title?.toLowerCase().replace(/\s+/g, "-") || "",
    subtitle: course.subtitle || course.short_description || "",
    description: course.description || "",
    short_description: course.short_description || course.description || "",
    instructor: {
      id: course.instructor?.id || course.instructor?._id || "",
      _id: course.instructor?._id || "",
      name: course.instructor?.full_name || course.instructor?.name || "",
      full_name: course.instructor?.full_name || course.instructor?.name || "",
      avatar: course.instructor?.avatar_url || course.instructor?.avatar || "",
      avatar_url:
        course.instructor?.avatar_url || course.instructor?.avatar || "",
      bio: course.instructor?.bio || "",
      expertise: course.instructor?.expertise || [],
    },
    price: course.price || 0,
    image: course.image || course.thumbnail_url || "",
    thumbnail_url: course.image || course.thumbnail_url || "",
    category: course.category || "",
    subcategory: course.subcategory || "",
    level: course.level || "",
    language: course.language || "",
    studentsEnrolled: course.total_students || course.studentsEnrolled || 0,
    total_students: course.total_students || course.studentsEnrolled || 0,
    requirements: course.requirements || [],
    whatYoullLearn: course.what_you_learn || course.whatYoullLearn || [],
    totalHours: course.duration_hours || course.totalHours || 0,
    duration_hours: course.duration_hours || course.totalHours || 0,
    lecturesCount: course.lectures_count || course.lecturesCount || 0,
    lectures_count: course.lectures_count || course.lecturesCount || 0,
    ratings: {
      average: course.ratings?.average || course.rating || 0,
      count: course.ratings?.count || course.total_ratings || 0,
    },
    rating: course.ratings?.average || course.rating || 0, // Legacy field
    total_ratings: course.ratings?.count || course.total_ratings || 0, // Legacy field
    isPublished: course.is_published || course.isPublished || false,
    is_published: course.is_published || course.isPublished || false,
    publishedAt: course.published_at || course.publishedAt || "",
    published_at: course.published_at || course.publishedAt || "",
    tags: course.tags || [],
    features: course.features || [],
    createdAt: course.created_at || course.createdAt || "",
    created_at: course.created_at || course.createdAt || "",
    updatedAt: course.updated_at || course.updatedAt || "",
    updated_at: course.updated_at || course.updatedAt || "",
  };
};

export const transformCategoriesResponse = (response: any): Category[] => {
  console.log("transformCategoriesResponse input:", response);

  let categories: any[] = [];

  // Handle array of strings (your current API response)
  if (
    Array.isArray(response) &&
    response.every((item: any) => typeof item === "string")
  ) {
    console.log("Processing array of category strings");
    categories = response.map((name: string, index: number) => ({
      id: `cat-${index + 1}`, // Generate simple ID
      name: name,
    }));
  }
  // Handle array of category objects
  else if (Array.isArray(response)) {
    console.log("Processing array of category objects");
    categories = response.map((cat: any) => ({
      id: cat.id || cat._id || "",
      name: cat.name || cat.title || "",
    }));
  }
  // Handle paginated response with data array
  else if (response?.data && Array.isArray(response.data)) {
    console.log("Processing paginated categories response");
    categories = response.data.map((cat: any) => ({
      id: cat.id || cat._id || "",
      name: cat.name || cat.title || "",
    }));
  }
  // Handle direct object response
  else if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
  ) {
    console.log("Processing single object categories response");
    categories = [response].map((cat: any) => ({
      id: cat.id || cat._id || "",
      name: cat.name || cat.title || "",
    }));
  }
  // Fallback for unexpected structures
  else {
    console.warn("Unexpected categories response structure:", response);
    categories = [];
  }

  // Filter out empty categories
  const validCategories = categories.filter(
    (cat: Category) => cat.name && cat.name.trim().length > 0
  );

  console.log("Transformed categories:", validCategories);
  return validCategories;
};
