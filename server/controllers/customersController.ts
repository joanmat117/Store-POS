import { Request, Response } from 'express';
import { customerService } from '../services/customerService.js';
import type { CustomerDTO } from '../types/index.js';

function getCustomerIdParam(req: Request): number {
  return parseInt(String(req.params.customerId), 10);
}

export const customersController = {
  async getCustomers(req: Request, res: Response): Promise<void> {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  },
  async getCustomerById(req: Request, res: Response): Promise<void> {
    const customer = await customerService.getCustomerById(getCustomerIdParam(req));
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(customer);
  },
  async createCustomer(req: Request, res: Response): Promise<void> {
    const customer = await customerService.createCustomer(req.body);
    res.json(customer);
  },
  async updateCustomer(req: Request, res: Response): Promise<void> {
    const customer = await customerService.updateCustomer(getCustomerIdParam(req), req.body);
    res.json(customer);
  },
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    await customerService.deleteCustomer(getCustomerIdParam(req));
    res.sendStatus(200);
  },
};