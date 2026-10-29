import { getDb } from '../db/index.js';
import { categories } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { CategoryRow, CategoryDTO } from '../types/index.js';

function mapCategory(row: CategoryRow | undefined): CategoryDTO | null {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
  };
}

export const categoryRepo = {
  async findAll(): Promise<CategoryDTO[]> {
    const rows = await getDb().select().from(categories).orderBy(categories.name);
    return rows.map(mapCategory).filter((c): c is CategoryDTO => c !== null);
  },
  async findById(id: number): Promise<CategoryDTO | null> {
    const result = await getDb().select().from(categories).where(eq(categories.id, id)).limit(1);
    return mapCategory(result[0]);
  },
  async create(name: string): Promise<CategoryDTO> {
    const result = await getDb().insert(categories).values({ name }).returning({ id: categories.id });
    const category = await this.findById(result[0].id);
    if (!category) throw new Error('Failed to create category');
    return category;
  },
  async update(id: number, name: string): Promise<CategoryDTO | null> {
    await getDb().update(categories).set({ name }).where(eq(categories.id, id));
    return this.findById(id);
  },
  async delete(id: number): Promise<{ changes: number }> {
    const result = await getDb().delete(categories).where(eq(categories.id, id));
    return { changes: result.changes ?? 0 };
  },
  mapCategory,
};