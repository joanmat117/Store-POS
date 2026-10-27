import { inventoryService } from '../services/inventoryService.js';

export const inventoryController = {
  async getProducts(req, res) {
    const products = await inventoryService.getAllProducts();
    res.json(products);
  },
  async getProductById(req, res) {
    const product = await inventoryService.getProductById(parseInt(req.params.productId, 10));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  },
  async getProductBySku(req, res) {
    const product = await inventoryService.getProductBySku(req.body?.skuCode);
    res.json(product);
  },
  async createProduct(req, res) {
    const product = await inventoryService.createProduct(req.body, req.file, req.uploadsPath);
    res.json(product);
  },
  async updateProduct(req, res) {
    const product = await inventoryService.updateProduct(
      parseInt(req.body.id, 10),
      req.body,
      req.file,
      req.uploadsPath
    );
    res.sendStatus(200);
  },
  async deleteProduct(req, res) {
    await inventoryService.deleteProduct(parseInt(req.params.productId, 10), req.uploadsPath);
    res.sendStatus(200);
  },
  async bulkDeleteProducts(req, res) {
    const ids = (req.body?.ids || [])
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (!ids.length) return res.status(400).json({ error: 'No product ids provided' });
    const result = await inventoryService.bulkDeleteProducts(ids, req.uploadsPath);
    res.json(result);
  },
};
