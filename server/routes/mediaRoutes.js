import { Router } from 'express';
import multer from 'multer';
import { mediaController } from '../controllers/mediaController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function mediaRoutes(uploadsPath) {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_products')); // media uses perm_products in original

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsPath),
    filename: (_req, _file, cb) => cb(null, `${Date.now()}.jpg`),
  });
  const upload = multer({ storage });

  router.use((req, _res, next) => {
    req.uploadsPath = uploadsPath;
    next();
  });

  router.get('/', (req, res) => mediaController.getMedia(req, res));
  router.get('/:mediaId', (req, res) => mediaController.getMediaById(req, res));
  router.post('/', upload.single('file'), (req, res) => mediaController.uploadMedia(req, res));
  router.delete('/:mediaId', (req, res) => mediaController.deleteMedia(req, res));

  return router;
}
