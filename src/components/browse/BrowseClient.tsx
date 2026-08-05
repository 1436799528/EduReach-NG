"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import {
  Search,
  Building,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface BrowseItem {
  id: number;
  name: string;
  subtitle: string;
  stat: string;
  courseCode?: string;
}

interface BreadcrumbItem {
  label: string;
  level: string;
  id?: number;
}

interface BrowseData {
  level: string;
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  data: BrowseItem[];
}

const LEVEL_ICONS: Record<string, typeof Building> = {
  institutions: Building,
  faculties: GraduationCap,
  departments: BookOpen,
  courses: BookOpen,
};

const NEXT_LEVEL: Record<string, string> = {
  institutions: "faculties",
  faculties: "departments",
  departments: "courses",
};

const NEXT_PARAM: Record<string, string> = {
  institutions: "universityId",
  faculties: "facultyId",
  departments: "departmentId",
};

export default function BrowseClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [browseData, setBrowseData] = useState<BrowseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Build API URL from current search params
  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    const level = searchParams.get("level") || "institutions";
    params.set("level", level);
    if (searchParams.get("universityId")) params.set("universityId", searchParams.get("universityId")!);
    if (searchParams.get("facultyId")) params.set("facultyId", searchParams.get("facultyId")!);
    if (searchParams.get("departmentId")) params.set("departmentId", searchParams.get("departmentId")!);

    try {
      const res = await fetch(`/api/browse?${params.toString()}`);
      const data = await res.json();
      if (data.success) setBrowseData(data);
    } catch {
      // skip
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
    setSearch("");
  }, [fetchData]);

  const navigateTo = (item: BrowseItem) => {
    if (!browseData) return;

    // If we're at courses level, go to course detail page
    if (browseData.level === "courses" && item.courseCode) {
      router.push(`/course/${item.courseCode}`);
      return;
    }

    // Otherwise drill down
    const nextLevel = NEXT_LEVEL[browseData.level];
    const nextParam = NEXT_PARAM[browseData.level];
    if (!nextLevel || !nextParam) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("level", nextLevel);
    params.set(nextParam, String(item.id));
    router.push(`/browse?${params.toString()}`);
  };

  const navigateBreadcrumb = (bc: BreadcrumbItem) => {
    const params = new URLSearchParams();
    params.set("level", bc.level);
    if (bc.level === "faculties" && bc.id) params.set("universityId", String(bc.id));
    if (bc.level === "departments" && bc.id) params.set("facultyId", String(bc.id));
    router.push(`/browse?${params.toString()}`);
  };

  const filtered = browseData?.data.filter((item) =>
    search.trim()
      ? item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.toLowerCase())
      : true
  ) || [];

  const Icon = LEVEL_ICONS[browseData?.level || "institutions"] || Building;

  if (loading) {
    return (
      <div className="space-y-3 py-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!browseData) {
    return (
      <div className="text-center py-16">
        <Building className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Failed to load. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      {browseData.breadcrumbs.length > 0 ? (
        <button
          onClick={() => {
            const prev = browseData.breadcrumbs[browseData.breadcrumbs.length - 1];
            navigateBreadcrumb(prev);
          }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      ) : (
        <BackButton />
      )}

      {/* Breadcrumbs */}
      {browseData.breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-400 mb-3 flex-wrap">
          {browseData.breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1">
              <button onClick={() => navigateBreadcrumb(bc)} className="hover:text-brand-700 transition">
                {bc.label}
              </button>
              <ChevronRight className="w-3 h-3" />
            </span>
          ))}
          <span className="text-slate-700 font-medium">{browseData.title}</span>
        </nav>
      )}

      {/* Title */}
      <h1 className="font-heading text-xl font-bold text-slate-900 mb-0.5">{browseData.title}</h1>
      <p className="text-sm text-slate-500 mb-4">{browseData.subtitle}</p>

      {/* Search within level */}
      {browseData.data.length > 6 && (
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${browseData.level}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item)}
              className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-lg hover:border-accent-300 hover:shadow-sm transition text-left w-full"
            >
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                <p className="text-xs text-slate-400 line-clamp-1">{item.subtitle}</p>
                <p className="text-xs text-brand-600 mt-0.5">{item.stat}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            {search.trim() ? `No results for "${search}"` : `No ${browseData.level} found.`}
          </p>
        </div>
      )}
    </div>
  );
}
