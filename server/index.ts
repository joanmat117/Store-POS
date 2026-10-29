// PRIMERA LÍNEA - antes de cualquier import que use constants
import { loadEnv, validateProductionEnv } from './config/env.js';
loadEnv();
validateProductionEnv();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { setJwtSecret } from './config/auth.js';
import { logger } from './logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import customersRoutes from './routes/customersRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import { initializeDb } from './db/index.js';

export async function createServer({ dbPath, uploadsPath, jwtSecret }: { dbPath: string; uploadsPath: string; jwtSecret: string }): Promise<express.Express> {
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, 'library'), { recursive: true });
  // Initialize database with custom path
  initializeDb(dbPath);
  setJwtSecret(jwtSecret);

  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(uploadsPath));
  app.use(requestLogger);

  app.get('/', (_req, res) => res.json({ status: 'ok', message: 'POS Server Online.' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Auth routes (no auth required)
  app.use('/api/auth', authRoutes);

  // Protected routes
  app.use('/api/users', usersRoutes);
  app.use('/api/inventory', inventoryRoutes(uploadsPath));
  app.use('/api/categories', categoriesRoutes());
  app.use('/api/customers', customersRoutes());
  app.use('/api/settings', settingsRoutes(uploadsPath));
  app.use('/api/media', mediaRoutes(uploadsPath));
  app.use('/api/demo', demoRoutes());
  app.use('/api', transactionsRoutes()); // transactions at root /api

  app.use(errorHandler);

  return app;
}