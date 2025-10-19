import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  Clock,
  Users,
  Star,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Settings,
  MoreVertical,
  PlayCircle,
  FileText,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types";

interface CourseCardProps {
  course: Course;
  viewMode: "grid" | "list";
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onViewLessons: (course: Course) => void;
  onAddLesson: (course: Course) => void;
  onStatusChange: (course: Course) => void;
  isSelected: boolean;
  onSelect: () => void;
  user: any;
}

const getStatusConfig = (status: string) => {
  const config = {
    published: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Published",
      icon: Eye,
    },
    draft: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Draft",
      icon: FileText,
    },
    archived: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Archived",
      icon: Shield,
    },
  };
  return config[status as keyof typeof config] || config.draft;
};

const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function CourseCardInstructor({
  course,
  viewMode,
  onEdit,
  onDelete,
  onViewLessons,
  onAddLesson,
  onStatusChange,
  isSelected,
  onSelect,
  user,
}: CourseCardProps) {
  const statusConfig = getStatusConfig(
    course.status || (course.isPublished ? "published" : "draft")
  );
  const StatusIcon = statusConfig.icon;

  if (viewMode === "list") {
    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Course Image */}
            <div className="relative flex-shrink-0">
              <img
                src={course.image || ""}
                alt={course.title}
                className="w-32 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -top-2 -left-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {course.description}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold text-gray-900">
                    ${course.price || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(course?.createdAt!)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  {course.lecturesCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.totalHours || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.studentsEnrolled || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {(course.rating || 0).toFixed(1)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" asChild variant="outline">
                  <Link href={`/instructor/courses/preview/${course._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                      Manage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(course)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewLessons(course)}>
                      <Video className="h-4 w-4 mr-2" />
                      View Lessons
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddLesson(course)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onStatusChange(course)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(course)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="group relative h-[70vh] overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image ||""}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Selection Checkbox */}
        <div className="absolute top-3 left-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>

        {/* Status Badge */}
        <Badge className={cn("absolute top-3 right-3", statusConfig.color)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>

        {/* Category Badge */}
        <Badge className="absolute bottom-3 left-3 bg-black/60 text-white border-0">
          {course.category}
        </Badge>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <Button
              size="sm"
              asChild
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              <Link
                href={`/dashboard/instructor/courses/preview/${course._id}`}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-black/60 text-white hover:bg-black/80"
              onClick={() => onEdit(course)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Course Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {course.title}
        </h3>

        {/* Course Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              {course.lecturesCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.totalHours || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{(course.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        {/* Enrollment and Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-gray-900">
            ${course.price || 0}
          </span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.studentsEnrolled || 0}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <MoreVertical className="h-4 w-4" />
                Manage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(course)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewLessons(course)}>
                <Video className="h-4 w-4 mr-2" />
                View Lessons
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddLesson(course)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange(course)}>
                <Settings className="h-4 w-4 mr-2" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(course)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" asChild className="flex-1">
            <Link href={`/dashboard/instructor/courses/preview/${course._id}`}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
