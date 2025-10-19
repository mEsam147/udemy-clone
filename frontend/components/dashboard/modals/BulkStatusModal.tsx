import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Loader2, CheckCircle2, EyeOff, Eye, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types";

interface BulkStatusModalProps {
  isBulkStatusModalOpen: boolean;
  setIsBulkStatusModalOpen: (open: boolean) => void;
  selectedCourses: string[];
  bulkStatus: string;
  filteredCourses: Course[];
  handleBulkStatusChange: () => void;
  bulkUpdateStatusMutation: any;
}

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    icon: EyeOff,
    description: "Course is not visible to students",
  },
  published: {
    label: "Published",
    color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: Eye,
    description: "Course is live and visible to students",
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    icon: Archive,
    description: "Course is hidden from students",
  },
};

export function BulkStatusModal({
  isBulkStatusModalOpen,
  setIsBulkStatusModalOpen,
  selectedCourses,
  bulkStatus,
  filteredCourses,
  handleBulkStatusChange,
  bulkUpdateStatusMutation,
}: BulkStatusModalProps) {
  const StatusIcon = statusConfig[bulkStatus as keyof typeof statusConfig]?.icon;

  return (
    <Dialog open={isBulkStatusModalOpen} onOpenChange={setIsBulkStatusModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Bulk Status Update
          </DialogTitle>
          <DialogDescription>
            You are about to update {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} to{" "}
            <strong>{bulkStatus}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Preview */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">New Status:</span>
            <Badge className={cn("px-2 py-1", statusConfig[bulkStatus as keyof typeof statusConfig]?.color)}>
              {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
              {statusConfig[bulkStatus as keyof typeof statusConfig]?.label || bulkStatus}
            </Badge>
          </div>

          {/* Affected Courses */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Affected Courses ({selectedCourses.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {filteredCourses
                .filter(course => selectedCourses.includes(course._id))
                .slice(0, 5)
                .map(course => (
                  <div key={course._id} className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="truncate">{course.title}</span>
                  </div>
                ))}
              {selectedCourses.length > 5 && (
                <div className="text-sm text-gray-500 text-center">
                  +{selectedCourses.length - 5} more courses
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsBulkStatusModalOpen(false)}
            disabled={bulkUpdateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkStatusChange}
            disabled={bulkUpdateStatusMutation.isPending}
            className="gap-2"
          >
            {bulkUpdateStatusMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}