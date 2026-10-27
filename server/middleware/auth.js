import { verifyToken } from '../config/auth.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requirePerm(perm) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.id === 1 || req.user[perm]) return next();
    return res.status(403).json({ error: 'Permission denied' });
  };
}

export function requireAnyPerm(...perms) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.id === 1 || perms.some((p) => req.user[p])) return next();
    return res.status(403).json({ error: 'Permission denied' });
  };
}
