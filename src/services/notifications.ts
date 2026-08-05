import type { ApiResponse } from "@/types";

export async function fetchNotifications(
  userId: number
): Promise<ApiResponse & { unreadCount?: number }> {
  const res = await fetch(`/api/notifications?userId=${userId}`);
  return res.json();
}

export async function markNotificationsRead(
  userId: number,
  notificationId?: number
): Promise<ApiResponse> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, notificationId }),
  });
  return res.json();
}
