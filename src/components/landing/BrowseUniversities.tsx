import { db } from "@/db";
import { universities, faculties, departments, universityCourses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import UniversityBrowser from "./UniversityBrowser";

export default async function BrowseUniversities() {
  let uniData: {
    id: number;
    name: string;
    shortName: string;
    location: string | null;
    facultyCount: number;
    courseCount: number;
  }[] = [];

  try {
    uniData = await db
      .select({
        id: universities.id,
        name: universities.name,
        shortName: universities.shortName,
        location: universities.location,
        facultyCount: sql<number>`(
          SELECT COUNT(*)::int FROM faculties WHERE university_id = ${universities.id}
        )`,
        courseCount: sql<number>`(
          SELECT COUNT(*)::int FROM university_courses uc
          JOIN departments d ON d.id = uc.department_id
          JOIN faculties f ON f.id = d.faculty_id
          WHERE f.university_id = ${universities.id}
        )`,
      })
      .from(universities)
      .orderBy(sql`(
        SELECT COUNT(*) FROM university_courses uc
        JOIN departments d ON d.id = uc.department_id
        JOIN faculties f ON f.id = d.faculty_id
        WHERE f.university_id = ${universities.id}
      ) DESC`);
  } catch {
    // Tables may not exist
  }

  if (uniData.length === 0) return null;

  return <UniversityBrowser universities={uniData} />;
}
