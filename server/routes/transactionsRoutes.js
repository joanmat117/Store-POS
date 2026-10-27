import { Router } from 'express';
import { transactionsController } from '../controllers/transactionsController.js';

export default function transactionsRoutes() {
  const router = Router();

  router.get('/all', (req, res) => transactionsController.getAllTransactions(req, res));
  router.get('/on-hold', (req, res) => transactionsController.getOnHoldTransactions(req, res));
  router.get('/customer-orders', (req, res) => transactionsController.getCustomerOrders(req, res));
  router.get('/by-date', (req, res) => transactionsController.getTransactionsByDate(req, res));
  router.get('/transaction/:transactionId', (req, res) =>
    transactionsController.getTransactionById(req, res)
  );
  router.post('/new', (req, res) => transactionsController.createTransaction(req, res));
  router.put('/new', (req, res) => transactionsController.updateTransaction(req, res));
  router.post('/delete', (req, res) => transactionsController.deleteTransaction(req, res));

  return router;
}
