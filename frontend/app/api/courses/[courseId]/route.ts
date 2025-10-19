import { NextResponse } from "next/server";

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn the basics of web development",
    sections: [
      {
        id: "section1",
        title: "Getting Started",
        lessons: [
          {
            id: "lesson1",
            title: "Introduction to HTML",
            description: "Learn the basics of HTML",
            duration_seconds: 600,
            video_url: "https://example.com/video1.mp4",
            is_preview: true,
            resources: [
              {
                id: "resource1",
                title: "HTML Cheat Sheet",
                type: "pdf",
                url: "https://example.com/html-cheatsheet.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
];

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const course = mockCourses.find((c) => c.id === params.courseId);

    if (!course) {
      return new NextResponse(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify(course), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle updating course progress
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const data = await request.json();
    // In a real app, you would update the database here

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
