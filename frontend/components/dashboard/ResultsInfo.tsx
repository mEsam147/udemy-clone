"use client";

import { motion } from "framer-motion";

interface ResultsInfoProps {
  currentPage: number;
  limit: number;
  totalCount: number;
  searchTerm: string;
  coursesCount: number;
}

export function ResultsInfo({
  currentPage,
  limit,
  totalCount,
  searchTerm,
  coursesCount,
}: ResultsInfoProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between mb-6"
    >
      <p className="text-sm text-gray-600">
        Showing <span className="font-semibold">{startItem}</span> to{" "}
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalCount}</span> courses
        {searchTerm && (
          <span>
            {" "}
            for "<span className="font-semibold">{searchTerm}</span>"
          </span>
        )}
      </p>

      <div className="text-sm text-gray-500">
        {coursesCount} course{coursesCount !== 1 ? "s" : ""} on this page
      </div>
    </motion.div>
  );
}
