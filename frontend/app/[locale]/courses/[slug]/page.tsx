// app/courses/[slug]/page.tsx
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  getCourse,
  getCourseReviews,
} from "@/services/course.service";
import CourseDetailPage from "@/components/courses/course-detail-page";

interface CoursePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  try {
    const course = await getCourse(await params.slug);

    if (!course) {
      return {
        title: "Course Not Found - Mini Udemy",
        description: "The requested course could not be found.",
      };
    }

    return {
      title: `${course.title} - Mini Udemy`,
      description: course.short_description || course.description,
      openGraph: {
        title: course.title,
        description: course.short_description || course.description,
        images: course.thumbnail_url ? [course.thumbnail_url] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Course Not Found - Mini Udemy",
      description: "The requested course could not be found.",
    };
  }
}

export default async function CourseDetailPageRoute({
  params,
}: CoursePageProps) {
  try {
    console.log("Fetching course data for slug:", params.slug);

    // First fetch the course
    const course = await getCourse(params.slug);

    if (!course) {
      console.log("Course not found for slug:", params.slug);
      return (
        <div className="min-h-screen">
          <Navbar />
          <main className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
          </main>
          <Footer />
        </div>
      );
    }

    console.log("course" , course._id)

    // Then fetch reviews using the course ID
    let reviewsData = null;
    try {
      reviewsData = await getCourseReviews(course._id??"");

      console.log("reviewsData" , reviewsData)
    } catch (error) {
      console.error("Error fetching reviews:", error);
      reviewsData = {
        reviews: [],
        averageRating: 0,
        totalRatings: 0,
      };
    }

    console.log("Server: Course data:", course);
    console.log("Server: Reviews data:", reviewsData);

    

    return (
      <div className="min-h-screen">
        <Navbar />
        <main>
          <CourseDetailPage
            slug={params.slug}
            initialCourse={course}
            initialReviews={reviewsData?.reviews || []}
          />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in course detail page:", error);
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Course</h1>
          <p className="text-muted-foreground mb-8">
            There was an error loading the course. Please try again.
          </p>
        </main>
        <Footer />
      </div>
    );
  }
}

export const revalidate = 3600; // Revalidate every hour
