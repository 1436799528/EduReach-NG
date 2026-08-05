import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  bookmarks,
  practiceSessions,
  uploads,
  universities,
  departments,
  faculties,
  achievements,
  userAchievements,
  fileUploads,
} from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

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

    // Profile
    const [user] = await db.select().from(users).where(eq(users.id, uid));
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // University & Department names
    let universityName: string | null = null;
    let departmentName: string | null = null;
    if (user.departmentId) {
      try {
        const deptResult = await db
          .select({
            deptName: departments.name,
            uniShort: universities.shortName,
          })
          .from(departments)
          .innerJoin(faculties, eq(departments.facultyId, faculties.id))
          .innerJoin(universities, eq(faculties.universityId, universities.id))
          .where(eq(departments.id, user.departmentId));
        if (deptResult.length > 0) {
          departmentName = deptResult[0].deptName;
          universityName = deptResult[0].uniShort;
        }
      } catch {
        // Skip if join fails
      }
    }

    // Bookmark count
    const [bkCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, uid));

    // Upload counts
    const [upCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(uploads)
      .where(eq(uploads.userId, uid));

    const [upApproved] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(uploads)
      .where(and(eq(uploads.userId, uid), eq(uploads.status, "approved")));

    // File upload count
    const [fileCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(fileUploads)
      .where(eq(fileUploads.userId, uid));

    // Practice sessions
    const recentSessions = await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, uid))
      .orderBy(desc(practiceSessions.createdAt))
      .limit(10);

    const avgScore =
      recentSessions.length > 0
        ? Math.round(
            recentSessions.reduce((s, ss) => s + (ss.score || 0), 0) /
              recentSessions.length
          )
        : 0;

    // Recent uploads (text + files combined)
    const recentUploads = await db
      .select({
        id: uploads.id,
        title: uploads.title,
        type: uploads.type,
        status: uploads.status,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .where(eq(uploads.userId, uid))
      .orderBy(desc(uploads.createdAt))
      .limit(5);

    const recentFiles = await db
      .select({
        id: fileUploads.id,
        title: fileUploads.title,
        fileType: fileUploads.fileType,
        fileName: fileUploads.fileName,
        status: fileUploads.status,
        createdAt: fileUploads.createdAt,
      })
      .from(fileUploads)
      .where(eq(fileUploads.userId, uid))
      .orderBy(desc(fileUploads.createdAt))
      .limit(5);

    // Earned achievements
    let earned: { name: string; iconEmoji: string; description: string; earnedAt: Date }[] = [];
    try {
      earned = await db
        .select({
          name: achievements.name,
          iconEmoji: achievements.iconEmoji,
          description: achievements.description,
          earnedAt: userAchievements.earnedAt,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, uid));
    } catch {
      // Skip if table doesn't exist yet
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
          level: user.level,
          programme: user.programme,
          semester: user.semester,
          points: user.points || 0,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          questionsViewed: user.questionsViewed || 0,
          questionsSolved: user.questionsSolved || 0,
          practiceSessionsCompleted: user.practiceSessionsCompleted || 0,
          onboardingComplete: user.onboardingComplete,
          universityName,
          departmentName,
          createdAt: user.createdAt,
        },
        stats: {
          bookmarkCount: bkCount.count,
          uploadCount: upCount.count + fileCount.count,
          approvedUploads: upApproved.count,
          avgScore,
        },
        recentSessions,
        recentUploads,
        recentFiles,
        achievements: earned,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile." },
      { status: 500 }
    );
  }
}
