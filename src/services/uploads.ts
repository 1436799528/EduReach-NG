import type { ApiResponse, Upload, FileUpload } from "@/types";

export async function submitUpload(data: {
  userId: number;
  title: string;
  type: string;
  content: string;
  year?: number | null;
}): Promise<ApiResponse> {
  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchUserUploads(
  userId: number
): Promise<ApiResponse<Upload[]>> {
  const res = await fetch(`/api/uploads?userId=${userId}`);
  return res.json();
}

export async function deleteUpload(
  uploadId: number,
  userId: number
): Promise<ApiResponse> {
  const res = await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, userId }),
  });
  return res.json();
}

export async function fetchUserFiles(
  userId: number
): Promise<ApiResponse<FileUpload[]>> {
  const res = await fetch(`/api/files?userId=${userId}`);
  return res.json();
}

export async function deleteFile(
  fileId: number,
  userId: number
): Promise<ApiResponse> {
  const res = await fetch("/api/files", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId, userId }),
  });
  return res.json();
}
