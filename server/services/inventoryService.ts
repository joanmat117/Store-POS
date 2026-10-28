import fs from 'fs';
import path from 'path';
import { productRepo } from '../models/productRepo.js';
import { logger } from '../logger.js';
import type { ProductDTO, ProductFormData } from '../types/index.js';

export const inventoryService = {
  async getAllProducts(): Promise<ProductDTO[]> {
    return productRepo.findAll();
  },
  async getProductById(id: number): Promise<ProductDTO | null> {
    return productRepo.findById(id);
  },
  async getProductBySku(skuCode: string): Promise<ProductDTO | null> {
    return productRepo.findBySku(skuCode);
  },
  async createProduct(data: ProductFormData, file: Express.Multer.File | undefined, uploadsPath: string): Promise<ProductDTO> {
    const image = file ? file.filename : (data.img || '');
    const stock = data.stock === 'on' || data.stock === 0 || data.stock === '0' ? 0 : 1;
    const quantity = data.quantity === '' || data.quantity == null ? 0 : parseInt(String(data.quantity), 10);
    return productRepo.create({
      name: data.name,
      price: parseFloat(String(data.price)) || 0,
      category: data.category || '',
      quantity,
      stock,
      img: image,
    });
  },
  async updateProduct(id: number, data: ProductFormData, file: Express.Multer.File | undefined, uploadsPath: string): Promise<ProductDTO | null> {
    let image = data.img || '';
    if (String(data.remove) === '1' && data.img) {
      const oldPath = path.join(uploadsPath, data.img);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        logger.error({ err, operation: 'deleteProductImage', path: oldPath }, 'Failed to delete product image');
      }
      if (!file) image = '';
    }
    if (file) image = file.filename;
    const stock = data.stock === 'on' || data.stock === 0 || data.stock === '0' ? 0 : 1;
    const quantity = data.quantity === '' || data.quantity == null ? 0 : parseInt(String(data.quantity), 10);
    return productRepo.update(id, {
      name: data.name,
      price: parseFloat(String(data.price)) || 0,
      category: data.category || '',
      quantity,
      stock,
      img: image,
    });
  },
  async deleteProduct(id: number, uploadsPath: string): Promise<{ ok: boolean }> {
    const img = productRepo.delete(id);
    if (img) {
      const imgPath = path.join(uploadsPath, img);
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        logger.error({ err, operation: 'deleteProductImage', path: imgPath }, 'Failed to delete product image');
      }
    }
    return { ok: true };
  },
  async bulkDeleteProducts(ids: number[], uploadsPath: string): Promise<{ ok: boolean; deleted: number }> {
    const { deleted, images } = productRepo.bulkDelete(ids);
    for (const img of images) {
      const imgPath = path.join(uploadsPath, img);
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        logger.error({ err, operation: 'bulkDeleteProductImage', path: imgPath }, 'Failed to delete product image');
      }
    }
    return { ok: true, deleted };
  },
};