import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';

describe('E2E Auth - Login', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    await seedBaseData();
  });

  beforeEach(async () => { await truncateAllTables(); await seedBaseData(); });

  it('POST /api/auth/login - credenciales válidas → 200 + token + user', async () => {
    const res = await api.post('/api/auth/login').send({ username: 'admin', password: 'admin' }).expect(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).not.toHaveProperty('refreshToken'); // no hay refresh token en la implementación actual
    expect(res.body.user).toMatchObject({ username: 'admin', id: 1 });
  });

  it('POST /api/auth/login - contraseña incorrecta → 401', async () => {
    await api.post('/api/auth/login').send({ username: 'admin', password: 'wrong' }).expect(401);
  });

  it('POST /api/auth/login - usuario inexistente → 401 (no 404 por seguridad)', async () => {
    await api.post('/api/auth/login').send({ username: 'noexiste', password: 'x' }).expect(401);
  });

  it('POST /api/auth/login - body inválido (faltan campos) → 400', async () => {
    await api.post('/api/auth/login').send({ username: 'admin' }).expect(400);
    await api.post('/api/auth/login').send({}).expect(400);
  });
});