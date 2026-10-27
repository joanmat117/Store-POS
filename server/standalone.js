import { createServer } from './index.js';
import fs from 'fs';
import path from 'path';

const PORT = 8001;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'pos.sqlite');
const UPLOADS_PATH = path.join(DATA_DIR, 'uploads');
const JWT_SECRET = 'store-pos-dev-secret';

fs.mkdirSync(path.join(UPLOADS_PATH, 'library'), { recursive: true });

const expressApp = await createServer({
  dbPath: DB_PATH,
  uploadsPath: UPLOADS_PATH,
  jwtSecret: JWT_SECRET,
});

expressApp.listen(PORT, '127.0.0.1', () => {
  console.log(`POS API listening on http://127.0.0.1:${PORT}`);
});