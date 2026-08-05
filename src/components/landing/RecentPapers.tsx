import Link from "next/link";
import { db } from "@/db";
import { uploads, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { FileText } from "lucide-react";

export default async function RecentPapers() {
  let papers: { id: number; title: string; type: string; contributorName: string; createdAt: Date }[] = [];

  try {
    papers = await db
      .select({
        id: uploads.id,
        title: uploads.title,
        type: uploads.type,
        contributorName: users.fullName,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .innerJoin(users, eq(uploads.userId, users.id))
      .where(eq(uploads.status, "approved"))
      .orderBy(desc(uploads.createdAt))
      .limit(6);
  } catch { /* skip */ }

  if (papers.length === 0) return null;

  const timeAgo = (d: Date) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-base font-bold text-slate-900">Recently Added</h2>
          <Link href="/courses" className="text-xs text-accent-500 font-semibold hover:text-accent-600">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {papers.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="w-8 h-8 bg-accent-50 rounded flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 line-clamp-1">{p.title}</p>
                <p className="text-xs text-slate-400">{p.contributorName} · {timeAgo(p.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
