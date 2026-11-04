import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory } from '../helpers/factories.js';

describe('E2E Inventory - CRUD', () => {
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

  it('GET /api/inventory/products - lista productos → 200 array', async () => {
    const res = await api.expectOk('get', '/api/inventory/products');
    expect(Array.isArray(res)).toBe(true);
    
    // Verificar estructura de cada item
    res.forEach((p: any) => {
      expect(p).toMatchObject({ 
        id: expect.any(Number), 
        name: expect.any(String),
        price: expect.any(Number),
        quantity: expect.any(Number),
        category: expect.any(String),
        stock: expect.any(Number),
        img: expect.any(String),
      });
    });
  });

  it('POST /api/inventory/product - crea producto → 200', async () => {
    const p = productFactory({ name: 'Café', price: 2.50, category: 'Bebidas', quantity: 50 });
    const created = await api.expectCreated('/api/inventory/product', p);
    expect(created).toMatchObject({ name: 'Café', price: 2.5, quantity: 50, category: 'Bebidas' });
    expect(created.id).toBeDefined();
  });

  it('POST /api/inventory/product - body inválido (precio negativo) → 400', async () => {
    await api.post('/api/inventory/product').send(productFactory({ price: -1 })).expect(400);
    await api.post('/api/inventory/product').send(productFactory({ quantity: -5 })).expect(400);
    await api.post('/api/inventory/product').send({}).expect(400);
  });

  it('GET /api/inventory/product/:productId - obtiene producto → 200', async () => {
    const created = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Get Test' }));
    const fetched = await api.expectOk('get', `/api/inventory/product/${created.id}`);
    expect(fetched).toMatchObject({ id: created.id, name: 'Get Test' });
  });

  it('GET /api/inventory/product/:productId - 404 si no existe', async () => {
    await api.expectNotFound('/api/inventory/product/999999');
  });

  it('PUT /api/inventory/product - actualiza precio y stock → 200', async () => {
    const created = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Upd', price: 10, quantity: 100, category: 'Test' }));
    // PUT devuelve 200 sin body
    await api.expectOk('put', `/api/inventory/product`, { id: created.id, name: 'Upd', price: 12.50, quantity: 75, category: 'Test' });
    
    // Verificar que se actualizó consultando el producto
    const updated = await api.expectOk('get', `/api/inventory/product/${created.id}`);
    expect(updated.price).toBe(12.5);
    expect(updated.quantity).toBe(75);
  });

  it('DELETE /api/inventory/product/:productId - elimina producto → 200', async () => {
    const created = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Del' }));
    await api.expectOk('delete', `/api/inventory/product/${created.id}`);
    await api.expectNotFound(`/api/inventory/product/${created.id}`);
  });
});