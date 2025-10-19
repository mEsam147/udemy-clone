"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  FileText,
  Download,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { EnhancedVideoPlayer } from "./enhanced-video-player";

interface Course {
  id: string;
  title: string;
  sections: CourseSection[];
}

interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number;
  video_url?: string;
  content?: string;
  description?: string;
  resources?: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface ProgressType {
  lesson_id: string;
  progress_percentage: number;
  completed: boolean;
}

interface CourseDiscussionProps {
  course: Course;
  currentLessonId: string;
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
  };
}

interface CourseLearningInterfaceProps {
  course: Course;
  currentLessonId?: string;
  userProgress: ProgressType[];
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, progress: number) => void;
}

interface ProgressType {
  lesson_id: string;
  progress_percentage: number;
  completed: boolean;
}

interface CourseDiscussionProps {
  course: Course;
  currentLessonId: string;
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
  };
}

interface CourseLearningInterfaceProps {
  course: Course;
  currentLessonId?: string;
  userProgress: ProgressType[];
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, progress: number) => void;
}

const CourseDiscussions = ({
  course,
  currentLessonId,
  currentUser,
}: CourseDiscussionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Discussion</h3>
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Discussion feature coming soon!</p>
          <p className="text-sm">
            Ask questions and interact with other students.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function CourseLearningInterface({
  course,
  currentLessonId,
  userProgress,
  onLessonComplete,
  onProgressUpdate,
}: CourseLearningInterfaceProps) {
  // State
  const [selectedLessonId, setSelectedLessonId] = useState(
    currentLessonId || course.sections[0]?.lessons[0]?.id
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([course.sections[0]?.id])
  );
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentNoteTimestamp, setCurrentNoteTimestamp] = useState(0);

  // Calculate lesson navigation info
  const allLessons = course.sections.flatMap(
    (section: CourseSection) => section.lessons
  );
  const currentLessonIndex = allLessons.findIndex(
    (lesson: Lesson) => lesson.id === selectedLessonId
  );
  const nextLesson = allLessons[currentLessonIndex + 1];
  const previousLesson = allLessons[currentLessonIndex - 1];
  const currentLesson = allLessons[currentLessonIndex];

  // Calculate overall progress
  const completedLessons = userProgress.filter(
    (p: ProgressType) => p.completed
  ).length;
  const totalLessons = allLessons.length;
  const overallProgress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const currentProgress = userProgress.find(
    (p: ProgressType) => p.lesson_id === selectedLessonId
  );

  // Helpers
  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(
      (p: ProgressType) => p.lesson_id === lessonId && p.completed
    );
  };

  const getLessonProgress = (lessonId: string) => {
    const progress = userProgress.find(
      (p: ProgressType) => p.lesson_id === lessonId
    );
    return progress?.progress_percentage || 0;
  };

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleAddNote = (timestamp: number) => {
    setShowNoteInput(true);
    setCurrentNoteTimestamp(timestamp);
  };

  const handleSaveNote = () => {
    if (currentNote.trim()) {
      setNotes({
        ...notes,
        [selectedLessonId]: `${notes[selectedLessonId] || ""}\n[${formatTime(
          currentNoteTimestamp
        )}] ${currentNote}`.trim(),
      });
      setCurrentNote("");
      setShowNoteInput(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Course Content Sidebar */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-80 border-r flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Course Content</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {course.sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg"
                    >
                      <span className="font-medium">{section.title}</span>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedSections.has(section.id) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {section.lessons.map((lesson) => {
                            const progress = userProgress.find(
                              (p) => p.lesson_id === lesson.id
                            );
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonSelect(lesson.id)}
                                className={`flex items-center gap-3 w-full p-2 pl-6 hover:bg-muted rounded-lg mt-1 ${
                                  selectedLessonId === lesson.id
                                    ? "bg-muted"
                                    : ""
                                }`}
                              >
                                {progress?.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border" />
                                )}
                                <span className="text-sm text-left">
                                  {lesson.title}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="p-4 border-b flex items-center gap-4">
          {!showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="font-semibold">{currentLesson?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {
                course.sections.find((s) =>
                  s.lessons.some((l) => l.id === selectedLessonId)
                )?.title
              }
            </p>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {currentLesson?.video_url && (
            <EnhancedVideoPlayer
              videoUrl={currentLesson.video_url}
              onProgress={(progress) =>
                onProgressUpdate(currentLesson.id, progress)
              }
              onComplete={() => onLessonComplete(currentLesson.id)}
              startTime={
                currentProgress?.progress_percentage
                  ? (currentProgress.progress_percentage / 100) *
                    currentLesson.duration_seconds
                  : 0
              }
            />
          )}
        </div>

        {/* Lesson Content and Notes */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <div className="px-4 border-b">
              <TabsList>
                <TabsTrigger value="content">Course Content</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="notes">My Notes</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <TabsContent value="content" className="p-4 m-0">
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="mb-4">{currentLesson?.title}</h2>
                  <div className="space-y-4">
                    <p>{currentLesson?.description}</p>
                    {currentLesson?.content && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content,
                        }}
                      />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="p-4 m-0">
                <CourseDiscussions
                  course={course}
                  currentLessonId={selectedLessonId}
                  currentUser={{
                    id: "user-1",
                    full_name: "John Doe",
                    email: "john@example.com",
                    avatar_url: "/placeholder.svg",
                    role: "student",
                  }}
                />
              </TabsContent>

              <TabsContent value="notes" className="p-4 m-0">
                <div className="space-y-4">
                  {showNoteInput ? (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <Textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          placeholder="Enter your note..."
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowNoteInput(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveNote}>Save Note</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      onClick={() =>
                        handleAddNote(currentProgress?.progress_percentage || 0)
                      }
                    >
                      Add Note
                    </Button>
                  )}

                  {notes[selectedLessonId] && (
                    <Card>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap font-sans">
                          {notes[selectedLessonId]}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="p-4 m-0">
                <div className="space-y-4">
                  {currentLesson?.resources?.map((resource, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{resource.title}</span>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
