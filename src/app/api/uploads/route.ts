import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads, users, notifications } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// POST: Upload content — admin uploads auto-approve
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, type, content, year } = body;

    if (!userId || !title || !type || !content) {
      return NextResponse.json(
        { success: false, message: "Title, type, and content are required." },
        { status: 400 }
      );
    }

    // Check if user is admin — auto-approve their uploads
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const uploadStatus = isAdmin ? "approved" : "pending";

    const [upload] = await db
      .insert(uploads)
      .values({
        userId,
        title: title.trim(),
        type,
        content,
        year: year || null,
        status: uploadStatus,
        reviewedBy: isAdmin ? userId : null,
        reviewedAt: isAdmin ? new Date() : null,
      })
      .returning();

    // Award points
    const pointsMap: Record<string, number> = {
      past_question: 15,
      solution: 20,
      notes: 10,
      material: 10,
      correction: 5,
    };
    const pts = pointsMap[type] || 10;
    const bonusPts = isAdmin ? 10 : 0; // Admin gets approval bonus immediately

    // Award points AND credits
    const creditsMap: Record<string, number> = {
      past_question: 20,
      solution: 25,
      notes: 15,
      material: 15,
      correction: 5,
    };
    const creditsEarned = creditsMap[type] || 10;

    await db
      .update(users)
      .set({
        points: sql`COALESCE(${users.points}, 0) + ${pts + bonusPts}`,
        credits: sql`COALESCE(${users.credits}, 0) + ${creditsEarned}`,
      })
      .where(eq(users.id, userId));

    await db.insert(notifications).values({
      userId,
      type: isAdmin ? "upload_approved" : "upload_submitted",
      title: isAdmin ? "Upload Published! ✅" : "Upload Submitted! 📤",
      message: isAdmin
        ? `"${title}" is now live. +${pts + bonusPts} points!`
        : `"${title}" is pending review. +${pts} points!`,
      link: "/my-uploads",
    });

    return NextResponse.json({
      success: true,
      message: isAdmin
        ? `Published immediately. +${pts + bonusPts} points!`
        : `Uploaded successfully. Pending review. +${pts} points!`,
      data: upload,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed." },
      { status: 500 }
    );
  }
}

// GET: List uploads
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const status = request.nextUrl.searchParams.get("status");

    const conditions = [];
    if (userId) conditions.push(eq(uploads.userId, parseInt(userId)));
    if (status) conditions.push(eq(uploads.status, status as "pending" | "approved" | "rejected"));

    const allUploads = await db
      .select({
        id: uploads.id,
        title: uploads.title,
        type: uploads.type,
        content: uploads.content,
        year: uploads.year,
        status: uploads.status,
        reviewNote: uploads.reviewNote,
        userId: uploads.userId,
        contributorName: users.fullName,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .innerJoin(users, eq(uploads.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(uploads.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, data: allUploads });
  } catch (error) {
    console.error("Uploads GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch uploads." },
      { status: 500 }
    );
  }
}

// DELETE: Poster deletes their own upload
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, userId } = body;

    if (!uploadId || !userId) {
      return NextResponse.json(
        { success: false, message: "uploadId and userId required." },
        { status: 400 }
      );
    }

    // Verify ownership (or admin)
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, uploadId));

    if (!upload) {
      return NextResponse.json(
        { success: false, message: "Upload not found." },
        { status: 404 }
      );
    }

    const isOwner = upload.userId === userId;
    const isAdmin = user?.role === "admin" || user?.role === "moderator";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied." },
        { status: 403 }
      );
    }

    await db.delete(uploads).where(eq(uploads.id, uploadId));

    return NextResponse.json({
      success: true,
      message: "Upload deleted.",
    });
  } catch (error) {
    console.error("Upload DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete." },
      { status: 500 }
    );
  }
}
