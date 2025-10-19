// components/StatusManagementPanel.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Eye,
  EyeOff,
  Archive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw,
  Filter,
  CheckSquare,
  Square,
  Zap,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { bulkUpdateCourseStatus, getCourseStatusStats } from "@/services/course.service";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Course {
  _id: string;
  title: string;
  status: string;
  instructor: string;
  image?: string;
  description?: string;
  lecturesCount?: number;
  requirements?: string[];
  whatYoullLearn?: string[];
  studentsEnrolled?: number;
  createdAt: string;
}

interface StatusManagementPanelProps {
  courses: Course[];
  userRole: string;
  userId: string;
  onStatusUpdate?: () => void;
}

interface StatusStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalStudents: number;
  totalRevenue: number;
}

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    icon: EyeOff,
    description: "Course is not visible to students",
    badgeColor: "bg-yellow-500"
  },
  published: {
    label: "Published",
    color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: Eye,
    description: "Course is live and visible to students",
    badgeColor: "bg-green-500"
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    icon: Archive,
    description: "Course is hidden from students",
    badgeColor: "bg-gray-500"
  },
};

export function StatusManagementPanel({
  courses,
  userRole,
  userId,
  onStatusUpdate,
}: StatusManagementPanelProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<StatusStats | null>(null);
  const queryClient = useQueryClient();

  // Filter courses based on user permissions
  const editableCourses = courses?.filter(course =>
    userRole === "admin" || (userRole === "instructor" && course?.instructor === userId)
  );

  // Filter courses by status
  const filteredCourses = statusFilter === "all" 
    ? editableCourses 
    : editableCourses?.filter(course => course?.status === statusFilter);

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      total: editableCourses?.length,
      published: editableCourses?.filter(c => c.status === "published").length,
      draft: editableCourses?.filter(c => c.status === "draft").length,
      archived: editableCourses?.filter(c => c.status === "archived").length,
      totalStudents: editableCourses?.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0),
      totalRevenue: editableCourses?.reduce((acc, course) => {
        // Assuming $10 per student for demo purposes
        return acc + ((course.studentsEnrolled || 0) * 10);
      }, 0),
    };
    setStats(stats);
  };

  // Initialize stats
  useState(() => {
    calculateStats();
  });

  // Bulk status update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ courseIds, status }: { courseIds: string[]; status: string }) =>
      bulkUpdateCourseStatus(courseIds, status),
    onSuccess: () => {
      toast({
        title: "✅ Status updated successfully!",
        description: `${selectedCourses.length} courses have been ${bulkStatus}ed.`,
      });
      setSelectedCourses([]);
      setBulkStatus("");
      setShowBulkModal(false);
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      calculateStats();
      onStatusUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error updating status",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Select all courses
  const selectAllCourses = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course._id));
    }
  };

  // Toggle single course selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = () => {
    if (!bulkStatus || selectedCourses.length === 0) return;
    
    bulkUpdateMutation.mutate({
      courseIds: selectedCourses,
      status: bulkStatus,
    });
  };

  // Refresh stats
  const refreshStats = () => {
    calculateStats();
    toast({
      title: "Stats refreshed",
      description: "Course statistics have been updated.",
    });
  };

  const getStatusPercentage = (count: number) => {
    return stats ? (count / stats.total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          value={stats?.total || 0}
          label="Total Courses"
          color="blue"
          trend={`${getStatusPercentage(stats?.total || 0).toFixed(1)}% of total`}
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          value={stats?.published || 0}
          label="Published"
          color="green"
          trend={`${getStatusPercentage(stats?.published || 0).toFixed(1)}%`}
        />
        <StatCard
          icon={<EyeOff className="h-5 w-5" />}
          value={stats?.draft || 0}
          label="Draft"
          color="yellow"
          trend={`${getStatusPercentage(stats?.draft || 0).toFixed(1)}%`}
        />
        <StatCard
          icon={<Archive className="h-5 w-5" />}
          value={stats?.archived || 0}
          label="Archived"
          color="gray"
          trend={`${getStatusPercentage(stats?.archived || 0).toFixed(1)}%`}
        />
      </div>

      {/* Bulk Actions Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Bulk Status Management
              </CardTitle>
              <CardDescription>
                Manage multiple courses at once. Select courses and apply status changes in bulk.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Selection */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCourses?.length === filteredCourses?.length && filteredCourses?.length > 0}
                  onCheckedChange={selectAllCourses}
                  disabled={filteredCourses?.length === 0}
                />
                <span className="text-sm font-medium">
                  {selectedCourses?.length} of {filteredCourses?.length} selected
                </span>
              </div>
              
              {selectedCourses?.length > 0 && (
                <div className="flex items-center gap-2">
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
                    onClick={() => setShowBulkModal(true)}
                    disabled={!bulkStatus}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredCourses?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No courses found</p>
                <p className="text-sm">Adjust your filters or create new courses</p>
              </div>
            ) : (
              filteredCourses?.map((course) => {
                const status = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.draft;
                const StatusIcon = status.icon;
                const isSelected = selectedCourses.includes(course._id);

                return (
                  <div
                    key={course._id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-lg transition-all duration-200",
                      isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCourseSelection(course._id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {course.title}
                        </h4>
                        <Badge className={cn("px-2 py-1 text-xs", status.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.studentsEnrolled || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge variant="outline" className={cn("px-2 py-1", status.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{status.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Update Confirmation Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Bulk Status Update
            </DialogTitle>
            <DialogDescription>
              You are about to update {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} to{" "}
              <strong>{bulkStatus}</strong>. This action will affect all selected courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status Preview */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">New Status:</span>
              <Badge className={cn("px-2 py-1", statusConfig[bulkStatus as keyof typeof statusConfig]?.color)}>
                {statusConfig[bulkStatus as keyof typeof statusConfig]?.icon && (
                  <statusConfig[bulkStatus as keyof typeof statusConfig].icon className="h-3 w-3 mr-1" />
                )}
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
                  ?.filter(course => selectedCourses.includes(course._id))
                  ?.slice(0, 5)
                  ?.map(course => (
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

            {/* Warning for Publishing */}
            {bulkStatus === "published" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Publishing Notice</p>
                    <p>Courses will become visible to students. Ensure they meet all requirements.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
              disabled={bulkUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkStatusUpdate}
              disabled={bulkUpdateMutation.isPending}
              className="gap-2"
            >
              {bulkUpdateMutation.isPending ? (
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
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, color, trend }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    gray: "from-gray-500 to-gray-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            {trend && (
              <p className="text-xs text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}