import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, CheckCircle2 } from "lucide-react";
import { Course, Lesson, LessonFormData } from "@/lib/types";

interface EditLessonModalProps {
  isEditLessonModalOpen: boolean;
  setIsEditLessonModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  selectedLesson: Lesson | null;
  currentLesson: LessonFormData;
  setCurrentLesson: (lesson: LessonFormData) => void;
  lessonVideoInputRef: React.RefObject<HTMLInputElement>;
  updateLessonMutation: any;
}

export function EditLessonModal({
  isEditLessonModalOpen,
  setIsEditLessonModalOpen,
  selectedCourse,
  selectedLesson,
  currentLesson,
  setCurrentLesson,
  lessonVideoInputRef,
  updateLessonMutation,
}: EditLessonModalProps) {
  return (
    <Dialog
      open={isEditLessonModalOpen}
      onOpenChange={setIsEditLessonModalOpen}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update the lesson details for "{selectedCourse?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editLessonTitle">Lesson Title *</Label>
            <Input
              id="editLessonTitle"
              placeholder="Enter lesson title"
              value={currentLesson.title}
              onChange={(e) =>
                setCurrentLesson({ ...currentLesson, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editLessonDescription">
              Description (Optional)
            </Label>
            <Textarea
              id="editLessonDescription"
              placeholder="Enter lesson description"
              value={currentLesson.description}
              onChange={(e) =>
                setCurrentLesson({
                  ...currentLesson,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editLessonDuration">Duration (minutes) *</Label>
              <Input
                id="editLessonDuration"
                type="number"
                placeholder="Enter duration"
                value={currentLesson.duration || ""}
                onChange={(e) =>
                  setCurrentLesson({
                    ...currentLesson,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLessonVideo">Video File (Optional)</Label>
              <Input
                id="editLessonVideo"
                type="file"
                accept="video/*"
                ref={lessonVideoInputRef}
                onChange={(e) =>
                  setCurrentLesson({
                    ...currentLesson,
                    video: e.target.files?.[0] || null,
                  })
                }
              />
              {selectedLesson?.videoUrl && (
                <p className="text-sm text-gray-500">
                  Current video: {selectedLesson?.videoUrl.split("/").pop()}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsEditLessonModalOpen(false)}
            disabled={updateLessonMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => updateLessonMutation.mutate()}
            disabled={
              updateLessonMutation.isPending ||
              !currentLesson.title ||
              !currentLesson.duration
            }
          >
            {updateLessonMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating Lesson...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Update Lesson
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
