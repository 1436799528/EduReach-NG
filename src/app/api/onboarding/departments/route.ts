import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const facultyId = request.nextUrl.searchParams.get("facultyId");
    if (!facultyId) return NextResponse.json([]);

    const all = await db
      .select({ id: departments.id, name: departments.name })
      .from(departments)
      .where(eq(departments.facultyId, parseInt(facultyId)))
      .orderBy(departments.name);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([]);
  }
}
