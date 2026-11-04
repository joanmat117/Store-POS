import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { customerFactory } from '../helpers/factories.js';

describe('E2E Customers - CRUD', () => {
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

  it('GET /api/customers - lista clientes → 200 array', async () => {
    const customers = await api.expectOk('get', '/api/customers');
    expect(Array.isArray(customers)).toBe(true);
  });

  it('POST /api/customers - crea cliente → 201', async () => {
    const cust = customerFactory({ name: 'Juan Pérez', email: 'juan@test.com' });
    const created = await api.expectCreated('/api/customers', cust);
    expect(created).toMatchObject({ name: 'Juan Pérez', email: 'juan@test.com' });
    expect(created.id).toBeDefined();
  });

  it('POST /api/customers - body inválido (nombre vacío) → 400', async () => {
    await api.post('/api/customers').send({ name: '' }).expect(400);
    await api.post('/api/customers').send({}).expect(400);
  });

  it('GET /api/customers/:id - obtiene cliente → 200', async () => {
    const created = await api.expectCreated('/api/customers', customerFactory({ name: 'Get Test' }));
    const fetched = await api.expectOk('get', `/api/customers/${created.id}`);
    expect(fetched).toMatchObject({ id: created.id, name: 'Get Test' });
  });

  it('GET /api/customers/:id - 404 si no existe', async () => {
    await api.expectNotFound('/api/customers/999999');
  });

  it('PUT /api/customers/:id - actualiza datos → 200', async () => {
    const created = await api.expectCreated('/api/customers', customerFactory({ name: 'Old Name' }));
    const updated = await api.expectOk('put', `/api/customers/${created.id}`, { name: 'New Name', phone: '555-0000' });
    expect(updated.name).toBe('New Name');
    expect(updated.phone).toBe('555-0000');
  });

  it('DELETE /api/customers/:id - elimina cliente → 200', async () => {
    const created = await api.expectCreated('/api/customers', customerFactory({ name: 'To Delete' }));
    await api.expectOk('delete', `/api/customers/${created.id}`);
    await api.expectNotFound(`/api/customers/${created.id}`);
  });
});