import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, universityId, departmentId, level, programme, semester } = body;

    if (!userId || !universityId || !departmentId || !level) {
      return NextResponse.json(
        { success: false, message: "University, department, and level are required." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      .set({
        universityId,
        departmentId,
        level,
        programme: programme || null,
        semester: semester || null,
        onboardingComplete: true,
        points: sql`COALESCE(${users.points}, 0) + 5`,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        level: users.level,
        points: users.points,
        currentStreak: users.currentStreak,
        onboardingComplete: users.onboardingComplete,
        universityId: users.universityId,
        departmentId: users.departmentId,
      });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    await db.insert(notifications).values({
      userId,
      type: "welcome",
      title: "Welcome to EduReach Hub! 🎉",
      message:
        "Your account is set up. Start by browsing courses and practicing past questions.",
      link: "/courses",
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, message: "Onboarding failed." },
      { status: 500 }
    );
  }
}
