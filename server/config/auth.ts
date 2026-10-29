// server/config/auth.ts
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './constants.js';
import type { JWTPayload } from '../types/index.js';
import { getEnv } from './env.js';

let _jwtSecret: string;

export function setJwtSecret(secret: string): void {
  _jwtSecret = secret;
}

export function getJwtSecretForSign(): string {
  return _jwtSecret || getJwtSecret();
}

function getExpiresIn(): jwt.SignOptions['expiresIn'] {
  return getEnv('JWT_EXPIRES_IN', '12h') as jwt.SignOptions['expiresIn'];
}

export function signToken(user: JWTPayload): string {
  const secret = getJwtSecretForSign() as jwt.Secret;
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
    secret,
    { expiresIn: getExpiresIn() }
  );
}

export function verifyToken(token: string): JWTPayload {
  const secret = getJwtSecretForSign() as jwt.Secret;
  return jwt.verify(token, secret) as JWTPayload;
}