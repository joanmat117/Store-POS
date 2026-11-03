import { Router } from 'express';
import { transactionsController } from '../controllers/transactionsController.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { transactionSchema, transactionUpdateSchema, deleteTransactionSchema, dateRangeQuerySchema } from '../validation/index.js';

export default function transactionsRoutes(): Router {
  const router = Router();

  router.get('/all', (req, res) => transactionsController.getAllTransactions(req, res));
  router.get('/on-hold', (req, res) => transactionsController.getOnHoldTransactions(req, res));
  router.get('/customer-orders', (req, res) => transactionsController.getCustomerOrders(req, res));
  router.get('/by-date', validateQuery(dateRangeQuerySchema), (req, res) => transactionsController.getTransactionsByDate(req, res));
  router.get('/transaction/:transactionId', (req, res) => transactionsController.getTransactionById(req, res));
  router.post('/new', validateBody(transactionSchema), (req, res) => transactionsController.createTransaction(req, res));
  router.put('/new', validateBody(transactionUpdateSchema), (req, res) => transactionsController.updateTransaction(req, res));
  router.post('/delete', validateBody(deleteTransactionSchema), (req, res) => transactionsController.deleteTransaction(req, res));

  return router;
}