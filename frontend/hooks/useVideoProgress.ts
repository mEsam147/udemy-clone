// hooks/useVideoProgress.ts
import { useState, useEffect } from "react";

interface UseVideoProgressProps {
  duration: number;
  onComplete?: () => void;
  completionThreshold?: number; // Percentage to consider as completed
}

export function useVideoProgress({
  duration,
  onComplete,
  completionThreshold = 90,
}: UseVideoProgressProps) {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const updateProgress = (seconds: number) => {
    setPlayedSeconds(seconds);
    const percentage = duration > 0 ? (seconds / duration) * 100 : 0;
    setCompletionPercentage(percentage);

    // Check if video meets completion threshold
    if (percentage >= completionThreshold && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  const resetProgress = () => {
    setPlayedSeconds(0);
    setIsCompleted(false);
    setCompletionPercentage(0);
  };

  return {
    playedSeconds,
    completionPercentage,
    isCompleted,
    updateProgress,
    resetProgress,
  };
}