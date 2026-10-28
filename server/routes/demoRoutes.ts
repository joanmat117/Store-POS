import { Router } from 'express';
import { demoController } from '../controllers/demoController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function demoRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_settings')); // demo uses perm_settings in original

  router.post('/seed', (req, res) => demoController.seedDemo(req, res));

  return router;
}