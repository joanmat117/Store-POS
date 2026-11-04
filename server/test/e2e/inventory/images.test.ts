import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory } from '../helpers/factories.js';
import fs from 'fs';
import path from 'path';

describe('E2E Inventory - Images', () => {
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

  it('POST /api/inventory/product con imagen - sube archivo y guarda filename', async () => {
    const res = await api.post('/api/inventory/product')
      .field('name', 'Con Imagen')
      .field('price', '5.00')
      .field('category', 'General')
      .field('quantity', '10')
      .field('stock', '1')
      .attach('imagename', pngBuffer, 'test.png')
      .expect(200);

    expect(res.body).toHaveProperty('img');
    expect(res.body.img).toMatch(/\.jpg$/); // multer renombra a .jpg
    expect(fs.existsSync(path.join(uploadsPath, res.body.img))).toBe(true);
  });

  it('PUT /api/inventory/product con nueva imagen - reemplaza y borra anterior', async () => {
    // Crear con imagen inicial
    const createRes = await api.post('/api/inventory/product')
      .field('name', 'Img Replace')
      .field('price', '5')
      .field('category', 'General')
      .field('quantity', '10')
      .field('stock', '1')
      .attach('imagename', pngBuffer, 'original.png')
      .expect(200);

    const oldImg = createRes.body.img;
    expect(fs.existsSync(path.join(uploadsPath, oldImg))).toBe(true);

    // Actualizar con nueva imagen (id en body)
    const updateRes = await api.put(`/api/inventory/product`)
      .field('id', String(createRes.body.id))
      .field('name', 'Img Replace')
      .field('price', '5')
      .field('category', 'General')
      .field('quantity', '10')
      .field('stock', '1')
      .field('remove', '1')
      .attach('imagename', pngBuffer, 'nueva.png')
      .expect(200);

    expect(updateRes.body.img).not.toBe(oldImg);
    expect(fs.existsSync(path.join(uploadsPath, oldImg))).toBe(false);
    expect(fs.existsSync(path.join(uploadsPath, updateRes.body.img))).toBe(true);
  });

  it('PUT /api/inventory/product con remove=1 sin nueva imagen - borra imagen', async () => {
    const createRes = await api.post('/api/inventory/product')
      .field('name', 'Img Remove')
      .field('price', '5')
      .field('category', 'General')
      .field('quantity', '10')
      .field('stock', '1')
      .attach('imagename', pngBuffer, 'toremove.png')
      .expect(200);

    const oldImg = createRes.body.img;
    expect(fs.existsSync(path.join(uploadsPath, oldImg))).toBe(true);

    await api.put(`/api/inventory/product`)
      .field('id', String(createRes.body.id))
      .field('name', 'Img Remove')
      .field('price', '5')
      .field('category', 'General')
      .field('quantity', '10')
      .field('stock', '1')
      .field('remove', '1')
      .expect(200);

    expect(fs.existsSync(path.join(uploadsPath, oldImg))).toBe(false);
  });
});