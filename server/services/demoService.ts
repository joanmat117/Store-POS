import { getDb } from '../db/index.js';
import { products, categories, customers, transactions } from '../db/schema/index.js';
import { eq, like } from 'drizzle-orm';
import { productRepo } from '../models/productRepo.js';
import { categoryRepo } from '../models/categoryRepo.js';
import { customerRepo } from '../models/customerRepo.js';
import { transactionRepo } from '../models/transactionRepo.js';
import type { TransactionFormData, CartItemDTO } from '../types/index.js';

export const demoService = {
  async seedDemoData(): Promise<{ ok: boolean; message: string }> {
    // Clear existing demo data (keep admin user and settings)
    await getDb().delete(products).where(like(products.name, 'Demo %'));
    await getDb().delete(categories).where(like(categories.name, 'Demo %'));
    await getDb().delete(customers).where(like(customers.name, 'Demo %'));
    await getDb().delete(transactions).where(like(transactions.customer_name, 'Demo %'));

    // Create demo categories
    const cat1 = await categoryRepo.create('Demo Beverages');
    const cat2 = await categoryRepo.create('Demo Snacks');
    const cat3 = await categoryRepo.create('Demo Electronics');

    // Create demo products
    const demoProducts = [
      { name: 'Demo Cola', price: 1.50, category: cat1.name, quantity: 100, stock: 1, img: '' },
      { name: 'Demo Water', price: 1.00, category: cat1.name, quantity: 200, stock: 1, img: '' },
      { name: 'Demo Chips', price: 2.00, category: cat2.name, quantity: 50, stock: 1, img: '' },
      { name: 'Demo Chocolate', price: 1.75, category: cat2.name, quantity: 75, stock: 1, img: '' },
      { name: 'Demo Headphones', price: 49.99, category: cat3.name, quantity: 10, stock: 1, img: '' },
      { name: 'Demo Cable', price: 9.99, category: cat3.name, quantity: 30, stock: 1, img: '' },
    ];
    for (const p of demoProducts) await productRepo.create(p);

    // Create demo customers
    const demoCustomers = [
      { name: 'Demo Customer 1', phone: '555-0101', email: 'demo1@example.com', address: '123 Demo St' },
      { name: 'Demo Customer 2', phone: '555-0102', email: 'demo2@example.com', address: '456 Demo Ave' },
    ];
    for (const c of demoCustomers) await customerRepo.create(c);

    // Create demo transactions
    const demoTransactions: TransactionFormData[] = [
      {
        ref_number: 'DEMO-001',
        customer: '1',
        customer_name: 'Demo Customer 1',
        status: 1,
        user_id: 1,
        user_name: 'Administrator',
        till: 1,
        discount: 0,
        subtotal: 3.50,
        tax: 0.35,
        total: 3.85,
        paid: 5.00,
        change: 1.15,
        payment_type: 1,
        items: [
          { id: 1, name: 'Demo Cola', price: 1.50, quantity: 1, stock: 1 },
          { id: 2, name: 'Demo Water', price: 1.00, quantity: 1, stock: 1 },
          { id: 3, name: 'Demo Chips', price: 2.00, quantity: 1, stock: 1 },
        ] as CartItemDTO[],
        date: new Date().toISOString(),
      },
    ];
    for (const t of demoTransactions) await transactionRepo.create(t);

    return { ok: true, message: 'Demo data seeded successfully' };
  },
};