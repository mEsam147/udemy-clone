// components/landing/categories-section.tsx
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, X, Grid, List } from "lucide-react";

interface Category {
  id: string;
  name: string;
  courseCount: number;
  totalStudents: number;
  avgRating: number;
  icon: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate progress percentage based on student count
  const getProgressPercentage = (studentCount: number) => {
    // Find the maximum student count to scale progress bars relatively
    const maxStudents = Math.max(...categories.map(cat => cat.totalStudents));
    // Calculate percentage (minimum 10% for visibility, maximum 100%)
    return Math.max(10, Math.min(100, (studentCount / maxStudents) * 100));
  };

  // Show only 6 categories in the main section
  const displayedCategories = categories.slice(0, 6);

  // Filter categories for modal based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CategoryCard = ({ category, index, compact = false }: { category: Category; index: number; compact?: boolean }) => {
    const progressPercentage = getProgressPercentage(category.totalStudents);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ scale: compact ? 1.02 : 1.05, y: compact ? -2 : -5 }}
      >
        <Card className={`p-${compact ? '4' : '6'} hover:shadow-xl transition-all duration-300 cursor-pointer group border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 ${
          compact ? 'h-full' : ''
        }`}>
          <div className={`flex items-center ${compact ? 'space-x-3' : 'space-x-4'}`}>
            <motion.div
              className={`${compact ? 'text-xl' : 'text-2xl'} group-hover:scale-110 transition-transform duration-300`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {category.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${compact ? 'text-base' : 'text-lg'} group-hover:text-primary transition-colors truncate`}>
                {category.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">
                  {category.courseCount} course{category.courseCount !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-foreground">
                    {category.avgRating.toFixed(1)}
                  </span>
                  <div className="text-yellow-500">★</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {category.totalStudents.toLocaleString()} students
              </p>
            </div>
          </div>

          {/* Progress bar for engagement */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Popularity</span>
              <span className="text-xs font-medium text-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                className="bg-gradient-to-r from-muted-foreground to-primary rounded-full h-2 shadow-sm"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">0</span>
              <span className="text-xs text-muted-foreground">
                {Math.max(...categories.map(cat => cat.totalStudents)).toLocaleString()} students
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const CategoryListItem = ({ category, index }: { category: Category; index: number }) => {
    const progressPercentage = getProgressPercentage(category.totalStudents);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border-border bg-card/50 backdrop-blur-sm hover:bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <motion.div
                className="text-2xl group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {category.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.courseCount} courses • {category.totalStudents.toLocaleString()} students
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right">
              {/* Rating */}
              <div className="flex items-center space-x-1">
                <span className="font-medium text-foreground">
                  {category.avgRating.toFixed(1)}
                </span>
                <div className="text-yellow-500">★</div>
              </div>

              {/* Progress Bar */}
              <div className="w-32">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-primary to-purple-600 rounded-full h-2 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Top Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular course categories. Start learning from our
              diverse range of courses taught by expert instructors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCategories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>

          {/* View All Categories CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-/5  px-8 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-purple-600/5 transition-all duration-300 hover:shadow-lg text-lg"
              size="lg"
            >
              View All Categories
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl xl:min-w-5xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-md border-0">
          <DialogHeader className="relative">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-center">
              All Course Categories
            </DialogTitle>

            {/* Search Bar */}
            <div className="relative mt-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center border border-border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0 rounded-md"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0 rounded-md"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Categories Grid/List */}
          <div className={`overflow-y-auto custom-scrollbar-thin pr-4 max-h-[60vh] ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }`}>
            <AnimatePresence mode="wait">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  viewMode === "grid" ? (
                    <CategoryCard key={category.id} category={category} index={index} compact />
                  ) : (
                    <CategoryListItem key={category.id} category={category} index={index} />
                  )
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 col-span-full"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
