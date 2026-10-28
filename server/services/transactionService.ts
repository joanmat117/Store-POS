import { transactionRepo } from '../models/transactionRepo.js';
import type { TransactionDTO, TransactionFormData } from '../types/index.js';

export const transactionService = {
  async getAllTransactions(): Promise<TransactionDTO[]> {
    return transactionRepo.findAll();
  },
  async getOnHoldTransactions(): Promise<TransactionDTO[]> {
    return transactionRepo.findOnHold();
  },
  async getCustomerOrders(): Promise<TransactionDTO[]> {
    return transactionRepo.findCustomerOrders();
  },
  async getTransactionsByDate(filters: { start: string; end: string; status: number; userId: number; till: number }): Promise<TransactionDTO[]> {
    return transactionRepo.findByDateRange(filters);
  },
  async getTransactionById(id: number): Promise<TransactionDTO | null> {
    return transactionRepo.findById(id);
  },
  async createTransaction(data: TransactionFormData): Promise<TransactionDTO> {
    return transactionRepo.create(data);
  },
  async updateTransaction(id: number, data: TransactionFormData): Promise<TransactionDTO | null> {
    return transactionRepo.update(id, data);
  },
  async deleteTransaction(id: number): Promise<{ changes: number }> {
    return transactionRepo.delete(id);
  },
};