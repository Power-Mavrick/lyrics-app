import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  lyrics: many(lyrics),
}));

// ─── sessions ─────────────────────────────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: varchar("session_token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ─── songs ────────────────────────────────────────────────────────────────────

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    normalizedTitle: varchar("normalized_title", { length: 255 }).notNull(),
    normalizedArtist: varchar("normalized_artist", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("songs_normalized_title_artist_unique_idx").on(
      t.normalizedTitle,
      t.normalizedArtist
    ),
    index("songs_normalized_title_artist_idx").on(
      t.normalizedTitle,
      t.normalizedArtist
    ),
  ]
);

export const songsRelations = relations(songs, ({ many }) => ({
  lyrics: many(lyrics),
  lyricExplanations: many(lyricExplanations),
}));

// ─── lyrics ───────────────────────────────────────────────────────────────────

export const lyrics = pgTable(
  "lyrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    lyricsText: text("lyrics_text"),
    sourceType: varchar("source_type", { length: 100 }).notNull(),
    sourceName: varchar("source_name", { length: 255 }),
    sourceUrl: varchar("source_url", { length: 2048 }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("lyrics_song_id_idx").on(t.songId)]
);

export const lyricsRelations = relations(lyrics, ({ one }) => ({
  song: one(songs, { fields: [lyrics.songId], references: [songs.id] }),
  createdByUser: one(users, {
    fields: [lyrics.createdByUserId],
    references: [users.id],
  }),
}));

// ─── lyric_explanations ───────────────────────────────────────────────────────

export const lyricExplanations = pgTable(
  "lyric_explanations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    stanzaHash: varchar("stanza_hash", { length: 64 }).notNull(),
    outputLanguage: varchar("output_language", { length: 50 }).notNull(),
    explanationJson: jsonb("explanation_json").notNull(),
    modelName: varchar("model_name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("lyric_explanations_unique_idx").on(
      t.songId,
      t.stanzaHash,
      t.outputLanguage,
      t.modelName
    ),
    index("lyric_explanations_song_id_idx").on(t.songId),
  ]
);

export const lyricExplanationsRelations = relations(
  lyricExplanations,
  ({ one }) => ({
    song: one(songs, {
      fields: [lyricExplanations.songId],
      references: [songs.id],
    }),
  })
);
