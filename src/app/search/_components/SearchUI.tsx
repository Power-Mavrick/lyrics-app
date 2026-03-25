"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Song {
  id: string;
  title: string;
  artist: string;
}

export default function SearchUI({ username }: { username: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(
        `/api/songs/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.ok ? data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const addUrl = `/add?title=${encodeURIComponent(query)}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Search Lyrics</h1>
        <p className="text-gray-500 text-sm">
          Welcome back, <span className="font-medium text-indigo-600">@{username}</span>. Search for any song by title or artist.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Song title or artist name…"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Results */}
      {searched && results !== null && (
        <div>
          {results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((song) => (
                <li key={song.id}>
                  <Link
                    href={`/song/${song.id}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-400 hover:shadow-sm transition group"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                    <span className="text-indigo-400 text-lg">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-8 text-center">
              <p className="text-gray-500 mb-1">
                No results found for{" "}
                <span className="font-semibold text-gray-700">
                  &ldquo;{query}&rdquo;
                </span>
              </p>
              <p className="text-sm text-gray-400 mb-5">
                Be the first to add these lyrics to the library.
              </p>
              <button
                onClick={() => router.push(addUrl)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                + Add Lyrics
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial state hint */}
      {!searched && (
        <p className="text-center text-sm text-gray-400">
          Type a song title or artist name and press Search.
        </p>
      )}
    </div>
  );
}
