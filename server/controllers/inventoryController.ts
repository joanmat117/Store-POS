import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService.js';
import type { ProductDTO, ProductInput, ProductUpdateInput, SkuInput, BulkDeleteInput } from '../types/index.js';

function getProductIdParam(req: Request): number {
  return parseInt(String(req.params.productId), 10);
}

function getProductBodyId(req: Request): number {
  return parseInt(String((req.validated as ProductUpdateInput)?.id ?? req.body.id), 10);
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
    const { skuCode } = req.validated as SkuInput;
    const product = await inventoryService.getProductBySku(skuCode);
    res.json(product);
  },
  async createProduct(req: Request, res: Response): Promise<void> {
    const productData = req.validated as ProductInput;
    const product = await inventoryService.createProduct(productData, req.file, req.uploadsPath!);
    res.json(product);
  },
  async updateProduct(req: Request, res: Response): Promise<void> {
    const productData = req.validated as ProductUpdateInput;
    await inventoryService.updateProduct(getProductBodyId(req), productData, req.file, req.uploadsPath!);
    res.sendStatus(200);
  },
  async deleteProduct(req: Request, res: Response): Promise<void> {
    await inventoryService.deleteProduct(getProductIdParam(req), req.uploadsPath!);
    res.sendStatus(200);
  },
  async bulkDeleteProducts(req: Request, res: Response): Promise<void> {
    const { ids } = req.validated as BulkDeleteInput;
    const result = await inventoryService.bulkDeleteProducts(ids, req.uploadsPath!);
    res.json(result);
  },
};