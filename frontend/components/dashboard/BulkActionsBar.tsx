import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, X, Zap } from "lucide-react";

interface BulkActionsBarProps {
  selectedCourses: string[];
  bulkStatus: string;
  setBulkStatus: (status: string) => void;
  openBulkStatusModal: () => void;
  setSelectedCourses: (courses: string[]) => void;
}

export function BulkActionsBar({
  selectedCourses,
  bulkStatus,
  setBulkStatus,
  openBulkStatusModal,
  setSelectedCourses,
}: BulkActionsBarProps) {
  if (selectedCourses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            {selectedCourses.length} course
            {selectedCourses.length > 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Set status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Publish</SelectItem>
              <SelectItem value="draft">Set as Draft</SelectItem>
              <SelectItem value="archived">Archive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={openBulkStatusModal}
            disabled={!bulkStatus}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Apply to {selectedCourses.length}
          </Button>
          <Button variant="outline" onClick={() => setSelectedCourses([])}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
