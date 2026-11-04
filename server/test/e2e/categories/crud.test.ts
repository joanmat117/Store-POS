import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { faker } from '@faker-js/faker';

describe('E2E Categories - CRUD', () => {
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

  it('GET /api/categories - lista categorías → 200 array con seed', async () => {
    const cats = await api.expectOk('get', '/api/categories');
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThanOrEqual(1); // seed tiene 'General'
    
    // Verificar seed "General" existe
    const general = cats.find((c: any) => c.name === 'General');
    expect(general).toBeDefined();
    expect(general).toMatchObject({ id: expect.any(Number), name: 'General' });
    
    // Verificar estructura de cada item
    cats.forEach((c: any) => {
      expect(c).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    });
  });

  it('POST /api/categories - crea categoría → 201', async () => {
    const name = faker.commerce.department();
    const created = await api.expectCreated('/api/categories', { name });
    expect(created).toMatchObject({ name });
    expect(created.id).toBeDefined();
  });

  it('POST /api/categories - nombre duplicado → 400', async () => {
    const name = 'Duplicate Cat';
    await api.expectCreated('/api/categories', { name });
    await api.post('/api/categories').send({ name }).expect(400);
  });

  it('POST /api/categories - body inválido (nombre vacío) → 400', async () => {
    await api.post('/api/categories').send({ name: '' }).expect(400);
    await api.post('/api/categories').send({}).expect(400);
  });

  it('GET /api/categories/:id - obtiene categoría → 200', async () => {
    const created = await api.expectCreated('/api/categories', { name: 'Get Test' });
    const fetched = await api.expectOk('get', `/api/categories/${created.id}`);
    expect(fetched).toMatchObject({ id: created.id, name: 'Get Test' });
  });

  it('GET /api/categories/:id - 404 si no existe', async () => {
    await api.expectNotFound('/api/categories/999999');
  });

  it('PUT /api/categories/:id - actualiza nombre → 200', async () => {
    const created = await api.expectCreated('/api/categories', { name: 'Old Name' });
    const updated = await api.expectOk('put', `/api/categories/${created.id}`, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });

  it('DELETE /api/categories/:id - elimina categoría → 200', async () => {
    const created = await api.expectCreated('/api/categories', { name: 'To Delete' });
    await api.expectOk('delete', `/api/categories/${created.id}`);
    await api.expectNotFound(`/api/categories/${created.id}`);
  });
});