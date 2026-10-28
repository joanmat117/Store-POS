import { getDb } from '../config/db.js';
import type { ProductRow, ProductDTO } from '../types/index.js';
import { mapProduct } from '../config/db.js';

export const productRepo = {
  findAll(): ProductDTO[] {
    return (getDb().prepare('SELECT * FROM products ORDER BY name').all() as unknown as ProductRow[])
      .map(mapProduct)
      .filter((p): p is ProductDTO => p !== null);
  },
  findById(id: number): ProductDTO | null {
    const row = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined;
    return mapProduct(row);
  },
  findBySku(skuCode: string): ProductDTO | null {
    const row = getDb()
      .prepare('SELECT * FROM products WHERE id = ? OR name = ?')
      .get(parseInt(skuCode, 10) || -1, String(skuCode || '')) as ProductRow | undefined;
    return mapProduct(row);
  },
  create(productData: {
    name: string;
    price: number;
    category: string;
    quantity: number;
    stock: number;
    img: string;
  }): ProductDTO {
    const result = getDb()
      .prepare(`INSERT INTO products (name, price, category, quantity, stock, img)
                VALUES (?, ?, ?, ?, ?, ?)`)
      .run(
        productData.name,
        productData.price,
        productData.category,
        productData.quantity,
        productData.stock,
        productData.img
      );
    const product = this.findById(result.lastInsertRowid);
    if (!product) throw new Error('Failed to create product');
    return product;
  },
  update(id: number, productData: {
    name: string;
    price: number;
    category: string;
    quantity: number;
    stock: number;
    img: string;
  }): ProductDTO | null {
    getDb()
      .prepare(`UPDATE products SET name = ?, price = ?, category = ?, quantity = ?, stock = ?, img = ? WHERE id = ?`)
      .run(
        productData.name,
        productData.price,
        productData.category,
        productData.quantity,
        productData.stock,
        productData.img,
        id
      );
    return this.findById(id);
  },
  delete(id: number): string | undefined {
    const row = getDb().prepare('SELECT img FROM products WHERE id = ?').get(id) as { img: string } | undefined;
    getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
    return row?.img;
  },
  bulkDelete(ids: number[]): { deleted: number; images: string[] } {
    const db = getDb();
    let deleted = 0;
    const images: string[] = [];
    const getImg = db.prepare('SELECT img FROM products WHERE id = ?');
    const del = db.prepare('DELETE FROM products WHERE id = ?');
    db.transaction(() => {
      for (const id of ids) {
        const row = getImg.get(id) as { img: string } | undefined;
        const result = del.run(id);
        if (result.changes) deleted += 1;
        if (row?.img) images.push(row.img);
      }
    })();
    return { deleted, images };
  },
  decrementQuantity(id: number, qty: number): { changes: number } {
    return getDb().prepare('UPDATE products SET quantity = MAX(0, quantity - ?) WHERE id = ? AND stock = 1').run(qty, id);
  },
  mapProduct,
};