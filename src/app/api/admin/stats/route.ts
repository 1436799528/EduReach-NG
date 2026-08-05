import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  questions,
  solutions,
  uploads,
  subjects,
  universityCourses,
  practiceSessions,
} from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    const [userCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users);
    const [questionCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(questions);
    const [solutionCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(solutions);
    const [pendingCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(uploads)
      .where(eq(uploads.status, "pending"));
    const [subjectCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(subjects);
    const [courseCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(universityCourses);
    const [sessionCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(practiceSessions);

    // Top contributors
    const topContributors = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        points: users.points,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.points))
      .limit(10);

    // Recent uploads pending review
    const pendingUploads = await db
      .select({
        id: uploads.id,
        title: uploads.title,
        type: uploads.type,
        content: uploads.content,
        status: uploads.status,
        year: uploads.year,
        userId: uploads.userId,
        contributorName: users.fullName,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .innerJoin(users, eq(uploads.userId, users.id))
      .orderBy(desc(uploads.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          users: userCount.count,
          questions: questionCount.count,
          solutions: solutionCount.count,
          pending: pendingCount.count,
          subjects: subjectCount.count,
          courses: courseCount.count,
          sessions: sessionCount.count,
        },
        topContributors,
        pendingUploads,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin stats." },
      { status: 500 }
    );
  }
}
