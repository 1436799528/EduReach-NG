import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads, users, notifications, auditLog } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// PATCH: Admin approve/reject/edit upload
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uploadId = parseInt(id);
    if (isNaN(uploadId)) {
      return NextResponse.json(
        { success: false, message: "Invalid upload ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, reviewNote, reviewerId, newTitle } = body;

    // Get the upload
    const [upload] = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, uploadId));

    if (!upload) {
      return NextResponse.json(
        { success: false, message: "Upload not found." },
        { status: 404 }
      );
    }

    // ---- EDIT TITLE (admin can rename) ----
    if (newTitle && !action) {
      await db
        .update(uploads)
        .set({ title: newTitle.trim() })
        .where(eq(uploads.id, uploadId));

      await db.insert(auditLog).values({
        userId: reviewerId || null,
        action: "upload_rename",
        entityType: "upload",
        entityId: uploadId,
        details: `Renamed from "${upload.title}" to "${newTitle.trim()}"`,
      });

      return NextResponse.json({
        success: true,
        message: "Title updated.",
      });
    }

    // ---- APPROVE / REJECT ----
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const updateFields: Record<string, unknown> = {
      status: newStatus,
      reviewedBy: reviewerId || null,
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    };

    // If admin also corrected the title
    if (newTitle) {
      updateFields.title = newTitle.trim();
    }

    await db
      .update(uploads)
      .set(updateFields)
      .where(eq(uploads.id, uploadId));

    // Award points on approval
    if (action === "approve") {
      const pointsMap: Record<string, number> = {
        past_question: 10,
        solution: 15,
        notes: 5,
        material: 5,
        correction: 5,
      };
      const bonusPoints = pointsMap[upload.type] || 5;

      await db
        .update(users)
        .set({ points: sql`COALESCE(${users.points}, 0) + ${bonusPoints}` })
        .where(eq(users.id, upload.userId));

      await db.insert(notifications).values({
        userId: upload.userId,
        type: "upload_approved",
        title: "Upload Approved! ✅",
        message: `"${newTitle || upload.title}" has been approved and is now live. +${bonusPoints} bonus points!`,
        link: "/my-uploads",
      });
    } else {
      await db.insert(notifications).values({
        userId: upload.userId,
        type: "upload_rejected",
        title: "Upload Needs Revision",
        message: reviewNote
          ? `"${upload.title}" was not approved: ${reviewNote}`
          : `"${upload.title}" was not approved. Please review and resubmit.`,
        link: "/upload",
      });
    }

    await db.insert(auditLog).values({
      userId: reviewerId || null,
      action: `upload_${action}`,
      entityType: "upload",
      entityId: uploadId,
      details: reviewNote || null,
    });

    return NextResponse.json({
      success: true,
      message: `Upload ${newStatus}.`,
    });
  } catch (error) {
    console.error("Admin upload action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed." },
      { status: 500 }
    );
  }
}
