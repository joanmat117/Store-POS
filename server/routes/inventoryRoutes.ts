import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { inventoryController } from '../controllers/inventoryController.js';
import { validateBody } from '../middleware/validation.js';
import { productSchema, productUpdateSchema, skuSchema, bulkDeleteSchema } from '../validation/index.js';

export default function inventoryRoutes(uploadsPath: string): Router {
  const router = Router();
  const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => cb(null, uploadsPath),
    filename: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => cb(null, `${Date.now()}.jpg`),
  });
  const upload = multer({ storage });

  router.use((req: Request, _res: Response, next: NextFunction) => { req.uploadsPath = uploadsPath; next(); });

  router.get('/products', (req, res) => inventoryController.getProducts(req, res));
  router.get('/product/:productId', (req, res) => inventoryController.getProductById(req, res));
  router.post('/product/sku', validateBody(skuSchema), (req, res) => inventoryController.getProductBySku(req, res));
  router.post('/product', upload.single('imagename'), validateBody(productSchema), (req, res) => inventoryController.createProduct(req, res));
  router.put('/product', upload.single('imagename'), validateBody(productUpdateSchema), (req, res) => inventoryController.updateProduct(req, res));
  router.delete('/product/:productId', (req, res) => inventoryController.deleteProduct(req, res));
  router.post('/products/bulk-delete', validateBody(bulkDeleteSchema), (req, res) => inventoryController.bulkDeleteProducts(req, res));

  return router;
}