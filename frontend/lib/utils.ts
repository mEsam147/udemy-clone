import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// lib/utils.ts
export const getSafeValue = <T>(
  value: T | undefined | null,
  defaultValue: T
): T => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
};

export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) {
    return "0";
  }
  return num.toLocaleString();
};

export const getInitials = (name: string | undefined | null): string => {
  if (!name) {
    return "U";
  }
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};



// lib/utils.ts - Add formatDuration function
export const formatDuration = (hours: number): string => {
  if (!hours || hours === 0) return "0h";
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

// Format seconds to MM:SS (for lesson durations)
export const formatSeconds = (seconds: number): string => {
  if (!seconds || seconds === 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};