"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Upload, ArrowRight } from "lucide-react";

export default function HeroClient({ trending }: { trending: string[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="bg-brand-700 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Nigeria&apos;s Largest Past Questions Platform for Tertiary Institutions
        </h1>
        <p className="text-sm md:text-base text-white/60 mb-8 max-w-xl mx-auto leading-relaxed">
          Search, preview, download, and contribute verified past examination
          questions from universities, polytechnics, and colleges across Nigeria.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
          <div className="relative shadow-2xl rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course title, topic, course code, or institution..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-36 py-4 bg-white rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              autoFocus
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-accent-500 text-white text-sm font-bold rounded-lg hover:bg-accent-600 transition">
              Start Searching
            </button>
          </div>
        </form>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition">
            <Upload className="w-4 h-4" />
            Upload Past Questions
          </Link>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/40">Popular:</span>
            {trending.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-white/10 text-white text-xs rounded-full hover:bg-white/20 transition"
              >
                {term}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
