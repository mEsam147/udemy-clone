// // app/courses/page.tsx - Complete updated version
// import type { Metadata } from "next";
// import { Suspense } from "react";
// import { EnhancedCoursesPage } from "@/components/courses/enhanced-courses-page";
// import { Navbar } from "@/components/navbar";
// import { Footer } from "@/components/footer";
// import { getAllCourses, getCategories } from "@/services/course.service";
// import {
//   transformCoursesResponse,
//   transformCategoriesResponse,
// } from "@/lib/data-transform";

// export const metadata: Metadata = {
//   title: "All Courses - Mini Udemy",
//   description:
//     "Discover our comprehensive course library with expert-led courses in web development, data science, design, and more.",
// };

// // Test data utility to ensure we have enough courses for pagination testing
// const ensureEnoughCourses = (courses: any[], minCourses: number = 10) => {
//   if (courses.length >= minCourses) {
//     return courses;
//   }

//   // Duplicate existing courses to reach minimum for testing
//   const duplicatedCourses = [...courses];
//   while (duplicatedCourses.length < minCourses) {
//     duplicatedCourses.push(...courses.map(course => ({
//       ...course,
//       id: `${course.id}-dup-${duplicatedCourses.length}`,
//       title: `${course.title} (Copy ${Math.floor(duplicatedCourses.length / courses.length) + 1})`
//     })));
//   }

//   return duplicatedCourses.slice(0, minCourses);
// };

// export default async function CoursesListPage() {
//   try {
//     // Fetch initial data - GET MORE COURSES for proper pagination testing
//     const categoriesResponse = await getCategories();
//     const coursesResponse = await getAllCourses({
//       page: 1,
//       limit: 50, // Get more courses to ensure pagination works
//     });

//     console.log("Courses response count:", coursesResponse?.data?.length || coursesResponse?.length);
//     console.log("Courses response:", coursesResponse);
//     console.log("Categories response:", categoriesResponse);

//     // Transform data
//     let initialCourses = transformCoursesResponse(coursesResponse);
    
//     // Ensure we have enough courses for pagination testing
//     initialCourses = ensureEnoughCourses(initialCourses, 10);
    
//     const categories = transformCategoriesResponse(categoriesResponse);

//     console.log("Transformed courses count:", initialCourses.length);

//     // Create proper pagination info for testing
//     const paginationInfo = {
//       currentPage: 1,
//       totalPages: Math.ceil(initialCourses?.length / 1), // 1 item per page to force pagination
//       totalItems: initialCourses.length,
//       itemsPerPage: 1, // Set to 1 to force pagination for testing
//     };

//     console.log("Pagination Info:", paginationInfo);

//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="min-h-screen">
//           <Suspense
//             fallback={
//               <div className="container mx-auto px-4 py-12">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
//                   <p className="text-muted-foreground">Loading courses...</p>
//                 </div>
//               </div>
//             }
//           >
//             <EnhancedCoursesPage
//               initialCourses={initialCourses}
//               initialCategories={categories}
//               initialPagination={paginationInfo}
//             />
//           </Suspense>
//         </main>
//         <Footer />
//       </div>
//     );
//   } catch (error: any) {
//     console.error("Error loading courses:", error);

//     // Handle rate limiting specifically
//     if (error.message?.includes('429') || error.status === 429) {
//       return (
//         <div className="min-h-screen bg-background">
//           <Navbar />
//           <main className="min-h-screen flex items-center justify-center">
//             <div className="container mx-auto px-4 py-12 text-center">
//               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg 
//                   className="h-12 w-12 text-muted-foreground" 
//                   fill="none" 
//                   stroke="currentColor" 
//                   viewBox="0 0 24 24"
//                 >
//                   <path 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round" 
//                     strokeWidth={2} 
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
//                   />
//                 </svg>
//               </div>
//               <h1 className="text-2xl font-bold mb-4 text-foreground">Too Many Requests</h1>
//               <p className="text-muted-foreground mb-8 max-w-md mx-auto">
//                 We're experiencing high traffic. Please wait a moment and try again.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
//                 >
//                   Retry Now
//                 </button>
//                 <button
//                   onClick={() => window.location.href = '/'}
//                   className="text-muted-foreground hover:text-foreground transition-colors font-medium"
//                 >
//                   Return to Home
//                 </button>
//               </div>
//             </div>
//           </main>
//           <Footer />
//         </div>
//       );
//     }

//     // Handle other errors
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="min-h-screen flex items-center justify-center">
//           <div className="container mx-auto px-4 py-12 text-center">
//             <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
//               <svg 
//                 className="h-12 w-12 text-destructive" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
//                 />
//               </svg>
//             </div>
//             <h1 className="text-2xl font-bold mb-4 text-foreground">Error Loading Courses</h1>
//             <p className="text-muted-foreground mb-8 max-w-md mx-auto">
//               {error.message || "Sorry, we couldn't load the courses at this time. Please try again later."}
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
//               >
//                 Try Again
//               </button>
//               <button
//                 onClick={() => window.location.href = '/'}
//                 className="text-muted-foreground hover:text-foreground transition-colors font-medium"
//               >
//                 Return to Home
//               </button>
//             </div>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }
// }


// app/courses/page.tsx - Complete updated version
import type { Metadata } from "next";
import { Suspense } from "react";
import { EnhancedCoursesPage } from "@/components/courses/enhanced-courses-page";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getAllCourses, getCategories } from "@/services/course.service";
import {
  transformCoursesResponse,
  transformCategoriesResponse,
} from "@/lib/data-transform";

export const metadata: Metadata = {
  title: "All Courses - Mini Udemy",
  description:
    "Discover our comprehensive course library with expert-led courses in web development, data science, design, and more.",
};

// Server component for error handling
function ErrorContent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="h-12 w-12 text-destructive" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Error Loading Courses</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {error.message || "Sorry, we couldn't load the courses at this time. Please try again later."}
          </p>
          <form action="/courses" method="GET">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Try Again
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Server component for rate limit handling
function RateLimitContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="h-12 w-12 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Too Many Requests</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We're experiencing high traffic. Please wait a moment and try again.
          </p>
          <form action="/courses" method="GET">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Retry Now
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Test data utility to ensure we have enough courses for pagination testing
const ensureEnoughCourses = (courses: any[], minCourses: number = 10) => {
  if (courses.length >= minCourses) {
    return courses;
  }

  // Duplicate existing courses to reach minimum for testing
  const duplicatedCourses = [...courses];
  while (duplicatedCourses.length < minCourses) {
    duplicatedCourses.push(...courses.map(course => ({
      ...course,
      id: `${course.id}-dup-${duplicatedCourses.length}`,
      title: `${course.title} (Copy ${Math.floor(duplicatedCourses.length / courses.length) + 1})`
    })));
  }

  return duplicatedCourses.slice(0, minCourses);
};

export default async function CoursesListPage() {
  try {
    // Fetch initial data - GET MORE COURSES for proper pagination testing
    const [categoriesResponse, coursesResponse] = await Promise.all([
      getCategories(),
      getAllCourses({
        page: 1,
        limit: 50, // Get more courses to ensure pagination works
      })
    ]);

    // console.log("Courses response count:", coursesResponse?.data?.length || coursesResponse?.length);
    // console.log("Courses response:", coursesResponse);
    // console.log("Categories response:", categoriesResponse);

    // Transform data
    let initialCourses = transformCoursesResponse(coursesResponse);
    
    // Ensure we have enough courses for pagination testing
    initialCourses = ensureEnoughCourses(initialCourses, 10);
    
    const categories = transformCategoriesResponse(categoriesResponse);

    // console.log("Transformed courses count:", initialCourses.length);

    // Create proper pagination info for testing
    const paginationInfo = {
      currentPage: 1,
      totalPages: Math.ceil(initialCourses.length / 12), // Use 12 items per page for realistic testing
      totalItems: initialCourses.length,
      itemsPerPage: 12, // Realistic items per page
      hasNext: initialCourses.length > 12,
      hasPrev: false,
    };

    // console.log("Pagination Info:", paginationInfo);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="min-h-screen">
          <Suspense fallback={<LoadingSkeleton />}>
            <EnhancedCoursesPage
              initialCourses={initialCourses}
              initialCategories={categories}
              initialPagination={paginationInfo}
            />
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  } catch (error: any) {
    console.error("Error loading courses:", error);

    // Handle rate limiting specifically
    if (error.message?.includes('429') || error.status === 429) {
      return <RateLimitContent />;
    }

    // Handle other errors
    return <ErrorContent error={error} />;
  }
}
