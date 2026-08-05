"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toggleBookmark, checkBookmark } from "@/services/bookmarks";

export default function BookmarkButton({ questionId }: { questionId: number }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkBookmark(user.id, questionId)
      .then((d) => setBookmarked(d.bookmarked))
      .catch(() => {});
  }, [user, questionId]);

  const toggle = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const data = await toggleBookmark(user.id, questionId);
      if (data.success && data.data) {
        setBookmarked(data.data.bookmarked);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 transition ${
        bookmarked
          ? "text-brand-600 hover:text-brand-700"
          : "text-slate-400 hover:text-brand-600"
      }`}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-brand-600" : ""}`} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
