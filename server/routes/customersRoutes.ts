import { Router } from 'express';
import { customersController } from '../controllers/customersController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';

export default function customersRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(requirePerm('perm_products')); // customers use perm_products in original

  router.get('/', (req, res) => customersController.getCustomers(req, res));
  router.get('/:customerId', (req, res) => customersController.getCustomerById(req, res));
  router.post('/', (req, res) => customersController.createCustomer(req, res));
  router.put('/:customerId', (req, res) => customersController.updateCustomer(req, res));
  router.delete('/:customerId', (req, res) => customersController.deleteCustomer(req, res));

  return router;
}