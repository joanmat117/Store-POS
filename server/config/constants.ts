// server/config/constants.ts
import { getEnv, getEnvInt } from './env.js';

// ========== GETTERS PEREZOSOS (se evalúan en RUNTIME) ==========
export const getApiPort = () => getEnvInt('API_PORT', 8001);
export const getNodeEnv = () => getEnv('NODE_ENV', 'development');
export const getJwtSecret = () => getEnv('JWT_SECRET', 'store-pos-dev-secret');
export const getJwtExpiresIn = () => getEnv('JWT_EXPIRES_IN', '12h');
export const getCorsOrigin = () => getEnv('CORS_ORIGIN', 'http://127.0.0.1:5173');

// ========== COMPAT: export const (se evalúan al importar en runtime) ==========
export const API_PORT = getApiPort();
export const NODE_ENV = getNodeEnv();
export const JWT_SECRET = getJwtSecret();
export const JWT_EXPIRES_IN = getJwtExpiresIn();
export const CORS_ORIGIN = getCorsOrigin();
export const DEFAULT_JWT_SECRET = JWT_SECRET;

// ========== CONSTANTES REALES (no dependen de env) ==========
export const UPLOADS_SUBDIR = 'uploads';
export const LIBRARY_SUBDIR = 'uploads/library';