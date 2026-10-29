// PRIMERA LÍNEA
import { loadEnv, getEnv } from './config/env.js';
loadEnv();

import { createServer } from './index.ts';
import { getApiPort } from './config/constants.ts';
import { getDbPath, getUploadsPath, getLibraryPath, ensureDataDirs } from './config/paths.ts';
import fs from 'fs';

const PORT = getApiPort();
const DB_PATH = getDbPath();
const UPLOADS_PATH = getUploadsPath();

ensureDataDirs();
fs.mkdirSync(getLibraryPath(), { recursive: true });

const expressApp = await createServer({
  dbPath: DB_PATH,
  uploadsPath: UPLOADS_PATH,
  jwtSecret: getEnv('JWT_SECRET', 'store-pos-dev-secret'),
});

expressApp.listen(PORT, '127.0.0.1', () => {
  console.log(`POS API (dev) listening on http://127.0.0.1:${PORT}`);
});