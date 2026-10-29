import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const mediaLibrary = sqliteTable('media_library', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull().unique(),
  source: text('source').notNull().default('upload'),
  pexels_id: integer('pexels_id'),
  photographer: text('photographer').notNull().default(''),
  alt: text('alt').notNull().default(''),
  created_at: text('created_at').notNull(),
});

export type MediaRow = typeof mediaLibrary.$inferSelect;
export type MediaInsert = typeof mediaLibrary.$inferInsert;