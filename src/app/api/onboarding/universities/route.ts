import { NextResponse } from "next/server";
import { db } from "@/db";
import { universities } from "@/db/schema";

export async function GET() {
  try {
    const all = await db
      .select({ id: universities.id, name: universities.name, shortName: universities.shortName })
      .from(universities)
      .orderBy(universities.name);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([]);
  }
}
