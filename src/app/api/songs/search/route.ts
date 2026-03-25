import { NextRequest, NextResponse } from "next/server";
import { like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { songs } from "@/db/schema";
import { normalizeText } from "@/lib/normalize";
import { getSessionCookie, validateSession } from "@/lib/session";

function unauth() {
  return NextResponse.json(
    { ok: false, error: { message: "Not authenticated" } },
    { status: 401 }
  );
}

export async function GET(req: NextRequest) {
  const token = getSessionCookie(req);
  if (!token) return unauth();
  const user = await validateSession(token);
  if (!user) return unauth();

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const normalized = normalizeText(q);

  const results = await db
    .select({
      id: songs.id,
      title: songs.title,
      artist: songs.artist,
    })
    .from(songs)
    .where(
      or(
        like(songs.normalizedTitle, `%${normalized}%`),
        like(songs.normalizedArtist, `%${normalized}%`)
      )
    )
    .orderBy(songs.title)
    .limit(20);

  return NextResponse.json({ ok: true, data: results });
}
