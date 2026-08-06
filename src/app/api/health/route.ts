import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, db: "up", ts: new Date().toISOString() },
      { status: 200 },
    );
  } catch (err) {
    // Log server-side only: never echo DB/driver messages to clients.
    console.error("[health] db check failed", err);
    return NextResponse.json(
      { ok: false, db: "down", ts: new Date().toISOString() },
      { status: 503 },
    );
  }
}
