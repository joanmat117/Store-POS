import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema/index.js';
import { getDbPath, ensureDataDirs } from '../config/paths.js';
import { logger } from '../logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: InstanceType<typeof Database> | null = null;
let _dbPath: string | null = null;
let _initialized = false;

function doInitialize(customPath?: string): ReturnType<typeof drizzle<typeof schema>> {
  ensureDataDirs();
  
  _dbPath = customPath || getDbPath();
  
  _sqlite = new Database(_dbPath);
  
  _sqlite.pragma('journal_mode = WAL');
  _sqlite.pragma('foreign_keys = ON');
  
  _db = drizzle(_sqlite, { schema });
  
  const migrationsPath = path.join(__dirname, 'migrations');
  try {
    migrate(_db, { migrationsFolder: migrationsPath });
    logger.info('Database migrations applied');
  } catch (err) {
    logger.error({ err }, 'Failed to apply database migrations');
    throw err;
  }
  
  logger.info({ dbPath: _dbPath }, 'Database initialized with better-sqlite3 + Drizzle ORM');
  _initialized = true;
  return _db;
}

export function initializeDb(customPath?: string): ReturnType<typeof drizzle<typeof schema>> {
  if (_initialized) return _db!;
  return doInitialize(customPath);
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_initialized) {
    return doInitialize();
  }
  return _db!;
}

export type DB = ReturnType<typeof drizzle<typeof schema>>;

export { schema };

export function getSqlite(): InstanceType<typeof Database> | null {
  return _sqlite;
}

export { getDbPath, getUploadsPath, getLibraryPath, ensureDataDirs } from '../config/paths.js';