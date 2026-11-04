import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory, customerFactory, transactionFactory } from '../helpers/factories.js';

describe('E2E Transactions - Reports', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    await seedBaseData();
    const token = await loginAsAdmin(app);
    api.setAuth(token);
  });

  beforeEach(async () => { await truncateAllTables(); await seedBaseData(); });

  it('GET /api/by-date con filtro de fecha → lista ventas en rango', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 10, quantity: 100 }));
    const customer = await api.expectCreated('/api/customers', customerFactory({ name: 'Report Customer' }));

    // Usar fecha fija para evitar flakiness
    const fixedDate = '2025-06-15T10:00:00.000Z';
    const startDate = '2025-06-15';
    const endDate = '2025-06-16';
    await api.expectCreated('/api/new', transactionFactory({
      customer: String(customer.id),
      customer_name: customer.name,
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
      payment_type: 1,
      paid: 10,
      date: fixedDate,
    }));

    const report = await api.expectOk('get', `/api/by-date?start=${startDate}&end=${endDate}`);
    expect(Array.isArray(report)).toBe(true);
    expect(report.length).toBeGreaterThanOrEqual(1);
  });
});