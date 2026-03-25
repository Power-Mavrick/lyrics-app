/**
 * Normalize a string for song/artist matching:
 * lowercase → trim → collapse internal whitespace
 */
export function normalizeText(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}
