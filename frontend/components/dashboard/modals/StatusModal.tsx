import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, EyeOff, Eye, Archive, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types";

interface StatusModalProps {
  isStatusModalOpen: boolean;
  setIsStatusModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  handleStatusChange: (status: string) => void;
  updateStatusMutation: any;
  getPublishingRequirements: (course: Course) => any;
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

export function StatusModal({
  isStatusModalOpen,
  setIsStatusModalOpen,
  selectedCourse,
  handleStatusChange,
  updateStatusMutation,
  getPublishingRequirements,
}: StatusModalProps) {
  const StatusIcon = selectedCourse ? statusConfig[selectedCourse.status as keyof typeof statusConfig]?.icon : null;

  return (
    <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Change Course Status
          </DialogTitle>
          <DialogDescription>
            Update the status for "{selectedCourse?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Current Status:</span>
            {selectedCourse && (
              <Badge className={cn("px-2 py-1", statusConfig[selectedCourse.status as keyof typeof statusConfig]?.color)}>
                {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                {statusConfig[selectedCourse.status as keyof typeof statusConfig]?.label || selectedCourse.status}
              </Badge>
            )}
          </div>

          {/* Status Options */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Select New Status:</h4>
            <div className="grid gap-2">
              <Button
                variant={selectedCourse?.status === "draft" ? "default" : "outline"}
                onClick={() => handleStatusChange("draft")}
                disabled={selectedCourse?.status === "draft" || updateStatusMutation.isPending}
                className="justify-start gap-2 h-11"
              >
                <EyeOff className="h-4 w-4" />
                Set as Draft
                <span className="text-xs text-muted-foreground ml-auto">
                  Not visible to students
                </span>
              </Button>

              <Button
                variant={selectedCourse?.status === "published" ? "default" : "outline"}
                onClick={() => handleStatusChange("published")}
                disabled={selectedCourse?.status === "published" || updateStatusMutation.isPending}
                className="justify-start gap-2 h-11"
              >
                <Eye className="h-4 w-4" />
                Publish Course
                <span className="text-xs text-muted-foreground ml-auto">
                  Visible to students
                </span>
              </Button>

              <Button
                variant={selectedCourse?.status === "archived" ? "default" : "outline"}
                onClick={() => handleStatusChange("archived")}
                disabled={selectedCourse?.status === "archived" || updateStatusMutation.isPending}
                className="justify-start gap-2 h-11"
              >
                <Archive className="h-4 w-4" />
                Archive Course
                <span className="text-xs text-muted-foreground ml-auto">
                  Hidden from students
                </span>
              </Button>
            </div>
          </div>

          {/* Publishing Requirements */}
          {selectedCourse && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Publishing Requirements
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getPublishingRequirements(selectedCourse).requirements.map((req: any, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded text-sm",
                      req.met ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}
                  >
                    {req.met ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{req.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsStatusModalOpen(false)}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}