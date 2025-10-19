"use client";

import { CourseEditor } from "./course-editor";
import type { Course } from "@/lib/types";

export function CreateCourseForm() {
  // Initialize an empty course object
  const emptyCourse: Course = {
    id: "",
    title: "",
    description: "",
    short_description: "",
    thumbnail_url: "",
    preview_video_url: "",
    price: 0,
    currency: "USD",
    level: "beginner",
    category: "",
    tags: [],
    instructor_id: "", // Will be filled with current user's ID
    instructor: null as any, // Will be filled with current user's data
    rating: 0,
    total_ratings: 0,
    total_students: 0,
    duration_hours: 0,
    language: "English",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [],
    what_you_learn: [],
    requirements: [],
  };

  return <CourseEditor course={emptyCourse} />;
}
