import { db } from "@/db";
import { searchLog, topics } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import HeroClient from "./HeroClient";

export default async function HeroSection() {
  let trending: string[] = [];

  try {
    const searches = await db
      .select({ query: searchLog.query, count: sql<number>`COUNT(*)::int` })
      .from(searchLog)
      .groupBy(searchLog.query)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(6);

    if (searches.length > 0) {
      trending = searches.map((s) => s.query);
    }
  } catch { /* skip */ }

  if (trending.length === 0) {
    try {
      const topTopics = await db.select({ name: topics.name }).from(topics).limit(6);
      trending = topTopics.map((t) => t.name);
    } catch { /* skip */ }
  }

  return <HeroClient trending={trending} />;
}
