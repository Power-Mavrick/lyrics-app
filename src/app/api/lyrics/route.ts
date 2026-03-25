import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { songs, lyrics } from "@/db/schema";
import { normalizeText } from "@/lib/normalize";
import { getSessionCookie, validateSession } from "@/lib/session";

function unauth() {
  return NextResponse.json(
    { ok: false, error: { message: "Not authenticated" } },
    { status: 401 }
  );
}

function err(message: string, status: number) {
  return NextResponse.json({ ok: false, error: { message } }, { status });
}

export async function POST(req: NextRequest) {
  const token = getSessionCookie(req);
  if (!token) return unauth();
  const user = await validateSession(token);
  if (!user) return unauth();

  let body: { title?: unknown; artist?: unknown; lyricsText?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const artist = typeof body.artist === "string" ? body.artist.trim() : "";
  const lyricsText =
    typeof body.lyricsText === "string" ? body.lyricsText.trim() : "";

  if (!title) return err("Title is required", 400);
  if (!artist) return err("Artist is required", 400);
  if (!lyricsText) return err("Lyrics text is required", 400);

  const normalizedTitle = normalizeText(title);
  const normalizedArtist = normalizeText(artist);

  // Upsert: find existing song or create new one
  let songId: string;

  const existing = await db
    .select({ id: songs.id })
    .from(songs)
    .where(
      and(
        eq(songs.normalizedTitle, normalizedTitle),
        eq(songs.normalizedArtist, normalizedArtist)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    songId = existing[0].id;
  } else {
    const inserted = await db
      .insert(songs)
      .values({ title, artist, normalizedTitle, normalizedArtist })
      .returning({ id: songs.id });
    songId = inserted[0].id;
  }

  // Insert lyrics row
  await db.insert(lyrics).values({
    songId,
    lyricsText,
    sourceType: "user",
    createdByUserId: user.id,
  });

  return NextResponse.json({ ok: true, data: { songId } }, { status: 201 });
}
