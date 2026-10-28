import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function settingsRoutes(uploadsPath: string): Router {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_settings'));

  const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => cb(null, uploadsPath),
    filename: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => cb(null, `${Date.now()}.jpg`),
  });
  const upload = multer({ storage });

  router.use((req: Request, _res: Response, next: NextFunction) => { req.uploadsPath = uploadsPath; next(); });

  router.get('/', (req, res) => settingsController.getSettings(req, res));
  router.put('/', upload.single('imagename'), (req, res) => settingsController.updateSettings(req, res));

  return router;
}