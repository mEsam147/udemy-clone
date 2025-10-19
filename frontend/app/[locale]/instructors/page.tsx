// app/instructors/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Users,
  BookOpen,
  MapPin,
  CheckCircle,
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Eye,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useInstructors } from "@/hooks/useInstructorQueries";
import type { InstructorFilters } from "@/services/instructor.service";

const expertiseOptions = [
  "React",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Node.js",
  "Python",
  "Machine Learning",
  "AI",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "CSS",
  "AWS",
  "Docker",
  "SQL",
  "MongoDB",
  "Backend Development",
  "Frontend Development",
  "Data Science",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
];

const sortOptions = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "newest", label: "Newest", icon: Clock },
  { value: "courses", label: "Most Courses", icon: BookOpen },
  { value: "students", label: "Most Students", icon: Users },
];

// Gradient colors for avatar backgrounds
const avatarGradients = [
  "from-blue-500 to-purple-600",
  "from-green-500 to-blue-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-teal-500 to-green-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
];

const getAvatarGradient = (name: string) => {
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[index % avatarGradients.length];
};

export default function InstructorsPage() {
  const [filters, setFilters] = useState<InstructorFilters>({
    page: 1,
    limit: 12,
    search: "",
    sort: "popular",
  });
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: instructorsData,
    isLoading,
    isFetching,
  } = useInstructors(filters);

  // Debounced search
  useEffect(() => {
    if (filters.search) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [filters.search]);

  // Update filters when expertise changes
  useEffect(() => {
    if (selectedExpertise.length > 0) {
      setFilters((prev) => ({
        ...prev,
        expertise: selectedExpertise,
        page: 1,
      }));
    } else {
      setFilters((prev) => {
        const { expertise, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  }, [selectedExpertise]);

  const handleFilterChange = (key: keyof InstructorFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((exp) => exp !== expertise)
        : [...prev, expertise]
    );
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      sort: "popular",
    });
    setSelectedExpertise([]);
  };

  const hasActiveFilters =
    filters.search ||
    selectedExpertise.length > 0 ||
    filters.verified ||
    filters.featured ||
    filters.country;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 200,
      },
    }),
  };

  const InstructorCard = ({
    instructor,
    index,
  }: {
    instructor: any;
    index: number;
  }) => {
    const avatarGradient = getAvatarGradient(instructor.user.name);
    const initials = instructor.user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();

    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
        className="group"
      >
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/30 hover:shadow-primary/10 cursor-pointer h-full flex flex-col bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm overflow-hidden relative">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Featured Ribbon */}
          {instructor.featured && (
            <div className="absolute top-4 right-4 z-20">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  delay: index * 0.1 + 0.3,
                }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Featured
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rotate-45" />
              </motion.div>
            </div>
          )}

          <CardContent className="p-6 flex-1 relative z-10">
            <div className="flex items-start gap-4">
              {/* Avatar with Enhanced Design */}
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${avatarGradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl relative overflow-hidden shadow-xl ring-2 ring-white/20 ring-inset`}
                >
                  {instructor.user.avatar ? (
                    <Image
                      src={instructor.user.avatar}
                      alt={instructor.user.name}
                      width={80}
                      height={80}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>

                {/* Verification Badge */}
                {instructor.isVerified && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg border-2 border-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.1 + 0.5,
                      type: "spring",
                      stiffness: 500,
                    }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 pr-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {instructor.user.name}
                    </motion.h3>
                    <motion.div
                      className="flex items-center gap-2 text-sm text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{instructor.user.country}</span>
                    </motion.div>
                  </div>
                </div>

                <motion.p
                  className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {instructor.profile.bio}
                </motion.p>

                {/* Expertise Tags with Animation */}
                <motion.div
                  className="flex flex-wrap gap-1.5 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {instructor.profile.expertise
                    .slice(0, 3)
                    .map((exp: string, tagIndex: number) => (
                      <motion.div
                        key={exp}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: index * 0.1 + 0.6 + tagIndex * 0.1,
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-all duration-200 group/tag backdrop-blur-sm border border-border/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpertise(exp);
                          }}
                        >
                          {exp}
                        </Badge>
                      </motion.div>
                    ))}
                  {instructor.profile.expertise.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs backdrop-blur-sm"
                    >
                      +{instructor.profile.expertise.length - 3} more
                    </Badge>
                  )}
                </motion.div>

                {/* Stats with Enhanced Design */}
                <motion.div
                  className="flex items-center gap-4 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  <div className="flex items-center gap-1.5 bg-foreground/5 rounded-full px-3 py-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-foreground">
                      {instructor.stats.averageRating}
                    </span>
                    <span className="text-xs">
                      ({instructor.stats.totalReviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-foreground/5 rounded-full px-3 py-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>
                      {instructor.stats.totalStudents.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-foreground/5 rounded-full px-3 py-1.5">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <span>{instructor.stats.totalCourses}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>

          {/* Enhanced Footer */}
          <CardFooter className="px-6 pb-6 pt-0 mt-auto relative z-10">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button
                asChild
                className="w-full group/btn bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <Link
                  href={`/instructors/${instructor._id}`}
                  className="relative overflow-hidden"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />

                  <Eye className="w-4 h-4 mr-2" />
                  <span className="font-semibold">View Profile</span>
                  <motion.span
                    className="ml-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const FilterSidebar = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sort By */}
      <div className="p-2">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          Sort By
        </h4>
        <Select
          value={filters.sort}
          onValueChange={(value: any) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-colors">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expertise */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-foreground ">
          Areas of Expertise
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-3">
          {expertiseOptions.map((expertise, index) => (
            <motion.div
              key={expertise}
              className="flex items-center gap-2 group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                type="checkbox"
                id={`expertise-${expertise}`}
                checked={selectedExpertise.includes(expertise)}
                onChange={() => toggleExpertise(expertise)}
                className="rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              />
              <label
                htmlFor={`expertise-${expertise}`}
                className="text-sm cursor-pointer select-none text-foreground group-hover:text-primary transition-colors"
              >
                {expertise}
              </label>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  const Pagination = () => {
    if (!instructorsData || instructorsData.totalPages <= 1) return null;

    const { currentPage, totalPages } = instructorsData;
    const pages = [];

    // Always show first page
    pages.push(1);

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return (
      <motion.div
        className="flex items-center justify-center gap-2 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && handlePageChange(page)}
            disabled={page === "..."}
            className={
              page === "..." ? "cursor-default hover:bg-transparent" : ""
            }
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="absolute z-20 top-10 left-10 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 hover:bg-gray-200"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:block">

            Back To Home
            </span>
          </Link>
        </Button>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-purple-500/20" />
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-pink-400/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Meet the Experts
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">
                Expert Instructors
              </h1>

              <motion.p
                className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Learn from industry professionals with real-world experience and
                proven teaching expertise
              </motion.p>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search instructors by name, expertise, or bio..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-0 bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/50 transition-all duration-300"
              />
              {(isSearching || isFetching) && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar - Desktop */}
          <motion.div
            className="hidden lg:block lg:w-80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-xl ">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters & Sorting
                  </h3>
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {instructorsData?.count || 0} results
                    </Badge>
                  )}
                </div>
                <FilterSidebar />
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Mobile Filters Sheet */}
          <div className="lg:hidden p-4">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full bg-background border-border/50"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters & Sorting
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-primary/10 text-primary"
                      >
                        {instructorsData?.count || 0}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 bg-background/95 backdrop-blur-md border-r-border/50"
              >
                <SheetHeader>
                  <SheetTitle>Filters & Sorting</SheetTitle>
                  <SheetDescription>
                    Refine your instructor search with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Instructors Grid */}
          <div className="flex-1 ">
            {/* Enhanced Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {instructorsData ? (
                    <span>
                      {instructorsData.totalCount} Expert Instructor
                      {instructorsData.totalCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    "Discover Instructors"
                  )}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {filters.search && `Search results for "${filters.search}"`}
                  {selectedExpertise.length > 0 &&
                    ` • Expertise: ${selectedExpertise.join(", ")}`}
                  {!filters.search &&
                    selectedExpertise.length === 0 &&
                    "Browse all expert instructors"}
                </p>
              </div>

              {/* Mobile filter count */}
              <div className="lg:hidden">
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {instructorsData?.count || 0} results
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Enhanced Loading State */}
            {(isLoading || isFetching) && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-64">
                      <CardContent className="p-6 h-full flex items-center justify-center">
                        <div className="flex items-center gap-4 w-full">
                          <Skeleton className="w-20 h-20 rounded-2xl" />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-16 rounded-full" />
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Enhanced Instructors Grid */}
            {!isLoading && instructorsData && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`instructors-${filters.page}-${filters.search}-${filters.sort}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {instructorsData.data.map((instructor, index) => (
                    <InstructorCard
                      key={instructor._id}
                      instructor={instructor}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Enhanced No Results State */}
            {!isLoading && instructorsData?.data.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Search className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No instructors found
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  {hasActiveFilters
                    ? "Try adjusting your search criteria or filters"
                    : "We're adding new instructors regularly. Check back soon!"}
                </p>
                {hasActiveFilters && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={clearAllFilters}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Enhanced Pagination */}
            {instructorsData && instructorsData.data.length > 0 && (
              <Pagination />
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}
