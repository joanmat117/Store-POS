import { getDb, mapTransaction } from '../config/db.js';

function decrementInventory(items, db = getDb()) {
  for (const item of items || []) {
    const id = parseInt(item.id ?? item._id, 10);
    const qty = parseInt(item.quantity, 10) || 0;
    if (!id || !qty) continue;
    const product = db.prepare('SELECT id, quantity, stock FROM products WHERE id = ?').get(id);
    if (!product || product.stock === 0) continue;
    const updated = Math.max(0, (product.quantity || 0) - qty);
    db.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(updated, id);
  }
}

export const transactionRepo = {
  findAll() {
    return getDb()
      .prepare('SELECT * FROM transactions ORDER BY date DESC')
      .all()
      .map(mapTransaction);
  },
  findOnHold() {
    return getDb()
      .prepare(
        `SELECT * FROM transactions WHERE ref_number != '' AND status = 0 ORDER BY date DESC`
      )
      .all()
      .map(mapTransaction);
  },
  findCustomerOrders() {
    return getDb()
      .prepare(
        `SELECT * FROM transactions WHERE customer != '0' AND status = 0 AND (ref_number IS NULL OR ref_number = '') ORDER BY date DESC`
      )
      .all()
      .map(mapTransaction);
  },
  findByDateRange({ start, end, status = 1, userId = 0, till = 0 }) {
    let sql = `SELECT * FROM transactions WHERE date >= ? AND date <= ? AND status = ?`;
    const params = [start, end, status];
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (till) {
      sql += ' AND till = ?';
      params.push(till);
    }
    sql += ' ORDER BY date DESC';
    return getDb()
      .prepare(sql)
      .all(...params)
      .map(mapTransaction);
  },
  findById(id) {
    const row = getDb().prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return mapTransaction(row);
  },
  create(transactionData) {
    const db = getDb();
    const result = db.transaction(() => {
      const insertResult = db
        .prepare(
          `INSERT INTO transactions (ref_number, customer, customer_name, status, user_id, user_name, till, discount, subtotal, tax, total, paid, change, payment_type, items_json, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
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
          transactionData.total,
          transactionData.paid,
          transactionData.change || 0,
          transactionData.payment_type || 1,
          JSON.stringify(transactionData.items),
          transactionData.date || new Date().toISOString()
        );
      if (
        transactionData.paid >= transactionData.total &&
        (transactionData.status === 1 || transactionData.status === undefined)
      ) {
        decrementInventory(transactionData.items, db);
      }
      return insertResult.lastInsertRowid;
    })();
    return this.findById(result);
  },
  update(id, transactionData) {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    db.transaction(() => {
      db.prepare(
        `UPDATE transactions SET ref_number = ?, customer = ?, customer_name = ?, status = ?, user_id = ?, user_name = ?, till = ?, discount = ?, subtotal = ?, tax = ?, total = ?, paid = ?, change = ?, payment_type = ?, items_json = ?, date = ? WHERE id = ?`
      ).run(
        transactionData.ref_number || '',
        String(transactionData.customer ?? '0'),
        transactionData.customer_name || '',
        transactionData.status,
        transactionData.user_id || 0,
        transactionData.user_name || '',
        transactionData.till || 1,
        transactionData.discount || 0,
        transactionData.subtotal || 0,
        transactionData.tax || 0,
        transactionData.total,
        transactionData.paid,
        transactionData.change || 0,
        transactionData.payment_type || 1,
        JSON.stringify(transactionData.items),
        transactionData.date || new Date().toISOString(),
        id
      );
      if (
        existing &&
        existing.status === 0 &&
        transactionData.status === 1 &&
        transactionData.paid >= transactionData.total
      ) {
        decrementInventory(transactionData.items, db);
      }
    })();
    return this.findById(id);
  },
  delete(id) {
    return getDb().prepare('DELETE FROM transactions WHERE id = ?').run(id);
  },
  mapTransaction,
  decrementInventory,
};
