import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2 } from "lucide-react";
import { Course, LessonFormData } from "@/lib/types";

interface AddLessonModalProps {
  isAddLessonModalOpen: boolean;
  setIsAddLessonModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  currentLesson: LessonFormData;
  setCurrentLesson: (lesson: LessonFormData) => void;
  videoInputRef: React.RefObject<HTMLInputElement>;
  uploadProgress: number;
  addLessonMutation: any;
}

export function AddLessonModal({
  isAddLessonModalOpen,
  setIsAddLessonModalOpen,
  selectedCourse,
  currentLesson,
  setCurrentLesson,
  videoInputRef,
  uploadProgress,
  addLessonMutation,
}: AddLessonModalProps) {
  return (
    <Dialog
      open={isAddLessonModalOpen}
      onOpenChange={setIsAddLessonModalOpen}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Lesson
          </DialogTitle>
          <DialogDescription>
            Add a new lesson to "{selectedCourse?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonTitle">Lesson Title *</Label>
            <Input
              id="lessonTitle"
              placeholder="Enter lesson title"
              value={currentLesson.title}
              onChange={(e) =>
                setCurrentLesson({ ...currentLesson, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonDescription">Description (Optional)</Label>
            <Textarea
              id="lessonDescription"
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
              <Label htmlFor="lessonDuration">Duration (minutes) *</Label>
              <Input
                id="lessonDuration"
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
              <Label htmlFor="lessonVideo">Video File (Optional)</Label>
              <Input
                id="lessonVideo"
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) =>
                  setCurrentLesson({
                    ...currentLesson,
                    video: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsAddLessonModalOpen(false)}
            disabled={addLessonMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => addLessonMutation.mutate()}
            disabled={
              addLessonMutation.isPending ||
              !currentLesson.title ||
              !currentLesson.duration
            }
          >
            {addLessonMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding Lesson...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}