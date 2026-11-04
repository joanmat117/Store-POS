import { getDb, getSqlite, schema } from '../../../db/index.js';
import { eq } from 'drizzle-orm';

export function getTestDb() {
  return getDb();
}

export function getTestSqlite() {
  return getSqlite();
}

/** Trunca todas las tablas manteniendo el schema (para aislamiento entre tests) */
export async function truncateAllTables() {
  const sqlite = getTestSqlite();
  if (!sqlite) return;

  // Usar SQL directo para evitar problemas con Drizzle delete()
  // Orden: tablas con FKs primero
  const tables = [
    'transactions',
    'customers',
    'products',
    'categories',
    'media_library',
    'users',
    'settings',
  ];

  for (const table of tables) {
    try {
      sqlite.exec(`DELETE FROM ${table};`);
    } catch { /* ignore */ }
  }
  // Reset autoincrement
  for (const table of tables) {
    try {
      sqlite.exec(`DELETE FROM sqlite_sequence WHERE name = '${table}';`);
    } catch { /* ignore */ }
  }
}

/** Seed mínimo para tests que necesitan datos base (idempotent) */
export async function seedBaseData() {
  const db = getTestDb();
  const { authService } = await import('../../../services/authService.js');
  
  // Admin user - upsert para ser idempotente
  const hashed = authService.hashPassword('admin');
  const existingAdmin = await db.select().from(schema.users).where(eq(schema.users.username, 'admin')).get();
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      username: 'admin',
      password: hashed,
      fullname: 'Administrator',
      perm_products: 1, perm_categories: 1, perm_transactions: 1, perm_users: 1, perm_settings: 1,
      status: 'Active',
    });
  }

  // Settings singleton - upsert
  const existingSettings = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).get();
  if (!existingSettings) {
    await db.insert(schema.settings).values({
      id: 1,
      app: 'Test POS',
      store: 'Test Store',
      symbol: '$',
      percentage: 10,
      charge_tax: 1,
      till: 1,
    });
  }

  // Categoría base - upsert
  const existingCat = await db.select().from(schema.categories).where(eq(schema.categories.name, 'General')).get();
  if (!existingCat) {
    await db.insert(schema.categories).values({ name: 'General' });
  }
}