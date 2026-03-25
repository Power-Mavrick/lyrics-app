import { redirect } from "next/navigation";
import {
  getSessionCookieServer,
  validateSession,
  type SessionUser,
} from "@/lib/session";

/**
 * Server-side auth guard for page server components.
 * Reads the session cookie, validates it, and redirects to /login if invalid.
 * Returns the authenticated user when valid.
 */
export async function requireAuth(): Promise<SessionUser> {
  const token = await getSessionCookieServer();
  if (!token) redirect("/login");

  const user = await validateSession(token);
  if (!user) redirect("/login");

  return user;
}
