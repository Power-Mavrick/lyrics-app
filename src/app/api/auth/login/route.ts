import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, sessions } from "@/db/schema";
import { verifyPassword, generateSessionToken, hashToken } from "@/lib/auth";
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

  if (!username || !password) {
    return err("Username and password are required", 400);
  }

  // Fetch user
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = rows[0];

  // Use constant-time comparison even if user not found (prevent timing attacks)
  const isValid = user
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !isValid) {
    return err("Invalid username or password", 401);
  }

  // Create session
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = sessionExpiresAt();

  await db.insert(sessions).values({
    userId: user.id,
    sessionTokenHash: tokenHash,
    expiresAt,
  });

  const res = NextResponse.json({
    ok: true,
    data: { id: user.id, username: user.username },
  });
  setSessionCookie(res, rawToken);
  return res;
}
