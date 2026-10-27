import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function categoriesRoutes() {
  const router = Router();
  router.use(authenticate);

  router.get('/', requirePerm('perm_categories'), (req, res) =>
    categoriesController.getCategories(req, res)
  );
  router.get('/:categoryId', requirePerm('perm_categories'), (req, res) =>
    categoriesController.getCategoryById(req, res)
  );
  router.post('/', requirePerm('perm_categories'), (req, res) =>
    categoriesController.createCategory(req, res)
  );
  router.put('/:categoryId', requirePerm('perm_categories'), (req, res) =>
    categoriesController.updateCategory(req, res)
  );
  router.delete('/:categoryId', requirePerm('perm_categories'), (req, res) =>
    categoriesController.deleteCategory(req, res)
  );

  return router;
}
