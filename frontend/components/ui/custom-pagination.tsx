// components/ui/custom-pagination.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  className?: string;
}

export function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = "",
}: CustomPaginationProps) {
  const isSinglePage = totalPages <= 1;

  const generatePageNumbers = () => {
    if (isSinglePage) return [1];

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1 && !isSinglePage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isSinglePage) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 px-2 ${className}`}
    >
      {/* Page info - Stack on mobile */}
      <div className="text-sm text-muted-foreground text-center lg:text-left whitespace-nowrap">
        <span className="inline-block lg:hidden">
          Page {currentPage} of {totalPages}
        </span>
        <span className="hidden lg:inline">
          Page {currentPage} of {totalPages} • {totalItems.toLocaleString()}{" "}
          total items
        </span>
        {isSinglePage && (
          <span className="ml-2">• All courses on one page</span>
        )}
      </div>

      {/* Pagination controls - Center on mobile */}
      <div className="flex-shrink-0 order-first lg:order-none">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
                className={
                  isSinglePage || currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-accent"
                }
              />
            </PaginationItem>

            {pageNumbers.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isSinglePage) onPageChange(page);
                  }}
                  className={
                    isSinglePage ? "cursor-default bg-muted" : "hover:bg-accent"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className={
                  isSinglePage || currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-accent"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Items per page selector - Stack on mobile */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
        <span className="hidden sm:inline">Show</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange?.(Number(value))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
          </SelectContent>
        </Select>
        <span className="hidden sm:inline">per page</span>
      </div>
    </div>
  );
}
