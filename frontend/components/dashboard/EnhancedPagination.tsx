import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaginationInfo } from "@/lib/types";


interface EnhancedPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}

export function EnhancedPagination({
  pagination,
  onPageChange,
  isFetching,
}: EnhancedPaginationProps) {
  const { currentPage, totalPages, totalCount, limit } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) pages.push(1, "...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages) pages.push("...", totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
    >
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{startItem}</span> to{" "}
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalCount}</span> courses
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className="gap-1 h-10 px-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={index} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={isFetching}
                className={cn(
                  "h-10 w-10 p-0 font-medium",
                  page === currentPage && "shadow-lg"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isFetching}
          className="gap-1 h-10 px-4"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
    </motion.div>
  );
}
