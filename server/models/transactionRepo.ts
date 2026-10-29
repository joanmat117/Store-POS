import { getDb, getSqlite } from '../db/index.js';
import { transactions, products } from '../db/schema/index.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type { TransactionRow, TransactionDTO, TransactionFormData, CartItemDTO } from '../types/index.js';

function mapTransaction(row: TransactionRow | undefined): TransactionDTO | null {
  if (!row) return null;
  let items: CartItemDTO[] = [];
  try {
    items = JSON.parse(row.items_json || '[]');
  } catch {
    items = [];
  }
  return {
    _id: row.id,
    id: row.id,
    ref_number: row.ref_number,
    customer: row.customer,
    customer_name: row.customer_name,
    status: row.status,
    user_id: row.user_id,
    user: row.user_name,
    till: row.till,
    discount: row.discount,
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    paid: row.paid,
    change: row.change,
    payment_type: row.payment_type,
    items,
    date: row.date,
  };
}

// Synchronous inventory decrement for use inside better-sqlite3 transaction
function decrementInventorySync(items: CartItemDTO[]): void {
  const db = getDb();
  for (const item of items || []) {
    const id = parseInt(String(item.id), 10);
    const qty = parseInt(String(item.quantity), 10) || 0;
    if (!id || !qty) continue;
    const product = db
      .select({ id: products.id, quantity: products.quantity, stock: products.stock })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .get();
    if (!product || product.stock === 0) continue;
    const updated = Math.max(0, (product.quantity || 0) - qty);
    db
      .update(products)
      .set({ quantity: updated })
      .where(eq(products.id, id))
      .run();
  }
}

// Run a function inside a better-sqlite3 synchronous transaction
function runInTransaction<T>(fn: () => T): T {
  const sqlite = getSqlite();
  if (!sqlite) throw new Error('Database not initialized');
  return sqlite.transaction(fn)();
}

export const transactionRepo = {
  async findAll(): Promise<TransactionDTO[]> {
    const rows = await getDb().select().from(transactions).orderBy(desc(transactions.date));
    return rows.map(mapTransaction).filter((t): t is TransactionDTO => t !== null);
  },
  async findOnHold(): Promise<TransactionDTO[]> {
    const rows = await getDb()
      .select()
      .from(transactions)
      .where(and(eq(transactions.status, 0), sql`${transactions.ref_number} != ''`))
      .orderBy(desc(transactions.date));
    return rows.map(mapTransaction).filter((t): t is TransactionDTO => t !== null);
  },
  async findCustomerOrders(): Promise<TransactionDTO[]> {
    const rows = await getDb()
      .select()
      .from(transactions)
      .where(and(eq(transactions.status, 0), sql`${transactions.customer} != '0'`, sql`${transactions.ref_number} IS NULL OR ${transactions.ref_number} = ''`))
      .orderBy(desc(transactions.date));
    return rows.map(mapTransaction).filter((t): t is TransactionDTO => t !== null);
  },
  async findByDateRange(filters: { start: string; end: string; status: number; userId: number; till: number }): Promise<TransactionDTO[]> {
    const conditions = [
      gte(transactions.date, filters.start),
      lte(transactions.date, filters.end),
      eq(transactions.status, filters.status),
    ];
    if (filters.userId) conditions.push(eq(transactions.user_id, filters.userId));
    if (filters.till) conditions.push(eq(transactions.till, filters.till));
    const rows = await getDb()
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));
    return rows.map(mapTransaction).filter((t): t is TransactionDTO => t !== null);
  },
  async findById(id: number): Promise<TransactionDTO | null> {
    const result = await getDb().select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return mapTransaction(result[0]);
  },
  async create(transactionData: TransactionFormData): Promise<TransactionDTO> {
    let insertedId: number;
    
    runInTransaction(() => {
      const insertResult = getDb()
        .insert(transactions)
        .values({
          ref_number: transactionData.ref_number || '',
          customer: String(transactionData.customer ?? '0'),
          customer_name: transactionData.customer_name || '',
          status: transactionData.status ?? 1,
          user_id: transactionData.user_id || 0,
          user_name: transactionData.user_name || '',
          till: transactionData.till || 1,
          discount: transactionData.discount || 0,
          subtotal: transactionData.subtotal || 0,
          tax: transactionData.tax || 0,
          total: transactionData.total ?? 0,
          paid: transactionData.paid ?? 0,
          change: transactionData.change || 0,
          payment_type: transactionData.payment_type || 1,
          items_json: JSON.stringify(transactionData.items),
          date: transactionData.date || new Date().toISOString(),
        })
        .returning({ id: transactions.id })
        .get();
      
      insertedId = insertResult!.id;
      
      // Decrement inventory inside the same transaction if paid
      if ((transactionData.paid ?? 0) >= (transactionData.total ?? 0) && (transactionData.status === 1 || transactionData.status === undefined)) {
        decrementInventorySync(transactionData.items || []);
      }
    });
    
    const transaction = await this.findById(insertedId!);
    if (!transaction) throw new Error('Failed to create transaction');
    return transaction;
  },
  async update(id: number, transactionData: TransactionFormData): Promise<TransactionDTO | null> {
    const existing = await getDb().select().from(transactions).where(eq(transactions.id, id)).limit(1);
    
    runInTransaction(() => {
      getDb()
        .update(transactions)
        .set({
          ref_number: transactionData.ref_number || '',
          customer: String(transactionData.customer ?? '0'),
          customer_name: transactionData.customer_name || '',
          status: transactionData.status ?? 1,
          user_id: transactionData.user_id || 0,
          user_name: transactionData.user_name || '',
          till: transactionData.till || 1,
          discount: transactionData.discount || 0,
          subtotal: transactionData.subtotal || 0,
          tax: transactionData.tax || 0,
          total: transactionData.total ?? 0,
          paid: transactionData.paid ?? 0,
          change: transactionData.change || 0,
          payment_type: transactionData.payment_type || 1,
          items_json: JSON.stringify(transactionData.items),
          date: transactionData.date || new Date().toISOString(),
        })
        .where(eq(transactions.id, id))
        .run();
      
      // Decrement inventory inside the same transaction if completing a hold
      if (existing[0] && existing[0].status === 0 && transactionData.status === 1 && (transactionData.paid ?? 0) >= (transactionData.total ?? 0)) {
        decrementInventorySync(transactionData.items || []);
      }
    });
    
    return this.findById(id);
  },
  async delete(id: number): Promise<{ changes: number }> {
    const result = await getDb().delete(transactions).where(eq(transactions.id, id));
    return { changes: result.changes ?? 0 };
  },
  mapTransaction,
  decrementInventory: decrementInventorySync,
};