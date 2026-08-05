import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchPageClient from "@/components/search/SearchPageClient";

export function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return searchParams.then((params) => {
    const q = params.q;
    return {
      title: q ? `${q} Past Questions | EduReach Hub` : "Search | EduReach Hub",
      description: q
        ? `Find ${q} past examination papers from Nigerian universities.`
        : "Search verified past questions from Nigerian universities.",
    };
  });
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Loading search...</div>}>
          <SearchPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
