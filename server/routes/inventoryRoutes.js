import { Router } from 'express';
import multer from 'multer';
import { inventoryController } from '../controllers/inventoryController.js';

export default function inventoryRoutes(uploadsPath) {
  const router = Router();
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsPath),
    filename: (_req, _file, cb) => cb(null, `${Date.now()}.jpg`),
  });
  const upload = multer({ storage });

  router.use((req, _res, next) => {
    req.uploadsPath = uploadsPath;
    next();
  });

  router.get('/products', (req, res) => inventoryController.getProducts(req, res));
  router.get('/product/:productId', (req, res) => inventoryController.getProductById(req, res));
  router.post('/product/sku', (req, res) => inventoryController.getProductBySku(req, res));
  router.post('/product', upload.single('imagename'), (req, res) =>
    inventoryController.createProduct(req, res)
  );
  router.put('/product', upload.single('imagename'), (req, res) =>
    inventoryController.updateProduct(req, res)
  );
  router.delete('/product/:productId', (req, res) => inventoryController.deleteProduct(req, res));
  router.post('/products/bulk-delete', (req, res) =>
    inventoryController.bulkDeleteProducts(req, res)
  );

  return router;
}
