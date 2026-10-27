import { getDb, mapCustomer } from '../config/db.js';

export const customerRepo = {
  findAll() {
    return getDb().prepare('SELECT * FROM customers ORDER BY name').all().map(mapCustomer);
  },
  findById(id) {
    const row = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id);
    return mapCustomer(row);
  },
  create(customerData) {
    const result = getDb()
      .prepare(`INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`)
      .run(
        customerData.name,
        customerData.phone || '',
        customerData.email || '',
        customerData.address || ''
      );
    return this.findById(result.lastInsertRowid);
  },
  update(id, customerData) {
    getDb()
      .prepare(`UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?`)
      .run(
        customerData.name,
        customerData.phone || '',
        customerData.email || '',
        customerData.address || '',
        id
      );
    return this.findById(id);
  },
  delete(id) {
    return getDb().prepare('DELETE FROM customers WHERE id = ?').run(id);
  },
  mapCustomer,
};
