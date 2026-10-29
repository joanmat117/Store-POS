// PRIMERA LÍNEA
import { loadEnv, validateProductionEnv, getEnv } from './config/env.js';
loadEnv();
validateProductionEnv();

import { createServer } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getApiPort } from './config/constants.js';
import { getDbPath, getUploadsPath, getLibraryPath, ensureDataDirs } from './config/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

expressApp.listen(PORT, '0.0.0.0', () => {
  console.log(`POS API listening on http://0.0.0.0:${PORT}`);
});