import { transactionService } from '../services/transactionService.js';

export const transactionsController = {
  async getAllTransactions(req, res) {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  },
  async getOnHoldTransactions(req, res) {
    const transactions = await transactionService.getOnHoldTransactions();
    res.json(transactions);
  },
  async getCustomerOrders(req, res) {
    const transactions = await transactionService.getCustomerOrders();
    res.json(transactions);
  },
  async getTransactionsByDate(req, res) {
    const startDate = new Date(String(req.query.start || ''));
    const endDate = new Date(String(req.query.end || ''));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date' });
    }
    const filters = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: parseInt(String(req.query.status), 10) || 1,
      userId: parseInt(String(req.query.user), 10) || 0,
      till: parseInt(String(req.query.till), 10) || 0,
    };
    const transactions = await transactionService.getTransactionsByDate(filters);
    res.json(transactions);
  },
  async getTransactionById(req, res) {
    const transaction = await transactionService.getTransactionById(
      parseInt(req.params.transactionId, 10)
    );
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  },
  async createTransaction(req, res) {
    const transaction = await transactionService.createTransaction(req.body);
    res.json(transaction);
  },
  async updateTransaction(req, res) {
    const id = parseInt(req.body._id ?? req.body.id, 10);
    const transaction = await transactionService.updateTransaction(id, req.body);
    res.sendStatus(200);
  },
  async deleteTransaction(req, res) {
    const orderId = parseInt(req.body?.orderId ?? req.body?._id, 10);
    await transactionService.deleteTransaction(orderId);
    res.sendStatus(200);
  },
};
