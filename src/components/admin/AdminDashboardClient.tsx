"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileQuestion,
  CheckCircle,
  Upload,
  Layers,
  BookOpen,
  BarChart3,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
} from "lucide-react";

interface Stats {
  users: number;
  questions: number;
  solutions: number;
  pending: number;
  subjects: number;
  courses: number;
  sessions: number;
}

interface UploadItem {
  id: number;
  title: string;
  type: string;
  content: string;
  status: string | null;
  year: number | null;
  userId: number;
  contributorName: string;
  createdAt: string;
}

interface Contributor {
  id: number;
  fullName: string;
  points: number | null;
  role: string | null;
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedUpload, setExpandedUpload] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
          setUploads(data.data.pendingUploads);
          setContributors(data.data.topContributors);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (uploadId: number, action: "approve" | "reject") => {
    setActionLoading(uploadId);
    try {
      const upload = uploads.find((u) => u.id === uploadId);
      const res = await fetch(`/api/admin/uploads/${uploadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewNote: reviewNote || "",
          newTitle: editingTitle === uploadId ? editTitleValue : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  status: action === "approve" ? "approved" : "rejected",
                  title: editingTitle === uploadId ? editTitleValue : u.title,
                }
              : u
          )
        );
        if (stats) setStats({ ...stats, pending: Math.max(0, stats.pending - 1) });
        setEditingTitle(null);
        setReviewNote("");
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveTitle = async (uploadId: number) => {
    try {
      await fetch(`/api/admin/uploads/${uploadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle: editTitleValue }),
      });
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, title: editTitleValue } : u
        )
      );
      setEditingTitle(null);
    } catch {
      // ignore
    }
  };

  const filteredUploads = tab === "all" ? uploads : uploads.filter((u) => u.status === tab);

  const statusColor = (s: string | null) => {
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
        <p className="text-slate-500">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-500">Review uploads, edit titles, manage content.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { icon: Users, value: stats.users, label: "Users", color: "text-blue-600 bg-blue-50" },
            { icon: FileQuestion, value: stats.questions, label: "Questions", color: "text-purple-600 bg-purple-50" },
            { icon: CheckCircle, value: stats.solutions, label: "Solutions", color: "text-green-600 bg-green-50" },
            { icon: Upload, value: stats.pending, label: "Pending", color: "text-amber-600 bg-amber-50" },
            { icon: Layers, value: stats.subjects, label: "Subjects", color: "text-indigo-600 bg-indigo-50" },
            { icon: BookOpen, value: stats.courses, label: "Courses", color: "text-teal-600 bg-teal-50" },
            { icon: BarChart3, value: stats.sessions, label: "Sessions", color: "text-pink-600 bg-pink-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Moderation Queue */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-600" />
            Moderation Queue
          </h2>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-slate-200">
            {(["pending", "approved", "rejected", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition capitalize ${
                  tab === t
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t} ({uploads.filter((u) => t === "all" || u.status === t).length})
              </button>
            ))}
          </div>

          {filteredUploads.length > 0 ? (
            <div className="space-y-3">
              {filteredUploads.map((upload) => (
                <div key={upload.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedUpload(expandedUpload === upload.id ? null : upload.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-bold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded shrink-0">
                        {upload.type.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor(upload.status)}`}>
                        {upload.status || "pending"}
                      </span>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {upload.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-slate-400">{upload.contributorName}</span>
                      {expandedUpload === upload.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedUpload === upload.id && (
                    <div className="border-t border-slate-100 p-4 space-y-4">
                      {/* Editable Title */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Title</label>
                        {editingTitle === upload.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button
                              onClick={() => handleSaveTitle(upload.id)}
                              className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">{upload.title}</span>
                            <button
                              onClick={() => {
                                setEditingTitle(upload.id);
                                setEditTitleValue(upload.title);
                              }}
                              className="p-1 text-slate-400 hover:text-brand-600 transition"
                              title="Edit title"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content preview */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Content</label>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                          {upload.content}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        By {upload.contributorName} • {new Date(upload.createdAt).toLocaleDateString()}
                        {upload.year ? ` • Year: ${upload.year}` : ""}
                      </p>

                      {/* Actions for pending */}
                      {upload.status === "pending" && (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder="Review note (optional)"
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAction(upload.id, "approve")}
                              disabled={actionLoading === upload.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve & Publish
                            </button>
                            <button
                              onClick={() => handleAction(upload.id, "reject")}
                              disabled={actionLoading === upload.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Reject
                            </button>
                            {actionLoading === upload.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl text-slate-400">
              <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No {tab === "all" ? "" : tab} submissions.</p>
            </div>
          )}
        </div>

        {/* Sidebar - Top Contributors */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Contributors
            </h3>
            {contributors.length > 0 ? (
              <div className="space-y-3">
                {contributors.map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-amber-500 text-white"
                        : idx === 1 ? "bg-slate-400 text-white"
                        : idx === 2 ? "bg-amber-700 text-white"
                        : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{c.fullName}</p>
                      <p className="text-xs text-slate-400 capitalize">{c.role}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{c.points || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No contributors yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
