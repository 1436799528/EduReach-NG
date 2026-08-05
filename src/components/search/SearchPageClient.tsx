"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import {
  Search,
  BookOpen,
  FileText,
  Building,
  Filter,
  Loader2,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";

interface CourseResult {
  id: number;
  courseCode: string;
  courseTitle: string;
  level: number | null;
  subjectName: string;
  universityShortName: string;
}

interface QuestionResult {
  id: number;
  questionText: string;
  difficulty: string | null;
  marks: number | null;
  topicName: string;
  subjectName: string;
}

interface TopicResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  subjectName: string;
  questionCount: number;
}

interface SubjectResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  fieldOfStudy: string | null;
}

interface SearchData {
  courses: CourseResult[];
  questions: QuestionResult[];
  topics: TopicResult[];
  subjects: SubjectResult[];
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      doSearch(query.trim());
    }
  };

  const totalResults = results
    ? results.courses.length + results.questions.length + results.topics.length + results.subjects.length
    : 0;

  return (
    <div>
      <BackButton />

      {/* Search bar — always visible */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course, topic, course code or institution..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            autoFocus
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-accent-500 text-white text-sm font-bold rounded-lg hover:bg-accent-600 transition">
            Search
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          {/* Skeleton cards */}
          <div className="space-y-3 max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-slate-700">&quot;{initialQuery}&quot;</span>
          </p>

          {/* Courses — highest priority */}
          {results.courses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                Courses ({results.courses.length})
              </h2>
              <div className="space-y-2">
                {results.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.courseCode}`}
                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-lg hover:border-accent-300 hover:shadow-sm transition"
                  >
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-brand-700 text-sm">{course.courseCode}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{course.universityShortName}</span>
                        {course.level && <span className="text-[10px] text-slate-400">{course.level}L</span>}
                      </div>
                      <p className="text-sm text-slate-600">{course.courseTitle}</p>
                      <p className="text-xs text-slate-400">{course.subjectName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {results.questions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Past Questions ({results.questions.length})
              </h2>
              <div className="space-y-2">
                {results.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/question/${q.id}`}
                    className="block p-3.5 bg-white border border-slate-200 rounded-lg hover:border-accent-300 hover:shadow-sm transition"
                  >
                    <p className="text-sm text-slate-800 line-clamp-2 mb-1.5">{q.questionText}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-brand-700">{q.subjectName}</span>
                      <span className="text-slate-400">{q.topicName}</span>
                      {q.marks && <span className="text-slate-400">{q.marks}m</span>}
                      {q.difficulty && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          q.difficulty === "easy" ? "bg-green-100 text-green-700" :
                          q.difficulty === "hard" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {results.subjects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Subjects ({results.subjects.length})</h2>
              <div className="space-y-2">
                {results.subjects.map((s) => (
                  <Link key={s.id} href={`/courses`} className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-accent-300 transition">
                    <h3 className="font-semibold text-sm text-slate-900">{s.name}</h3>
                    {s.fieldOfStudy && <p className="text-xs text-slate-400">{s.fieldOfStudy}</p>}
                    {s.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {results.topics.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Topics ({results.topics.length})</h2>
              <div className="space-y-2">
                {results.topics.map((t) => (
                  <Link key={t.id} href={`/courses`} className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-accent-300 transition">
                    <h3 className="font-semibold text-sm text-slate-900">{t.name}</h3>
                    <p className="text-xs text-slate-400">{t.subjectName} · {t.questionCount} questions</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalResults === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">No past questions found</h3>
              <p className="text-sm text-slate-500 mb-4">
                Try another keyword or browse by institution.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/courses" className="px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-600 transition">
                  Browse Institutions
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial state — no search yet */}
      {!results && !loading && !searched && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">Search past questions</h3>
          <p className="text-sm text-slate-500">
            Enter a course title, topic, course code, or university name.
          </p>
        </div>
      )}
    </div>
  );
}
