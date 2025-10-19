import type { Course } from "./types";

// Additional types for the dashboard
export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  monthlyRevenue: number;
  newEnrollments: number;
}

// Mock course data
const mockCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn web development from scratch with this comprehensive bootcamp.",
    short_description:
      "Master web development fundamentals and modern frameworks.",
    thumbnail_url: "/placeholder.svg",
    preview_video_url: "https://example.com/preview.mp4",
    price: 99.99,
    currency: "USD",
    level: "beginner" as const,
    category: "Web Development",
    tags: ["HTML", "CSS", "JavaScript", "React"],
    instructor_id: "1",
    instructor: {
      id: "1",
      email: "instructor@example.com",
      full_name: "John Instructor",
      role: "instructor" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    rating: 4.5,
    total_ratings: 128,
    total_students: 450,
    duration_hours: 40,
    language: "English",
    status: "published" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [],
    what_you_learn: [
      "Build responsive websites",
      "Master JavaScript fundamentals",
      "Create full-stack applications",
    ],
    requirements: [
      "Basic computer skills",
      "No prior programming experience needed",
    ],
  },
  {
    id: "2",
    title: "Advanced React and Next.js",
    description:
      "Take your React skills to the next level with advanced patterns and Next.js.",
    short_description:
      "Master advanced React concepts and server-side rendering.",
    thumbnail_url: "/placeholder.svg",
    preview_video_url: "https://example.com/preview.mp4",
    price: 129.99,
    currency: "USD",
    level: "advanced" as const,
    category: "Web Development",
    tags: ["React", "Next.js", "TypeScript"],
    instructor_id: "1",
    instructor: {
      id: "1",
      email: "instructor@example.com",
      full_name: "John Instructor",
      role: "instructor" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    rating: 4.8,
    total_ratings: 85,
    total_students: 320,
    duration_hours: 35,
    language: "English",
    status: "published" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [],
    what_you_learn: [
      "Advanced React patterns",
      "Server-side rendering with Next.js",
      "State management solutions",
    ],
    requirements: [
      "Intermediate React knowledge",
      "Basic TypeScript understanding",
    ],
  },
];

// API client functions for instructor dashboard
export async function getInstructorCourses(
  instructorId: string
): Promise<Course[]> {
  // TODO: Replace with actual API call
  return mockCourses.filter((course) => course.instructor_id === instructorId);
}

export async function getInstructorStats(
  instructorId: string
): Promise<InstructorStats> {
  // TODO: Replace with actual API call
  return {
    totalCourses: 5,
    totalStudents: 1250,
    totalRevenue: 25000,
    averageRating: 4.5,
    monthlyRevenue: 3200,
    newEnrollments: 48,
  };
}
