import { fetchWrapper } from "@/lib/api";

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  read: boolean;
  course?: { title: string; slug: string };
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

interface NotificationResponse {
  success: boolean;
  data: Notification;
}

// Fetch all notifications for the authenticated user
export const getNotifications = (
  token: string
): Promise<NotificationsResponse> => {
  return fetchWrapper("/notifications", "GET");
};

// Mark a single notification as read
// services/notification.service.ts
export const markNotificationAsRead = (
  notificationId: string
): Promise<NotificationResponse> => {
  return fetchWrapper(
    `/notifications/${notificationId}/read`,
    "PUT",
    undefined
  );
};

// Mark all notifications as read (optional)
export const markAllNotificationsAsRead = (
  token: string
): Promise<NotificationsResponse> => {
  return fetchWrapper("/notifications/read-all", "PUT", undefined);
};

// Delete a single notification (optional)
// services/notification.service.ts
export const deleteNotification = (
  notificationId: string
): Promise<NotificationResponse> => {
  return fetchWrapper(
    `/notifications/${notificationId}`,
    "DELETE",
    undefined
  );
};

// Delete all notifications (optional)
export const deleteAllNotifications = (
  token: string
): Promise<NotificationsResponse> => {
  return fetchWrapper("/notifications", "DELETE", undefined);
};
