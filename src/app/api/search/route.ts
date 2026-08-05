import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  universityCourses,
  subjects,
  questions,
  topics,
  departments,
  faculties,
  universities,
  courseAliases,
  searchLog,
} from "@/db/schema";
import { ilike, or, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        courses: [],
        questions: [],
        topics: [],
        subjects: [],
      });
    }

    const searchTerm = `%${q.trim()}%`;

    // === TOPICS FIRST (most useful results) ===
    const matchedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        description: topics.description,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        questionCount: sql<number>`(SELECT COUNT(*)::int FROM questions WHERE topic_id = ${topics.id})`,
      })
      .from(topics)
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(
        or(ilike(topics.name, searchTerm), ilike(topics.description, searchTerm))
      )
      .limit(10);

    // === SUBJECTS ===
    const matchedSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        description: subjects.description,
        fieldOfStudy: subjects.fieldOfStudy,
      })
      .from(subjects)
      .where(
        or(
          ilike(subjects.name, searchTerm),
          ilike(subjects.description, searchTerm)
        )
      )
      .limit(10);

    // === COURSES (search code, title, AND check aliases) ===
    const matchedCourses = await db
      .select({
        id: universityCourses.id,
        courseCode: universityCourses.courseCode,
        courseTitle: universityCourses.courseTitle,
        level: universityCourses.level,
        subjectName: subjects.name,
        universityShortName: universities.shortName,
      })
      .from(universityCourses)
      .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
      .innerJoin(
        departments,
        eq(universityCourses.departmentId, departments.id)
      )
      .innerJoin(faculties, eq(departments.facultyId, faculties.id))
      .innerJoin(universities, eq(faculties.universityId, universities.id))
      .where(
        or(
          ilike(universityCourses.courseCode, searchTerm),
          ilike(universityCourses.courseTitle, searchTerm),
          // Also search by subject name (so "Boolean Algebra" finds EEE322)
          ilike(subjects.name, searchTerm)
        )
      )
      .limit(15);

    // === Also check course aliases ===
    let aliasCourses: typeof matchedCourses = [];
    try {
      const aliasMatches = await db
        .select({ subjectId: courseAliases.subjectId })
        .from(courseAliases)
        .where(ilike(courseAliases.courseCode, searchTerm));

      if (aliasMatches.length > 0) {
        const subjectIds = aliasMatches.map((a) => a.subjectId);
        aliasCourses = await db
          .select({
            id: universityCourses.id,
            courseCode: universityCourses.courseCode,
            courseTitle: universityCourses.courseTitle,
            level: universityCourses.level,
            subjectName: subjects.name,
            universityShortName: universities.shortName,
          })
          .from(universityCourses)
          .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
          .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
          .innerJoin(faculties, eq(departments.facultyId, faculties.id))
          .innerJoin(universities, eq(faculties.universityId, universities.id))
          .where(
            sql`${universityCourses.subjectId} IN (${sql.join(
              subjectIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .limit(10);
      }
    } catch {
      // courseAliases table might not exist yet
    }

    // Merge and deduplicate courses
    const allCourseIds = new Set(matchedCourses.map((c) => c.id));
    const mergedCourses = [
      ...matchedCourses,
      ...aliasCourses.filter((c) => !allCourseIds.has(c.id)),
    ];

    // === QUESTIONS ===
    const matchedQuestions = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        difficulty: questions.difficulty,
        marks: questions.marks,
        topicName: topics.name,
        subjectName: subjects.name,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(ilike(questions.questionText, searchTerm))
      .limit(20);

    const totalResults =
      matchedTopics.length +
      matchedSubjects.length +
      mergedCourses.length +
      matchedQuestions.length;

    // Log search (fire and forget — don't block response)
    const userId = request.nextUrl.searchParams.get("userId");
    db.insert(searchLog)
      .values({
        query: q.trim().toLowerCase(),
        userId: userId ? parseInt(userId) : null,
        resultCount: totalResults,
      })
      .catch(() => {});

    return NextResponse.json({
      topics: matchedTopics,
      subjects: matchedSubjects,
      courses: mergedCourses,
      questions: matchedQuestions,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
