# Drizzle ORM + Neon Postgres Setup

Add a type-safe database layer using Drizzle ORM connected to a Neon Postgres database, with full schema, indexes, and an initial migration.

## User Review Required

> [!IMPORTANT]
> **`.env.local` is currently empty.** Before running migrations, you must fill in two environment variables from your Neon dashboard:
> ```
> DATABASE_URL_POOLED=postgres://...   # Used by the app at runtime
> DATABASE_URL_DIRECT=postgres://...   # Used by drizzle-kit for migrations
> ```

> [!NOTE]
> We'll use `pg` (node-postgres) for the **direct** migration connection via drizzle-kit, and `@neondatabase/serverless` for the **pooled** runtime connection (recommended by Neon for serverless/Next.js). This requires installing one extra package: `@neondatabase/serverless`.

## Proposed Changes

### DB Layer — `src/db/`

#### [NEW] [schema.ts](file:///Users/prasang/Documents/Antigravity%20Projects/Lyrixx/lyrics-app/src/db/schema.ts)
Full Drizzle schema with all 5 tables and all indexes:
- `users` — uuid pk, username (unique), password_hash, created_at
- `sessions` — uuid pk, user_id fk, session_token_hash, expires_at, created_at + indexes on `user_id`, `expires_at`
- `songs` — uuid pk, title, artist, normalized_title, normalized_artist, created_at + unique constraint + index on (normalized_title, normalized_artist)
- `lyrics` — uuid pk, song_id fk, lyrics_text (nullable text), source_type, source_name, source_url, created_by_user_id fk (nullable), created_at + index on `song_id`
- `lyric_explanations` — uuid pk, song_id fk, stanza_hash, output_language, explanation_json (jsonb), model_name, created_at + unique(song_id, stanza_hash, output_language, model_name) + index on `song_id`

#### [NEW] [db.ts](file:///Users/prasang/Documents/Antigravity%20Projects/Lyrixx/lyrics-app/src/db/db.ts)
Runtime DB client using `@neondatabase/serverless` + `DATABASE_URL_POOLED`.

---

### Config

#### [NEW] [drizzle.config.ts](file:///Users/prasang/Documents/Antigravity%20Projects/Lyrixx/lyrics-app/drizzle.config.ts)
Points drizzle-kit at `src/db/schema.ts`, outputs migrations to `drizzle/migrations/`, uses `DATABASE_URL_DIRECT` and `pg` dialect.

#### [MODIFY] [package.json](file:///Users/prasang/Documents/Antigravity%20Projects/Lyrixx/lyrics-app/package.json)
Add scripts:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push":    "drizzle-kit push",
"db:studio":  "drizzle-kit studio"
```

---

### Environment

#### [MODIFY] [.env.local](file:///Users/prasang/Documents/Antigravity%20Projects/Lyrixx/lyrics-app/.env.local)
Add placeholder vars (user must fill in real values):
```
DATABASE_URL_POOLED=
DATABASE_URL_DIRECT=
```

## Verification Plan

### Automated Tests
1. **TypeScript check** — `npx tsc --noEmit` (no errors expected)
2. **Dev server** — `npm run dev` still starts cleanly

### Migration (requires `.env.local` filled in)
```bash
# Generate SQL migration files
npm run db:generate

# Push/run migration against Neon
npm run db:migrate
```
After pushing, the Neon console should show all 5 tables with correct columns and indexes.
