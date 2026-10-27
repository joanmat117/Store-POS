import bcrypt from 'bcryptjs';
import { userRepo } from '../models/userRepo.js';
import { signToken } from '../config/auth.js';

export const authService = {
  async login(username, password) {
    const user = userRepo.findByUsername(username);
    if (!user) return null;
    if (!bcrypt.compareSync(password, user.password)) return null;
    userRepo.updateStatus(user.id, `Logged In_${new Date().toISOString()}`);
    return userRepo.mapUser(user);
  },
  hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  },
  generateToken(user) {
    return signToken(user);
  },
  async updatePassword(userId, newPassword) {
    const hashed = this.hashPassword(newPassword);
    userRepo.updatePassword(userId, hashed);
    return { ok: true };
  },
};
