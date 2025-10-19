"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCourseForm } from "./create-course-form";
import { CourseCurriculumBuilder } from "./course-curriculum-builder";
import type { Course } from "@/lib/types";

interface CourseEditorProps {
  course: Course;
}

export function CourseEditor({ course }: CourseEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");

  const handleCourseUpdate = async (updatedCourse: Course) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Updated course:", updatedCourse);
      router.push("/instructor/courses");
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleSectionsUpdate = async (sections: Course["sections"]) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Updated sections:", sections);
    } catch (error) {
      console.error("Error updating sections:", error);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">Course Content</TabsTrigger>
        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <CreateCourseForm
          initialData={course}
          onSubmit={handleCourseUpdate}
          submitLabel="Update Course"
        />
      </TabsContent>

      <TabsContent value="curriculum">
        <CourseCurriculumBuilder
          sections={course.sections}
          onSectionsChange={handleSectionsUpdate}
        />
      </TabsContent>

      <TabsContent value="pricing">
        {/* TODO: Add pricing settings component */}
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Coming Soon</h3>
          <p className="text-muted-foreground">
            Pricing settings will be available in the next update.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
