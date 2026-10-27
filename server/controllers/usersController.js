import { userRepo } from '../models/userRepo.js';
import { authService } from '../services/authService.js';

export const usersController = {
  async getUsers(req, res) {
    const users = userRepo.findAll().map((u) => userRepo.mapUser(u));
    res.json(users);
  },
  async getUser(req, res) {
    const user = userRepo.findById(parseInt(req.params.id, 10));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(userRepo.mapUser(user));
  },
  async createUser(req, res) {
    const {
      username,
      password,
      fullname,
      perm_products,
      perm_categories,
      perm_transactions,
      perm_users,
      perm_settings,
    } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });
    const existing = userRepo.findByUsername(username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const hashed = authService.hashPassword(password);
    const user = userRepo.create({
      username,
      password: hashed,
      fullname: fullname || '',
      perm_products: perm_products || 0,
      perm_categories: perm_categories || 0,
      perm_transactions: perm_transactions || 0,
      perm_users: perm_users || 0,
      perm_settings: perm_settings || 0,
    });
    res.json(userRepo.mapUser(user));
  },
  async updateUser(req, res) {
    const id = parseInt(req.params.id, 10);
    const user = userRepo.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...rest } = req.body || {};
    if (password) {
      rest.password = authService.hashPassword(password);
    }
    const updated = userRepo.update(id, rest);
    res.json(userRepo.mapUser(updated));
  },
  async deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);
    userRepo.delete(id);
    res.sendStatus(200);
  },
  async logoutUser(req, res) {
    const id = parseInt(req.params.id, 10);
    userRepo.updateStatus(id, 'Logged Out');
    res.sendStatus(200);
  },
};
