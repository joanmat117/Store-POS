import { transactionRepo } from '../models/transactionRepo.js';

export const transactionService = {
  async getAllTransactions() {
    return transactionRepo.findAll();
  },
  async getOnHoldTransactions() {
    return transactionRepo.findOnHold();
  },
  async getCustomerOrders() {
    return transactionRepo.findCustomerOrders();
  },
  async getTransactionsByDate(filters) {
    return transactionRepo.findByDateRange(filters);
  },
  async getTransactionById(id) {
    return transactionRepo.findById(id);
  },
  async createTransaction(data) {
    return transactionRepo.create(data);
  },
  async updateTransaction(id, data) {
    return transactionRepo.update(id, data);
  },
  async deleteTransaction(id) {
    return transactionRepo.delete(id);
  },
};
