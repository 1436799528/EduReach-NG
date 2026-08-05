import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import Breadcrumb from "@/components/Breadcrumb";
import BookmarkButton from "@/components/BookmarkButton";
import { db } from "@/db";
import {
  universityCourses,
  subjects,
  topics,
  questions,
  questionAppearances,
  departments,
  faculties,
  universities,
  uploads,
  users,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import {
  FileText,
  Building,
  Download,
  Users,
  Calendar,
  ShieldCheck,
  Upload,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";
import CourseQuestions from "@/components/course/CourseQuestions";

type PageProps = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `${code.toUpperCase()} Past Questions | EduReach Hub`,
    description: `Download ${code.toUpperCase()} past examination papers from Nigerian universities.`,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  // Find the course
  let course;
  try {
    const results = await db
      .select({
        id: universityCourses.id,
        courseCode: universityCourses.courseCode,
        courseTitle: universityCourses.courseTitle,
        creditUnit: universityCourses.creditUnit,
        semester: universityCourses.semester,
        level: universityCourses.level,
        subjectId: universityCourses.subjectId,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        subjectDescription: subjects.description,
        universityShortName: universities.shortName,
        universityName: universities.name,
        departmentName: departments.name,
      })
      .from(universityCourses)
      .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
      .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
      .innerJoin(faculties, eq(departments.facultyId, faculties.id))
      .innerJoin(universities, eq(faculties.universityId, universities.id))
      .where(eq(universityCourses.courseCode, upperCode));
    course = results[0];
  } catch { notFound(); }

  if (!course) notFound();

  // Get questions for this course (grouped by year)
  const courseQuestions = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      marks: questions.marks,
      difficulty: questions.difficulty,
      topicId: questions.topicId,
      year: questionAppearances.year,
      hasSolution: sql<boolean>`EXISTS(SELECT 1 FROM solutions WHERE solutions.question_id = ${questions.id})`,
    })
    .from(questions)
    .innerJoin(questionAppearances, eq(questions.id, questionAppearances.questionId))
    .where(eq(questionAppearances.universityCourseId, course.id))
    .orderBy(desc(questionAppearances.year));

  const years = [...new Set(courseQuestions.map((q) => q.year))].sort((a, b) => b - a);

  // Get topics for this subject
  const courseTopics = await db
    .select({ id: topics.id, name: topics.name })
    .from(topics)
    .where(eq(topics.subjectId, course.subjectId))
    .orderBy(topics.orderIndex);

  // Get other universities with the same subject
  const otherCourses = await db
    .select({
      courseCode: universityCourses.courseCode,
      universityShortName: universities.shortName,
    })
    .from(universityCourses)
    .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
    .innerJoin(faculties, eq(departments.facultyId, faculties.id))
    .innerJoin(universities, eq(faculties.universityId, universities.id))
    .where(eq(universityCourses.subjectId, course.subjectId));

  const otherUnis = otherCourses
    .filter((c) => c.courseCode !== course.courseCode)
    .map((c) => `${c.universityShortName} (${c.courseCode})`);

  // Repeated topics (topics that appear in multiple years)
  const topicYears: Record<string, number[]> = {};
  for (const q of courseQuestions) {
    if (q.topicId) {
      const topic = courseTopics.find((t) => t.id === q.topicId);
      if (topic) {
        if (!topicYears[topic.name]) topicYears[topic.name] = [];
        if (!topicYears[topic.name].includes(q.year)) topicYears[topic.name].push(q.year);
      }
    }
  }
  const repeatedTopics = Object.entries(topicYears)
    .filter(([, yrs]) => yrs.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, yrs]) => ({ name, years: yrs.sort((a, b) => b - a) }));

  const totalQuestions = courseQuestions.length;
  const withSolutions = courseQuestions.filter((q) => q.hasSolution).length;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <BackButton />
        <Breadcrumb items={[
          { label: "Browse", href: "/browse" },
          { label: course.universityShortName, href: `/browse?level=faculties&universityId=1` },
          { label: course.courseCode },
        ]} />

        {/* Course Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
            {course.subjectName}
          </h1>
          <p className="text-sm text-slate-500 mb-3">
            {course.departmentName} · {course.level}L · {course.semester} Semester
          </p>

          {/* Available at other universities */}
          {otherUnis.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400">Also at:</span>
              {otherUnis.slice(0, 5).map((uni) => (
                <span key={uni} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">{uni}</span>
              ))}
              {otherUnis.length > 5 && (
                <span className="text-slate-400">+{otherUnis.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {[
            { icon: FileText, value: totalQuestions, label: "Past Questions" },
            { icon: Building, value: otherUnis.length + 1, label: "Institutions" },
            { icon: ShieldCheck, value: withSolutions, label: "With Solutions" },
            { icon: Calendar, value: years.length, label: "Years Available" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
              <Icon className="w-5 h-5 text-accent-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {course.subjectDescription && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 leading-relaxed">{course.subjectDescription}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Past Questions */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-500" />
              Past Questions
            </h2>

            <CourseQuestions questions={courseQuestions} years={years} />

            {totalQuestions === 0 && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 mb-1">No past questions available yet</p>
                <p className="text-xs text-slate-500 mb-3">Become the first contributor.</p>
                <Link href="/upload" className="inline-flex items-center gap-1 px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-600 transition">
                  <Upload className="w-4 h-4" />Upload
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Repeated Topics */}
            {repeatedTopics.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Repeated Topics</h3>
                <div className="space-y-2">
                  {repeatedTopics.map((topic) => (
                    <div key={topic.name} className="p-2.5 bg-red-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900">{topic.name}</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Appeared: {topic.years.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {courseTopics.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Topics</h3>
                <div className="space-y-1">
                  {courseTopics.map((topic) => (
                    <div key={topic.id} className="px-3 py-2 bg-slate-50 rounded text-sm text-slate-700">
                      {topic.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Info */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">Course Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Code</span>
                  <span className="font-semibold text-brand-700">{course.courseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Title</span>
                  <span className="font-medium text-slate-900">{course.courseTitle}</span>
                </div>
                {course.creditUnit && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credits</span>
                    <span className="text-slate-900">{course.creditUnit}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">University</span>
                  <span className="text-slate-900">{course.universityShortName}</span>
                </div>
              </div>
            </div>

            {/* Upload CTA */}
            <Link href="/upload" className="flex items-center justify-between p-4 bg-accent-50 border border-accent-200 rounded-lg hover:bg-accent-100 transition">
              <div>
                <p className="text-sm font-semibold text-accent-700">Missing a paper?</p>
                <p className="text-xs text-accent-600">Upload it to help others.</p>
              </div>
              <Upload className="w-5 h-5 text-accent-500" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
