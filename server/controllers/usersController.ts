import { Request, Response } from 'express';
import { userRepo } from '../models/userRepo.js';
import { authService } from '../services/authService.js';
import type { UserDTO, CreateUserData, UpdateUserData } from '../types/index.js';

function getParamId(req: Request): number {
  return parseInt(String(req.params.id), 10);
}

export const usersController = {
  async getUsers(req: Request, res: Response): Promise<void> {
    const users = (await userRepo.findAll()).map(userRepo.mapUser);
    res.json(users);
  },
  async getUser(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(getParamId(req));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(userRepo.mapUser(user));
  },
  async createUser(req: Request, res: Response): Promise<void> {
    const { username, password, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }
    const existing = await userRepo.findByUsername(username);
    if (existing) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
    const hashed = authService.hashPassword(password);
    const user = await userRepo.create({
      username,
      password: hashed,
      fullname: fullname || '',
      perm_products: perm_products || 0,
      perm_categories: perm_categories || 0,
      perm_transactions: perm_transactions || 0,
      perm_users: perm_users || 0,
      perm_settings: perm_settings || 0,
    });
    res.json(user);
  },
  async updateUser(req: Request, res: Response): Promise<void> {
    const id = getParamId(req);
    const user = await userRepo.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password, ...rest } = req.body || {};
    if (password) {
      rest.password = authService.hashPassword(password);
    }
    const updated = await userRepo.update(id, rest as UpdateUserData);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  },
  async deleteUser(req: Request, res: Response): Promise<void> {
    await userRepo.delete(getParamId(req));
    res.sendStatus(200);
  },
  async logoutUser(req: Request, res: Response): Promise<void> {
    await userRepo.updateStatus(getParamId(req), 'Logged Out');
    res.sendStatus(200);
  },
};