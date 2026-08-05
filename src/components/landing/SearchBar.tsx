"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

export default function SearchBar({ trending }: { trending: string[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search past questions, courses, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 focus:bg-white"
              autoFocus
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-accent-500 text-white text-sm font-bold rounded-lg hover:bg-accent-600 transition">
              Search
            </button>
          </div>
        </form>

        {trending.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-xs text-slate-400">Trending:</span>
            {trending.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-accent-50 hover:text-accent-600 transition"
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
