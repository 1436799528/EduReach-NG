import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH: Update profile info
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, phone, gender, programme, semester, level, theme, notifyEmail, notifyPractice, notifyUploads } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId required." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (programme !== undefined) updateData.programme = programme || null;
    if (semester !== undefined) updateData.semester = semester || null;
    if (level !== undefined) updateData.level = level;
    if (theme !== undefined) updateData.theme = theme;
    if (notifyEmail !== undefined) updateData.notifyEmail = notifyEmail;
    if (notifyPractice !== undefined) updateData.notifyPractice = notifyPractice;
    if (notifyUploads !== undefined) updateData.notifyUploads = notifyUploads;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        gender: users.gender,
        programme: users.programme,
        semester: users.semester,
        level: users.level,
        theme: users.theme,
        notifyEmail: users.notifyEmail,
        notifyPractice: users.notifyPractice,
        notifyUploads: users.notifyUploads,
      });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
