import { customerService } from '../services/customerService.js';

export const customersController = {
  async getCustomers(req, res) {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  },
  async getCustomerById(req, res) {
    const customer = await customerService.getCustomerById(parseInt(req.params.customerId, 10));
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  },
  async createCustomer(req, res) {
    const customer = await customerService.createCustomer(req.body);
    res.json(customer);
  },
  async updateCustomer(req, res) {
    const customer = await customerService.updateCustomer(
      parseInt(req.params.customerId, 10),
      req.body
    );
    res.json(customer);
  },
  async deleteCustomer(req, res) {
    await customerService.deleteCustomer(parseInt(req.params.customerId, 10));
    res.sendStatus(200);
  },
};
