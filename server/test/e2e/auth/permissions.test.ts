import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables, getTestDb } from '../helpers/db.js';
import { loginAsAdmin, loginAs } from '../helpers/auth.js';
import { userFactory } from '../helpers/factories.js';
import { users } from '../../../db/schema/users.js';
import { authService } from '../../../services/authService.js';
import { Permissions, UserStatus } from '../helpers/constants.js';
import jwt from 'jsonwebtoken';

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
      status: UserStatus.ACTIVE,
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
      status: UserStatus.ACTIVE,
    });

    const managerToken = await loginAs(app, 'manager', 'manager123');
    api.setAuth(managerToken);
    await api.get('/api/users').expect(200);
  });

  // S7: Edge case - Usuario Inactive → login permitido (validación faltante en servidor)
  it('Usuario con status=Inactive → login permitido (validación faltante en servidor)', async () => {
    const hashed = authService.hashPassword('test123');
    await db.insert(users).values({
      username: 'inactive',
      password: hashed,
      fullname: 'Inactive User',
      perm_products: 1, perm_categories: 1, perm_transactions: 1, perm_users: 1, perm_settings: 1,
      status: UserStatus.INACTIVE,
    });

    // NOTA: El servidor no valida status en login, permite login (bug conocido)
    const res = await api.post('/api/auth/login').send({ username: 'inactive', password: 'test123' }).expect(200);
    expect(res.body.token).toBeDefined();
  });

  // S7: Edge case - Token JWT expirado → 401
  it('Token JWT expirado → 401', async () => {
    // Crear token manual con exp en el pasado
    const expiredToken = jwt.sign(
      { userId: 1, username: 'admin', permissions: [] },
      'test-jwt-secret-e2e-only',
      { expiresIn: '-1h' }  // expirado hace 1 hora
    );

    api.setAuth({ token: expiredToken, user: { id: 1, username: 'admin', role: 'admin', permissions: [] } });
    await api.get('/api/users').expect(401);
  });
});