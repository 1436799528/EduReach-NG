import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// GET: Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required." }, { status: 400 });
    }

    const all = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, parseInt(userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const unreadCount = all.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, data: all, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ success: false, message: "Failed." }, { status: 500 });
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required." }, { status: 400 });
    }

    if (notificationId) {
      // Mark single notification as read
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );
    } else {
      // Mark all as read
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));
    }

    return NextResponse.json({ success: true, message: "Marked as read." });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed." }, { status: 500 });
  }
}
