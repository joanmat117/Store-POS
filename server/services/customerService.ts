import { customerRepo } from '../models/customerRepo.js';
import type { CustomerDTO, CustomerFormData } from '../types/index.js';

export const customerService = {
  async getAllCustomers(): Promise<CustomerDTO[]> {
    return customerRepo.findAll();
  },
  async getCustomerById(id: number): Promise<CustomerDTO | null> {
    return customerRepo.findById(id);
  },
  async createCustomer(data: CustomerFormData): Promise<CustomerDTO> {
    return customerRepo.create(data);
  },
  async updateCustomer(id: number, data: CustomerFormData): Promise<CustomerDTO | null> {
    return customerRepo.update(id, data);
  },
  async deleteCustomer(id: number): Promise<{ changes: number }> {
    return customerRepo.delete(id);
  },
};