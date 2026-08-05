import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  subjects,
  topics,
  universityCourses,
  questions,
  solutions,
  questionAppearances,
  departments,
  auditLog,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// POST: Bulk import questions, topics, courses, solutions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, userId } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: "type and data required." },
        { status: 400 }
      );
    }

    let imported = 0;

    // ==========================================
    // BULK IMPORT QUESTIONS
    // Format: { courseCode, year, questions: [{ text, marks, difficulty, topic }] }
    // ==========================================
    if (type === "questions") {
      const { courseCode, year, questions: rawQuestions } = data;

      if (!courseCode || !year || !rawQuestions?.length) {
        return NextResponse.json(
          { success: false, message: "courseCode, year, and questions array required." },
          { status: 400 }
        );
      }

      // Find the course
      const [course] = await db
        .select()
        .from(universityCourses)
        .where(eq(universityCourses.courseCode, courseCode.toUpperCase()));

      if (!course) {
        return NextResponse.json(
          { success: false, message: `Course ${courseCode} not found. Create it first.` },
          { status: 404 }
        );
      }

      // Get all topics for this subject
      const subjectTopics = await db
        .select()
        .from(topics)
        .where(eq(topics.subjectId, course.subjectId));

      for (const q of rawQuestions) {
        if (!q.text?.trim()) continue;

        // Find or guess topic
        let topicId: number | null = null;

        if (q.topic) {
          // Try exact match
          const match = subjectTopics.find(
            (t) =>
              t.name.toLowerCase() === q.topic.toLowerCase() ||
              t.slug === q.topic.toLowerCase().replace(/\s+/g, "-")
          );
          if (match) topicId = match.id;
        }

        // Default to first topic if not found
        if (!topicId && subjectTopics.length > 0) {
          topicId = subjectTopics[0].id;
        }

        if (!topicId) continue;

        // Detect command word from question text
        const firstWord = q.text.trim().split(/[\s(]/)[0];
        const commandWords = ["Explain", "State", "Derive", "Design", "Calculate", "Compare", "Simplify", "Define", "List", "Describe", "Solve"];
        const commandWord = commandWords.find(
          (w) => firstWord.toLowerCase() === w.toLowerCase()
        ) || null;

        // Insert question
        const [inserted] = await db
          .insert(questions)
          .values({
            questionText: q.text.trim(),
            questionNumber: q.number || null,
            marks: q.marks || null,
            difficulty: q.difficulty || "medium",
            topicId,
            commandWord,
            status: "approved",
            contributorId: userId || null,
          })
          .returning();

        // Link to course + year
        await db.insert(questionAppearances).values({
          questionId: inserted.id,
          universityCourseId: course.id,
          year: parseInt(year),
        });

        imported++;
      }

      // Log
      if (userId) {
        await db.insert(auditLog).values({
          userId,
          action: "bulk_import_questions",
          entityType: "question",
          details: `Imported ${imported} questions for ${courseCode} ${year}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `${imported} questions imported for ${courseCode} (${year}).`,
        imported,
      });
    }

    // ==========================================
    // BULK ADD TOPICS
    // Format: { subjectSlug, topics: [{ name, description }] }
    // ==========================================
    if (type === "topics") {
      const { subjectSlug, topics: rawTopics } = data;

      const [subject] = await db
        .select()
        .from(subjects)
        .where(eq(subjects.slug, subjectSlug));

      if (!subject) {
        return NextResponse.json(
          { success: false, message: `Subject ${subjectSlug} not found.` },
          { status: 404 }
        );
      }

      for (const t of rawTopics) {
        if (!t.name?.trim()) continue;

        const slug = t.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Skip if already exists
        const existing = await db
          .select()
          .from(topics)
          .where(eq(topics.slug, slug));

        if (existing.length > 0) continue;

        await db.insert(topics).values({
          name: t.name.trim(),
          slug,
          description: t.description || null,
          subjectId: subject.id,
          notes: t.notes || null,
          formulas: t.formulas || null,
          examTips: t.examTips || null,
        });

        imported++;
      }

      return NextResponse.json({
        success: true,
        message: `${imported} topics added to ${subject.name}.`,
        imported,
      });
    }

    // ==========================================
    // ADD A NEW SUBJECT
    // ==========================================
    if (type === "subject") {
      const { name, description, fieldOfStudy, iconEmoji } = data;

      if (!name?.trim()) {
        return NextResponse.json(
          { success: false, message: "Subject name required." },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existing = await db
        .select()
        .from(subjects)
        .where(eq(subjects.slug, slug));

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: "Subject already exists." },
          { status: 409 }
        );
      }

      const [created] = await db
        .insert(subjects)
        .values({
          name: name.trim(),
          slug,
          description: description || null,
          fieldOfStudy: fieldOfStudy || null,
          iconEmoji: iconEmoji || "📚",
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Subject "${created.name}" created.`,
        data: created,
      });
    }

    // ==========================================
    // ADD A NEW COURSE (map code to subject)
    // ==========================================
    if (type === "course") {
      const { courseCode, courseTitle, subjectSlug, creditUnit, semester, level } = data;

      if (!courseCode || !courseTitle || !subjectSlug) {
        return NextResponse.json(
          { success: false, message: "courseCode, courseTitle, and subjectSlug required." },
          { status: 400 }
        );
      }

      const [subject] = await db
        .select()
        .from(subjects)
        .where(eq(subjects.slug, subjectSlug));

      if (!subject) {
        return NextResponse.json(
          { success: false, message: `Subject "${subjectSlug}" not found.` },
          { status: 404 }
        );
      }

      // Get first department (UNICAL EEE for now)
      const [dept] = await db.select().from(departments).limit(1);

      if (!dept) {
        return NextResponse.json(
          { success: false, message: "No department found. Seed the database first." },
          { status: 404 }
        );
      }

      const [created] = await db
        .insert(universityCourses)
        .values({
          courseCode: courseCode.toUpperCase().trim(),
          courseTitle: courseTitle.trim(),
          departmentId: dept.id,
          subjectId: subject.id,
          creditUnit: creditUnit || null,
          semester: semester || null,
          level: level || null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Course ${created.courseCode} created and linked to ${subject.name}.`,
        data: created,
      });
    }

    // ==========================================
    // BULK ADD SOLUTIONS
    // Format: { solutions: [{ questionId, solutionText, explanation, commonMistakes }] }
    // ==========================================
    if (type === "solutions") {
      const { solutions: rawSolutions } = data;

      for (const s of rawSolutions) {
        if (!s.questionId || !s.solutionText?.trim()) continue;

        await db.insert(solutions).values({
          questionId: s.questionId,
          solutionText: s.solutionText.trim(),
          explanation: s.explanation || null,
          commonMistakes: s.commonMistakes || null,
          marksAllocation: s.marksAllocation || null,
          hints: s.hints || null,
          status: "approved",
          contributorId: userId || null,
        });

        imported++;
      }

      return NextResponse.json({
        success: true,
        message: `${imported} solutions added.`,
        imported,
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown import type: ${type}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { success: false, message: "Bulk import failed." },
      { status: 500 }
    );
  }
}
