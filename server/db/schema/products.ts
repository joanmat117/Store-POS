import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull().default(0),
  category: text('category').notNull().default(''),
  quantity: integer('quantity').notNull().default(0),
  stock: integer('stock').notNull().default(1),
  img: text('img').notNull().default(''),
});

export type ProductRow = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;