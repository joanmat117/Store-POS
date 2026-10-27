import { customerRepo } from '../models/customerRepo.js';

export const customerService = {
  async getAllCustomers() {
    return customerRepo.findAll();
  },
  async getCustomerById(id) {
    return customerRepo.findById(id);
  },
  async createCustomer(data) {
    return customerRepo.create(data);
  },
  async updateCustomer(id, data) {
    return customerRepo.update(id, data);
  },
  async deleteCustomer(id) {
    return customerRepo.delete(id);
  },
};
