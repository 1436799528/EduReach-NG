import { db } from "@/db";
import { universities, universityCourses, uploads, users } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { Building, BookOpen, FileText, Users } from "lucide-react";

export default async function PlatformStats() {
  let stats = { universities: 0, courses: 0, papers: 0, contributors: 0 };

  try {
    const [uniCount] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(universities);
    const [courseCount] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(universityCourses);
    const [paperCount] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(uploads).where(eq(uploads.status, "approved"));
    const [userCount] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(users);

    stats = {
      universities: uniCount.c,
      courses: courseCount.c,
      papers: paperCount.c,
      contributors: userCount.c,
    };
  } catch { /* skip */ }

  if (stats.papers === 0 && stats.courses === 0) return null;

  const items = [
    { icon: Building, value: stats.universities, label: "Universities" },
    { icon: BookOpen, value: stats.courses, label: "Courses" },
    { icon: FileText, value: stats.papers, label: "Papers" },
    { icon: Users, value: stats.contributors, label: "Contributors" },
  ];

  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-4 gap-3">
          {items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center p-4 bg-white border border-slate-200 rounded-lg">
              <Icon className="w-5 h-5 text-brand-600 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
