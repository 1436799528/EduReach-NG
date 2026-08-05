"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Bookmark,
  FileQuestion,
  Trash2,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";

interface BookmarkItem {
  id: number;
  questionId: number;
  questionText: string;
  difficulty: string | null;
  marks: number | null;
  topicName: string;
  subjectName: string;
  createdAt: string;
}

export default function BookmarksPage() {
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
      loadBookmarks(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadBookmarks = async (uid: number) => {
    try {
      const res = await fetch(`/api/bookmarks?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setBookmarksList(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId: number) => {
    if (!userId) return;
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, questionId }),
      });
      setBookmarksList((prev) =>
        prev.filter((b) => b.questionId !== questionId)
      );
    } catch {
      // ignore
    }
  };

  const difficultyColor = (d: string | null) => {
    if (d === "easy") return "bg-green-100 text-green-700";
    if (d === "hard") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  if (!userId && !loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Sign in to view bookmarks
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
        <Breadcrumb items={[{ label: "My Bookmarks" }]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              My Bookmarks
            </h1>
            <p className="text-slate-500">
              {bookmarksList.length} saved question
              {bookmarksList.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Bookmark className="w-8 h-8 text-brand-300" />
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-slate-400">Loading bookmarks...</p>
          </div>
        ) : bookmarksList.length > 0 ? (
          <div className="space-y-3">
            {bookmarksList.map((bm) => (
              <div
                key={bm.id}
                className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-brand-200 transition group"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-brand-50 rounded-lg shrink-0">
                  <FileQuestion className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/question/${bm.questionId}`}
                    className="text-slate-800 font-medium line-clamp-2 hover:text-brand-700 transition"
                  >
                    {bm.questionText}
                  </Link>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-semibold text-brand-700">
                      {bm.subjectName}
                    </span>
                    <span className="text-slate-400">{bm.topicName}</span>
                    {bm.marks && (
                      <span className="text-slate-400">{bm.marks} marks</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${difficultyColor(bm.difficulty)}`}
                    >
                      {bm.difficulty || "medium"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeBookmark(bm.questionId)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm mt-1">
              Save questions while studying to review them later.
            </p>
            <Link
              href="/courses"
              className="inline-flex px-6 py-3 bg-brand-700 text-white font-medium rounded-lg hover:bg-brand-800 transition mt-6"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
