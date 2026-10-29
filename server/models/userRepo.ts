import { getDb } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { UserRow, UserDTO, CreateUserData, UpdateUserData } from '../types/index.js';
import bcrypt from 'bcryptjs';

function mapUser(row: UserRow | undefined): UserDTO | null {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    username: row.username,
    fullname: row.fullname,
    perm_products: row.perm_products,
    perm_categories: row.perm_categories,
    perm_transactions: row.perm_transactions,
    perm_users: row.perm_users,
    perm_settings: row.perm_settings,
    status: row.status,
  };
}

export const userRepo = {
  async findByUsername(username: string): Promise<UserRow | undefined> {
    const result = await getDb().select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  },
  async findById(id: number): Promise<UserRow | undefined> {
    const result = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },
  async findAll(): Promise<UserRow[]> {
    return getDb().select().from(users);
  },
  async create(userData: CreateUserData): Promise<UserDTO> {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const result = await getDb()
      .insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        fullname: userData.fullname || '',
        perm_products: userData.perm_products || 0,
        perm_categories: userData.perm_categories || 0,
        perm_transactions: userData.perm_transactions || 0,
        perm_users: userData.perm_users || 0,
        perm_settings: userData.perm_settings || 0,
        status: userData.status || '',
      })
      .returning({ id: users.id });
    const user = await this.findById(result[0].id);
    if (!user) throw new Error('Failed to create user');
    return mapUser(user)!;
  },
  async update(id: number, userData: UpdateUserData): Promise<UserDTO | null> {
    await getDb()
      .update(users)
      .set({
        username: userData.username,
        fullname: userData.fullname || '',
        perm_products: userData.perm_products || 0,
        perm_categories: userData.perm_categories || 0,
        perm_transactions: userData.perm_transactions || 0,
        perm_users: userData.perm_users || 0,
        perm_settings: userData.perm_settings || 0,
      })
      .where(eq(users.id, id));
    const user = await this.findById(id);
    return user ? mapUser(user) : null;
  },
  async updatePassword(id: number, password: string): Promise<{ changes: number }> {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await getDb()
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
    return { changes: result.changes ?? 0 };
  },
  async updateStatus(id: number, status: string): Promise<{ changes: number }> {
    const result = await getDb()
      .update(users)
      .set({ status })
      .where(eq(users.id, id));
    return { changes: result.changes ?? 0 };
  },
  async delete(id: number): Promise<{ changes: number }> {
    const result = await getDb().delete(users).where(eq(users.id, id));
    return { changes: result.changes ?? 0 };
  },
  mapUser,
};