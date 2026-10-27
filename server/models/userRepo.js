import { getDb, mapUser } from '../config/db.js';

export const userRepo = {
  findByUsername(username) {
    return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  findById(id) {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
  findAll() {
    return getDb().prepare('SELECT * FROM users').all();
  },
  create(userData) {
    const result = getDb()
      .prepare(
        `INSERT INTO users (username, password, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
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
    return this.findById(result.lastInsertRowid);
  },
  updateStatus(id, status) {
    return getDb().prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  },
  update(id, userData) {
    getDb()
      .prepare(
        `UPDATE users SET username = ?, fullname = ?, perm_products = ?, perm_categories = ?, perm_transactions = ?, perm_users = ?, perm_settings = ? WHERE id = ?`
      )
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
    return this.findById(id);
  },
  updatePassword(id, password) {
    return getDb().prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id);
  },
  delete(id) {
    return getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
  },
  mapUser,
};
