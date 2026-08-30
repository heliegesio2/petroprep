import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Healthcheck simples para monitoramento de uptime. */
export async function GET() {
  let db = false;
  if (hasDatabase) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
  }
  return NextResponse.json(
    { ok: true, db, ts: new Date().toISOString() },
    { status: db || !hasDatabase ? 200 : 503 },
  );
}
