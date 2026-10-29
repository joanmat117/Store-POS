import { getDb } from '../db/index.js';
import { customers } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { CustomerRow, CustomerDTO, CustomerFormData } from '../types/index.js';

function mapCustomer(row: CustomerRow | undefined): CustomerDTO | null {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
  };
}

export const customerRepo = {
  async findAll(): Promise<CustomerDTO[]> {
    const rows = await getDb().select().from(customers).orderBy(customers.name);
    return rows.map(mapCustomer).filter((c): c is CustomerDTO => c !== null);
  },
  async findById(id: number): Promise<CustomerDTO | null> {
    const result = await getDb().select().from(customers).where(eq(customers.id, id)).limit(1);
    return mapCustomer(result[0]);
  },
  async create(customerData: CustomerFormData): Promise<CustomerDTO> {
    const result = await getDb()
      .insert(customers)
      .values({
        name: customerData.name,
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || '',
      })
      .returning({ id: customers.id });
    const customer = await this.findById(result[0].id);
    if (!customer) throw new Error('Failed to create customer');
    return customer;
  },
  async update(id: number, customerData: CustomerFormData): Promise<CustomerDTO | null> {
    await getDb()
      .update(customers)
      .set({
        name: customerData.name,
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || '',
      })
      .where(eq(customers.id, id));
    return this.findById(id);
  },
  async delete(id: number): Promise<{ changes: number }> {
    const result = await getDb().delete(customers).where(eq(customers.id, id));
    return { changes: result.changes ?? 0 };
  },
  mapCustomer,
};