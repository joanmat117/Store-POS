import { createServer } from '../../../index.js';
import { getTestSqlite } from './db.js';
import type { Express } from 'express';

let cachedApp: Express | null = null;

export async function createTestApp(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const sqlite = getTestSqlite();
  if (!sqlite) throw new Error('DB no inicializada - llamar setup.ts antes');

  const dbPath = globalThis.__TEST_DB_PATH__;
  const uploadsPath = globalThis.__TEST_UPLOADS_PATH__;
  const jwtSecret = 'test-jwt-secret-e2e-only';

  const app = await createServer({ dbPath, uploadsPath, jwtSecret });
  cachedApp = app;
  return app;
}

export function resetAppCache() { cachedApp = null; }