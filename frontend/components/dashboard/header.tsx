"use client";
import {
  Bell,
  Search,
  Menu,
  User,
  ChevronDown,
  Settings,
  LogOut,
  X,
  BookOpen,
  Video,
  Users as UsersIcon,
  MessageSquare,
  CheckCircle,
  Trash2,
  Clock,
  Zap,
  Eye,
  Star,
  DollarSign,
  Heart,
  AlertCircle,
  Loader2,
  History,
  Sparkles,
  TrendingUp,
  Clock as ClockIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import * as authService from "@/services/auth.service";
import { searchService, type SearchResult } from "@/services/search.service";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/notification.service";
import { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "../theme-toggle";
interface DashboardHeaderProps {
onMenuClick: () => void;
  user: UserType;
}
// Custom debounce hook
function useDebounce<T>(value: T, delay?: number): T {
const [debouncedValue, setDebouncedValue] = useState<T>(value);
useEffect(() => {
const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
return () => clearTimeout(timer);
  }, [value, delay]);
return debouncedValue;
}
const notificationTypes = {
  ENROLLMENT: { icon: UsersIcon, color: "text-green-500", label: "Enrollment" },
  LESSON_COMPLETED: {
    icon: CheckCircle,
    color: "text-blue-500",
    label: "Lesson Completed",
  },
  WISHLIST_ADDED: { icon: Heart, color: "text-red-500", label: "Wishlist" },
  WISHLIST_REMOVED: { icon: Heart, color: "text-gray-500", label: "Wishlist" },
  COURSE_CREATED: {
    icon: BookOpen,
    color: "text-purple-500",
    label: "Course Created",
  },
  LESSON_ADDED: { icon: Video, color: "text-orange-500", label: "New Lesson" },
  REVIEW_ADDED: { icon: Star, color: "text-yellow-500", label: "New Review" },
  PAYMENT_SUCCESS: {
    icon: DollarSign,
    color: "text-emerald-500",
    label: "Payment",
  },
  COURSE_UPDATED: {
    icon: Eye,
    color: "text-cyan-500",
    label: "Course Updated",
  },
  COURSE_DELETED: {
    icon: Trash2,
    color: "text-rose-500",
    label: "Course Deleted",
  },
  SYSTEM_ANNOUNCEMENT: {
    icon: AlertCircle,
    color: "text-amber-500",
    label: "System",
  },
};
// Quick search suggestions based on user role
const getQuickSuggestions = (role: string) => {
const baseSuggestions = [
"JavaScript",
"React",
"Web Development",
"Python",
"Design",
  ];
if (role === "instructor") {
return [...baseSuggestions, "My Students", "Course Analytics"];
  }
if (role === "admin") {
return [...baseSuggestions, "User Management", "Analytics"];
  }
return baseSuggestions;
};
export function DashboardHeader({ onMenuClick, user }: DashboardHeaderProps) {
const router = useRouter();
const queryClient = useQueryClient();
const [searchValue, setSearchValue] = useState("");
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [inputWidth, setInputWidth] = useState(0);
const [searchInputRef, setSearchInputRef] = useState<HTMLDivElement | null>(null);
const searchRef = useRef<HTMLInputElement>(null);
// Use the custom debounce hook
const debouncedSearchValue = useDebounce(searchValue, 300);
// Measure input width for popover
useEffect(() => {
if (searchInputRef) {
const updateWidth = () => {
setInputWidth(searchInputRef?.offsetWidth || 0);
      };
updateWidth();
      window.addEventListener('resize', updateWidth);
return () => window.removeEventListener('resize', updateWidth);
    }
  }, [searchInputRef]);
// Recent searches query
const { data: recentSearchesData } = useQuery({
    queryKey: ["recentSearches"],
queryFn: () => searchService.getRecentSearches(),
    enabled: isSearchOpen && !searchValue,
  });
// Notifications queries
const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", "header"],
queryFn: () => getNotifications(),
    refetchInterval: 30000,
  });
// Search query using the new service with enhanced logic
const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching: isSearchFetching
  } = useQuery({
    queryKey: ["dashboardSearch", debouncedSearchValue, user.id, user.role],
queryFn: () => searchService.dashboardSearch(debouncedSearchValue),
    enabled: !!debouncedSearchValue && !!user.id && isSearchOpen,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
onError: (error: any) => {
      console.error("Search error:", error);
if (error.message?.includes("401") || error.message?.includes("403")) {
        router.push("/auth/login");
      } else {
toast({
          title: "❌ Search failed",
          description: "Unable to perform search. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
// Clear recent searches mutation
const clearRecentSearchesMutation = useMutation({
    mutationFn: searchService.clearRecentSearches,
onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
toast({
        title: "✅ Recent searches cleared",
        description: "Your search history has been cleared.",
      });
    },
onError: (error: any) => {
toast({
        title: "❌ Failed to clear search history",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
// Notifications mutations
const markAsReadMutation = useMutation({
mutationFn: (notificationId: string) =>
markNotificationAsRead(notificationId),
onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
toast({
        title: "✅ All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
  });
const deleteNotificationMutation = useMutation({
mutationFn: (notificationId: string) => deleteNotification(notificationId),
onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
toast({
        title: "🗑️ Notification deleted",
        description: "The notification has been deleted.",
      });
    },
  });
const notifications = notificationsData?.data || [];
const unreadNotifications = notifications.filter((n) => !n.read);
const unreadCount = unreadNotifications.length;
const recentSearches = recentSearchesData?.data?.recentSearches || [];
const quickSuggestions = getQuickSuggestions(user.role);
// Enhanced search handlers
const handleSearchFocus = () => {
setIsSearchOpen(true);
  };
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setSearchValue(e.target.value);
// Keep search open when typing
if (!isSearchOpen) {
setIsSearchOpen(true);
    }
  };
const handleClearSearch = () => {
setSearchValue("");
// Don't close search popover when clearing, show recent searches instead
  };
const handleQuickSuggestionClick = (suggestion: string) => {
setSearchValue(suggestion);
setIsSearchOpen(true);
  };
const handleRecentSearchClick = (searchTerm: string) => {
setSearchValue(searchTerm);
setIsSearchOpen(true);
  };
const handleClearRecentSearches = () => {
    clearRecentSearchesMutation.mutate();
  };
const handleResultClick = (result: SearchResult) => {
setSearchValue("");
setIsSearchOpen(false);
// Enhanced navigation with smooth transitions
setTimeout(() => {
if (result.type === "course") {
if (user.role === "instructor" || user.role === "admin") {
          router.push(`/instructor/courses/${result._id}`);
        } else {
          router.push(`/courses/${result.slug}`);
        }
      } else if (result.type === "lesson" && result.course) {
        router.push(`/courses/${result.course.slug}/lessons/${result._id}`);
      } else if (result.type === "student") {
if (user.role === "admin") {
          router.push(`/admin/users/${result._id}`);
        } else {
          router.push(`/instructor/students/${result._id}`);
        }
      }
    }, 150);
  };
const handleNotificationClick = (notification: any) => {
if (!notification.read) {
handleMarkAsRead(notification._id);
    }
if (notification.course) {
setTimeout(() => {
if (user.role === "instructor" || user.role === "admin") {
          router.push(`/instructor/courses/${notification.course._id}`);
        } else {
          router.push(`/courses/${notification.course.slug}`);
        }
      }, 150);
    }
setIsNotificationOpen(false);
  };
const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };
const handleMarkAllAsRead = () => {
if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };
const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };
const handleLogout = async () => {
try {
await authService.logout();
      router.push("/auth/signin");
    } catch (error: any) {
toast({
        title: "❌ Logout Failed",
        description: error.message || "Failed to log out.",
        variant: "destructive",
      });
    }
  };
const formatTime = (dateString: string) => {
const date = new Date(dateString);
const now = new Date();
const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
if (diffInMinutes < 1) return "Just now";
if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
const getResultIcon = (type: SearchResult["type"]) => {
switch (type) {
case "course":
return BookOpen;
case "lesson":
return Video;
case "student":
return UsersIcon;
default:
return Search;
    }
  };
const getResultColor = (type: SearchResult["type"]) => {
switch (type) {
case "course":
return "text-blue-500";
case "lesson":
return "text-green-500";
case "student":
return "text-purple-500";
default:
return "text-gray-500";
    }
  };
// Enhanced search content rendering
const renderSearchContent = () => {
// Show quick suggestions and recent searches when no query
if (!searchValue && isSearchOpen) {
return (
<div className="max-h-96 overflow-y-auto custom-scrollbar-thin">
{/* Quick Suggestions */}
<div className="p-4 border-b">
<div className="flex items-center gap-2 mb-3">
<Sparkles className="h-4 w-4 text-yellow-500" />
<h3 className="font-semibold text-foreground">Quick Suggestions</h3>
</div>
<div className="flex flex-wrap gap-2">
{quickSuggestions.map((suggestion, index) => (
<motion.button
key={suggestion}
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: index * 0.05 }}
onClick={() => handleQuickSuggestionClick(suggestion)}
className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all duration-200 hover:scale-105 border"
>
{suggestion}
</motion.button>
              ))}
</div>
</div>
{/* Recent Searches */}
<div className="p-4">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<History className="h-4 w-4 text-muted-foreground" />
<h3 className="font-semibold text-foreground">Recent Searches</h3>
</div>
{recentSearches.length > 0 && (
<Button
variant="ghost"
size="sm"
onClick={handleClearRecentSearches}
disabled={clearRecentSearchesMutation.isPending}
className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
>
{clearRecentSearchesMutation.isPending ? (
<Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
"Clear all"
                  )}
</Button>
              )}
</div>
{recentSearches.length === 0 ? (
<div className="text-center py-8 text-muted-foreground">
<History className="h-8 w-8 mx-auto mb-2 opacity-50" />
<p className="text-sm">No recent searches</p>
<p className="text-xs mt-1">Your search history will appear here</p>
</div>
            ) : (
<div className="space-y-1">
{recentSearches.map((searchTerm, index) => (
<motion.button
key={index}
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.03 }}
onClick={() => handleRecentSearchClick(searchTerm)}
className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 group text-left"
>
<History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
<span className="text-sm text-foreground truncate flex-1">
{searchTerm}
</span>
<Button
variant="ghost"
size="sm"
className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
onClick={(e) => {
                        e.stopPropagation();
// Individual search removal could be implemented here
                      }}
>
<X className="h-3 w-3" />
</Button>
</motion.button>
                ))}
</div>
            )}
</div>
</div>
      );
    }
// Show search results when there's a query
if (searchValue) {
const isLoading = isSearchLoading || isSearchFetching;
if (isLoading) {
return (
<div className="p-8 text-center">
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
<Loader2 className="h-8 w-8 text-primary mx-auto mb-3" />
</motion.div>
<p className="text-sm text-muted-foreground">Searching for "{searchValue}"</p>
<p className="text-xs text-muted-foreground mt-1">Checking courses, lessons, and more...</p>
</div>
        );
      }
if (searchError) {
return (
<div className="p-6 text-center">
<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
<p className="text-sm font-medium text-foreground mb-2">Search failed</p>
<p className="text-xs text-muted-foreground mb-4">
{searchError.message || "Unable to load search results"}
</p>
<Button
variant="outline"
size="sm"
onClick={() => queryClient.refetchQueries({ queryKey: ["dashboardSearch"] })}
className="w-full"
>
<Loader2 className="h-3 w-3 mr-2" />
              Try Again
</Button>
</div>
        );
      }
if (!searchResults?.data?.results?.length) {
return (
<div className="p-8 text-center">
<Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
<p className="text-sm font-medium text-foreground mb-1">
              No results found for "{searchValue}"
</p>
<p className="text-xs text-muted-foreground mb-4">
              Try different keywords or check your spelling
</p>
<div className="flex flex-wrap gap-2 justify-center">
{quickSuggestions.slice(0, 3).map((suggestion) => (
<button
key={suggestion}
onClick={() => handleQuickSuggestionClick(suggestion)}
className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors"
>
{suggestion}
</button>
              ))}
</div>
</div>
        );
      }
const results = searchResults.data.results;
const groupedResults = {
        courses: results.filter((r: SearchResult) => r.type === "course"),
        lessons: results.filter((r: SearchResult) => r.type === "lesson"),
        students: results.filter((r: SearchResult) => r.type === "student"),
      };
return (
<div className="max-h-96 overflow-y-auto custom-scrollbar-thin">
{/* Results Summary */}
<div className="p-4 border-b bg-muted/20">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<TrendingUp className="h-4 w-4 text-green-500" />
<span className="text-sm font-medium text-foreground">
{results.length} results
</span>
</div>
<Badge variant="outline" className="text-xs">
{debouncedSearchValue}
</Badge>
</div>
</div>
{/* Results List */}
<div className="p-2">
{Object.entries(groupedResults).map(([type, items]) => {
if (items.length === 0) return null;
const title = {
                courses: "Courses",
                lessons: "Lessons",
                students: user.role === "admin" ? "Users" : "Students",
              }[type];
return (
<div key={type} className="mb-4 last:mb-0">
<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
{title} ({items.length})
</h4>
<div className="space-y-1">
{(items as SearchResult[]).map((result, index) => {
const IconComponent = getResultIcon(result.type);
const iconColor = getResultColor(result.type);
return (
<motion.div
key={result._id}
initial={{ opacity: 0, y: 5 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group border"
onClick={() => handleResultClick(result)}
>
<div className={cn(
"p-2 rounded-lg flex-shrink-0",
                            result.type === "course" && "bg-blue-50 dark:bg-blue-950/20",
                            result.type === "lesson" && "bg-green-50 dark:bg-green-950/20",
                            result.type === "student" && "bg-purple-50 dark:bg-purple-950/20"
                          )}>
<IconComponent className={cn("h-4 w-4", iconColor)} />
</div>
<div className="flex-1 min-w-0">
<div className="flex items-start justify-between gap-2 mb-1">
<h4 className="text-sm font-medium text-foreground truncate">
{result.title}
</h4>
<div className="flex items-center gap-1 flex-shrink-0">
{result.type === "course" && result.isEnrolled && (
<Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Enrolled
</Badge>
                                )}
{result.type === "course" && (
<Badge variant={result.isPublished ? "default" : "secondary"} className="text-xs">
{result.isPublished ? "Published" : "Draft"}
</Badge>
                                )}
{result.type === "lesson" && result.duration && (
<Badge variant="outline" className="text-xs">
<ClockIcon className="h-3 w-3 mr-1" />
{Math.floor(result.duration / 60)}m
</Badge>
                                )}
</div>
</div>
<div className="flex items-center gap-2 text-xs text-muted-foreground">
{result.type === "course" && result.category && (
<span>{result.category}</span>
                              )}
{result.type === "lesson" && result.course && (
<span>In: {result.course.title}</span>
                              )}
{result.type === "student" && result.email && (
<span>{result.email}</span>
                              )}
</div>
</div>
</motion.div>
                      );
                    })}
</div>
</div>
              );
            })}
</div>
</div>
      );
    }
return null;
  };
return (
<motion.header
initial={{ y: -20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.3 }}
className="flex justify-between h-16 items-center gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 sticky top-0 z-50"
>
{/* Mobile menu button */}
<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
type="button"
className="-m-2.5 p-2.5 text-muted-foreground lg:hidden rounded-lg hover:bg-accent transition-colors"
onClick={onMenuClick}
>
<Menu className="h-6 w-6" />
</motion.button>
{/* Separator */}
<div className="h-6 w-px bg-border lg:hidden" />
{/* Enhanced Search bar with Popover */}
<Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
<PopoverTrigger asChild>
<motion.div
ref={setSearchInputRef}
initial={{ scaleX: 0.95, opacity: 0 }}
animate={{ scaleX: 1, opacity: 1 }}
transition={{ delay: 0.1, duration: 0.3 }}
className="relative flex flex-1 max-w-2xl"
>
<Input
ref={searchRef}
type="text"
placeholder={`Search for ${
                user.role === "student"
? "courses or lessons"
: user.role === "instructor"
? "courses, lessons, or students"
: "courses, lessons, or users"
}...`}
value={searchValue}
onChange={handleSearchChange}
onFocus={handleSearchFocus}
onClick={(e) => e.stopPropagation()}
className="pl-4 pr-10 h-10 bg-muted/50 border-border focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl shadow-sm"
/>
<div
className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-x-1"
onClick={(e) => {
  e.stopPropagation();
  searchRef.current?.focus();
}}
>
{searchValue && (
<motion.button
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
onClick={handleClearSearch}
className="p-1 rounded-full hover:bg-accent transition-colors"
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.9 }}
>
<X className="h-3 w-3 text-muted-foreground" />
</motion.button>
              )}
{!searchValue && (
<Search className="h-4 w-4 text-muted-foreground" />
              )}
</div>
</motion.div>
</PopoverTrigger>
{/* Popover Content - Matches input width */}
<PopoverContent
align="start"
style={{ width: inputWidth }}
className="p-0 rounded-xl shadow-xl border max-w-2xl min-w-[300px]"
sideOffset={8}
>
<motion.div
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
>
{renderSearchContent()}
</motion.div>
</PopoverContent>
</Popover>
{/* Right side buttons */}
<div className="flex items-center gap-x-3 lg:gap-x-4">
<ThemeToggle />
{/* Notifications Popover */}
<Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
<PopoverTrigger asChild>
<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
className={cn(
"relative rounded-full h-10 w-10 flex items-center justify-center transition-colors",
                isNotificationOpen
? "bg-accent text-primary"
: "hover:bg-accent text-muted-foreground"
              )}
>
<Bell className="h-5 w-5" />
{unreadCount > 0 && (
<Badge
variant="destructive"
className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0 rounded-full border-2 border-background animate-pulse"
>
{unreadCount > 9 ? "9+" : unreadCount}
</Badge>
              )}
</motion.button>
</PopoverTrigger>
<PopoverContent
align="end"
className="w-80 sm:w-96 p-0 rounded-xl shadow-xl border"
sideOffset={10}
>
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
>
{/* Notifications Header */}
<div className="flex items-center justify-between p-4 border-b">
<div>
<h3 className="font-semibold text-foreground">Notifications</h3>
<p className="text-sm text-muted-foreground">
{unreadCount} unread{" "}
{unreadCount === 1 ? "message" : "messages"}
</p>
</div>
<div className="flex gap-2">
{unreadCount > 0 && (
<Button
variant="ghost"
size="sm"
onClick={handleMarkAllAsRead}
disabled={markAllAsReadMutation.isPending}
className="text-xs text-primary hover:text-primary/80"
>
{markAllAsReadMutation.isPending ? (
<Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
"Mark all read"
                      )}
</Button>
                  )}
<Button
variant="ghost"
size="sm"
onClick={() => {
setIsNotificationOpen(false);
                      router.push("/notifications");
                    }}
className="text-xs text-muted-foreground hover:text-foreground"
>
                    View all
</Button>
</div>
</div>
{/* Notifications List */}
<div className="max-h-80 overflow-y-auto custom-scrollbar-thin">
{notificationsLoading ? (
<div className="p-4 text-center">
<Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
<p className="text-sm text-muted-foreground mt-2">
                      Loading notifications...
</p>
</div>
                ) : notifications.length === 0 ? (
<div className="p-8 text-center text-muted-foreground">
<Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
<p>No notifications yet</p>
<p className="text-sm">
                      We'll notify you when something happens
</p>
</div>
                ) : (
<AnimatePresence>
{notifications.slice(0, 5).map((notification, index) => {
const notificationType = notificationTypes[
                        notification.type as keyof typeof notificationTypes
                      ] || {
                        icon: Bell,
                        color: "text-muted-foreground",
                        label: "Notification",
                      };
const IconComponent = notificationType.icon;
return (
<motion.div
key={notification._id}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.1 }}
className={cn(
"p-3 border-b last:border-b-0 transition-colors cursor-pointer group",
!notification.read && "bg-accent/50"
                          )}
onClick={() => handleNotificationClick(notification)}
>
<div className="flex gap-x-3">
{/* Read indicator */}
<div
className={cn(
"w-2 h-2 rounded-full mt-2 flex-shrink-0",
!notification.read
? "bg-primary"
: "bg-muted-foreground/50"
                              )}
/>
{/* Notification content */}
<div className="flex-1 min-w-0 max-w-[calc(100%-40px)]">
<div className="flex items-start gap-2 mb-1">
<IconComponent
className={cn(
"h-4 w-4 flex-shrink-0 mt-0.5",
                                    notificationType.color
                                  )}
/>
<div className="flex-1 min-w-0">
<h4
className={cn(
"font-medium text-sm line-clamp-1",
!notification.read
? "text-foreground"
: "text-muted-foreground"
                                    )}
>
{notification.title || notification.message}
</h4>
<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
{notification.message}
</p>
</div>
</div>
{/* Meta information */}
<div className="flex items-center justify-between mt-2">
<Badge
variant="secondary"
className="text-xs bg-muted text-muted-foreground"
>
{notificationType.label}
</Badge>
<span className="text-xs text-muted-foreground flex items-center gap-1">
<Clock className="h-3 w-3" />
{formatTime(notification.createdAt)}
</span>
</div>
</div>
{/* Action buttons */}
<div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
{!notification.read && (
<Button
variant="ghost"
size="sm"
onClick={(e) => {
                                    e.stopPropagation();
handleMarkAsRead(notification._id);
                                  }}
className="h-7 w-7 p-0 text-primary hover:text-primary/80 hover:bg-accent"
disabled={markAsReadMutation.isPending}
title="Mark as read"
>
<CheckCircle className="h-3 w-3" />
</Button>
                              )}
<Button
variant="ghost"
size="sm"
onClick={(e) => {
                                  e.stopPropagation();
handleDeleteNotification(notification._id);
                                }}
className="h-7 w-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
disabled={deleteNotificationMutation.isPending}
title="Delete notification"
>
<Trash2 className="h-3 w-3" />
</Button>
</div>
</div>
</motion.div>
                      );
                    })}
</AnimatePresence>
                )}
</div>
{/* Notifications Footer */}
{notifications.length > 0 && (
<div className="p-3 border-t">
<Button
variant="ghost"
size="sm"
className="w-full text-sm text-primary hover:text-primary/80"
onClick={() => {
setIsNotificationOpen(false);
                      router.push("/notifications");
                    }}
>
<Zap className="h-4 w-4 mr-2" />
                    View all notifications
</Button>
</div>
              )}
</motion.div>
</PopoverContent>
</Popover>
{/* User menu */}
<DropdownMenu>
<DropdownMenuTrigger asChild>
<motion.button
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
className="flex items-center gap-x-3 rounded-full p-1 hover:bg-accent transition-colors group"
>
<div className="relative">
<Avatar className="h-8 w-8 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
<AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium">
{user?.name?.charAt(0).toUpperCase()}
</AvatarFallback>
</Avatar>
<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
</div>
<span className="hidden sm:block text-sm font-medium text-foreground">
{user.name}
</span>
<ChevronDown className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform" />
</motion.button>
</DropdownMenuTrigger>
<DropdownMenuContent
align="end"
className="w-64 rounded-xl shadow-xl border p-2"
sideOffset={10}
>
<motion.div
initial={{ opacity: 0, y: 5 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
>
{/* User Info */}
<div className="flex items-center gap-x-3 px-2 py-3 mb-1 rounded-lg bg-accent">
<Avatar className="h-12 w-12 border-2 border-background shadow-sm">
<AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium text-lg">
{user?.name?.charAt(0).toUpperCase()}
</AvatarFallback>
</Avatar>
<div className="flex flex-col flex-1 min-w-0">
<span className="text-sm font-semibold text-foreground truncate">
{user.name}
</span>
<span className="text-xs text-muted-foreground truncate">
{user.email}
</span>
<Badge
variant={
                      user.role === "admin"
? "destructive"
: user.role === "instructor"
? "default"
: "secondary"
}
className="mt-1 capitalize text-xs"
>
{user.role}
</Badge>
</div>
</div>
<DropdownMenuSeparator className="my-2" />
{/* Menu Items */}
<DropdownMenuItem
onClick={() => router.push("/dashboard/profile")}
className="flex items-center gap-x-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent hover:text-accent-foreground group"
>
<User className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
<span className="text-sm">Profile</span>
</DropdownMenuItem>
<DropdownMenuItem
onClick={() => router.push("/dashboard/settings")}
className="flex items-center gap-x-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent hover:text-accent-foreground group"
>
<Settings className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
<span className="text-sm">Settings</span>
</DropdownMenuItem>
{(user.role === "instructor" || user.role === "admin") && (
<DropdownMenuItem
onClick={() => router.push("/instructor/courses")}
className="flex items-center gap-x-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent hover:text-accent-foreground group"
>
<BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
<span className="text-sm">My Courses</span>
</DropdownMenuItem>
              )}
<DropdownMenuSeparator className="my-2" />
<DropdownMenuItem
onClick={handleLogout}
className="flex items-center gap-x-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group"
>
<LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
<span className="text-sm font-medium">Sign out</span>
</DropdownMenuItem>
</motion.div>
</DropdownMenuContent>
</DropdownMenu>
</div>
</motion.header>
  );
}
