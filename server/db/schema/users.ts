import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullname: text('fullname').notNull().default(''),
  perm_products: integer('perm_products').notNull().default(0),
  perm_categories: integer('perm_categories').notNull().default(0),
  perm_transactions: integer('perm_transactions').notNull().default(0),
  perm_users: integer('perm_users').notNull().default(0),
  perm_settings: integer('perm_settings').notNull().default(0),
  status: text('status').notNull().default(''),
});

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;