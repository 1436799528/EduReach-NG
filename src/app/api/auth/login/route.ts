import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Get profile
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check if banned
    if (profile.isBanned) {
      return NextResponse.json(
        { success: false, message: "This account has been permanently banned." },
        { status: 403 }
      );
    }

    // Check if suspended
    if (profile.isSuspended && profile.suspendedUntil) {
      if (new Date(profile.suspendedUntil) > new Date()) {
        return NextResponse.json(
          { success: false, message: `Account suspended until ${new Date(profile.suspendedUntil).toLocaleDateString()}.` },
          { status: 403 }
        );
      }
      // Suspension expired — clear it
      await db
        .update(users)
        .set({ isSuspended: false, suspendedUntil: null })
        .where(eq(users.id, profile.id));
    }

    // Check if pending deletion
    if (profile.isDeleted) {
      return NextResponse.json(
        { success: false, message: "This account is scheduled for deletion. Go to Settings to cancel." },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        level: profile.level,
        points: profile.points,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        questionsViewed: profile.questionsViewed,
        questionsSolved: profile.questionsSolved,
        practiceSessionsCompleted: profile.practiceSessionsCompleted,
        onboardingComplete: profile.onboardingComplete,
        universityId: profile.universityId,
        departmentId: profile.departmentId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
