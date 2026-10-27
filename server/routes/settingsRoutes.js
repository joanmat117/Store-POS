import { Router } from 'express';
import multer from 'multer';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function settingsRoutes(uploadsPath) {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_settings'));

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsPath),
    filename: (_req, _file, cb) => cb(null, `${Date.now()}.jpg`),
  });
  const upload = multer({ storage });

  router.use((req, _res, next) => {
    req.uploadsPath = uploadsPath;
    next();
  });

  router.get('/', (req, res) => settingsController.getSettings(req, res));
  router.put('/', upload.single('imagename'), (req, res) =>
    settingsController.updateSettings(req, res)
  );

  return router;
}
