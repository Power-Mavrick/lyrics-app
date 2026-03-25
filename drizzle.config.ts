import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    // DATABASE_URL_DIRECT must be set when running db:migrate or db:push
    url: process.env.DATABASE_URL_DIRECT ?? "",
  },
});

