import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";

const BCRYPT_COST = 12;

/** Hash a plain-text password with bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/** Verify a plain-text password against a stored bcrypt hash. */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Generate a cryptographically-random 32-byte hex token (goes into the cookie). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** SHA-256 hash of a raw token (stored in the DB as session_token_hash). */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
