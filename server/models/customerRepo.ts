import { getDb } from '../config/db.js';
import type { CustomerRow, CustomerDTO, CustomerFormData } from '../types/index.js';
import { mapCustomer } from '../config/db.js';

export const customerRepo = {
  findAll(): CustomerDTO[] {
    return (getDb().prepare('SELECT * FROM customers ORDER BY name').all() as unknown as CustomerRow[])
      .map(mapCustomer)
      .filter((c): c is CustomerDTO => c !== null);
  },
  findById(id: number): CustomerDTO | null {
    const row = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id) as CustomerRow | undefined;
    return mapCustomer(row);
  },
  create(customerData: CustomerFormData): CustomerDTO {
    const result = getDb()
      .prepare(`INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`)
      .run(customerData.name, customerData.phone || '', customerData.email || '', customerData.address || '');
    const customer = this.findById(result.lastInsertRowid);
    if (!customer) throw new Error('Failed to create customer');
    return customer;
  },
  update(id: number, customerData: CustomerFormData): CustomerDTO | null {
    getDb()
      .prepare(`UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?`)
      .run(customerData.name, customerData.phone || '', customerData.email || '', customerData.address || '', id);
    return this.findById(id);
  },
  delete(id: number): { changes: number } {
    return getDb().prepare('DELETE FROM customers WHERE id = ?').run(id);
  },
  mapCustomer,
};