"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Video, File } from "lucide-react";
import type { CourseSection, Lesson } from "@/lib/types";

interface CourseCurriculumBuilderProps {
  sections: CourseSection[];
  onSectionsChange: (sections: CourseSection[]) => void;
}

export function CourseCurriculumBuilder({
  sections,
  onSectionsChange,
}: CourseCurriculumBuilderProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    description: "",
    duration: "",
    videoUrl: "",
    resources: [],
  });

  const addSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: CourseSection = {
      id: `section-${Date.now()}`,
      course_id: "temp-course-id", // This will be replaced when the course is created
      title: newSectionTitle,
      order_index: sections.length,
      lessons: [],
    };

    onSectionsChange([...sections, newSection]);
    setNewSectionTitle("");
  };

  const removeSection = (sectionId: string) => {
    onSectionsChange(sections.filter((section) => section.id !== sectionId));
  };

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      section_id: sectionId,
      title: newLessonData.title,
      description: newLessonData.description,
      video_url: newLessonData.videoUrl,
      duration_seconds: parseInt(newLessonData.duration) * 60, // Convert minutes to seconds
      order_index:
        sections.find((s) => s.id === sectionId)?.lessons.length || 0,
      is_preview: false,
      resources: [],
    };

    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: [...section.lessons, newLesson],
        };
      }
      return section;
    });

    onSectionsChange(updatedSections);
    setNewLessonData({
      title: "",
      description: "",
      duration: "",
      videoUrl: "",
      resources: [],
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
        };
      }
      return section;
    });

    onSectionsChange(updatedSections);
  };

  const moveLessonUp = (sectionId: string, index: number) => {
    if (index === 0) return;

    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        const newLessons = [...section.lessons];
        const temp = newLessons[index];
        newLessons[index] = newLessons[index - 1];
        newLessons[index - 1] = temp;
        return { ...section, lessons: newLessons };
      }
      return section;
    });

    onSectionsChange(updatedSections);
  };

  const moveLessonDown = (sectionId: string, index: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || index === section.lessons.length - 1) return;

    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        const newLessons = [...section.lessons];
        const temp = newLessons[index];
        newLessons[index] = newLessons[index + 1];
        newLessons[index + 1] = temp;
        return { ...section, lessons: newLessons };
      }
      return section;
    });

    onSectionsChange(updatedSections);
  };

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter section title"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <Button onClick={addSection}>Add Section</Button>
      </div>

      {/* Sections List */}
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Lesson</DialogTitle>
                          <DialogDescription>
                            Create a new lesson for the section &quot;
                            {section.title}&quot;
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Lesson Title
                            </label>
                            <Input
                              value={newLessonData.title}
                              onChange={(e) =>
                                setNewLessonData({
                                  ...newLessonData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Enter lesson title"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Description
                            </label>
                            <Textarea
                              value={newLessonData.description}
                              onChange={(e) =>
                                setNewLessonData({
                                  ...newLessonData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Enter lesson description"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Duration (minutes)
                            </label>
                            <Input
                              type="number"
                              value={newLessonData.duration}
                              onChange={(e) =>
                                setNewLessonData({
                                  ...newLessonData,
                                  duration: e.target.value,
                                })
                              }
                              placeholder="Enter duration in minutes"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Video URL
                            </label>
                            <Input
                              value={newLessonData.videoUrl}
                              onChange={(e) =>
                                setNewLessonData({
                                  ...newLessonData,
                                  videoUrl: e.target.value,
                                })
                              }
                              placeholder="Enter video URL"
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() =>
                              selectedSection && addLesson(selectedSection)
                            }
                          >
                            Add Lesson
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-2">
                  {section.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg group"
                    >
                      <button className="opacity-0 group-hover:opacity-50 hover:opacity-100">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(lesson.duration_seconds / 60)} minutes •{" "}
                          {lesson.resources?.length || 0} resources
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveLessonUp(section.id, index)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveLessonDown(section.id, index)}
                          disabled={index === section.lessons.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeLesson(section.id, lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
