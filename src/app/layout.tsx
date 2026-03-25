import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lyrics Finder",
  description: "Search and explore song lyrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* Top Navbar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-indigo-600 tracking-tight hover:text-indigo-700 transition-colors"
            >
              🎵 Lyrics Finder
            </Link>
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
          </div>
        </nav>

        {/* Page Content */}
        <main className="max-w-5xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}

