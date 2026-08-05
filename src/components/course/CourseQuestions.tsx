"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ShieldCheck, FileText } from "lucide-react";

interface Question {
  id: number;
  questionText: string;
  marks: number | null;
  difficulty: string | null;
  year: number;
  hasSolution: boolean;
}

export default function CourseQuestions({
  questions,
  years,
}: {
  questions: Question[];
  years: number[];
}) {
  const [expanded, setExpanded] = useState<number[]>(years.length > 0 ? [years[0]] : []);

  const toggle = (year: number) => {
    setExpanded((prev) => prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]);
  };

  if (years.length === 0) return null;

  return (
    <div className="space-y-2">
      {years.map((year) => {
        const yearQuestions = questions.filter((q) => q.year === year);
        const isOpen = expanded.includes(year);

        return (
          <div key={year} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(year)}
              className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-heading text-base font-bold text-slate-900">{year}</span>
                <span className="text-xs text-slate-400">
                  {yearQuestions.length} question{yearQuestions.length !== 1 ? "s" : ""}
                </span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {yearQuestions.map((q, idx) => (
                  <Link
                    key={q.id}
                    href={`/question/${q.id}`}
                    className="flex items-start gap-3 p-3.5 hover:bg-brand-50/30 transition"
                  >
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded text-xs font-medium text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 line-clamp-2">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        {q.marks && <span className="text-slate-400">{q.marks} marks</span>}
                        {q.difficulty && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            q.difficulty === "easy" ? "bg-green-100 text-green-700" :
                            q.difficulty === "hard" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                        {q.hasSolution && (
                          <span className="flex items-center gap-0.5 text-green-600">
                            <ShieldCheck className="w-3 h-3" />Solution
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
