import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { songs, lyrics } from "@/db/schema";
import { getSessionCookie, validateSession } from "@/lib/session";

function unauth() {
  return NextResponse.json(
    { ok: false, error: { message: "Not authenticated" } },
    { status: 401 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getSessionCookie(req);
  if (!token) return unauth();
  const user = await validateSession(token);
  if (!user) return unauth();

  const { id } = await params;

  const rows = await db
    .select({
      id: songs.id,
      title: songs.title,
      artist: songs.artist,
      lyricsText: lyrics.lyricsText,
    })
    .from(songs)
    .leftJoin(lyrics, eq(lyrics.songId, songs.id))
    .where(eq(songs.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: { message: "Song not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: rows[0] });
}
