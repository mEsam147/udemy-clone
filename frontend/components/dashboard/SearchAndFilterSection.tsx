"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Grid3X3, List, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SearchAndFilterSectionProps {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  viewMode: "grid" | "list";
  limit: number;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}

export function SearchAndFilterSection({
  searchTerm,
  statusFilter,
  sortBy,
  viewMode,
  limit,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  onLimitChange,
  onRefresh,
}: SearchAndFilterSectionProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onSearchChange("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-11 rounded-lg border-gray-300 focus:border-blue-500"
          />
          {localSearchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40 h-11 rounded-lg">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40 h-11 rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 w-8 p-0 rounded-md"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 w-8 p-0 rounded-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Per Page */}
          <Select
            value={limit.toString()}
            onValueChange={(value) => onLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-28 h-11 rounded-lg">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 per page</SelectItem>
              <SelectItem value="9">9 per page</SelectItem>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="18">18 per page</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2 h-11"
          >
            <Zap className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
