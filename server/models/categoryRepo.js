import { getDb, mapCategory } from '../config/db.js';

export const categoryRepo = {
  findAll() {
    return getDb().prepare('SELECT * FROM categories ORDER BY name').all().map(mapCategory);
  },
  findById(id) {
    const row = getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return mapCategory(row);
  },
  create(name) {
    const result = getDb().prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    return this.findById(result.lastInsertRowid);
  },
  update(id, name) {
    getDb().prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    return this.findById(id);
  },
  delete(id) {
    return getDb().prepare('DELETE FROM categories WHERE id = ?').run(id);
  },
  mapCategory,
};
