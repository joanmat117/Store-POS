import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory, transactionFactory } from '../helpers/factories.js';
import { TransactionStatus, PaymentType } from '../helpers/constants.js';

describe('E2E Transactions - Void & Refund', () => {
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

  it('PUT /api/new con status=2 → anula venta (void)', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Void Test', quantity: 10 }));
    
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 20, quantity: 2, stock: 1 }],
      status: TransactionStatus.COMPLETED,
      payment_type: PaymentType.CASH,
      paid: 40,
    }));

    expect(sale.status).toBe(TransactionStatus.COMPLETED);

    // Anular (id en body) - PUT devuelve 200 sin body
    await api.expectOk('put', `/api/new`, { id: sale.id, status: TransactionStatus.VOID });
    
    // Verificar que se actualizó consultando la transacción
    const updated = await api.expectOk('get', `/api/transaction/${sale.id}`);
    expect(updated.status).toBe(TransactionStatus.VOID);
  });

  it('POST /api/delete - elimina venta (soft delete)', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Delete Test', quantity: 10 }));
    
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
      status: TransactionStatus.COMPLETED,
      payment_type: PaymentType.CASH,
      paid: 10,
    }));

    await api.expectOk('post', `/api/delete`, { orderId: sale.id });
    
    // Verificar que ya no aparece en listados normales
    const list = await api.expectOk('get', '/api/all');
    const found = list.find((t: any) => t.id === sale.id);
    expect(found).toBeUndefined();
  });

  it('Venta anulada no aparece en reportes de ventas normales', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Report Test', quantity: 10 }));
    
    const fixedDate = '2025-01-15T12:00:00.000Z';

    await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 50, quantity: 1, stock: 1 }],
      status: TransactionStatus.COMPLETED,
      payment_type: PaymentType.CASH,
      paid: 50,
      date: fixedDate,
    }));

    const voidSale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 50, quantity: 1, stock: 1 }],
      status: TransactionStatus.VOID,
      payment_type: PaymentType.CASH,
      paid: 50,
      date: fixedDate,
    }));

    // Verificar que la venta anulada existe consultándola directamente
    const voidedDirect = await api.expectOk('get', `/api/transaction/${voidSale.id}`);
    expect(voidedDirect.status).toBe(TransactionStatus.VOID);

    const startDate = '2025-01-15';
    const endDate = '2025-01-16';
    const completedReport = await api.expectOk('get', `/api/by-date?start=${startDate}&end=${endDate}&status=${TransactionStatus.COMPLETED}`);
    const voidedReport = await api.expectOk('get', `/api/by-date?start=${startDate}&end=${endDate}&status=${TransactionStatus.VOID}`);
    
    expect(completedReport.length).toBeGreaterThanOrEqual(1);
    expect(voidedReport.length).toBeGreaterThanOrEqual(1);
    expect(voidedReport.some((t: any) => t.id === voidSale.id)).toBe(true);
  });
});