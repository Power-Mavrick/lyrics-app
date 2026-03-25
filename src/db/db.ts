import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL_POOLED) {
  throw new Error("DATABASE_URL_POOLED environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL_POOLED);

export const db = drizzle(sql, { schema });
