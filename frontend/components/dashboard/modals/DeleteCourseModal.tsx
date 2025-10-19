import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Course } from "@/lib/types";

interface DeleteCourseModalProps {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  deleteCourseMutation: any;
}

export function DeleteCourseModal({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedCourse,
  deleteCourseMutation,
}: DeleteCourseModalProps) {
  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Delete Course
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "
            <strong>{selectedCourse?.title}</strong>"? This action cannot be
            undone and all course data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleteCourseMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteCourseMutation.mutate(selectedCourse!._id)}
            disabled={deleteCourseMutation.isPending}
          >
            {deleteCourseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}