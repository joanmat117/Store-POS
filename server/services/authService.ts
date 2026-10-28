import bcrypt from 'bcryptjs';
import { userRepo } from '../models/userRepo.js';
import { signToken } from '../config/auth.js';
import type { UserDTO, JWTPayload } from '../types/index.js';

export const authService = {
  async login(username: string, password: string): Promise<UserDTO | null> {
    const user = userRepo.findByUsername(username);
    if (!user) return null;
    if (!bcrypt.compareSync(password, user.password)) return null;
    userRepo.updateStatus(user.id, `Logged In_${new Date().toISOString()}`);
    return userRepo.mapUser(user);
  },
  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  },
  generateToken(user: JWTPayload): string {
    return signToken(user);
  },
  async updatePassword(userId: number, newPassword: string): Promise<{ ok: boolean }> {
    const hashed = this.hashPassword(newPassword);
    userRepo.updatePassword(userId, hashed);
    return { ok: true };
  },
};