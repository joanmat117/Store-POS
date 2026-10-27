import { authService } from '../services/authService.js';
import { userRepo } from '../models/userRepo.js';

export const authController = {
  async login(req, res) {
    const { username, password } = req.body || {};
    const user = await authService.login(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = authService.generateToken(user);
    res.json({ token, user });
  },
  async checkUsers(req, res) {
    const users = userRepo.findAll();
    res.json({ ready: users.length > 0 });
  },
};
