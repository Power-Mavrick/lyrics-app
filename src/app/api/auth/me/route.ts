import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie, validateSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const rawToken = getSessionCookie(req);

  if (!rawToken) {
    return NextResponse.json(
      { ok: false, error: { message: "Not authenticated" } },
      { status: 401 }
    );
  }

  const user = await validateSession(rawToken);

  if (!user) {
    return NextResponse.json(
      { ok: false, error: { message: "Session expired or invalid" } },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, data: { id: user.id, username: user.username } });
}
