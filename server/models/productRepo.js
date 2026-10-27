import { getDb, mapProduct } from '../config/db.js';

export const productRepo = {
  findAll() {
    return getDb().prepare('SELECT * FROM products ORDER BY name').all().map(mapProduct);
  },
  findById(id) {
    const row = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
    return mapProduct(row);
  },
  findBySku(skuCode) {
    const row = getDb()
      .prepare('SELECT * FROM products WHERE id = ? OR name = ?')
      .get(parseInt(skuCode, 10) || -1, String(skuCode || ''));
    return mapProduct(row);
  },
  create(productData) {
    const result = getDb()
      .prepare(
        `INSERT INTO products (name, price, category, quantity, stock, img)
                VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        productData.name,
        productData.price,
        productData.category,
        productData.quantity,
        productData.stock,
        productData.img
      );
    return this.findById(result.lastInsertRowid);
  },
  update(id, productData) {
    getDb()
      .prepare(
        `UPDATE products SET name = ?, price = ?, category = ?, quantity = ?, stock = ?, img = ? WHERE id = ?`
      )
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
  delete(id) {
    const row = getDb().prepare('SELECT img FROM products WHERE id = ?').get(id);
    getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
    return row?.img;
  },
  bulkDelete(ids) {
    const db = getDb();
    let deleted = 0;
    const getImg = db.prepare('SELECT img FROM products WHERE id = ?');
    const del = db.prepare('DELETE FROM products WHERE id = ?');
    const images = [];
    db.transaction(() => {
      for (const id of ids) {
        const row = getImg.get(id);
        const result = del.run(id);
        if (result.changes) deleted += 1;
        if (row?.img) images.push(row.img);
      }
    })();
    return { deleted, images };
  },
  decrementQuantity(id, qty) {
    return getDb()
      .prepare('UPDATE products SET quantity = MAX(0, quantity - ?) WHERE id = ? AND stock = 1')
      .run(qty, id);
  },
  mapProduct,
};
