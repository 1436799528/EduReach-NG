import Link from "next/link";
import { db } from "@/db";
import { faculties, departments, universityCourses } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { ChevronRight, Wrench, FlaskConical, Stethoscope, Scale, Wheat, BookOpen, Palette, Briefcase, Building, HardHat, Microscope, Wifi, School } from "lucide-react";

const FACULTY_ICONS: Record<string, typeof Wrench> = {
  engineering: Wrench, science: FlaskConical, medicine: Stethoscope, law: Scale,
  agriculture: Wheat, education: BookOpen, arts: Palette, management: Briefcase,
  social: Building, environmental: HardHat, clinical: Stethoscope, allied: Microscope,
  basic: FlaskConical, communication: Wifi,
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(FACULTY_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return School;
}

export default async function BrowseFaculties() {
  let facList: { id: number; name: string; courseCount: number }[] = [];

  try {
    facList = await db
      .select({
        id: faculties.id,
        name: faculties.name,
        courseCount: sql<number>`(SELECT COUNT(*)::int FROM university_courses uc JOIN departments d ON d.id = uc.department_id WHERE d.faculty_id = ${faculties.id})`,
      })
      .from(faculties)
      .orderBy(desc(sql`(SELECT COUNT(*) FROM university_courses uc JOIN departments d ON d.id = uc.department_id WHERE d.faculty_id = ${faculties.id})`))
      .limit(9);
  } catch { /* skip */ }

  if (facList.length === 0) return null;

  return (
    <section className="py-6 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading text-base font-bold text-slate-900 mb-1">Browse by Faculty</h2>
        <p className="text-xs text-slate-500 mb-4">Faculty → Department → Level → Course</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {facList.map((fac) => {
            const Icon = getIcon(fac.name);
            return (
              <Link key={fac.id} href="/courses" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-accent-300 hover:shadow-sm transition">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {fac.name.replace("Faculty of ", "").replace(" & Technology", "")}
                  </p>
                  <p className="text-xs text-slate-400">{fac.courseCount} courses</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
