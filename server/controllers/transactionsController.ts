import { Request, Response } from 'express';
import { transactionService } from '../services/transactionService.js';
import type { TransactionDTO, TransactionInput, TransactionUpdateInput, DeleteTransactionInput, DateRangeQueryInput } from '../types/index.js';

function getTransactionIdParam(req: Request): number {
  return parseInt(String(req.params.transactionId), 10);
}

function getTransactionBodyId(req: Request): number {
  return parseInt(String((req.validated as TransactionUpdateInput)?._id ?? (req.validated as TransactionUpdateInput)?.id), 10);
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
    const { start, end, status, user, till } = req.validated as DateRangeQueryInput;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const filters = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: status || 1,
      userId: user || 0,
      till: till || 0,
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
    const transactionData = req.validated as TransactionInput;
    try {
      const transaction = await transactionService.createTransaction(transactionData);
      res.json(transaction);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Insufficient stock')) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
  async updateTransaction(req: Request, res: Response): Promise<void> {
    const transactionData = req.validated as TransactionUpdateInput;
    const updated = await transactionService.updateTransaction(getTransactionBodyId(req), transactionData);
    if (!updated) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(updated);
  },
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    const { orderId } = req.validated as DeleteTransactionInput;
    await transactionService.deleteTransaction(orderId);
    res.sendStatus(200);
  },
};