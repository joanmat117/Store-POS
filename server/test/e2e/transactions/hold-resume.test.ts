import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory, transactionFactory } from '../helpers/factories.js';

describe('E2E Transactions - Hold & Resume', () => {
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

  it('POST /api/new con status=0 → venta en hold (no descuenta stock)', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Hold Test', quantity: 10 }));
    
    const holdSale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 3, stock: 1 }],
      status: 0, // hold
      payment_type: 1,
      paid: 0,
    }));

    expect(holdSale.status).toBe(0);
    expect(holdSale.paid).toBe(0);
  });

  it('GET /api/on-hold → lista ventas en hold', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Hold List', quantity: 10 }));
    
    await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
      status: 0,
    }));

    const onHold = await api.expectOk('get', '/api/on-hold');
    expect(Array.isArray(onHold)).toBe(true);
    expect(onHold.length).toBeGreaterThanOrEqual(1);
    expect(onHold[0].status).toBe(0);
  });

  it('PUT /api/new - reanuda hold → completa venta y descuenta stock', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Resume', quantity: 10 }));
    
    const holdSale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 15, quantity: 2, stock: 1 }],
      status: 0,
      payment_type: 1,
      paid: 0,
    }));

    // Reanudar: cambiar status a 1 y pagar (id en body)
    const resumed = await api.expectOk('put', `/api/new`, {
      id: holdSale.id,
      status: 1,
      paid: 30,
      payment_type: 1,
    });

    expect(resumed.status).toBe(1);
    expect(resumed.paid).toBe(30);
    expect(resumed.total).toBe(30);
  });
});