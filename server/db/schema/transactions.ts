import { integer, real, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ref_number: text('ref_number').notNull().default(''),
  customer: text('customer').notNull().default('0'),
  customer_name: text('customer_name').notNull().default(''),
  status: integer('status').notNull().default(1),
  user_id: integer('user_id').notNull().default(0),
  user_name: text('user_name').notNull().default(''),
  till: integer('till').notNull().default(1),
  discount: real('discount').notNull().default(0),
  subtotal: real('subtotal').notNull().default(0),
  tax: real('tax').notNull().default(0),
  total: real('total').notNull().default(0),
  paid: real('paid').notNull().default(0),
  change: real('change').notNull().default(0),
  payment_type: integer('payment_type').notNull().default(1),
  items_json: text('items_json').notNull().default('[]'),
  date: text('date').notNull(),
}, (table) => [
  index('idx_transactions_date').on(table.date),
  index('idx_transactions_status').on(table.status),
  index('idx_transactions_user').on(table.user_id),
  index('idx_transactions_till').on(table.till),
]);

export type TransactionRow = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;