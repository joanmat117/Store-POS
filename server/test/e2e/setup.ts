import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { initializeDb, getSqlite } from '../../db/index.js';
import { _resetCache } from '../../config/paths.js';
import { resetAppCache } from './helpers/app.js';
import { clearAuthCache } from './helpers/auth.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Import assertions to extend vitest globally
import './helpers/assertions.js';

let testDbPath: string;
let testUploadsPath: string;

beforeAll(async () => {
  // Directorio temporal único por proceso
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pos-e2e-'));
  testDbPath = path.join(tmpDir, 'pos.sqlite');
  testUploadsPath = path.join(tmpDir, 'uploads');
  fs.mkdirSync(testUploadsPath, { recursive: true });
  fs.mkdirSync(path.join(testUploadsPath, 'library'), { recursive: true });

  // Setear globals ANTES de que los tests los lean
  globalThis.__TEST_DB_PATH__ = testDbPath;
  globalThis.__TEST_UPLOADS_PATH__ = testUploadsPath;

  // Setear env vars para que paths.ts use nuestro directorio
  process.env.POS_DATA_DIR = tmpDir;
  _resetCache(); // limpiar cache de paths.ts

  // Inicializar DB real con migraciones
  initializeDb(testDbPath);
}, 60_000);

afterAll(async () => {
  const sqlite = getSqlite();
  sqlite?.close();
  delete process.env.POS_DATA_DIR;
  _resetCache();
});

afterEach(() => {
  vi.clearAllMocks();
  resetAppCache();
  clearAuthCache();
});

// Helper global para tests
declare global {
  var __TEST_DB_PATH__: string;
  var __TEST_UPLOADS_PATH__: string;
}