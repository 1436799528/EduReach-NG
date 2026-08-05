"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  FileArchive,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UploadedFile {
  id: number;
  fileName: string;
  fileSize: number;
  publicUrl: string;
}

interface FileUploaderProps {
  userId: number;
  category?: string;
  onUploadComplete?: (file: UploadedFile) => void;
}

const ALLOWED_EXT = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "csv", "zip", "rar",
  "png", "jpg", "jpeg", "webp", "svg",
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(ext: string) {
  if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext))
    return <Image className="w-5 h-5 text-purple-500" />;
  if (["zip", "rar"].includes(ext))
    return <FileArchive className="w-5 h-5 text-amber-500" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  return <FileText className="w-5 h-5 text-brand-500" />;
}

interface QueueItem {
  file: File;
  title: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: UploadedFile;
}

export default function FileUploader({
  userId,
  category,
  onUploadComplete,
}: FileUploaderProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);

    const newItems: QueueItem[] = fileArray
      .filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return ALLOWED_EXT.includes(ext) && f.size <= 50 * 1024 * 1024;
      })
      .map((f) => ({
        file: f,
        title: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        status: "pending" as const,
      }));

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const removeFromQueue = (idx: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTitle = (idx: number, title: string) => {
    setQueue((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, title } : item))
    );
  };

  const uploadAll = async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== "pending") continue;

      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", queue[i].file);
        formData.append("userId", String(userId));
        formData.append("title", queue[i].title);
        formData.append("category", category || "material");

        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? { ...item, status: "done", result: data.data }
                : item
            )
          );
          onUploadComplete?.(data.data);
        } else {
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? { ...item, status: "error", error: data.message }
                : item
            )
          );
        }
      } catch {
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: "error", error: "Upload failed" }
              : item
          )
        );
      }
    }
  };

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXT.map((e) => `.${e}`).join(",")}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
        <Upload
          className={`w-10 h-10 mx-auto mb-3 ${dragOver ? "text-brand-500" : "text-slate-300"}`}
        />
        <p className="text-sm font-medium text-slate-700">
          {dragOver ? "Drop files here" : "Drag & drop files or click to browse"}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, ZIP, RAR, PNG, JPG, SVG — Max 50MB
        </p>
      </div>

      {/* File Queue */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {queue.length} file{queue.length !== 1 ? "s" : ""} selected
              {doneCount > 0 && ` · ${doneCount} uploaded`}
            </p>
            {pendingCount > 0 && (
              <button
                onClick={uploadAll}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition"
              >
                <Upload className="w-4 h-4" />
                Upload {pendingCount > 1 ? `All ${pendingCount}` : ""}
              </button>
            )}
          </div>

          {queue.map((item, idx) => {
            const ext =
              item.file.name.split(".").pop()?.toLowerCase() || "";
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.status === "done"
                    ? "bg-green-50 border-green-200"
                    : item.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-slate-200"
                }`}
              >
                {getFileIcon(ext)}
                <div className="flex-1 min-w-0">
                  {item.status === "pending" ? (
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTitle(idx, e.target.value)}
                      className="w-full text-sm font-medium text-slate-900 border-b border-slate-200 focus:border-brand-500 focus:outline-none pb-0.5"
                      placeholder="Give this file a title..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.title}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.file.name} · {formatSize(item.file.size)}
                  </p>
                  {item.error && (
                    <p className="text-xs text-red-600 mt-0.5">{item.error}</p>
                  )}
                </div>

                {/* Status indicator */}
                {item.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-brand-600 animate-spin shrink-0" />
                )}
                {item.status === "done" && (
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {item.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                {item.status === "pending" && (
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-slate-300 hover:text-red-500 transition shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
