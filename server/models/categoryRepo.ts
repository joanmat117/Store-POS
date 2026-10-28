import { getDb } from '../config/db.js';
import type { CategoryRow, CategoryDTO } from '../types/index.js';
import { mapCategory } from '../config/db.js';

export const categoryRepo = {
  findAll(): CategoryDTO[] {
    return (getDb().prepare('SELECT * FROM categories ORDER BY name').all() as unknown as CategoryRow[])
      .map(mapCategory)
      .filter((c): c is CategoryDTO => c !== null);
  },
  findById(id: number): CategoryDTO | null {
    const row = getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow | undefined;
    return mapCategory(row);
  },
  create(name: string): CategoryDTO {
    const result = getDb().prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    const category = this.findById(result.lastInsertRowid);
    if (!category) throw new Error('Failed to create category');
    return category;
  },
  update(id: number, name: string): CategoryDTO | null {
    getDb().prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    return this.findById(id);
  },
  delete(id: number): { changes: number } {
    return getDb().prepare('DELETE FROM categories WHERE id = ?').run(id);
  },
  mapCategory,
};