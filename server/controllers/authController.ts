import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { userRepo } from '../models/userRepo.js';
import type { UserDTO } from '../types/index.js';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body || {};
    const user = await authService.login(username, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = authService.generateToken(user);
    res.json({ token, user });
  },
  async checkUsers(req: Request, res: Response): Promise<void> {
    const users = userRepo.findAll();
    res.json({ ready: users.length > 0 });
  },
};