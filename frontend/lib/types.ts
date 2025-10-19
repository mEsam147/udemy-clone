// lib/types/index.ts
export interface User {
  id: string;
  full_name: string;
  name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  expertise?: string[];
  role: "student" | "instructor" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Instructor {
  id?: string;
  _id?: string;
  full_name?: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  bio?: string;
  expertise?: string[];
  total_students?: number;
  total_courses?: number;
  average_rating?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  course_count?: number;
  icon?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_seconds: number;
  order: number;
  course_id: string;
  video?: {
    public_id: string;
    url: string;
    format: string;
    bytes: number;
  };
  resources?: Array<{
    name: string;
    url: string;
  }>;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  course_id: string;
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  progress: number;
  completed_lessons: string[];
  last_accessed: string;
  rating?: {
    score: number;
    review?: string;
    rated_at: string;
  };
  created_at: string;
  updated_at: string;
}

// lib/types.ts
// lib/types.ts (add this to your Course type)
export interface Course {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price: number;
  category: string;
  subcategory?: string;
  level: string;
  language: string;
  studentsEnrolled?: number;
  totalHours: number;
  lecturesCount?: number;
  instructor: Instructor;
  requirements?: string[];
  whatYoullLearn?: string[];
  ratings?: {
    average: number;
    count: number;
  };
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SearchFilters {
  query: string;
  categories: string[];
  levels: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  rating: number;
  features: string[];
  language: string;
  sortBy: string;
  limit?: number; // Add this line
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface CourseStats {
  total_courses: number;
  total_students: number;
  total_instructors: number;
  average_rating: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

// Added specific interfaces for your backend response structure
interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalRatings: number;
}

interface CourseLesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number;
  isPreview?: boolean;
  [key: string]: any;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  courseId: string;
  enrollment?: {
    id: string;
    progress: number;
    completedLessons: string[];
    lastAccessed: string;
  } | null;
}

export interface WishlistStatusResponse {
  isInWishlist: boolean;
  courseId: string;
  wishlistCount: number;
}

export interface WishlistActionResponse {
  courseId: string;
  isInWishlist: boolean;
  message: string;
  wishlistCount: number;
}

export interface CourseLearningData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  trailerVideo?: string;
  language: string;
  category: string;
  subcategory?: string;
  level: string;
  price: number;
  originalPrice?: number;
  discountInfo?: {
    discountPercentage: number;
    savings: number;
  };

  instructor: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    expertise: string[];
    responseTime: string;
    officeHours?: string;
    socialLinks: Record<string, string>;
    rating: { average: number; count: number };
    totalStudents: number;
  };

  statistics: {
    totalLessons: number;
    totalSections: number;
    totalDuration: number;
    totalResources: number;
    totalQuizzes: number;
    totalAssignments: number;
    lastUpdated: string;
  };

  progress: {
    overall: number;
    completedLessons: number;
    remainingLessons: number;
    completedDuration: number;
    remainingDuration: number;
    estimatedCompletion?: {
      hours: number;
      days: number;
      pace: string;
    };
    lastAccessed?: string;
    startedAt?: string;
  };

  sections: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
    duration: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      duration: number;
      order: number;
      isPreview: boolean;
      isCompleted: boolean;
      resources: any[];
      hasQuiz: boolean;
      hasAssignments: boolean;
    }>;
  }>;

  lessons: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl?: string;
    duration: number;
    order: number;
    isPreview: boolean;
    isCompleted: boolean;
    resources: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size?: number;
      uploadedAt: string;
    }>;
    transcript?: string;
    quiz?: {
      id: string;
      title: string;
      questionCount: number;
      timeLimit: number;
      passingScore: number;
    };
    assignments: any[];
  }>;

  enrollment?: {
    id: string;
    progress: number;
    enrolledAt: string;
    lastAccessed: string;
    completedLessons: Array<{
      id: string;
      title: string;
      completedAt: string;
    }>;
    rating?: number;
    notes: Array<{
      id: string;
      lessonId: string;
      content: string;
      createdAt: string;
    }>;
  };

  reviews: {
    average: number;
    count: number;
    distribution: Record<string, number>;
    recent: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      student: {
        id: string;
        name: string;
        avatar: string;
      };
    }>;
    userReview?: {
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
    };
  };

  isEnrolled: boolean;
  canAccessFullContent: boolean;
  requiresEnrollment: boolean;
  previewLessons: Array<{
    id: string;
    title: string;
    description: string;
    duration: number;
    order: number;
  }>;

  nextLesson?: {
    id: string;
    title: string;
    order: number;
    section: string;
  };

  courseCompleted: boolean;
  certificateEligible: boolean;
}

export interface SearchResponse {
  success: boolean;
  data: Course[];
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  level: string;
  status: string;
  image?: File | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface CourseStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalStudents: number;
  totalRevenue: number;
}


export interface LessonFormData {
  title: string;
  video: File | null;
  duration: number;
  description?: string;
}

export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    courseUpdates: boolean;
    newMessages: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "connections";
    showEmail: boolean;
    showEnrollments: boolean;
  };
  communication: {
    newsletter: boolean;
    productUpdates: boolean;
    courseRecommendations: boolean;
  };
  language: string;
  timezone: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  confirmation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


// lib/types.ts - Add these missing types
export interface InstructorApplication {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  instructorApplication: {
    status: 'pending' | 'approved' | 'rejected';
    bio: string;
    expertise: string[];
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
  };
  createdAt: string;
  courses?: any[];
  students?: number;
  revenue?: number;
  rating?: number;
}

export interface InstructorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export interface CourseStatusStats {
  draft: number;
  published: number;
  archived: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface CourseAnalytics {
  course: {
    title: string;
    studentsEnrolled: number;
    revenue: number;
    averageRating: number;
    totalReviews: number;
  };
  progress: {
    averageProgress: number;
    completedStudents: number;
    activeStudents: number;
  };
  enrollmentTrends: Array<{
    _id: string;
    count: number;
  }>;
  lessons: {
    total: number;
    totalDuration: number;
  };
}

// lib/types.ts - Make sure your Review type matches
export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  course: string;
  rating: number;
  comment: string;
  helpful: {
    count: number;
    users: string[];
  };
  userHasMarkedHelpful?: boolean;
  createdAt: string;
}


// lib/types/course.ts




export interface SearchFilters {
  query: string;
  categories: string[];
  levels: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  rating: number;
  features: string[];
  language: string;
  sortBy: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: PaginationInfo;
  featured?: Course[];
  count?: number;
  total?: number;
}