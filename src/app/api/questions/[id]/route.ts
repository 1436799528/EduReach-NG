import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  questions,
  solutions,
  topics,
  subjects,
  questionAppearances,
  universityCourses,
  universities,
  departments,
  faculties,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Get topic and subject
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, question.topicId));

    let subject = null;
    if (topic) {
      const [s] = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, topic.subjectId));
      subject = s;
    }

    // Get solutions
    const questionSolutions = await db
      .select()
      .from(solutions)
      .where(eq(solutions.questionId, questionId));

    // Get appearances (which universities and years)
    const appearances = await db
      .select({
        year: questionAppearances.year,
        courseCode: universityCourses.courseCode,
        courseTitle: universityCourses.courseTitle,
        universityShortName: universities.shortName,
        universityName: universities.name,
      })
      .from(questionAppearances)
      .innerJoin(
        universityCourses,
        eq(questionAppearances.universityCourseId, universityCourses.id)
      )
      .innerJoin(
        departments,
        eq(universityCourses.departmentId, departments.id)
      )
      .innerJoin(faculties, eq(departments.facultyId, faculties.id))
      .innerJoin(universities, eq(faculties.universityId, universities.id))
      .where(eq(questionAppearances.questionId, questionId));

    // Get related questions (same topic)
    const relatedQuestions = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        difficulty: questions.difficulty,
        marks: questions.marks,
      })
      .from(questions)
      .where(eq(questions.topicId, question.topicId))
      .limit(6);

    // Group appearances by university
    const universitiesAppeared = [
      ...new Set(appearances.map((a) => a.universityShortName)),
    ];
    const yearsAppeared = [...new Set(appearances.map((a) => a.year))].sort(
      (a, b) => b - a
    );

    return NextResponse.json({
      question,
      topic,
      subject,
      solutions: questionSolutions,
      appearances,
      universitiesAppeared,
      yearsAppeared,
      relatedQuestions: relatedQuestions.filter((q) => q.id !== questionId),
    });
  } catch (error) {
    console.error("Question detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}
