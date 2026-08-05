import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  universityCourses,
  subjects,
  departments,
  faculties,
  universities,
  questionAppearances,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityShortName = searchParams.get("university");

    let query = db
      .select({
        id: universityCourses.id,
        courseCode: universityCourses.courseCode,
        courseTitle: universityCourses.courseTitle,
        creditUnit: universityCourses.creditUnit,
        semester: universityCourses.semester,
        level: universityCourses.level,
        subjectId: universityCourses.subjectId,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        universityShortName: universities.shortName,
        universityName: universities.name,
        departmentName: departments.name,
        questionCount:
          sql<number>`(SELECT COUNT(DISTINCT qa.question_id) FROM question_appearances qa WHERE qa.university_course_id = ${universityCourses.id})::int`,
      })
      .from(universityCourses)
      .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
      .innerJoin(departments, eq(universityCourses.departmentId, departments.id))
      .innerJoin(faculties, eq(departments.facultyId, faculties.id))
      .innerJoin(universities, eq(faculties.universityId, universities.id))
      .orderBy(universityCourses.courseCode);

    const allCourses = await query;

    // Filter by university if specified
    const filteredCourses = universityShortName
      ? allCourses.filter(
          (c) =>
            c.universityShortName.toLowerCase() ===
            universityShortName.toLowerCase()
        )
      : allCourses;

    return NextResponse.json(filteredCourses);
  } catch (error) {
    console.error("Courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
