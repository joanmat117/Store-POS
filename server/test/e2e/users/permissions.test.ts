import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables, getTestDb } from '../helpers/db.js';
import { loginAsAdmin, loginAs } from '../helpers/auth.js';
import { userFactory } from '../helpers/factories.js';
import { users } from '../../../db/schema/users.js';
import { authService } from '../../../services/authService.js';

describe('E2E Users - Permission Matrix', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;
  let db: ReturnType<typeof getTestDb>;
  let adminToken: Awaited<ReturnType<typeof loginAsAdmin>>;

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    db = getTestDb();
    await seedBaseData();
    adminToken = await loginAsAdmin(app);
  });

  beforeEach(async () => { await truncateAllTables(); await seedBaseData(); adminToken = await loginAsAdmin(app); });

  const createUserWithPerms = async (username: string, perms: Record<string, number>) => {
    const hashed = authService.hashPassword('test123');
    await db.insert(users).values({
      username,
      password: hashed,
      fullname: username,
      perm_products: perms.perm_products ?? 0,
      perm_categories: perms.perm_categories ?? 0,
      perm_transactions: perms.perm_transactions ?? 0,
      perm_users: perms.perm_users ?? 0,
      perm_settings: perms.perm_settings ?? 0,
      status: 'Active',
    });
    return loginAs(app, username, 'test123');
  };

  it('perm_products=1 permite acceso a /api/inventory/products', async () => {
    const token = await createUserWithPerms('invuser', { perm_products: 1 });
    api.setAuth(token);
    await api.get('/api/inventory/products').expect(200);
  });

  it('perm_products=0 deniega acceso a /api/inventory/products → 403', async () => {
    const token = await createUserWithPerms('noinv', { perm_products: 0 });
    api.setAuth(token);
    await api.get('/api/inventory/products').expect(403);
  });

  it('perm_categories=1 permite acceso a /api/categories', async () => {
    const token = await createUserWithPerms('catuser', { perm_categories: 1 });
    api.setAuth(token);
    await api.get('/api/categories').expect(200);
  });

  it('perm_transactions=1 permite acceso a /api/all', async () => {
    const token = await createUserWithPerms('txnuser', { perm_transactions: 1 });
    api.setAuth(token);
    await api.get('/api/all').expect(200);
  });

  it('perm_users=1 permite acceso a /api/users', async () => {
    const token = await createUserWithPerms('usruser', { perm_users: 1 });
    api.setAuth(token);
    await api.get('/api/users').expect(200);
  });

  it('perm_settings=1 permite acceso a /api/settings', async () => {
    const token = await createUserWithPerms('setuser', { perm_settings: 1 });
    api.setAuth(token);
    await api.get('/api/settings').expect(200);
  });

  it('Admin (id=1) bypassa todos los permisos', async () => {
    api.setAuth(adminToken);
    await api.get('/api/inventory/products').expect(200);
    await api.get('/api/categories').expect(200);
    await api.get('/api/all').expect(200);
    await api.get('/api/users').expect(200);
    await api.get('/api/settings').expect(200);
  });
});