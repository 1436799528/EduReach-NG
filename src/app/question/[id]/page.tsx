import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import Breadcrumb from "@/components/Breadcrumb";
import BookmarkButton from "@/components/BookmarkButton";
import { db } from "@/db";
import {
  questions,
  solutions,
  topics,
  subjects,
  questionAppearances,
  universityCourses,
  departments,
  faculties,
  universities,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  FileText,
  ShieldCheck,
  Calendar,
  Hash,
  Building,
  Flag,
  Share2,
  Download,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";
import ShareButton from "@/components/ShareButton";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Question ${id} | EduReach Hub`,
    description: "Preview and study this past examination question.",
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const questionId = parseInt(id);
  if (isNaN(questionId)) notFound();

  // Get question
  let question;
  try {
    const result = await db.select().from(questions).where(eq(questions.id, questionId));
    question = result[0];
  } catch { notFound(); }
  if (!question) notFound();

  // Topic + Subject
  const [topic] = await db.select().from(topics).where(eq(topics.id, question.topicId));
  let subject = null;
  if (topic) {
    const [s] = await db.select().from(subjects).where(eq(subjects.id, topic.subjectId));
    subject = s;
  }

  // Solutions
  const questionSolutions = await db.select().from(solutions).where(eq(solutions.questionId, questionId));

  // Appearances (which universities + years)
  const appearances = await db
    .select({
      year: questionAppearances.year,
      courseCode: universityCourses.courseCode,
      universityShortName: universities.shortName,
    })
    .from(questionAppearances)
    .innerJoin(universityCourses, eq(questionAppearances.universityCourseId, universityCourses.id))
    .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
    .innerJoin(faculties, eq(departments.facultyId, faculties.id))
    .innerJoin(universities, eq(faculties.universityId, universities.id))
    .where(eq(questionAppearances.questionId, questionId));

  const yearsAppeared = [...new Set(appearances.map((a) => a.year))].sort((a, b) => b - a);
  const universitiesAppeared = [...new Set(appearances.map((a) => `${a.universityShortName} (${a.courseCode})`))];

  // Related questions (same topic)
  const related = await db
    .select({ id: questions.id, questionText: questions.questionText, marks: questions.marks, difficulty: questions.difficulty })
    .from(questions)
    .where(eq(questions.topicId, question.topicId))
    .limit(5);
  const relatedQuestions = related.filter((q) => q.id !== questionId);

  const primaryCourse = appearances[0];

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <BackButton />
        <Breadcrumb items={[
          { label: "Browse", href: "/browse" },
          primaryCourse ? { label: primaryCourse.courseCode, href: `/course/${primaryCourse.courseCode}` } : { label: subject?.name || "Question" },
          { label: `Q${question.id}` },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Question Viewer */}
          <div className="lg:col-span-2">
            {/* Paper Header */}
            <div className="mb-4">
              <h1 className="font-heading text-xl font-bold text-slate-900 mb-2">
                {subject?.name || "Past Question"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {primaryCourse && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3" />{primaryCourse.universityShortName}
                  </span>
                )}
                {topic && <span>{topic.name}</span>}
                {question.marks && (
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{question.marks} marks</span>
                )}
                {question.difficulty && (
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    question.difficulty === "easy" ? "bg-green-100 text-green-700" :
                    question.difficulty === "hard" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{question.difficulty}</span>
                )}
              </div>
            </div>

            {/* Question Content (the "document") */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-6 md:p-8">
                <p className="text-base text-slate-900 leading-relaxed whitespace-pre-line">
                  {question.questionText}
                </p>
              </div>

              {/* Appearances */}
              {appearances.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Appeared {appearances.length} time{appearances.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {appearances.map((a, i) => (
                      <Link key={i} href={`/course/${a.courseCode}`} className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:border-accent-300 transition">
                        {a.universityShortName} · {a.courseCode} · {a.year}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-slate-100 px-6 py-3 flex items-center gap-4 text-sm">
                <BookmarkButton questionId={question.id} />
                <ShareButton />
                <button className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition text-xs">
                  <Flag className="w-3.5 h-3.5" />Report
                </button>
              </div>
            </div>

            {/* Solution */}
            {questionSolutions.length > 0 && (
              <div className="mt-4">
                <h2 className="font-heading text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />Solution
                </h2>
                {questionSolutions.map((sol) => (
                  <div key={sol.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-3">
                    <div className="p-6 space-y-4">
                      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                        {sol.solutionText}
                      </div>
                      {sol.explanation && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-slate-700">
                          <p className="font-semibold text-amber-800 mb-1">Explanation</p>
                          {sol.explanation}
                        </div>
                      )}
                      {sol.commonMistakes && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-slate-700">
                          <p className="font-semibold text-red-800 mb-1">Common Mistakes</p>
                          {sol.commonMistakes}
                        </div>
                      )}
                      {sol.marksAllocation && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-slate-700">
                          <p className="font-semibold text-blue-800 mb-1">Marks Allocation</p>
                          {sol.marksAllocation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questionSolutions.length === 0 && (
              <div className="mt-4 text-center py-8 bg-white border border-slate-200 rounded-lg">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-2">No solution available yet.</p>
                <Link href="/upload" className="text-xs text-accent-600 font-semibold hover:text-accent-700">
                  Contribute a solution
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Metadata */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                {subject && <div className="flex justify-between"><span className="text-slate-500">Subject</span><span className="font-medium">{subject.name}</span></div>}
                {topic && <div className="flex justify-between"><span className="text-slate-500">Topic</span><span className="font-medium">{topic.name}</span></div>}
                {question.marks && <div className="flex justify-between"><span className="text-slate-500">Marks</span><span className="font-medium">{question.marks}</span></div>}
                {question.commandWord && <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{question.commandWord}</span></div>}
                {yearsAppeared.length > 0 && <div className="flex justify-between"><span className="text-slate-500">Years</span><span className="font-medium">{yearsAppeared.join(", ")}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Solution</span><span className="font-medium">{questionSolutions.length > 0 ? "Available" : "Not yet"}</span></div>
              </div>
            </div>

            {/* Institutions */}
            {universitiesAppeared.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Institutions</h3>
                <div className="space-y-1">
                  {universitiesAppeared.map((uni) => (
                    <div key={uni} className="px-3 py-2 bg-brand-50 rounded text-xs font-medium text-brand-700">{uni}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Questions */}
            {relatedQuestions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Related Questions</h3>
                <div className="space-y-1.5">
                  {relatedQuestions.slice(0, 3).map((rq) => (
                    <Link key={rq.id} href={`/question/${rq.id}`} className="block p-2.5 bg-slate-50 rounded hover:bg-brand-50 transition">
                      <p className="text-xs text-slate-700 line-clamp-2">{rq.questionText}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upload CTA */}
            <Link href="/upload" className="flex items-center justify-between p-4 bg-accent-50 border border-accent-200 rounded-lg hover:bg-accent-100 transition">
              <div>
                <p className="text-sm font-semibold text-accent-700">Have the solution?</p>
                <p className="text-xs text-accent-600">Upload it to earn points.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-accent-500" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
