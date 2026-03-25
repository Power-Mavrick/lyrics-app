"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AddFormProps {
  initialTitle: string;
  initialArtist: string;
}

export default function AddForm({ initialTitle, initialArtist }: AddFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [artist, setArtist] = useState(initialArtist);
  const [lyricsText, setLyricsText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist, lyricsText }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/song/${data.data.songId}`);
      } else {
        setError(data.error?.message ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Song Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bohemian Rhapsody"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Artist */}
        <div>
          <label
            htmlFor="artist"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Artist <span className="text-red-400">*</span>
          </label>
          <input
            id="artist"
            type="text"
            required
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Queen"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Lyrics */}
        <div>
          <label
            htmlFor="lyrics"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lyrics <span className="text-red-400">*</span>
          </label>
          <textarea
            id="lyrics"
            required
            rows={14}
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder="Paste or type the full lyrics here…"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y font-mono"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving…" : "Save Lyrics"}
        </button>
        <Link
          href="/search"
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-gray-400 transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
