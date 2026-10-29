import { getDb } from '../db/index.js';
import { products } from '../db/schema/index.js';
import { eq, or, sql } from 'drizzle-orm';
import type { ProductRow, ProductDTO } from '../types/index.js';

function mapProduct(row: ProductRow | undefined): ProductDTO | null {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    quantity: row.quantity,
    stock: row.stock,
    img: row.img,
  };
}

export const productRepo = {
  async findAll(): Promise<ProductDTO[]> {
    const rows = await getDb().select().from(products).orderBy(products.name);
    return rows.map(mapProduct).filter((p): p is ProductDTO => p !== null);
  },
  async findById(id: number): Promise<ProductDTO | null> {
    const result = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
    return mapProduct(result[0]);
  },
  async findBySku(skuCode: string): Promise<ProductDTO | null> {
    const id = parseInt(skuCode, 10) || -1;
    const result = await getDb()
      .select()
      .from(products)
      .where(or(eq(products.id, id), eq(products.name, String(skuCode || ''))))
      .limit(1);
    return mapProduct(result[0]);
  },
  async create(productData: {
    name: string;
    price: number;
    category: string;
    quantity: number;
    stock: number;
    img: string;
  }): Promise<ProductDTO> {
    const result = await getDb()
      .insert(products)
      .values({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        quantity: productData.quantity,
        stock: productData.stock,
        img: productData.img,
      })
      .returning({ id: products.id });
    const product = await this.findById(result[0].id);
    if (!product) throw new Error('Failed to create product');
    return product;
  },
  async update(id: number, productData: {
    name: string;
    price: number;
    category: string;
    quantity: number;
    stock: number;
    img: string;
  }): Promise<ProductDTO | null> {
    await getDb()
      .update(products)
      .set({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        quantity: productData.quantity,
        stock: productData.stock,
        img: productData.img,
      })
      .where(eq(products.id, id));
    return this.findById(id);
  },
  async delete(id: number): Promise<string | undefined> {
    const row = await getDb().select({ img: products.img }).from(products).where(eq(products.id, id)).limit(1);
    await getDb().delete(products).where(eq(products.id, id));
    return row[0]?.img;
  },
  async bulkDelete(ids: number[]): Promise<{ deleted: number; images: string[] }> {
    let deleted = 0;
    const images: string[] = [];

    for (const id of ids) {
      const row = await getDb().select({ img: products.img }).from(products).where(eq(products.id, id)).limit(1);
      const result = await getDb().delete(products).where(eq(products.id, id));
      if (result.changes) deleted += 1;
      if (row[0]?.img) images.push(row[0].img);
    }
    return { deleted, images };
  },
  async decrementQuantity(id: number, qty: number): Promise<{ changes: number }> {
    const result = await getDb()
      .update(products)
      .set({ quantity: sql`MAX(0, ${products.quantity} - ${qty})` })
      .where(eq(products.id, id));
    return { changes: result.changes ?? 0 };
  },
  mapProduct,
};