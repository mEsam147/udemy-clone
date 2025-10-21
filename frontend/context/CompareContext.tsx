// context/CompareContext.tsx - UPDATED WITH API CALLS
"use client";

import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { Course } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { compareService } from "@/services/compare.service";

interface CompareState {
  courses: Course[];
  isComparing: boolean;
  isLoading: boolean;
  error: string | null;
}

type CompareAction =
  | { type: "ADD_COURSE"; payload: Course }
  | { type: "REMOVE_COURSE"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_COMPARING"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_COURSES"; payload: Course[] };

const initialState: CompareState = {
  courses: [],
  isComparing: false,
  isLoading: false,
  error: null,
};

interface CompareContextType {
  state: CompareState;
  addCourse: (course: Course) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  isInCompareList: (courseId: string) => boolean;
  loadComparisonList: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "ADD_COURSE":
      if (state.courses.length >= 3) {
        return {
          ...state,
          error: "Cannot compare more than 3 courses"
        };
      }

      // Check if course already exists
      const courseId = action.payload._id || action.payload.id;
      if (state.courses.some(c => (c._id || c.id) === courseId)) {
        return {
          ...state,
          error: "Course already in comparison list"
        };
      }

      return {
        ...state,
        courses: [...state.courses, action.payload],
        error: null
      };

    case "REMOVE_COURSE":
      return {
        ...state,
        courses: state.courses.filter(c => (c._id || c.id) !== action.payload),
        error: null
      };

    case "CLEAR_ALL":
      return {
        ...state,
        courses: [],
        error: null
      };

    case "SET_COMPARING":
      return {
        ...state,
        isComparing: action.payload
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload
      };

    case "SET_COURSES":
      return {
        ...state,
        courses: action.payload,
        error: null
      };

    default:
      return state;
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, initialState);
  const { toast } = useToast();

  // Load comparison list from server on mount
  useEffect(() => {
    loadComparisonList();
  }, []);

  const loadComparisonList = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const courses = await compareService.getComparisonList();
      dispatch({ type: "SET_COURSES", payload: courses });
    } catch (error) {
      console.error('Error loading comparison list:', error);
      // Fallback to localStorage if server fails
      try {
        const saved = localStorage.getItem('compare-courses');
        if (saved) {
          const courses = JSON.parse(saved);
          if (Array.isArray(courses) && courses.length > 0) {
            dispatch({ type: "SET_COURSES", payload: courses });
          }
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const syncWithServer = useCallback(async () => {
    try {
      const courseIds = state.courses.map(course => course._id || course.id).filter(Boolean) as string[];
      if (courseIds.length > 0) {
        await compareService.syncComparison(courseIds);
      }
    } catch (error) {
      console.error('Error syncing with server:', error);
    }
  }, [state.courses]);

  const addCourse = useCallback(async (course: Course) => {
    try {
      // Get course ID - handle both _id and id
      const courseId = course._id || course.id;

      // Validate course data
      if (!courseId) {
        throw new Error("Invalid course ID");
      }

      if (!course.title || course.title === "Untitled Course") {
        throw new Error("Invalid course data");
      }

      // Check maximum limit
      if (state.courses.length >= 3) {
        throw new Error("Cannot compare more than 3 courses");
      }

      // Check if course already exists
      if (state.courses.some(c => (c._id || c.id) === courseId)) {
        throw new Error("Course already in comparison list");
      }

      dispatch({ type: "SET_LOADING", payload: true });

      // API call to add course to comparison
      await compareService.addToComparison(courseId);

      // Update local state
      dispatch({ type: "ADD_COURSE", payload: course });

      // Save to localStorage
      localStorage.setItem('compare-courses', JSON.stringify([...state.courses, course]));

      toast({
        title: "Course Added",
        description: `${course.title} added to comparison`
      });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.courses, toast]);

  const removeCourse = useCallback(async (courseId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // API call to remove course from comparison
      await compareService.removeFromComparison(courseId);

      // Update local state
      dispatch({ type: "REMOVE_COURSE", payload: courseId });

      // Update localStorage
      const updatedCourses = state.courses.filter(c => (c._id || c.id) !== courseId);
      localStorage.setItem('compare-courses', JSON.stringify(updatedCourses));

      toast({
        title: "Course Removed",
        description: "Course removed from comparison"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove course from comparison",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.courses, toast]);

  const clearAll = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // API call to clear comparison
      await compareService.clearComparison();

      // Update local state
      dispatch({ type: "CLEAR_ALL" });

      // Clear localStorage
      localStorage.removeItem('compare-courses');

      toast({
        title: "Comparison Cleared",
        description: "All courses removed from comparison"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear comparison",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [toast]);

  const isInCompareList = useCallback((courseId: string) => {
    return state.courses.some(c => (c._id || c.id) === courseId);
  }, [state.courses]);

  const value: CompareContextType = {
    state,
    addCourse,
    removeCourse,
    clearAll,
    isInCompareList,
    loadComparisonList,
    syncWithServer
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
