import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables, getTestDb } from '../helpers/db.js';
import { loginAsAdmin, loginAs } from '../helpers/auth.js';
import { userFactory } from '../helpers/factories.js';
import { users } from '../../../db/schema/users.js';
import { authService } from '../../../services/authService.js';

describe('E2E Auth - Permissions & Token Validation', () => {
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

  it('GET /api/users sin token → 401', async () => {
    api.clearAuth();
    await api.get('/api/users').expect(401);
  });

  it('GET /api/users con token inválido → 401', async () => {
    api.setAuth({ ...adminToken, token: 'invalid.token.here' });
    await api.get('/api/users').expect(401);
  });

  it('GET /api/users con token admin → 200', async () => {
    api.setAuth(adminToken);
    await api.get('/api/users').expect(200);
  });

  it('Usuario sin perm_users no puede listar usuarios → 403', async () => {
    // Crear usuario cajero sin perm_users
    const hashed = authService.hashPassword('cajero123');
    await db.insert(users).values({
      username: 'cajero',
      password: hashed,
      fullname: 'Cajero Test',
      perm_products: 1, perm_categories: 0, perm_transactions: 1, perm_users: 0, perm_settings: 0,
      status: 'Active',
    });

    const cajeroToken = await loginAs(app, 'cajero', 'cajero123');
    api.setAuth(cajeroToken);
    await api.get('/api/users').expect(403);
  });

  it('Usuario con perm_users puede listar usuarios → 200', async () => {
    const hashed = authService.hashPassword('manager123');
    await db.insert(users).values({
      username: 'manager',
      password: hashed,
      fullname: 'Manager Test',
      perm_products: 1, perm_categories: 1, perm_transactions: 1, perm_users: 1, perm_settings: 0,
      status: 'Active',
    });

    const managerToken = await loginAs(app, 'manager', 'manager123');
    api.setAuth(managerToken);
    await api.get('/api/users').expect(200);
  });

  it('Admin puede acceder a todos los endpoints protegidos', async () => {
    api.setAuth(adminToken);
    await api.get('/api/users').expect(200);
    await api.get('/api/inventory/products').expect(200);
    await api.get('/api/categories').expect(200);
    await api.get('/api/customers').expect(200);
    await api.get('/api/settings').expect(200);
    await api.get('/api/all').expect(200);
  });
});