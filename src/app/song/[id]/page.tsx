import { requireAuth } from "@/lib/requireAuth";
import { db } from "@/lib/db";
import { songs, lyrics } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

interface SongPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongPage({ params }: SongPageProps) {
  await requireAuth();
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
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-4xl mb-4">🎵</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Song not found</h1>
        <p className="text-gray-500 mb-6">
          This song doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          ← Back to Search
        </Link>
      </div>
    );
  }

  const song = rows[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-6 transition"
      >
        ← Back to Search
      </Link>

      {/* Song header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{song.title}</h1>
        <p className="text-gray-500 mt-1">{song.artist}</p>
      </div>

      {/* Lyrics */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Lyrics
        </h2>
        {song.lyricsText ? (
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
            {song.lyricsText}
          </pre>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">No lyrics added yet.</p>
            <Link
              href={`/add?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              + Add Lyrics
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
