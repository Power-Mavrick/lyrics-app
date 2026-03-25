"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavbarClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setUser({ username: data.data.username });
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
        <Link href="/search" className="hover:text-indigo-600 transition-colors">
          Search
        </Link>
        <Link href="/add" className="hover:text-indigo-600 transition-colors">
          Add Song
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-700 font-semibold">@{user.username}</span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-3 py-1.5 rounded-md border border-gray-300 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    );
  }

  // Not logged in (or still loading)
  return (
    <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
      <Link href="/search" className="hover:text-indigo-600 transition-colors">
        Search
      </Link>
      <Link href="/add" className="hover:text-indigo-600 transition-colors">
        Add Song
      </Link>
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-md border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
