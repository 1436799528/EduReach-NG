"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Loader2, AlertCircle, Flame, Trophy, BookOpen, Bookmark, Upload, FileText, ChevronRight, Settings } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import RecentUploadsList from "@/components/dashboard/RecentUploadsList";

export default function DashboardPage() {
  const { user, data, loading, error } = useDashboard();

  if (!user && !loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900 mb-1">Sign in to continue</h1>
          <Link href="/login" className="inline-flex px-5 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition mt-3 text-sm">Login</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent-500 mx-auto" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{error || "Failed to load."}</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-accent-500 text-white rounded-lg text-sm">Retry</button>
        </main>
        <Footer />
      </>
    );
  }

  const { profile, stats, recentUploads, recentFiles } = data;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <WelcomeHeader profile={profile} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: Trophy, value: profile.points, label: "Points", color: "text-amber-600 bg-amber-50" },
            { icon: Bookmark, value: stats.bookmarkCount, label: "Saved", color: "text-brand-600 bg-brand-50" },
            { icon: Upload, value: stats.uploadCount, label: "Uploads", color: "text-accent-600 bg-accent-50" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className={`w-7 h-7 rounded flex items-center justify-center mb-1.5 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-lg font-bold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { href: "/courses", icon: BookOpen, label: "Browse Courses" },
            { href: "/bookmarks", icon: Bookmark, label: "My Bookmarks" },
            { href: "/upload", icon: Upload, label: "Upload Paper" },
            { href: "/my-uploads", icon: FileText, label: "My Uploads" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{label}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
            </Link>
          ))}
        </div>

        {/* Recent uploads */}
        <RecentUploadsList textUploads={recentUploads} fileUploads={recentFiles} />

        {/* Settings + Signout */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <Link href="/settings" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <Settings className="w-4 h-4" />Settings
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              localStorage.removeItem("edureach_user");
              window.location.href = "/";
            }}
            className="text-sm text-slate-400 hover:text-red-500"
          >
            Sign out
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
