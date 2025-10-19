import { fetchWrapper } from "@/lib/api";
import { getNotifications } from "@/services/notification.service";
import { useState, useEffect } from "react";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications({});
      setNotifications(data?.data || []);
      setUnreadCount(data.data.filter((n: any) => !n.read).length);
      setError(null);
    } catch (err) {
      setError(err.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refetch every minute
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
