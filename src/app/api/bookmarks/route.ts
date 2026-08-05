import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks, questions, topics, subjects } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET: List user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId required." },
        { status: 400 }
      );
    }

    const userBookmarks = await db
      .select({
        id: bookmarks.id,
        questionId: bookmarks.questionId,
        questionText: questions.questionText,
        difficulty: questions.difficulty,
        marks: questions.marks,
        topicName: topics.name,
        subjectName: subjects.name,
        createdAt: bookmarks.createdAt,
      })
      .from(bookmarks)
      .innerJoin(questions, eq(bookmarks.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(eq(bookmarks.userId, parseInt(userId)))
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({ success: true, data: userBookmarks });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookmarks." },
      { status: 500 }
    );
  }
}

// POST: Toggle bookmark (add or remove)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId } = body;

    if (!userId || !questionId) {
      return NextResponse.json(
        { success: false, message: "userId and questionId required." },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.questionId, questionId)
        )
      );

    if (existing.length > 0) {
      // Remove bookmark
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.questionId, questionId)
          )
        );
      return NextResponse.json({
        success: true,
        message: "Bookmark removed.",
        bookmarked: false,
      });
    } else {
      // Add bookmark
      await db.insert(bookmarks).values({ userId, questionId });
      return NextResponse.json({
        success: true,
        message: "Question bookmarked.",
        bookmarked: true,
      });
    }
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle bookmark." },
      { status: 500 }
    );
  }
}
