import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const questionId = request.nextUrl.searchParams.get("questionId");

    if (!userId || !questionId) {
      return NextResponse.json({ bookmarked: false });
    }

    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, parseInt(userId)),
          eq(bookmarks.questionId, parseInt(questionId))
        )
      );

    return NextResponse.json({ bookmarked: existing.length > 0 });
  } catch {
    return NextResponse.json({ bookmarked: false });
  }
}
