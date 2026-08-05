import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, faculties, departments, universityCourses, subjects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const level = request.nextUrl.searchParams.get("level") || "institutions";
    const universityId = request.nextUrl.searchParams.get("universityId");
    const facultyId = request.nextUrl.searchParams.get("facultyId");
    const departmentId = request.nextUrl.searchParams.get("departmentId");

    // Level: Institutions
    if (level === "institutions") {
      const items = await db
        .select({
          id: universities.id,
          name: universities.shortName,
          fullName: universities.name,
          location: universities.location,
        })
        .from(universities)
        .orderBy(universities.name);

      return NextResponse.json({
        success: true,
        level: "institutions",
        title: "Browse Institutions",
        subtitle: `${items.length} Nigerian universities, polytechnics, and colleges`,
        breadcrumbs: [],
        data: items.map((u) => ({
          id: u.id,
          name: u.name,
          subtitle: u.fullName + (u.location ? ` · ${u.location}` : ""),
          stat: "",
        })),
      });
    }

    // Level: Faculties
    if (level === "faculties" && universityId) {
      const uid = parseInt(universityId);
      const [uni] = await db.select().from(universities).where(eq(universities.id, uid));
      if (!uni) return NextResponse.json({ success: false, message: "Institution not found." }, { status: 404 });

      const items = await db
        .select({ id: faculties.id, name: faculties.name })
        .from(faculties)
        .where(eq(faculties.universityId, uid))
        .orderBy(faculties.name);

      return NextResponse.json({
        success: true,
        level: "faculties",
        title: uni.shortName,
        subtitle: uni.name,
        breadcrumbs: [{ label: "Institutions", level: "institutions" }],
        data: items.map((f) => ({
          id: f.id,
          name: f.name.replace("Faculty of ", ""),
          subtitle: f.name,
          stat: "",
        })),
      });
    }

    // Level: Departments
    if (level === "departments" && facultyId) {
      const fid = parseInt(facultyId);
      const [fac] = await db.select().from(faculties).where(eq(faculties.id, fid));
      if (!fac) return NextResponse.json({ success: false, message: "Faculty not found." }, { status: 404 });
      const [uni] = await db.select().from(universities).where(eq(universities.id, fac.universityId));

      const items = await db
        .select({
          id: departments.id,
          name: departments.name,
          courseCount: sql<number>`(SELECT COUNT(*)::int FROM university_courses WHERE department_id = ${departments.id})`,
        })
        .from(departments)
        .where(eq(departments.facultyId, fid))
        .orderBy(departments.name);

      return NextResponse.json({
        success: true,
        level: "departments",
        title: fac.name.replace("Faculty of ", ""),
        subtitle: `${uni?.shortName || ""} · ${fac.name}`,
        breadcrumbs: [
          { label: "Institutions", level: "institutions" },
          { label: uni?.shortName || "", level: "faculties", id: uni?.id },
        ],
        data: items.map((d) => ({
          id: d.id,
          name: d.name,
          subtitle: fac.name,
          stat: `${d.courseCount} courses`,
        })),
      });
    }

    // Level: Courses in a department
    if (level === "courses" && departmentId) {
      const did = parseInt(departmentId);
      const [dept] = await db.select().from(departments).where(eq(departments.id, did));
      if (!dept) return NextResponse.json({ success: false, message: "Department not found." }, { status: 404 });
      const [fac] = await db.select().from(faculties).where(eq(faculties.id, dept.facultyId));
      const [uni] = fac ? await db.select().from(universities).where(eq(universities.id, fac.universityId)) : [null];

      const items = await db
        .select({
          id: universityCourses.id,
          courseCode: universityCourses.courseCode,
          courseTitle: universityCourses.courseTitle,
          level: universityCourses.level,
          semester: universityCourses.semester,
          subjectName: subjects.name,
          questionCount: sql<number>`(SELECT COUNT(DISTINCT qa.question_id)::int FROM question_appearances qa WHERE qa.university_course_id = ${universityCourses.id})`,
        })
        .from(universityCourses)
        .innerJoin(subjects, eq(universityCourses.subjectId, subjects.id))
        .where(eq(universityCourses.departmentId, did))
        .orderBy(universityCourses.courseCode);

      return NextResponse.json({
        success: true,
        level: "courses",
        title: dept.name,
        subtitle: `${uni?.shortName || ""} · ${fac?.name.replace("Faculty of ", "") || ""}`,
        breadcrumbs: [
          { label: "Institutions", level: "institutions" },
          { label: uni?.shortName || "", level: "faculties", id: uni?.id },
          { label: fac?.name.replace("Faculty of ", "") || "", level: "departments", id: fac?.id },
        ],
        data: items.map((c) => ({
          id: c.id,
          name: `${c.courseCode} — ${c.courseTitle}`,
          subtitle: `${c.subjectName} · ${c.level || ""}L · ${c.semester || ""} Semester`,
          stat: `${c.questionCount} papers`,
          courseCode: c.courseCode,
        })),
      });
    }

    return NextResponse.json({ success: false, message: "Invalid browse level." }, { status: 400 });
  } catch (error) {
    console.error("Browse error:", error);
    return NextResponse.json({ success: false, message: "Failed to load." }, { status: 500 });
  }
}
