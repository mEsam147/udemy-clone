// components/courses/course-comparison.tsx - COMPLETE VERSION
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Users, DollarSign, CheckCircle, Crown, 
  BookOpen, Award, Download, Globe, BarChart3, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/lib/types";

interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onClose: () => void;
  onClearAll?: () => void;
}

export function CourseComparison({ 
  courses, 
  onRemoveCourse, 
  onClose, 
  onClearAll 
}: CourseComparisonProps) {
  const { toast } = useToast();

  // Comparison fields configuration
  const comparisonFields = [
    { 
      key: "price", 
      label: "Price", 
      icon: DollarSign, 
      format: (value: number, course?: Course) => {
        if (course?.isPremium) {
          return (
            <div className="flex items-center gap-1 text-green-600">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Premium</span>
            </div>
          );
        }
        return value === 0 ? "Free" : `$${value.toFixed(2)}`;
      },
      highlight: "lowest" 
    },
    { 
      key: "ratings.average", 
      label: "Rating", 
      icon: Star, 
      format: (value: number) => value ? (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-medium">{value.toFixed(1)}</span>
        </div>
      ) : "No ratings",
      highlight: "highest" 
    },
    { 
      key: "ratings.count", 
      label: "Reviews", 
      icon: Users, 
      format: (value: number) => value ? value.toLocaleString() : "0",
      highlight: "highest" 
    },
    { 
      key: "studentsEnrolled", 
      label: "Students", 
      icon: Users, 
      format: (value: number) => value ? value.toLocaleString() : "0",
      highlight: "highest" 
    },
    { 
      key: "totalHours", 
      label: "Duration", 
      icon: Clock, 
      format: (value: number) => value ? `${value}h` : "Not specified",
      highlight: "highest" 
    },
    { 
      key: "lecturesCount", 
      label: "Lectures", 
      icon: BookOpen, 
      format: (value: number) => value ? value.toString() : "0",
      highlight: "highest" 
    },
    { 
      key: "level", 
      label: "Level", 
      format: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value || "Not specified"}
        </Badge>
      )
    },
    { 
      key: "category", 
      label: "Category", 
      format: (value: string) => value || "Uncategorized" 
    },
  ];

  const featureFields = [
    {
      key: "features",
      label: "Features",
      icon: Award,
      format: (features: string[] = []) => (
        <div className="space-y-1">
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="line-clamp-1">{feature}</span>
            </div>
          ))}
          {features.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{features.length - 3} more features
            </div>
          )}
        </div>
      )
    }
  ];

  const getFieldValue = (course: Course, path: string) => {
    return path.split('.').reduce((obj, key) => obj?.[key], course as any);
  };

  const getHighlightClass = (field: any, value: any, allValues: any[]) => {
    if (!field.highlight || allValues.length < 2) return "";
    
    const numericValues = allValues.map(v => typeof v === 'number' ? v : 0);
    
    if (field.highlight === 'highest' && Math.max(...numericValues) === value) {
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
    }
    
    if (field.highlight === 'lowest' && Math.min(...numericValues) === value) {
      return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
    }
    
    return "";
  };

  const handleEnrollClick = (course: Course) => {
    toast({
      title: "Redirecting to Course",
      description: `Taking you to ${course.title}`,
    });
    window.location.href = `/courses/${course.slug || course._id}`;
  };

  const handleClearAll = () => {
    onClearAll?.();
    toast({
      title: "Comparison Cleared",
      description: "All courses removed from comparison.",
    });
  };

  if (courses.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b shrink-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Compare Courses
              </h2>
              <p className="text-muted-foreground">
                Side-by-side comparison of {courses.length} course{courses.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onClearAll && (
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Comparison Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Courses Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => {
                  const instructorName = course.instructor?.name || "Unknown Instructor";
                  const instructorAvatar = course.instructor?.avatar || "";
                  
                  return (
                    <Card key={course._id} className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveCourse(course.id)}
                        className="absolute top-3 right-3 h-8 w-8 p-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <CardHeader className="pb-4">
                        <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {course.isPremium && (
                            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg line-clamp-2 leading-tight">
                          {course.title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={instructorAvatar} alt={instructorName} />
                            <AvatarFallback className="text-xs">
                              {instructorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {instructorName}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Button 
                          className="w-full" 
                          onClick={() => handleEnrollClick(course)}
                        >
                          View Course Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Separator className="my-6" />

              {/* Detailed Comparison */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Course Information
                  </h3>
                  <div className="space-y-4">
                    {comparisonFields.map((field) => {
                      const allValues = courses.map(course => getFieldValue(course, field.key));
                      
                      return (
                        <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 font-semibold p-3 bg-muted/50 rounded-lg">
                            {field.icon && <field.icon className="h-4 w-4 text-primary" />}
                            {field.label}
                          </div>
                          {courses.map((course, index) => {
                            const value = getFieldValue(course, field.key);
                            const highlightClass = getHighlightClass(field, value, allValues);
                            
                            return (
                              <div 
                                key={`${course._id}-${field.key}`} 
                                className={`p-3 rounded-lg border transition-colors ${highlightClass}`}
                              >
                                {field.format(value, course)}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* What You'll Learn */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    What You'll Learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={`${course._id}-learn`} className="space-y-2">
                        <ul className="space-y-2">
                          {(course.whatYoullLearn || []).slice(0, 4).map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                        {(course.whatYoullLearn || []).length > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{(course.whatYoullLearn || []).length - 4} more learning objectives
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Features & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Course Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featureFields.map((field) => (
                        <div key={field.key} className="col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 font-semibold p-3">
                            {field.icon && <field.icon className="h-4 w-4 text-primary" />}
                            {field.label}
                          </div>
                          {courses.map((course) => (
                            <div key={`${course._id}-features`} className="p-3">
                              {field.format(course.features)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Requirements
                    </h3>
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div key={`${course.id}-requirements`} className="space-y-2">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {(course.requirements || []).slice(0, 3).map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>
                    {3 - courses.length} more course{courses.length < 2 ? 's' : ''} can be added
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Best Value</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">Lowest Price</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onClearAll && (
                  <Button variant="outline" onClick={handleClearAll}>
                    Clear All
                  </Button>
                )}
                <Button onClick={onClose}>
                  Close Comparison
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}