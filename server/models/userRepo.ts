import { getDb } from '../config/db.js';
import type { UserRow, UserDTO, CreateUserData, UpdateUserData } from '../types/index.js';
import { mapUser } from '../config/db.js';

export const userRepo = {
  findByUsername(username: string): UserRow | undefined {
    return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;
  },
  findById(id: number): UserRow | undefined {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  },
  findAll(): UserRow[] {
    return getDb().prepare('SELECT * FROM users').all() as unknown as UserRow[];
  },
  create(userData: CreateUserData): UserDTO {
    const result = getDb()
      .prepare(`INSERT INTO users (username, password, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        userData.username,
        userData.password,
        userData.fullname || '',
        userData.perm_products || 0,
        userData.perm_categories || 0,
        userData.perm_transactions || 0,
        userData.perm_users || 0,
        userData.perm_settings || 0,
        userData.status || ''
      );
    const user = this.findById(result.lastInsertRowid);
    if (!user) throw new Error('Failed to create user');
    return mapUser(user)!;
  },
  update(id: number, userData: UpdateUserData): UserDTO | null {
    getDb()
      .prepare(`UPDATE users SET username = ?, fullname = ?, perm_products = ?, perm_categories = ?, perm_transactions = ?, perm_users = ?, perm_settings = ? WHERE id = ?`)
      .run(
        userData.username,
        userData.fullname || '',
        userData.perm_products || 0,
        userData.perm_categories || 0,
        userData.perm_transactions || 0,
        userData.perm_users || 0,
        userData.perm_settings || 0,
        id
      );
    const user = this.findById(id);
    return user ? mapUser(user) : null;
  },
  updatePassword(id: number, password: string): { changes: number } {
    return getDb().prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id);
  },
  updateStatus(id: number, status: string): { changes: number } {
    return getDb().prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  },
  delete(id: number): { changes: number } {
    return getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
  },
  mapUser,
};