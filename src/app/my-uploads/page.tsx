"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  User,
  FileQuestion,
  BookOpen,
  FileText,
  Lightbulb,
} from "lucide-react";

interface UploadItem {
  id: number;
  title: string;
  type: string;
  content: string;
  year: number | null;
  status: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
      fetchUploads(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUploads = async (uid: number) => {
    try {
      const res = await fetch(`/api/uploads?userId=${uid}`);
      const data = await res.json();
      if (data.success) setUploads(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uploadId: number) => {
    if (!userId || !confirm("Delete this upload? This cannot be undone."))
      return;
    setDeleting(uploadId);
    try {
      const res = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "past_question": return <FileQuestion className="w-4 h-4" />;
      case "solution": return <Lightbulb className="w-4 h-4" />;
      case "notes": return <BookOpen className="w-4 h-4" />;
      case "material": return <FileText className="w-4 h-4" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  const statusBadge = (status: string | null) => {
    if (status === "approved")
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  if (!userId && !loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Sign in to view your uploads
          </h1>
          <Link
            href="/login"
            className="inline-flex px-6 py-3 bg-brand-700 text-white font-medium rounded-lg hover:bg-brand-800 transition mt-4"
          >
            Sign In
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "My Uploads" }]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              My Uploads
            </h1>
            <p className="text-slate-500">
              {uploads.length} upload{uploads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition"
          >
            <Upload className="w-4 h-4" />
            New Upload
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-slate-400">Loading uploads...</p>
          </div>
        ) : uploads.length > 0 ? (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-200 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs font-bold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded">
                        {typeIcon(upload.type)}
                        {upload.type.replace("_", " ")}
                      </span>
                      {statusBadge(upload.status)}
                      {upload.year && (
                        <span className="text-xs text-slate-400">
                          {upload.year}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {upload.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {upload.content}
                    </p>
                    {upload.reviewNote && upload.status === "rejected" && (
                      <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                        Reviewer note: {upload.reviewNote}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(upload.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    disabled={deleting === upload.id}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    title="Delete this upload"
                  >
                    {deleting === upload.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No uploads yet</p>
            <p className="text-sm mt-1">
              Start contributing past questions, notes, or solutions.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white font-medium rounded-lg hover:bg-brand-800 transition mt-6"
            >
              <Upload className="w-4 h-4" />
              Upload Now
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
