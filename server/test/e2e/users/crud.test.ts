import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { userFactory } from '../helpers/factories.js';

describe('E2E Users - CRUD', () => {
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

  it('GET /api/users - lista usuarios → 200 array', async () => {
    const users = await api.expectOk('get', '/api/users');
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/users - crea usuario con permisos → 201', async () => {
    const newUser = userFactory({ username: 'cajero1', perm_products: 1, perm_transactions: 1 });
    const created = await api.expectCreated('/api/users', newUser);
    expect(created).toMatchObject({ username: 'cajero1', perm_products: 1, perm_transactions: 1 });
    expect(created).not.toHaveProperty('password');
  });

  it('POST /api/users - username duplicado → 400', async () => {
    const u = userFactory({ username: 'dup' });
    await api.expectCreated('/api/users', u);
    await api.post('/api/users').send(u).expect(400);
  });

  it('POST /api/users - body inválido (faltan campos requeridos) → 400', async () => {
    await api.post('/api/users').send({ username: 'nopass' }).expect(400);
    await api.post('/api/users').send({ password: 'nouser' }).expect(400);
    await api.post('/api/users').send({}).expect(400);
  });

  it('PUT /api/users/:id - actualiza permisos → 200', async () => {
    const created = await api.expectCreated('/api/users', userFactory({ username: 'upd' }));
    const updated = await api.expectOk('put', `/api/users/${created.id}`, { perm_settings: 1 });
    expect(updated.perm_settings).toBe(1);
  });

  it('PUT /api/users/:id - actualiza password → 200', async () => {
    const created = await api.expectCreated('/api/users', userFactory({ username: 'pwdchg', password: 'oldpass' }));
    const updated = await api.expectOk('put', `/api/users/${created.id}`, { password: 'newpass123' });
    expect(updated.id).toBe(created.id);
  });

  it('DELETE /api/users/:id - elimina usuario → 200', async () => {
    const created = await api.expectCreated('/api/users', userFactory({ username: 'del' }));
    await api.expectOk('delete', `/api/users/${created.id}`);
    await api.expectNotFound(`/api/users/${created.id}`);
  });

  it('GET /api/users/:id - 404 si no existe', async () => {
    await api.expectNotFound('/api/users/999999');
  });

  it('POST /api/users/:id/logout - actualiza status a Logged Out', async () => {
    const created = await api.expectCreated('/api/users', userFactory({ username: 'logoutuser' }));
    const res = await api.post(`/api/users/${created.id}/logout`).expect(200);
    // El endpoint devuelve 200 con body vacío (res.sendStatus(200))
    expect(res.body).toEqual({});
  });
});