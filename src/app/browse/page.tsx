import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrowseClient from "@/components/browse/BrowseClient";

export const metadata = {
  title: "Browse Institutions | EduReach Hub",
  description: "Browse Nigerian universities, polytechnics, and colleges. Find past questions by institution, faculty, department, level, and course.",
};

export default function BrowsePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Suspense fallback={<div className="py-12 text-center text-sm text-slate-400">Loading...</div>}>
          <BrowseClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
