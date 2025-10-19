// app/notifications/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  Star,
  Users,
  Video,
  DollarSign,
  Heart,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/services/notification.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const notificationTypes = {
  ENROLLMENT: {
    icon: Users,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20"
  },
  LESSON_COMPLETED: {
    icon: CheckCircle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  WISHLIST_ADDED: {
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20"
  },
  WISHLIST_REMOVED: {
    icon: Heart,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  COURSE_CREATED: {
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  LESSON_ADDED: {
    icon: Video,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  REVIEW_ADDED: {
    icon: Star,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  PAYMENT_SUCCESS: {
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  COURSE_UPDATED: {
    icon: Eye,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
  },
  COURSE_DELETED: {
    icon: Trash2,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
  },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "All notifications cleared",
        description: "All notifications have been deleted.",
      });
    },
  });

  const filteredNotifications =
    notifications?.data?.filter((notification) => {
      const matchesSearch = notification.message
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "unread"
          ? !notification.read
          : activeTab === "read"
          ? notification.read
          : true;

      return matchesSearch && matchesTab;
    }) || [];

  const unreadCount = notifications?.data?.filter((n) => !n.read).length || 0;

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted.",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <Bell className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Notifications
                </h1>
                <p className="text-muted-foreground">
                  Stay updated with your learning journey
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {unreadCount} unread
                </Badge>
              )}

              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>

              <Button
                onClick={() => deleteAllNotificationsMutation.mutate()}
                disabled={
                  !notifications?.data?.length ||
                  deleteAllNotificationsMutation.isPending
                }
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredNotifications.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16"
                >
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "You're all caught up!"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent =
                      notificationTypes[notification.type]?.icon || Bell;
                    const { color, bgColor } = notificationTypes[
                      notification.type
                    ] || {
                      color: "text-muted-foreground",
                      bgColor: "bg-muted",
                    };

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <Card
                          className={cn(
                            "hover:shadow-md transition-all duration-200 cursor-pointer group",
                            !notification.read &&
                              "bg-primary/5 border-l-4 border-l-primary"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Notification Icon */}
                              <div
                                className={cn(
                                  "p-2 rounded-lg flex-shrink-0",
                                  bgColor
                                )}
                              >
                                <IconComponent
                                  className={cn("h-5 w-5", color)}
                                />
                              </div>

                              {/* Notification Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      !notification.read
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {notification.message}
                                  </p>

                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notification._id);
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(
                                          notification._id
                                        );
                                      }}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-medium"
                                    >
                                      {notification.type.replace(/_/g, " ")}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(notification.createdAt)}
                                    </span>
                                  </div>

                                  {!notification.read && (
                                    <Badge
                                      variant="default"
                                      className="bg-primary text-primary-foreground"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="h-12 bg-muted rounded max-w-md animate-pulse"></div>

        {/* Tabs Skeleton */}
        <div className="h-12 bg-muted rounded animate-pulse"></div>

        {/* Notifications Skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-card rounded-lg border animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
