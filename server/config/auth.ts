import jwt from 'jsonwebtoken';
import { DEFAULT_JWT_SECRET, JWT_EXPIRES_IN } from './constants.js';
import type { JWTPayload } from '../types/index.js';

let jwtSecret = DEFAULT_JWT_SECRET;

export function setJwtSecret(secret: string): void {
  jwtSecret = secret || jwtSecret;
}

export function signToken(user: JWTPayload): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      perm_products: user.perm_products,
      perm_categories: user.perm_categories,
      perm_transactions: user.perm_transactions,
      perm_users: user.perm_users,
      perm_settings: user.perm_settings,
    },
    jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, jwtSecret) as JWTPayload;
}