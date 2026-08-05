"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import UploadFormNew from "@/components/upload/UploadFormNew";
import FileUploader from "@/components/upload/FileUploader";
import {
  FileText,
  File,
  Upload,
  CheckCircle,
  Trash2,
  Loader2,
  Clock,
  XCircle,
} from "lucide-react";

interface UploadedItem {
  id: number;
  title: string;
  type: string;
  status: string | null;
  createdAt: string;
}

interface UploadedFile {
  id: number;
  title: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string | null;
  createdAt: string;
}

export default function UploadPage() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [userId, setUserId] = useState<number | null>(null);
  const [textUploads, setTextUploads] = useState<UploadedItem[]>([]);
  const [fileUploads, setFileUploads] = useState<UploadedFile[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
      loadMyUploads(u.id);
    }
  }, []);

  const loadMyUploads = async (uid: number) => {
    setLoadingUploads(true);
    try {
      const [textRes, fileRes] = await Promise.all([
        fetch(`/api/uploads?userId=${uid}`),
        fetch(`/api/files?userId=${uid}`),
      ]);
      const textData = await textRes.json();
      const fileData = await fileRes.json();
      if (textData.success) setTextUploads(textData.data || []);
      if (fileData.success) setFileUploads(fileData.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingUploads(false);
    }
  };

  const deleteTextUpload = async (uploadId: number) => {
    if (!userId || !confirm("Delete this upload?")) return;
    setDeletingId(uploadId);
    try {
      const res = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setTextUploads((prev) => prev.filter((u) => u.id !== uploadId));
        setSuccessMessage("Upload deleted.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const deleteFile = async (fileId: number) => {
    if (!userId || !confirm("Delete this file?")) return;
    setDeletingId(fileId + 100000);
    try {
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setFileUploads((prev) => prev.filter((f) => f.id !== fileId));
        setSuccessMessage("File deleted.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const statusIcon = (s: string | null) => {
    if (s === "approved") return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
    if (s === "rejected") return <XCircle className="w-3.5 h-3.5 text-red-600" />;
    return <Clock className="w-3.5 h-3.5 text-amber-600" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadComplete = () => {
    setSuccessMessage("✅ Upload successful! It's now pending admin review.");
    if (userId) loadMyUploads(userId);
    setTimeout(() => setSuccessMessage(null), 5000);
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
      fileName: f.fileName,
      fileSize: f.fileSize,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Upload" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload &amp; Help Others Pass</h1>
          <p className="text-slate-500">Share past questions, solutions, notes, or study materials.</p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-6">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${mode === "text" ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <FileText className="w-4 h-4" />
            Type / Paste
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${mode === "file" ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <File className="w-4 h-4" />
            Upload Files
          </button>
        </div>

        {mode === "text" ? (
          <UploadFormNew />
        ) : userId ? (
          <div>
            <FileUploader userId={userId} category="material" onUploadComplete={handleUploadComplete} />
            <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-semibold text-amber-800 mb-2">📋 Supported file types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-sm text-amber-700">
                <span>📄 PDF, DOC, DOCX</span>
                <span>📊 PPT, PPTX</span>
                <span>📈 XLS, XLSX, CSV</span>
                <span>📝 TXT</span>
                <span>🖼️ PNG, JPG, WEBP, SVG</span>
                <span>📦 ZIP, RAR</span>
              </div>
              <p className="text-xs text-amber-600 mt-2">Max 50MB per file. Multiple files at once.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sign in to upload files.</p>
            <a href="/login" className="inline-block mt-4 px-6 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium">Login</a>
          </div>
        )}

        {/* My Uploads Section */}
        {userId && allUploads.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">My Uploads ({allUploads.length})</h2>
              <a href="/my-uploads" className="text-xs text-brand-600 font-medium hover:text-brand-700">View All →</a>
            </div>
            <div className="space-y-2">
              {allUploads.slice(0, 8).map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group hover:border-brand-200 transition">
                  <div className="flex items-center gap-1.5">
                    {statusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.type.replace("_", " ")} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()} •{" "}
                      <span className={`capitalize ${item.status === "approved" ? "text-green-600" : item.status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                        {item.status || "pending"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      item.kind === "text"
                        ? deleteTextUpload(item.id)
                        : deleteFile(item.id)
                    }
                    disabled={
                      deletingId === item.id ||
                      deletingId === item.id + 100000
                    }
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                  >
                    {deletingId === item.id || deletingId === item.id + 100000 ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
