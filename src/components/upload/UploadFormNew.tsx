"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  BookOpen,
  FileText,
  Lightbulb,
  Wrench,
} from "lucide-react";

const UPLOAD_TYPES = [
  {
    key: "past_question",
    label: "Past Question",
    icon: FileQuestion,
    desc: "Upload exam questions from past years",
    points: 15,
    placeholder:
      "Type the past question(s) exactly as they appeared on the exam paper.\n\nInclude:\n• Question number\n• Full question text\n• Marks allocation\n• Any diagrams (describe them)\n\nExample:\nQuestion 3 (10 marks)\nSimplify the Boolean expression F = AB + A'B'C using Boolean algebra theorems.",
  },
  {
    key: "solution",
    label: "Solution",
    icon: Lightbulb,
    desc: "Provide solutions to existing questions",
    points: 20,
    placeholder:
      "Write the step-by-step solution.\n\nInclude:\n• Each step clearly numbered\n• Formulas used\n• Final answer clearly stated\n• Common mistakes to avoid",
  },
  {
    key: "notes",
    label: "Notes",
    icon: BookOpen,
    desc: "Share class notes or study summaries",
    points: 10,
    placeholder:
      "Paste or type your notes here.\n\nTips:\n• Organize by topic\n• Include key definitions\n• Add formulas\n• Mention exam-relevant sections",
  },
  {
    key: "material",
    label: "Material",
    icon: FileText,
    desc: "Textbook excerpts, handouts, guides",
    points: 10,
    placeholder:
      "Paste the study material content here.\n\nThis could be:\n• Textbook summaries\n• Lecturer handouts\n• Lab manuals\n• Tutorial sheets",
  },
  {
    key: "correction",
    label: "Correction",
    icon: Wrench,
    desc: "Fix errors in existing content",
    points: 5,
    placeholder:
      "Describe the error and provide the correct information.\n\nInclude:\n• Which question/solution has the error\n• What the error is\n• What the correct version should be",
  },
];

export default function UploadFormNew() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [type, setType] = useState("past_question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [year, setYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) {
      setUserId(JSON.parse(stored).id);
    }
  }, []);

  const selectedType = UPLOAD_TYPES.find((t) => t.key === type)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (!userId) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: title.trim(),
          type,
          content: content.trim(),
          year: year ? parseInt(year) : null,
        }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });

      if (data.success) {
        setTitle("");
        setContent("");
        setYear("");
        // Update local points
        const stored = localStorage.getItem("edureach_user");
        if (stored) {
          const user = JSON.parse(stored);
          user.points = (user.points || 0) + (selectedType.points || 10);
          localStorage.setItem("edureach_user", JSON.stringify(user));
        }
      }
    } catch {
      setResult({ success: false, message: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Upload & Help Others Pass
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Share past questions, solutions, notes, or study materials. You name
          it, admins verify it, and fellow students benefit. Earn points for
          every upload!
        </p>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-8">
        {UPLOAD_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`relative p-4 rounded-xl border-2 text-left transition ${
              type === t.key
                ? "border-brand-600 bg-brand-50 ring-1 ring-brand-200"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <t.icon
              className={`w-5 h-5 mb-2 ${type === t.key ? "text-brand-600" : "text-slate-400"}`}
            />
            <p className="text-sm font-semibold text-slate-900">{t.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
            <span
              className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                type === t.key
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              +{t.points}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title — student names it */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "past_question"
                ? "e.g. EEE322 Past Questions 2024 First Semester"
                : type === "notes"
                  ? "e.g. Boolean Algebra Complete Notes"
                  : type === "solution"
                    ? "e.g. Solution to EEE322 2024 Question 3"
                    : type === "material"
                      ? "e.g. Circuit Theory II Textbook Summary"
                      : "e.g. Correction for EEE322 K-Map Solution"
            }
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Give it a clear name so other students can find it. Admin may edit if
            needed.
          </p>
        </div>

        {/* Year (optional, for past questions) */}
        {(type === "past_question" || type === "solution") && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Exam Year (optional)
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select year</option>
              {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder={selectedType.placeholder}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y font-mono text-sm leading-relaxed"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            {submitting ? "Uploading..." : "Upload"}
          </button>
          <span className="text-sm text-slate-400">
            +{selectedType.points} points on upload,
            +{selectedType.points === 20 ? 15 : 5} bonus when approved
          </span>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`flex items-center gap-2 p-4 rounded-xl border ${
              result.success
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm">{result.message}</p>
          </div>
        )}
      </form>

      {/* Info box */}
      <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="font-semibold text-amber-800 mb-2">How it works</h3>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
          <li>You upload and name your content</li>
          <li>It enters a moderation queue (pending review)</li>
          <li>Admin verifies accuracy and may edit the title</li>
          <li>Once approved, it goes live for all students</li>
          <li>You earn bonus points when approved</li>
          <li>You can delete your own uploads anytime</li>
        </ol>
      </div>
    </div>
  );
}
