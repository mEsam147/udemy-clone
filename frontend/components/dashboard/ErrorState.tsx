import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
    >
      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Error Loading Courses
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't load your courses. This might be due to a network issue or
        server problem.
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <Zap className="h-4 w-4" />
        Try Again
      </Button>
    </motion.div>
  );
}
