import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLog, notifications, universities, faculties, departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

const SUPER_ADMIN = {
  email: "jamesjulius176@gmail.com",
  university: "UNICAL",
  level: 300,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, gender } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists." },
        { status: 409 }
      );
    }

    // Always hash password locally first (fast, reliable)
    const passwordHash = await bcrypt.hash(password, 10);

    // Try Supabase Auth in background (don't block registration)
    if (isSupabaseConfigured()) {
      // Fire and forget — don't await, don't block
      createSupabaseServerClient()
        .then((supabase) =>
          supabase.auth.signUp({
            email: email.toLowerCase(),
            password,
            options: { data: { full_name: fullName } },
          })
        )
        .catch(() => {
          // Supabase failed — no problem, bcrypt works
        });
    }

    // Check if Super Admin
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN.email.toLowerCase();

    // Auto-resolve academic profile for Super Admin
    let universityId: number | null = null;
    let departmentId: number | null = null;

    if (isSuperAdmin) {
      try {
        const [uni] = await db
          .select()
          .from(universities)
          .where(eq(universities.shortName, SUPER_ADMIN.university));
        if (uni) {
          universityId = uni.id;
          const [fac] = await db
            .select()
            .from(faculties)
            .where(eq(faculties.universityId, uni.id));
          if (fac) {
            const [dept] = await db
              .select()
              .from(departments)
              .where(eq(departments.facultyId, fac.id));
            if (dept) departmentId = dept.id;
          }
        }
      } catch {
        // Skip
      }
    }

    // Create profile
    const [profile] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone || null,
        gender: gender || null,
        role: isSuperAdmin ? "admin" : "student",
        points: isSuperAdmin ? 100 : 0,
        currentStreak: 0,
        universityId,
        departmentId,
        level: isSuperAdmin ? SUPER_ADMIN.level : null,
        programme: isSuperAdmin ? "Electrical & Electronics Engineering" : null,
        semester: isSuperAdmin ? "First" : null,
        onboardingComplete: isSuperAdmin,
      })
      .returning();

    // Audit + notification (don't await — fire and forget)
    db.insert(auditLog)
      .values({
        userId: profile.id,
        action: isSuperAdmin ? "super_admin_register" : "register",
        entityType: "user",
        entityId: profile.id,
      })
      .catch(() => {});

    db.insert(notifications)
      .values({
        userId: profile.id,
        type: "welcome",
        title: isSuperAdmin ? "Welcome, Super Admin! 🛡️" : "Welcome to EduReach Hub! 🎉",
        message: isSuperAdmin
          ? "You have full admin access. Go to /admin to manage the platform."
          : "Your account is created. Complete your profile to get started.",
        link: isSuperAdmin ? "/admin" : "/onboarding",
      })
      .catch(() => {});

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
        onboardingComplete: profile.onboardingComplete,
        universityId: profile.universityId,
        departmentId: profile.departmentId,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
