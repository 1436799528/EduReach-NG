import type { StoredUser, ApiResponse } from "@/types";

export async function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  gender?: string;
}): Promise<ApiResponse<{ user: StoredUser }>> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ user: StoredUser }>> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchProfile(
  userId: number
): Promise<ApiResponse> {
  const res = await fetch(`/api/auth/me?userId=${userId}`);
  return res.json();
}

export async function updateProfile(
  data: Record<string, unknown>
): Promise<ApiResponse> {
  const res = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function accountAction(
  data: Record<string, unknown>
): Promise<ApiResponse> {
  const res = await fetch("/api/auth/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
