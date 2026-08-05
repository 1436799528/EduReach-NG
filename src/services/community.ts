import type { ApiResponse, CommunityPost } from "@/types";

export async function fetchPosts(
  params?: Record<string, string>
): Promise<ApiResponse<CommunityPost[]>> {
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const res = await fetch(`/api/community${query}`);
  return res.json();
}

export async function createPost(data: {
  userId: number;
  title?: string;
  content: string;
  postType?: string;
  parentId?: number;
  questionId?: number;
  topicId?: number;
}): Promise<ApiResponse> {
  const res = await fetch("/api/community", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function votePost(
  userId: number,
  postId: number,
  voteType: "up" | "down"
): Promise<ApiResponse> {
  const res = await fetch("/api/community/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, postId, voteType }),
  });
  return res.json();
}
