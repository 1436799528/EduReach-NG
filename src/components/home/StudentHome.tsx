"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Play,
  Bookmark,
  Upload,
  FileQuestion,
  BookOpen,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PersonalizedData {
  myCourses: { id: number; courseCode: string; courseTitle: string; questionCount: number }[];
  continueStudying: { subjectName: string | null; topicName: string | null; courseCode: string | null; progressPercent: number | null }[];
  repeatedQuestions: { id: number; questionText: string; topicName: string; timesAppeared: number }[];
  recentlyViewed: { questionId: number; questionText: string }[];
}

export default function StudentHome() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [data, setData] = useState<PersonalizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`/api/personalized?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !isLoggedIn) return null;
  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-accent-500 mx-auto" /></div>;
  if (!data) return null;

  const firstName = user?.fullName.split(" ")[0] || "Student";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); }} className="mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search past questions..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
        </div>
      </form>

      {/* Continue reading */}
      {data.continueStudying.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-700 mb-2">Continue Reading</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.continueStudying.map((item, i) => (
              <Link key={i} href={item.courseCode ? `/course/${item.courseCode}` : "/courses"} className="flex items-center gap-2 p-3 bg-accent-50 border border-accent-200 rounded-lg min-w-[180px] shrink-0 hover:shadow-sm transition">
                <Play className="w-4 h-4 text-accent-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.courseCode || item.subjectName}</p>
                  <p className="text-xs text-slate-500">{item.topicName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My courses */}
      {data.myCourses.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-700 mb-2">Your {user?.level || ""}L Courses</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.myCourses.map((c) => (
              <Link key={c.id} href={`/course/${c.courseCode}`} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-300 transition">
                <p className="font-bold text-brand-700 text-sm">{c.courseCode}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{c.courseTitle}</p>
                <p className="text-[11px] text-slate-400 mt-1">{c.questionCount} papers</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Repeated + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.repeatedQuestions.length > 0 && (
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-slate-700 mb-2">Most Repeated</h2>
            <div className="space-y-1.5">
              {data.repeatedQuestions.slice(0, 4).map((q) => (
                <Link key={q.id} href={`/question/${q.id}`} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-red-200 transition">
                  <span className="w-7 h-7 bg-red-50 rounded flex items-center justify-center text-xs font-bold text-red-600 shrink-0">{q.timesAppeared}×</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 line-clamp-1">{q.questionText}</p>
                    <p className="text-xs text-slate-400">{q.topicName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {[
            { href: "/bookmarks", icon: Bookmark, label: "Saved" },
            { href: "/upload", icon: Upload, label: "Upload" },
            { href: "/my-uploads", icon: FileQuestion, label: "My Uploads" },
            { href: "/courses", icon: BookOpen, label: "All Courses" },
            { href: "/dashboard", icon: ChevronRight, label: "Full Dashboard" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
