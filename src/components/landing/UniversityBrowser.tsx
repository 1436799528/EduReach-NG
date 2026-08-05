"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building,
  ChevronRight,
  Search,
  GraduationCap,
} from "lucide-react";

interface University {
  id: number;
  name: string;
  shortName: string;
  location: string | null;
  facultyCount: number;
  courseCount: number;
}

export default function UniversityBrowser({
  universities,
}: {
  universities: University[];
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = search.trim()
    ? universities.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.shortName.toLowerCase().includes(search.toLowerCase()) ||
          (u.location || "").toLowerCase().includes(search.toLowerCase())
      )
    : universities;

  // Show universities with courses first, then the rest
  const withCourses = filtered.filter((u) => u.courseCount > 0);
  const withoutCourses = filtered.filter((u) => u.courseCount === 0);
  const sorted = [...withCourses, ...withoutCourses];

  const displayList = showAll || search.trim() ? sorted : sorted.slice(0, 12);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Browse Universities
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {universities.length} Nigerian universities •
              University → Faculty → Department → Courses
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayList.map((uni) => (
            <Link
              key={uni.id}
              href={`/courses?university=${uni.shortName}`}
              className="group flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand-100">
                <Building className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-700">
                    {uni.shortName}
                  </h3>
                  {uni.courseCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      {uni.courseCount} courses
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{uni.name}</p>
                {uni.location && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{uni.location}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0" />
            </Link>
          ))}
        </div>

        {/* Show more / less */}
        {!search.trim() && sorted.length > 12 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-brand-600 font-medium hover:text-brand-700 transition"
            >
              {showAll
                ? "Show less"
                : `Show all ${sorted.length} universities`}
            </button>
          </div>
        )}

        {filtered.length === 0 && search.trim() && (
          <div className="text-center py-8 text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No universities match &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </section>
  );
}
