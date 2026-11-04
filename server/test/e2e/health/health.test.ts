import { describe, it, expect, beforeAll } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';

describe('E2E Health - System Checks', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    await seedBaseData();
    const token = await loginAsAdmin(app);
    api.setAuth(token);
  });

  it('GET /api/health → 200 + status ok', async () => {
    const res = await api.get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET / → 200 + server online message', async () => {
    const res = await api.get('/').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
  });

  it('CORS headers presentes en respuestas', async () => {
    const res = await api.get('/api/health').set('Origin', 'http://localhost:5173').expect(200);
    expect(res.headers).toHaveProperty('access-control-allow-origin');
    expect(res.headers).toHaveProperty('access-control-allow-credentials', 'true');
  });
});