import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory } from '../helpers/factories.js';

describe('E2E Inventory - Bulk Operations', () => {
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

  it('POST /api/inventory/products/bulk-delete - elimina múltiples productos → 200', async () => {
    const p1 = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Bulk 1' }));
    const p2 = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Bulk 2' }));
    const p3 = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Bulk 3' }));

    const res = await api.post('/api/inventory/products/bulk-delete').send({ ids: [p1.id, p2.id] }).expect(200);
    expect(res.body).toMatchObject({ ok: true, deleted: 2 });

    await api.expectNotFound(`/api/inventory/product/${p1.id}`);
    await api.expectNotFound(`/api/inventory/product/${p2.id}`);
    await api.expectOk('get', `/api/inventory/product/${p3.id}`); // p3 sigue existiendo
  });

  it('POST /api/inventory/products/bulk-delete - array vacío → 400 validation error', async () => {
    await api.post('/api/inventory/products/bulk-delete').send({ ids: [] }).expect(400);
  });

  it('POST /api/inventory/products/bulk-delete - IDs inexistentes → 200 deleted: 0', async () => {
    const res = await api.post('/api/inventory/products/bulk-delete').send({ ids: [999, 888] }).expect(200);
    expect(res.body).toMatchObject({ ok: true, deleted: 0 });
  });
});