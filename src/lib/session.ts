import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/db/schema";
import { hashToken } from "@/lib/auth";

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Write the raw session token into an HTTP-only cookie on a NextResponse. */
export function setSessionCookie(res: NextResponse, rawToken: string): void {
  res.cookies.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/** Expire the session cookie on a NextResponse. */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Read the raw token from the incoming request cookie. */
export function getSessionCookie(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

/** Read the raw token from the server-side cookie store (Server Components / Route Handlers without request). */
export async function getSessionCookieServer(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export type SessionUser = { id: string; username: string };

/**
 * Validate a raw session token:
 *  1. Hash it
 *  2. Look up the sessions row
 *  3. Check it hasn't expired
 *  4. Return the associated user
 */
export async function validateSession(
  rawToken: string
): Promise<SessionUser | null> {
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      username: users.username,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.sessionTokenHash, tokenHash),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1);

  if (rows.length === 0) return null;

  return { id: rows[0].userId, username: rows[0].username };
}

/** Returns the session expiry date (now + 30 days). */
export function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}
