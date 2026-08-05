"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  fetchUserUploads,
  fetchUserFiles,
  deleteUpload as deleteUploadService,
  deleteFile as deleteFileService,
} from "@/services/uploads";
import type { Upload, FileUpload } from "@/types";

export function useUploads() {
  const { user } = useAuth();
  const [textUploads, setTextUploads] = useState<Upload[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUploads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [textRes, fileRes] = await Promise.all([
        fetchUserUploads(user.id),
        fetchUserFiles(user.id),
      ]);
      if (textRes.success && textRes.data) setTextUploads(textRes.data);
      if (fileRes.success && fileRes.data) setFileUploads(fileRes.data);
    } catch {
      // Silently fail — uploads are not critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const removeTextUpload = async (uploadId: number) => {
    if (!user) return false;
    const res = await deleteUploadService(uploadId, user.id);
    if (res.success) {
      setTextUploads((prev) => prev.filter((u) => u.id !== uploadId));
    }
    return res.success;
  };

  const removeFile = async (fileId: number) => {
    if (!user) return false;
    const res = await deleteFileService(fileId, user.id);
    if (res.success) {
      setFileUploads((prev) => prev.filter((f) => f.id !== fileId));
    }
    return res.success;
  };

  const allUploads = [
    ...textUploads.map((u) => ({ ...u, kind: "text" as const })),
    ...fileUploads.map((f) => ({
      id: f.id,
      title: f.title || f.fileName,
      type: f.fileType,
      status: f.status,
      createdAt: f.createdAt,
      kind: "file" as const,
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    textUploads,
    fileUploads,
    allUploads,
    loading,
    removeTextUpload,
    removeFile,
    reload: loadUploads,
  };
}
