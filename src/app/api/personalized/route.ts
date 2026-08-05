import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  universityCourses,
  subjects,
  topics,
  questions,
  questionAppearances,
  studyProgress,
  departments,
  faculties,
  universities,
  bookmarks,
  questionViews,
} from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

// GET: Personalized content for a student based on their academic profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId required." },
        { status: 400 }
      );
    }

    const uid = parseInt(userId);
    const [user] = await db.select().from(users).where(eq(users.id, uid));
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // === MY COURSES (based on department + level) ===
    let myCourses: {
      id: number;
      courseCode: string;
      courseTitle: string;
      level: number | null;
      semester: string | null;
      subjectName: string;
      questionCount: number;
    }[] = [];

    if (user.departmentId && user.level) {
      myCourses = await db
        .select({
          id: universityCourses.id,
          courseCode: universityCourses.courseCode,
          courseTitle: universityCourses.courseTitle,
          level: universityCourses.level,
          semester: universityCourses.semester,
          subjectName: subjects.name,
          questionCount: sql<number>`(
            SELECT COUNT(DISTINCT qa.question_id)::int
            FROM question_appearances qa
            WHERE qa.university_course_id = ${universityCourses.id}
          )`,
        })
        .from(universityCourses)
        .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
        .where(
          and(
            eq(universityCourses.departmentId, user.departmentId),
            eq(universityCourses.level, user.level)
          )
        )
        .orderBy(universityCourses.courseCode);
    }

    // === CONTINUE STUDYING ===
    let continueStudying: {
      subjectName: string | null;
      topicName: string | null;
      courseCode: string | null;
      progressPercent: number | null;
      updatedAt: Date;
    }[] = [];

    try {
      continueStudying = await db
        .select({
          subjectName: sql<string | null>`(SELECT name FROM subjects WHERE id = ${studyProgress.subjectId})`,
          topicName: sql<string | null>`(SELECT name FROM topics WHERE id = ${studyProgress.topicId})`,
          courseCode: sql<string | null>`(SELECT course_code FROM university_courses WHERE id = ${studyProgress.universityCourseId})`,
          progressPercent: studyProgress.progressPercent,
          updatedAt: studyProgress.updatedAt,
        })
        .from(studyProgress)
        .where(eq(studyProgress.userId, uid))
        .orderBy(desc(studyProgress.updatedAt))
        .limit(3);
    } catch {
      // Table might not exist yet
    }

    // === MOST REPEATED (personalized to department) ===
    let repeatedQuestions: {
      id: number;
      questionText: string;
      topicName: string;
      timesAppeared: number;
    }[] = [];

    if (user.departmentId) {
      // Get course IDs for this department
      const deptCourses = await db
        .select({ id: universityCourses.id })
        .from(universityCourses)
        .where(eq(universityCourses.departmentId, user.departmentId));

      if (deptCourses.length > 0) {
        const courseIds = deptCourses.map((c) => c.id);

        repeatedQuestions = await db
          .select({
            id: questions.id,
            questionText: questions.questionText,
            topicName: topics.name,
            timesAppeared: sql<number>`(
              SELECT COUNT(*)::int FROM question_appearances
              WHERE question_id = ${questions.id}
            )`,
          })
          .from(questions)
          .innerJoin(topics, eq(questions.topicId, topics.id))
          .innerJoin(
            questionAppearances,
            eq(questions.id, questionAppearances.questionId)
          )
          .where(
            sql`${questionAppearances.universityCourseId} IN (${sql.join(
              courseIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .orderBy(
            desc(
              sql`(SELECT COUNT(*) FROM question_appearances WHERE question_id = ${questions.id})`
            )
          )
          .limit(5);
      }
    }

    // === RECOMMENDED TOPICS (based on what they haven't studied) ===
    let recommendedTopics: {
      id: number;
      name: string;
      subjectName: string;
      questionCount: number;
    }[] = [];

    if (user.departmentId) {
      // Get subject IDs from department courses
      const deptSubjects = await db
        .select({ subjectId: universityCourses.subjectId })
        .from(universityCourses)
        .where(eq(universityCourses.departmentId, user.departmentId));

      const subjectIds = [...new Set(deptSubjects.map((s) => s.subjectId))];

      if (subjectIds.length > 0) {
        recommendedTopics = await db
          .select({
            id: topics.id,
            name: topics.name,
            subjectName: subjects.name,
            questionCount: sql<number>`(
              SELECT COUNT(*)::int FROM questions WHERE topic_id = ${topics.id}
            )`,
          })
          .from(topics)
          .innerJoin(subjects, eq(topics.subjectId, subjects.id))
          .where(
            sql`${topics.subjectId} IN (${sql.join(
              subjectIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .orderBy(sql`RANDOM()`)
          .limit(6);
      }
    }

    // === RECENTLY VIEWED ===
    let recentlyViewed: {
      questionId: number;
      questionText: string;
      viewedAt: Date;
    }[] = [];

    try {
      recentlyViewed = await db
        .select({
          questionId: questionViews.questionId,
          questionText: questions.questionText,
          viewedAt: questionViews.createdAt,
        })
        .from(questionViews)
        .innerJoin(questions, eq(questionViews.questionId, questions.id))
        .where(eq(questionViews.userId, uid))
        .orderBy(desc(questionViews.createdAt))
        .limit(5);
    } catch {
      // Table might not exist
    }

    return NextResponse.json({
      success: true,
      data: {
        myCourses,
        continueStudying,
        repeatedQuestions,
        recommendedTopics,
        recentlyViewed,
      },
    });
  } catch (error) {
    console.error("Personalized error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load personalized content." },
      { status: 500 }
    );
  }
}
