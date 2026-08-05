import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { faculties } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const universityId = request.nextUrl.searchParams.get("universityId");
    if (!universityId) return NextResponse.json([]);

    const all = await db
      .select({ id: faculties.id, name: faculties.name })
      .from(faculties)
      .where(eq(faculties.universityId, parseInt(universityId)))
      .orderBy(faculties.name);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([]);
  }
}
