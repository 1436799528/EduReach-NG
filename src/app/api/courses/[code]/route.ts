import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  universityCourses,
  subjects,
  topics,
  questions,
  solutions,
  questionAppearances,
  departments,
  faculties,
  universities,
} from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find the university course by code
    const courseResults = await db
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
      .where(eq(universityCourses.courseCode, code.toUpperCase()));

    if (courseResults.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseResults[0];

    // Get topics for this subject
    const courseTopics = await db
      .select()
      .from(topics)
      .where(eq(topics.subjectId, course.subjectId))
      .orderBy(topics.orderIndex);

    // Get questions that appeared in this course
    const courseQuestions = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        marks: questions.marks,
        difficulty: questions.difficulty,
        topicId: questions.topicId,
        year: questionAppearances.year,
        hasSolution:
          sql<boolean>`EXISTS(SELECT 1 FROM solutions WHERE solutions.question_id = ${questions.id})`,
        appearanceCount:
          sql<number>`(SELECT COUNT(*) FROM question_appearances WHERE question_appearances.question_id = ${questions.id})::int`,
      })
      .from(questions)
      .innerJoin(
        questionAppearances,
        eq(questions.id, questionAppearances.questionId)
      )
      .where(eq(questionAppearances.universityCourseId, course.id))
      .orderBy(desc(questionAppearances.year));

    // Get unique years
    const years = [
      ...new Set(courseQuestions.map((q) => q.year)),
    ].sort((a, b) => b - a);

    // Get other universities that teach this subject
    const otherUniversities = await db
      .select({
        courseCode: universityCourses.courseCode,
        courseTitle: universityCourses.courseTitle,
        universityShortName: universities.shortName,
      })
      .from(universityCourses)
      .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
      .innerJoin(faculties, eq(departments.facultyId, faculties.id))
      .innerJoin(universities, eq(faculties.universityId, universities.id))
      .where(eq(universityCourses.subjectId, course.subjectId));

    return NextResponse.json({
      course,
      topics: courseTopics,
      questions: courseQuestions,
      years,
      otherUniversities: otherUniversities.filter(
        (u) => u.courseCode !== course.courseCode
      ),
      stats: {
        totalQuestions: courseQuestions.length,
        totalTopics: courseTopics.length,
        yearsAvailable: years.length,
        withSolutions: courseQuestions.filter((q) => q.hasSolution).length,
      },
    });
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
