import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { categorySchema, categoryUpdateSchema } from '../validation/index.js';

export default function categoriesRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_categories'));

  router.get('/', (req, res) => categoriesController.getCategories(req, res));
  router.get('/:categoryId', (req, res) => categoriesController.getCategoryById(req, res));
  router.post('/', validateBody(categorySchema), (req, res) => categoriesController.createCategory(req, res));
  router.put('/:categoryId', validateBody(categoryUpdateSchema), (req, res) => categoriesController.updateCategory(req, res));
  router.delete('/:categoryId', (req, res) => categoriesController.deleteCategory(req, res));

  return router;
}