import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { Zap, Brain } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — EduReach Hub",
  description: "Manage courses, questions, users, and submissions.",
};

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Admin quick actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/admin/bulk-import"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-700 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition"
          >
            <Zap className="w-4 h-4" />
            Bulk Import
          </Link>
          <Link
            href="/admin/ai-process"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition"
          >
            <Brain className="w-4 h-4" />
            AI Document Processor
          </Link>
        </div>

        <AdminDashboardClient />
      </main>
      <Footer />
    </>
  );
}
