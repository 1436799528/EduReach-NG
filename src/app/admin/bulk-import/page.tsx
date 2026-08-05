"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  BookOpen,
  Layers,
  Plus,
  Loader2,
  Lightbulb,
  Trash2,
} from "lucide-react";

type ImportTab = "questions" | "subject" | "course" | "topics";

interface QuestionRow {
  text: string;
  marks: string;
  difficulty: string;
  topic: string;
}

export default function BulkImportPage() {
  const [tab, setTab] = useState<ImportTab>("questions");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Questions state
  const [courseCode, setCourseCode] = useState("");
  const [year, setYear] = useState("2024");
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { text: "", marks: "", difficulty: "medium", topic: "" },
  ]);
  const [bulkPasteMode, setBulkPasteMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Subject state
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [subjectField, setSubjectField] = useState("Electrical Engineering");
  const [subjectEmoji, setSubjectEmoji] = useState("📚");

  // Course state
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSubject, setNewCourseSubject] = useState("");
  const [newCourseCU, setNewCourseCU] = useState("3");
  const [newCourseSemester, setNewCourseSemester] = useState("First");
  const [newCourseLevel, setNewCourseLevel] = useState("300");

  // Topics state
  const [topicSubjectSlug, setTopicSubjectSlug] = useState("");
  const [topicRows, setTopicRows] = useState([{ name: "", description: "" }]);

  useEffect(() => {
    const stored = localStorage.getItem("edureach_user");
    if (stored) setUserId(JSON.parse(stored).id);
  }, []);

  const addQuestionRow = () => {
    setQuestionRows([
      ...questionRows,
      { text: "", marks: "", difficulty: "medium", topic: "" },
    ]);
  };

  const removeQuestionRow = (idx: number) => {
    setQuestionRows(questionRows.filter((_, i) => i !== idx));
  };

  const updateQuestionRow = (
    idx: number,
    field: keyof QuestionRow,
    value: string
  ) => {
    const updated = [...questionRows];
    updated[idx][field] = value;
    setQuestionRows(updated);
  };

  const parseBulkPaste = () => {
    // Parse numbered questions: "1. Question text (10 marks)"
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: QuestionRow[] = [];
    let current = "";

    for (const line of lines) {
      // Check if line starts a new question (number followed by period/bracket)
      const isNewQ = /^(\d+[\.\)\:]|\(?[a-z]\)|\(?[ivxlc]+\))/i.test(line);

      if (isNewQ && current) {
        // Save previous question
        const marksMatch = current.match(/\((\d+)\s*marks?\)/i);
        parsed.push({
          text: current.replace(/\(\d+\s*marks?\)/i, "").trim(),
          marks: marksMatch ? marksMatch[1] : "",
          difficulty: "medium",
          topic: "",
        });
        current = line.replace(/^(\d+[\.\)\:])\s*/, "");
      } else if (isNewQ) {
        current = line.replace(/^(\d+[\.\)\:])\s*/, "");
      } else {
        current += (current ? " " : "") + line;
      }
    }

    // Don't forget the last question
    if (current) {
      const marksMatch = current.match(/\((\d+)\s*marks?\)/i);
      parsed.push({
        text: current.replace(/\(\d+\s*marks?\)/i, "").trim(),
        marks: marksMatch ? marksMatch[1] : "",
        difficulty: "medium",
        topic: "",
      });
    }

    if (parsed.length > 0) {
      setQuestionRows(parsed);
      setBulkPasteMode(false);
      setResult({
        success: true,
        message: `Parsed ${parsed.length} questions from pasted text. Review and submit.`,
      });
    } else {
      setResult({
        success: false,
        message:
          "Could not parse questions. Make sure each starts with a number (e.g., 1. Question text).",
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    let payload: Record<string, unknown> = {};

    if (tab === "questions") {
      const validQs = questionRows.filter((q) => q.text.trim().length > 0);
      if (!courseCode || !year || validQs.length === 0) {
        setResult({
          success: false,
          message: "Course code, year, and at least one question required.",
        });
        setLoading(false);
        return;
      }

      payload = {
        type: "questions",
        userId,
        data: {
          courseCode,
          year,
          questions: validQs.map((q) => ({
            text: q.text,
            marks: q.marks ? parseInt(q.marks) : null,
            difficulty: q.difficulty,
            topic: q.topic || null,
          })),
        },
      };
    } else if (tab === "subject") {
      payload = {
        type: "subject",
        userId,
        data: {
          name: subjectName,
          description: subjectDesc,
          fieldOfStudy: subjectField,
          iconEmoji: subjectEmoji,
        },
      };
    } else if (tab === "course") {
      payload = {
        type: "course",
        userId,
        data: {
          courseCode: newCourseCode,
          courseTitle: newCourseTitle,
          subjectSlug: newCourseSubject,
          creditUnit: parseInt(newCourseCU),
          semester: newCourseSemester,
          level: parseInt(newCourseLevel),
        },
      };
    } else if (tab === "topics") {
      payload = {
        type: "topics",
        userId,
        data: {
          subjectSlug: topicSubjectSlug,
          topics: topicRows.filter((t) => t.name.trim()),
        },
      };
    }

    try {
      const res = await fetch("/api/admin/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });

      if (data.success && tab === "questions") {
        setQuestionRows([
          { text: "", marks: "", difficulty: "medium", topic: "" },
        ]);
      }
    } catch {
      setResult({ success: false, message: "Import failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Bulk Import" },
          ]}
        />

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bulk Import
        </h1>
        <p className="text-slate-500 mb-8">
          Add multiple questions, create subjects, courses, and topics — all
          from one page.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "questions" as ImportTab, label: "📝 Questions", icon: FileQuestion },
            { key: "subject" as ImportTab, label: "📚 New Subject", icon: BookOpen },
            { key: "course" as ImportTab, label: "🎓 New Course", icon: BookOpen },
            { key: "topics" as ImportTab, label: "📋 Add Topics", icon: Layers },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === t.key
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===================== QUESTIONS TAB ===================== */}
        {tab === "questions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EEE322"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Exam Year *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
                    (y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Paste mode toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setBulkPasteMode(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !bulkPasteMode
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Row by Row
              </button>
              <button
                onClick={() => setBulkPasteMode(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  bulkPasteMode
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                📋 Paste All at Once
              </button>
            </div>

            {bulkPasteMode ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Paste all questions (numbered)
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={15}
                  placeholder={`Paste the full exam paper here. Format:\n\n1. Simplify the Boolean expression F = AB + A'B'C (8 marks)\n2. Design a 4-to-1 multiplexer using basic logic gates (12 marks)\n3. Explain the operation of a JK flip-flop (10 marks)\n4. Use a K-map to simplify F(A,B,C,D) = Σ(0,1,2,5,8,9,10) (8 marks)`}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={parseBulkPaste}
                  className="mt-3 px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
                >
                  Parse Questions
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questionRows.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-sm font-bold text-slate-500 shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={q.text}
                          onChange={(e) =>
                            updateQuestionRow(idx, "text", e.target.value)
                          }
                          rows={2}
                          placeholder="Type the question..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestionRow(idx, "marks", e.target.value)
                            }
                            placeholder="Marks"
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <select
                            value={q.difficulty}
                            onChange={(e) =>
                              updateQuestionRow(
                                idx,
                                "difficulty",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                          <input
                            type="text"
                            value={q.topic}
                            onChange={(e) =>
                              updateQuestionRow(idx, "topic", e.target.value)
                            }
                            placeholder="Topic (optional)"
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      {questionRows.length > 1 && (
                        <button
                          onClick={() => removeQuestionRow(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addQuestionRow}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-brand-400 hover:text-brand-600 transition w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== SUBJECT TAB ===================== */}
        {tab === "subject" && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Name *</label>
              <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Power Systems" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea value={subjectDesc} onChange={(e) => setSubjectDesc(e.target.value)} rows={3} placeholder="What this subject covers..." className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Field of Study</label>
                <input type="text" value={subjectField} onChange={(e) => setSubjectField(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Icon Emoji</label>
                <input type="text" value={subjectEmoji} onChange={(e) => setSubjectEmoji(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
        )}

        {/* ===================== COURSE TAB ===================== */}
        {tab === "course" && (
          <div className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Code *</label>
                <input type="text" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())} placeholder="e.g. EEE412" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title *</label>
                <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g. Power Systems I" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Slug *</label>
              <input type="text" value={newCourseSubject} onChange={(e) => setNewCourseSubject(e.target.value)} placeholder="e.g. power-systems (must exist already)" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <p className="text-xs text-slate-400 mt-1">This is the slug of an existing subject. Create the subject first if needed.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Credits</label>
                <input type="number" value={newCourseCU} onChange={(e) => setNewCourseCU(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Semester</label>
                <select value={newCourseSemester} onChange={(e) => setNewCourseSemester(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                <select value={newCourseLevel} onChange={(e) => setNewCourseLevel(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {[100, 200, 300, 400, 500].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TOPICS TAB ===================== */}
        {tab === "topics" && (
          <div className="space-y-4">
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Slug *</label>
              <input type="text" value={topicSubjectSlug} onChange={(e) => setTopicSubjectSlug(e.target.value)} placeholder="e.g. digital-electronics" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            {topicRows.map((t, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 rounded-xl p-4">
                <input type="text" value={t.name} onChange={(e) => { const u = [...topicRows]; u[idx].name = e.target.value; setTopicRows(u); }} placeholder="Topic name" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="text" value={t.description} onChange={(e) => { const u = [...topicRows]; u[idx].description = e.target.value; setTopicRows(u); }} placeholder="Description (optional)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}
            <button onClick={() => setTopicRows([...topicRows, { name: "", description: "" }])} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-brand-400 hover:text-brand-600 transition w-full justify-center">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>
        )}

        {/* Submit + Result */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {loading ? "Importing..." : "Import"}
          </button>

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
        </div>

        {/* Help */}
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            How to bulk import
          </h3>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Create the <strong>Subject</strong> first (e.g., &quot;Power Systems&quot;)</li>
            <li>Create the <strong>Course</strong> and link it to the subject</li>
            <li>Add <strong>Topics</strong> under the subject</li>
            <li>Import <strong>Questions</strong> — paste a full exam paper or add row by row</li>
            <li>Questions auto-detect command words (Explain, Design, Calculate, etc.)</li>
            <li>Set the topic for each question, or leave blank to use the first topic</li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
