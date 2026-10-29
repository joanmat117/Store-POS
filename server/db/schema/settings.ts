import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: false }), // singleton, id=1
  app: text('app').notNull().default('Standalone Point of Sale'),
  store: text('store').notNull().default(''),
  address_one: text('address_one').notNull().default(''),
  address_two: text('address_two').notNull().default(''),
  contact: text('contact').notNull().default(''),
  tax: text('tax').notNull().default(''),
  symbol: text('symbol').notNull().default('$'),
  percentage: real('percentage').notNull().default(0),
  charge_tax: integer('charge_tax').notNull().default(0),
  footer: text('footer').notNull().default(''),
  img: text('img').notNull().default(''),
  till: integer('till').notNull().default(1),
  server_ip: text('server_ip').notNull().default(''),
  pexels_api_key: text('pexels_api_key').notNull().default(''),
});

export type SettingsRow = typeof settings.$inferSelect;
export type SettingsInsert = typeof settings.$inferInsert;