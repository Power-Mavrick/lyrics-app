import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, sessions } from "@/db/schema";
import { hashPassword, generateSessionToken, hashToken } from "@/lib/auth";
import { setSessionCookie, sessionExpiresAt } from "@/lib/session";

function err(message: string, status: number) {
  return NextResponse.json({ ok: false, error: { message } }, { status });
}

export async function POST(req: NextRequest) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (username.length < 3 || username.length > 30) {
    return err("Username must be between 3 and 30 characters", 400);
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return err("Username may only contain letters, numbers, and underscores", 400);
  }
  if (password.length < 8) {
    return err("Password must be at least 8 characters", 400);
  }

  const passwordHash = await hashPassword(password);

  let newUser: { id: string; username: string };
  try {
    const rows = await db
      .insert(users)
      .values({ username, passwordHash })
      .returning({ id: users.id, username: users.username });
    newUser = rows[0];
  } catch (e: unknown) {
    // Neon driver wraps postgres errors: the pg error code lives in cause.code
    const pgCode =
      (e as { cause?: { code?: string } })?.cause?.code ??
      (e as { code?: string })?.code ??
      "";
    if (pgCode === "23505") {
      return err("Username is already taken", 409);
    }
    console.error("[signup] DB error:", e);
    return err("Internal server error", 500);
  }

  // Create session
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = sessionExpiresAt();

  await db.insert(sessions).values({
    userId: newUser.id,
    sessionTokenHash: tokenHash,
    expiresAt,
  });

  const res = NextResponse.json(
    { ok: true, data: { id: newUser.id, username: newUser.username } },
    { status: 201 }
  );
  setSessionCookie(res, rawToken);
  return res;
}
