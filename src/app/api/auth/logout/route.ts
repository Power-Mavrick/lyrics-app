import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema";
import { hashToken } from "@/lib/auth";
import { getSessionCookie, clearSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const rawToken = getSessionCookie(req);

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    // Delete the session row (best-effort — don't fail if already gone)
    await db
      .delete(sessions)
      .where(eq(sessions.sessionTokenHash, tokenHash))
      .catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
