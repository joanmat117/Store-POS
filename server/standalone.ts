import { createServer } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { API_PORT, DEFAULT_JWT_SECRET } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = API_PORT;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'pos.sqlite');
const UPLOADS_PATH = path.join(DATA_DIR, 'uploads');
const JWT_SECRET = DEFAULT_JWT_SECRET;

fs.mkdirSync(path.join(UPLOADS_PATH, 'library'), { recursive: true });

const expressApp = await createServer({
  dbPath: DB_PATH,
  uploadsPath: UPLOADS_PATH,
  jwtSecret: JWT_SECRET,
});

expressApp.listen(PORT, '127.0.0.1', () => {
  console.log(`POS API listening on http://127.0.0.1:${PORT}`);
});