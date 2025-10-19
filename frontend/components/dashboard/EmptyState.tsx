import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

export function EmptyState({ hasSearch, onClearSearch }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
    >
      <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasSearch ? "No courses found" : "No courses yet"}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasSearch
          ? "Try adjusting your search terms or filters to find what you're looking for."
          : "Start your teaching journey by creating your first course. Share your knowledge with students around the world."}
      </p>
      <div className="flex gap-3 justify-center">
        {hasSearch ? (
          <Button onClick={onClearSearch} variant="outline">
            Clear Search
          </Button>
        ) : (
          <Link href="/instructor/create-course">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Course
            </Button>
          </Link>
        )}
        <Link href="/instructor">
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
