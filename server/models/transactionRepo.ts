import { getDb } from '../config/db.js';
import type { TransactionRow, TransactionDTO, TransactionFormData, CartItemDTO } from '../types/index.js';
import { mapTransaction } from '../config/db.js';

function decrementInventory(items: CartItemDTO[], dbInstance = getDb() as ReturnType<typeof getDb>): void {
  for (const item of items || []) {
    const id = parseInt(String(item.id), 10);
    const qty = parseInt(String(item.quantity), 10) || 0;
    if (!id || !qty) continue;
    const product = dbInstance.prepare('SELECT id, quantity, stock FROM products WHERE id = ?').get(id) as { id: number; quantity: number; stock: number } | undefined;
    if (!product || product.stock === 0) continue;
    const updated = Math.max(0, (product.quantity || 0) - qty);
    dbInstance.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(updated, id);
  }
}

export const transactionRepo = {
  findAll(): TransactionDTO[] {
    return (getDb().prepare('SELECT * FROM transactions ORDER BY date DESC').all() as unknown as TransactionRow[])
      .map(mapTransaction)
      .filter((t): t is TransactionDTO => t !== null);
  },
  findOnHold(): TransactionDTO[] {
    return (getDb()
      .prepare(`SELECT * FROM transactions WHERE ref_number != '' AND status = 0 ORDER BY date DESC`)
      .all() as unknown as TransactionRow[])
      .map(mapTransaction)
      .filter((t): t is TransactionDTO => t !== null);
  },
  findCustomerOrders(): TransactionDTO[] {
    return (getDb()
      .prepare(`SELECT * FROM transactions WHERE customer != '0' AND status = 0 AND (ref_number IS NULL OR ref_number = '') ORDER BY date DESC`)
      .all() as unknown as TransactionRow[])
      .map(mapTransaction)
      .filter((t): t is TransactionDTO => t !== null);
  },
  findByDateRange(filters: { start: string; end: string; status: number; userId: number; till: number }): TransactionDTO[] {
    let sql = `SELECT * FROM transactions WHERE date >= ? AND date <= ? AND status = ?`;
    const params: unknown[] = [filters.start, filters.end, filters.status];
    if (filters.userId) { sql += ' AND user_id = ?'; params.push(filters.userId); }
    if (filters.till) { sql += ' AND till = ?'; params.push(filters.till); }
    sql += ' ORDER BY date DESC';
    return (getDb().prepare(sql).all(...params) as unknown as TransactionRow[])
      .map(mapTransaction)
      .filter((t): t is TransactionDTO => t !== null);
  },
  findById(id: number): TransactionDTO | null {
    const row = getDb().prepare('SELECT * FROM transactions WHERE id = ?').get(id) as TransactionRow | undefined;
    return mapTransaction(row);
  },
  create(transactionData: TransactionFormData): TransactionDTO {
    const dbInstance = getDb();
    const result = dbInstance.transaction(() => {
      const insertResult = dbInstance.prepare(
        `INSERT INTO transactions (ref_number, customer, customer_name, status, user_id, user_name, till, discount, subtotal, tax, total, paid, change, payment_type, items_json, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        transactionData.ref_number || '',
        String(transactionData.customer ?? '0'),
        transactionData.customer_name || '',
        transactionData.status ?? 1,
        transactionData.user_id || 0,
        transactionData.user_name || '',
        transactionData.till || 1,
        transactionData.discount || 0,
        transactionData.subtotal || 0,
        transactionData.tax || 0,
        transactionData.total ?? 0,
        transactionData.paid ?? 0,
        transactionData.change || 0,
        transactionData.payment_type || 1,
        JSON.stringify(transactionData.items),
        transactionData.date || new Date().toISOString()
      );
      if ((transactionData.paid ?? 0) >= (transactionData.total ?? 0) && (transactionData.status === 1 || transactionData.status === undefined)) {
        decrementInventory(transactionData.items || [], dbInstance);
      }
      return insertResult.lastInsertRowid;
    })();
    const transaction = this.findById(result);
    if (!transaction) throw new Error('Failed to create transaction');
    return transaction;
  },
  update(id: number, transactionData: TransactionFormData): TransactionDTO | null {
    const dbInstance = getDb();
    const existing = dbInstance.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as TransactionRow | undefined;
    dbInstance.transaction(() => {
      dbInstance.prepare(
        `UPDATE transactions SET ref_number = ?, customer = ?, customer_name = ?, status = ?, user_id = ?, user_name = ?, till = ?, discount = ?, subtotal = ?, tax = ?, total = ?, paid = ?, change = ?, payment_type = ?, items_json = ?, date = ? WHERE id = ?`
      ).run(
        transactionData.ref_number || '',
        String(transactionData.customer ?? '0'),
        transactionData.customer_name || '',
        transactionData.status ?? 1,
        transactionData.user_id || 0,
        transactionData.user_name || '',
        transactionData.till || 1,
        transactionData.discount || 0,
        transactionData.subtotal || 0,
        transactionData.tax || 0,
        transactionData.total ?? 0,
        transactionData.paid ?? 0,
        transactionData.change || 0,
        transactionData.payment_type || 1,
        JSON.stringify(transactionData.items),
        transactionData.date || new Date().toISOString(),
        id
      );
      if (existing && existing.status === 0 && transactionData.status === 1 && (transactionData.paid ?? 0) >= (transactionData.total ?? 0)) {
        decrementInventory(transactionData.items || [], dbInstance);
      }
    })();
    return this.findById(id);
  },
  delete(id: number): { changes: number } {
    return getDb().prepare('DELETE FROM transactions WHERE id = ?').run(id);
  },
  mapTransaction,
  decrementInventory,
};