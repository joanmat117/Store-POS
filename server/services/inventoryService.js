import fs from 'fs';
import path from 'path';
import { productRepo } from '../models/productRepo.js';
import { logger } from '../logger.js';

export const inventoryService = {
  async getAllProducts() {
    return productRepo.findAll();
  },
  async getProductById(id) {
    return productRepo.findById(id);
  },
  async getProductBySku(skuCode) {
    return productRepo.findBySku(skuCode);
  },
  async createProduct(data, file, uploadsPath) {
    const image = file ? file.filename : data.img || '';
    const stock = data.stock === 'on' || data.stock === 0 || data.stock === '0' ? 0 : 1;
    const quantity =
      data.quantity === '' || data.quantity == null ? 0 : parseInt(data.quantity, 10);
    return productRepo.create({
      name: data.name,
      price: parseFloat(data.price) || 0,
      category: data.category || '',
      quantity,
      stock,
      img: image,
    });
  },
  async updateProduct(id, data, file, uploadsPath) {
    let image = data.img || '';
    if (String(data.remove) === '1' && data.img) {
      const oldPath = path.join(uploadsPath, data.img);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        logger.error(
          { err, operation: 'deleteProductImage', path: oldPath },
          'Failed to delete product image'
        );
      }
      if (!file) image = '';
    }
    if (file) image = file.filename;
    const stock = data.stock === 'on' || data.stock === 0 || data.stock === '0' ? 0 : 1;
    const quantity =
      data.quantity === '' || data.quantity == null ? 0 : parseInt(data.quantity, 10);
    return productRepo.update(id, {
      name: data.name,
      price: parseFloat(data.price) || 0,
      category: data.category || '',
      quantity,
      stock,
      img: image,
    });
  },
  async deleteProduct(id, uploadsPath) {
    const img = productRepo.delete(id);
    if (img) {
      const imgPath = path.join(uploadsPath, img);
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        logger.error(
          { err, operation: 'deleteProductImage', path: imgPath },
          'Failed to delete product image'
        );
      }
    }
    return { ok: true };
  },
  async bulkDeleteProducts(ids, uploadsPath) {
    const { deleted, images } = productRepo.bulkDelete(ids);
    for (const img of images) {
      const imgPath = path.join(uploadsPath, img);
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        logger.error(
          { err, operation: 'bulkDeleteProductImage', path: imgPath },
          'Failed to delete product image'
        );
      }
    }
    return { ok: true, deleted };
  },
};
