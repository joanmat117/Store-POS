import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/auth.js';
import type { JWTPayload } from '../types/index.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requirePerm(perm: keyof JWTPayload): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (req.user.id === 1 || req.user[perm]) {
      next();
      return;
    }
    res.status(403).json({ error: 'Permission denied' });
  };
}

export function requireAnyPerm(...perms: (keyof JWTPayload)[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (req.user.id === 1 || perms.some(p => req.user![p])) {
      next();
      return;
    }
    res.status(403).json({ error: 'Permission denied' });
  };
}