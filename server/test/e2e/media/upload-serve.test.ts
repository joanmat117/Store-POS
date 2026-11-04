import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import fs from 'fs';
import path from 'path';

describe('E2E Media - Upload & Serve', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;
  let uploadsPath: string;

  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  ); // 1x1px PNG válido

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    await seedBaseData();
    const token = await loginAsAdmin(app);
    api.setAuth(token);
    uploadsPath = globalThis.__TEST_UPLOADS_PATH__;
  });

  beforeEach(async () => { await truncateAllTables(); await seedBaseData(); });

  it('POST /api/media - sube imagen → 200 + archivo en disco', async () => {
    const res = await api.post('/api/media')
      .attach('file', pngBuffer, 'test.png')
      .expect(200);

    expect(res.body).toHaveProperty('filename');
    expect(res.body.filename).toMatch(/\.jpg$/); // multer renombra a .jpg
    expect(fs.existsSync(path.join(uploadsPath, res.body.filename))).toBe(true);
  });

  it('POST /api/media sin archivo → 400', async () => {
    await api.post('/api/media').expect(400);
  });

  it('GET /api/media - lista media → 200 array', async () => {
    await api.post('/api/media').attach('file', pngBuffer, 'list1.png').expect(200);
    await api.post('/api/media').attach('file', pngBuffer, 'list2.png').expect(200);

    const list = await api.expectOk('get', '/api/media');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(2);
    
    // Verificar estructura de cada item (la API devuelve _id e id, filename)
    list.forEach((m: any) => {
      expect(m).toMatchObject({ 
        id: expect.any(Number), 
        filename: expect.any(String),
      });
      expect(m).toHaveProperty('_id');
    });
  });

  it('GET /api/media/:id - sirve archivo → 200 + image/jpeg', async () => {
    const uploadRes = await api.post('/api/media').attach('file', pngBuffer, 'serve.png').expect(200);
    const mediaId = uploadRes.body.id;

    await api.get(`/api/media/${mediaId}`).expect(200).expect('Content-Type', 'image/jpeg');
  });

  it('GET /api/media/:id - 404 si no existe', async () => {
    await api.get('/api/media/999999').expect(404);
  });

  it('DELETE /api/media/:id - elimina de DB y disco', async () => {
    const uploadRes = await api.post('/api/media').attach('file', pngBuffer, 'del.png').expect(200);
    const mediaId = uploadRes.body.id;
    const filename = uploadRes.body.filename;

    await api.expectOk('delete', `/api/media/${mediaId}`);
    expect(fs.existsSync(path.join(uploadsPath, filename))).toBe(false);
  });
});