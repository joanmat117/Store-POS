import { Request, Response } from 'express';
import { transactionService } from '../services/transactionService.js';
import type { TransactionDTO } from '../types/index.js';

function getTransactionIdParam(req: Request): number {
  return parseInt(String(req.params.transactionId), 10);
}

function getTransactionBodyId(req: Request): number {
  return parseInt(String(req.body._id ?? req.body.id), 10);
}

function getDeleteOrderId(req: Request): number {
  return parseInt(String(req.body?.orderId ?? req.body?._id), 10);
}

export const transactionsController = {
  async getAllTransactions(req: Request, res: Response): Promise<void> {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  },
  async getOnHoldTransactions(req: Request, res: Response): Promise<void> {
    const transactions = await transactionService.getOnHoldTransactions();
    res.json(transactions);
  },
  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    const transactions = await transactionService.getCustomerOrders();
    res.json(transactions);
  },
  async getTransactionsByDate(req: Request, res: Response): Promise<void> {
    const startDate = new Date(String(req.query.start || ''));
    const endDate = new Date(String(req.query.end || ''));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      res.status(400).json({ error: 'Invalid start or end date' });
      return;
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
  async getTransactionById(req: Request, res: Response): Promise<void> {
    const transaction = await transactionService.getTransactionById(getTransactionIdParam(req));
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  },
  async createTransaction(req: Request, res: Response): Promise<void> {
    const transaction = await transactionService.createTransaction(req.body);
    res.json(transaction);
  },
  async updateTransaction(req: Request, res: Response): Promise<void> {
    await transactionService.updateTransaction(getTransactionBodyId(req), req.body);
    res.sendStatus(200);
  },
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    await transactionService.deleteTransaction(getDeleteOrderId(req));
    res.sendStatus(200);
  },
};