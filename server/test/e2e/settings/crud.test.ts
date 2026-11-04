import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';

describe('E2E Settings - CRUD', () => {
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

  it('GET /api/settings - obtiene configuración singleton → 200', async () => {
    const settings = await api.expectOk('get', '/api/settings');
    expect(settings).toHaveProperty('_id', 1);
    expect(settings).toHaveProperty('settings');
    expect(settings.settings).toHaveProperty('store'); // seed: 'Test Store'
    expect(settings.settings).toHaveProperty('percentage'); // seed: 10
    expect(settings.settings).toHaveProperty('symbol'); // seed: '$'
  });

  it('PUT /api/settings - actualiza configuración → 200', async () => {
    // El endpoint usa multer con field 'imagename', enviar como multipart
    const res = await api.put('/api/settings')
      .field('store', 'Mi Tienda Test')
      .field('address_one', 'Calle Test 123')
      .field('contact', '555-1234')
      .field('percentage', '15')
      .field('symbol', 'EUR')
      .field('footer', 'Gracias por su compra')
      .expect(200);
    
    expect(res.body.settings.store).toBe('Mi Tienda Test');
    expect(res.body.settings.percentage).toBe(15);
    expect(res.body.settings.symbol).toBe('EUR');
  });

  it('PUT /api/settings - actualización parcial → 200', async () => {
    const res = await api.put('/api/settings')
      .field('percentage', '21')
      .expect(200);
    expect(res.body.settings.percentage).toBe(21);
  });

  it('PUT /api/settings - body inválido (percentage negativo) → 400', async () => {
    await api.put('/api/settings')
      .field('percentage', '-5')
      .expect(400);
  });
});