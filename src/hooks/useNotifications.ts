"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  fetchNotifications as fetchNotifs,
  markNotificationsRead,
} from "@/services/notifications";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNotifs(user.id)
      .then((d) => {
        if (d.success) {
          setNotifications(d.data as Notification[]);
          setUnreadCount(d.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await markNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}
