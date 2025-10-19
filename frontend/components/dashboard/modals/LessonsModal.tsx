import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Edit2, Trash2, Plus } from "lucide-react";
import { Course, Lesson } from "@/lib/types";

interface LessonsModalProps {
  isLessonsModalOpen: boolean;
  setIsLessonsModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  lessons: Lesson[];
  openEditLessonModal: (lesson: Lesson) => void;
  deleteLessonMutation: any;
  openAddLessonModal: (course: Course) => void;
}

export function LessonsModal({
  isLessonsModalOpen,
  setIsLessonsModalOpen,
  selectedCourse,
  lessons,
  openEditLessonModal,
  deleteLessonMutation,
  openAddLessonModal,
}: LessonsModalProps) {
  return (
    <Dialog open={isLessonsModalOpen} onOpenChange={setIsLessonsModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Lessons for {selectedCourse?.title}
          </DialogTitle>
          <DialogDescription>
            Manage the lessons in your course. You can add, edit, or remove
            lessons.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No lessons added yet.</p>
              <p className="text-sm">
                Start by adding your first lesson to this course.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-gray-500">
                        Duration: {lesson.duration} minutes
                        {lesson.description && ` • ${lesson.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditLessonModal(lesson)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLessonMutation.mutate(lesson._id)}
                      disabled={deleteLessonMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsLessonsModalOpen(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setIsLessonsModalOpen(false);
              openAddLessonModal(selectedCourse!);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
