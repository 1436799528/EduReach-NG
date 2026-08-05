import type { ApiResponse } from "@/types";

export async function toggleBookmark(
  userId: number,
  questionId: number
): Promise<ApiResponse<{ bookmarked: boolean }>> {
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, questionId }),
  });
  return res.json();
}

export async function checkBookmark(
  userId: number,
  questionId: number
): Promise<{ bookmarked: boolean }> {
  const res = await fetch(
    `/api/bookmarks/check?userId=${userId}&questionId=${questionId}`
  );
  return res.json();
}

export async function fetchBookmarks(
  userId: number
): Promise<ApiResponse> {
  const res = await fetch(`/api/bookmarks?userId=${userId}`);
  return res.json();
}
