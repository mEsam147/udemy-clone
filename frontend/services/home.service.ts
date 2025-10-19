import { fetchWrapper } from "@/lib/api";

export interface HomeData {
  hero: {
    stats: {
      totalStudents: number;
      totalCourses: number;
      totalInstructors: number;
      successRate: number;
      totalEnrollments: number;
      dailyEnrollments: number;
    };
    trendingSkills: Array<{
      skill: string;
      courseCount: number;
      totalStudents: number;
    }>;
    headlines: string[];
  };
  categories: Array<{
    id: string;
    name: string;
    courseCount: number;
    totalStudents: number;
    avgRating: number;
    icon: string;
  }>;
  courses: {
    featured: Course[];
    popular: Course[];
    new: Course[];
  };
  instructors: Array<{
    id: string;
    name: string;
    avatar: string;
    bio: string;
    expertise: string[];
    stats: {
      coursesCount: number;
      studentsCount: number;
      avgRating: number;
    };
  }>;
  testimonials: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    course: {
      id: string;
      title: string;
      category: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  pricing: Array<{
    name: string;
    description: string;
    price: number;
    period: string;
    currency: string;
    features: string[];
    isPopular: boolean;
    trialDays: number;
    maxStudents: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  ratings: {
    average: number;
    count: number;
  };
  studentsEnrolled: number;
  level: string;
  category: string;
  slug: string;
  totalHours: number;
  lecturesCount: number;
  instructor: {
    id: string;
    name: string;
    avatar: string;
    expertise: string[];
  };
  createdAt: string;
  isFeatured: boolean;
}

export type CourseResult = Course & {
  type: "course";
};

export type InstructorResult = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  expertise: string[];
  stats: {
    coursesCount: number;
    studentsCount: number;
    avgRating: number;
  };
  type: "instructor";
};

export type LessonResult = {
  id: string;
  title: string;
  description: string;
  duration: number;
  isPreview: boolean;
  course: {
    id: string;
    title: string;
    instructor?: {
      name: string;
    };
  };
  type: "lesson";
};

export type SearchResult = CourseResult | InstructorResult | LessonResult;

export interface SearchResponse {
  success: boolean;
  data: {
    courses: {
      items: CourseResult[];
      count: number;
    };
    instructors: {
      items: InstructorResult[];
      count: number;
    };
    lessons: {
      items: LessonResult[];
      count: number;
    };
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SearchParams {
  q: string;
  type?: "all" | "courses" | "instructors" | "lessons";
  lang?: string;
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  price_min?: number;
  price_max?: number;
  sort?:
    | "relevance"
    | "price-low"
    | "price-high"
    | "rating"
    | "students"
    | "newest";
}

export const homeService = {
  getHomeData: (
    lang: string = "en"
  ): Promise<{ success: boolean; data: HomeData; language: string }> => {
    return fetchWrapper(`/home?lang=${lang}`, "GET");
  },

  search: (params: SearchParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return fetchWrapper(`/home/search?${searchParams.toString()}`, "GET");
  },
};
