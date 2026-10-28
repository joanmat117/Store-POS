import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService.js';
import type { ProductDTO } from '../types/index.js';

function getProductIdParam(req: Request): number {
  return parseInt(String(req.params.productId), 10);
}

function getProductBodyId(req: Request): number {
  return parseInt(String(req.body.id), 10);
}

function getBulkIds(req: Request): number[] {
  return (req.body?.ids || [])
    .map((id: unknown) => parseInt(String(id), 10))
    .filter((id: number) => Number.isFinite(id) && id > 0);
}

export const inventoryController = {
  async getProducts(req: Request, res: Response): Promise<void> {
    const products = await inventoryService.getAllProducts();
    res.json(products);
  },
  async getProductById(req: Request, res: Response): Promise<void> {
    const product = await inventoryService.getProductById(getProductIdParam(req));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  },
  async getProductBySku(req: Request, res: Response): Promise<void> {
    const product = await inventoryService.getProductBySku(req.body?.skuCode);
    res.json(product);
  },
  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await inventoryService.createProduct(req.body, req.file, req.uploadsPath!);
    res.json(product);
  },
  async updateProduct(req: Request, res: Response): Promise<void> {
    await inventoryService.updateProduct(getProductBodyId(req), req.body, req.file, req.uploadsPath!);
    res.sendStatus(200);
  },
  async deleteProduct(req: Request, res: Response): Promise<void> {
    await inventoryService.deleteProduct(getProductIdParam(req), req.uploadsPath!);
    res.sendStatus(200);
  },
  async bulkDeleteProducts(req: Request, res: Response): Promise<void> {
    const ids = getBulkIds(req);
    if (!ids.length) {
      res.status(400).json({ error: 'No product ids provided' });
      return;
    }
    const result = await inventoryService.bulkDeleteProducts(ids, req.uploadsPath!);
    res.json(result);
  },
};