"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User,
  Mail,
  GraduationCap,
  Trophy,
  ChevronRight,
  Flame,
  FileQuestion,
  Upload,
  Bookmark,
  Loader2,
  Calendar,
} from "lucide-react";

interface ProfileData {
  profile: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    level: number | null;
    points: number;
    currentStreak: number;
    longestStreak: number;
    questionsViewed: number;
    questionsSolved: number;
    practiceSessionsCompleted: number;
    universityName: string | null;
    departmentName: string | null;
    createdAt: string;
  };
  stats: {
    bookmarkCount: number;
    uploadCount: number;
    approvedUploads: number;
    avgScore: number;
  };
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) {
      const u = JSON.parse(stored);
      fetch(`/api/auth/me?userId=${u.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setData(d.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
        </main>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your profile</h1>
          <Link href="/login" className="inline-flex px-6 py-3 bg-brand-700 text-white font-medium rounded-lg hover:bg-brand-800 transition mt-4">
            Sign In
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const { profile: p, stats: s } = data;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-800 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {p.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{p.fullName}</h2>
                <p className="text-white/70 text-sm">{p.email}</p>
                <p className="text-white/50 text-xs mt-1">
                  {p.departmentName || "Student"}
                  {p.universityName ? ` • ${p.universityName}` : ""}
                  {p.level ? ` • ${p.level}L` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100">
            {[
              { icon: Trophy, label: "Points", value: p.points, color: "text-amber-600" },
              { icon: Flame, label: "Streak", value: `${p.currentStreak}d`, color: "text-orange-600" },
              { icon: FileQuestion, label: "Solved", value: p.questionsSolved, color: "text-brand-600" },
              { icon: Upload, label: "Uploads", value: s.uploadCount, color: "text-green-600" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-900">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Academic Info</p>
                  <p className="font-medium text-slate-900">
                    {p.departmentName || "Not set"} {p.level ? `• ${p.level}L` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Bookmark className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Bookmarks</p>
                  <p className="font-medium text-slate-900">{s.bookmarkCount} saved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Joined</p>
                  <p className="font-medium text-slate-900">
                    {new Date(p.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <Link href="/dashboard" className="text-sm text-brand-700 font-medium hover:text-brand-800 flex items-center gap-1">
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  localStorage.removeItem("edureach_user");
                  window.location.href = "/";
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
