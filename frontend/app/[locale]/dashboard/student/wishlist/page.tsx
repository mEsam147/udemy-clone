"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { studentService } from "@/services/student.service";
import { enrollCourse } from "@/services/course.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Heart,
  Trash2,
  BookOpen,
  PlayCircle,
  Star,
  Clock,
  Users,
  ShoppingCart,
  Eye,
  Bookmark,
  Search,
  Grid3X3,
  Table as TableIcon,
  Code,
  Filter,
  SortAsc,
  Download,
  Plus,
  AlertCircle,
  Loader2,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { paymentService } from "@/services/payment.service";
import { loadStripe } from "@stripe/stripe-js";

type ViewMode = "grid" | "table" | "raw";
type SortField = "title" | "price" | "rating" | "students" | "level";

export default function Wishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: studentService.getWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: (courseId: string) => studentService.removeFromWishlist(courseId),
    onMutate: (courseId) => {
      setRemovingCourseId(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: "Course removed",
        description: "Course has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove course from wishlist",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setRemovingCourseId(null);
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (course: Course) => {
      setEnrollingCourseId(course.id);

      if (course.price === 0) {
        // Free course - direct enrollment
        const response = await enrollCourse(course.id);
        if (!response.success) {
          throw new Error("Failed to enroll in free course");
        }
        return response;
      } else {
        // Paid course - Stripe checkout
        const { sessionId } = await paymentService.createCheckoutSession({
          courseId: course.id,
        });

        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );

        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          });

          if (error) {
            throw new Error(error.message);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Could not enroll in the course",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setEnrollingCourseId(null);
    },
  });

  const filteredAndSortedCourses = useMemo(() => {
    if (!data?.data) return [];

    let courses = data.data.filter((course: Course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    courses.sort((a: Course, b: Course) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "rating":
          aValue = a.ratings?.average || 0;
          bValue = b.ratings?.average || 0;
          break;
        case "students":
          aValue = a.studentsEnrolled || 0;
          bValue = b.studentsEnrolled || 0;
          break;
        case "level":
          aValue = a.level || "";
          bValue = b.level || "";
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return courses;
  }, [data?.data, searchQuery, sortField, sortDirection]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;

  const wishlist = data?.data || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        </div>
        <p className="text-muted-foreground">
          {wishlist.length === 0
            ? "Start building your learning journey"
            : `You have ${wishlist.length} saved course${wishlist.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {/* Controls */}
      {wishlist.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  <SortAsc className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                </Button>

                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
                  <TabsList className="grid w-[140px] grid-cols-3">
                    <TabsTrigger value="grid" size="sm">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="table" size="sm">
                      <TableIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="raw" size="sm">
                      <Code className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      {wishlist.length > 0 && searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredAndSortedCourses.length} results for</span>
          <Badge variant="secondary">"{searchQuery}"</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-auto p-0 text-primary hover:bg-transparent"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredAndSortedCourses.length > 0 ? (
          <motion.div
            key={`content-${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {viewMode === "grid" && (
              <GridView
                courses={filteredAndSortedCourses}
                onRemove={removeMutation.mutate}
                onEnroll={enrollMutation.mutate}
                removingCourseId={removingCourseId}
                enrollingCourseId={enrollingCourseId}
              />
            )}

            {viewMode === "table" && (
              <TableView
                courses={filteredAndSortedCourses}
                onRemove={removeMutation.mutate}
                onEnroll={enrollMutation.mutate}
                removingCourseId={removingCourseId}
                enrollingCourseId={enrollingCourseId}
              />
            )}

            {viewMode === "raw" && (
              <RawDataView courses={filteredAndSortedCourses} />
            )}
          </motion.div>
        ) : wishlist.length === 0 ? (
          <EmptyWishlistState />
        ) : (
          <EmptySearchState onClearSearch={() => setSearchQuery("")} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Grid View Component
function GridView({ courses, onRemove, onEnroll, removingCourseId, enrollingCourseId }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: Course, index: number) => (
        <CourseCard
          key={course.id}
          course={course}
          index={index}
          onRemove={() => onRemove(course.id)}
          onEnroll={() => onEnroll(course)}
          isRemoving={removingCourseId === course.id}
          isEnrolling={enrollingCourseId === course.id}
        />
      ))}
    </div>
  );
}

// Course Card Component
function CourseCard({ course, index, onRemove, onEnroll, isRemoving, isEnrolling }: any) {
  const isFree = course.price === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow group">
        {/* Course Image */}
        <div className="aspect-video relative bg-muted overflow-hidden">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Course Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
              {course.level || "All Levels"}
            </Badge>
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={isRemoving}
              className="h-8 w-8 bg-background/95 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Enrollment Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEnroll();
              }}
              disabled={isEnrolling}
              className="w-full bg-background/95 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              size="sm"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isFree ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Enroll Free
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase ${course.price}
                </>
              )}
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-lg leading-tight">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {course.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          {/* Instructor */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            <span className="font-medium text-foreground">
              {course.instructor?.name}
            </span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {course.ratings?.average && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.ratings.average.toFixed(1)}</span>
                <span>({course.ratings.count})</span>
              </div>
            )}
            {course.totalHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.totalHours}h</span>
              </div>
            )}
          </div>

          {/* Category */}
          {course.category && (
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {isFree ? (
              <span className="font-bold text-lg text-green-600">Free</span>
            ) : (
              <span className="font-bold text-lg">${course.price}</span>
            )}
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.slug || course.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Table View Component
function TableView({ courses, onRemove, onEnroll, removingCourseId, enrollingCourseId }: any) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course: Course, index: number) => {
            const isFree = course.price === 0;
            const isEnrolling = enrollingCourseId === course.id;
            const isRemoving = removingCourseId === course.id;

            return (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {course.image && (
                        <Image
                          src={course.image}
                          alt={course.title}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium line-clamp-1">{course.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{course.category}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{course.instructor?.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {course.level || "All"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {course.ratings?.average?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {isFree ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Free
                    </Badge>
                  ) : (
                    <div className="font-medium">${course.price}</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => onEnroll(course)}
                      disabled={isEnrolling}
                      className="min-w-[100px]"
                    >
                      {isEnrolling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFree ? (
                        "Enroll Free"
                      ) : (
                        `Buy $${course.price}`
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/courses/${course.slug || course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(course.id)}
                      disabled={isRemoving}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// Raw Data View Component
function RawDataView({ courses }: { courses: Course[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Raw Data
        </CardTitle>
        <CardDescription>
          JSON representation of your wishlist data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(courses, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

// Empty Wishlist State
function EmptyWishlistState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
          <p className="text-muted-foreground">
            Start building your learning journey by saving courses that interest you
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/courses">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Courses
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/student/my_learning">
              <BookOpen className="h-4 w-4 mr-2" />
              My Learning
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <div>Save Courses</div>
          </div>
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Bookmark className="h-4 w-4 text-primary" />
            </div>
            <div>Organize Learning</div>
          </div>
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <div>Quick Enrollment</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty Search State
function EmptySearchState({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
        <Button onClick={onClearSearch} variant="outline">
          Clear Search
        </Button>
      </div>
    </motion.div>
  );
}

// Error State Component
function ErrorState({ error }: { error: Error }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Unable to load wishlist</h3>
          <p className="text-muted-foreground">
            We encountered an error while loading your wishlist
          </p>
        </div>
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error.message}
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </motion.div>
  );
}

// Skeleton Loading
function PageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Controls Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
