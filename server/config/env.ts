// server/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-load electron only when available (in Electron context)
let _electronApp: typeof import('electron').app | null = null;
function getElectronApp() {
  if (_electronApp !== null) return _electronApp;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const electron = require('electron');
    _electronApp = electron.app || electron.remote?.app || null;
  } catch {
    _electronApp = null;
  }
  return _electronApp;
}

let _loaded = false;
let _validated = false;

/**
 * Carga .env desde múltiples ubicaciones (orden de prioridad):
 * 1. process.env (ya seteado por shell / Electron main)
 * 2. .env en raíz del proyecto (dev)
 * 3. .env en resources/ (empaquetado, junto al exe)
 * 4. .env en userData/ (configurable por usuario)
 */
export function loadEnv(): void {
  if (_loaded) return;

  // 1. Dev: raíz del proyecto (donde está package.json)
  const projectRoot = path.resolve(__dirname, '../../');
  dotenv.config({ path: path.join(projectRoot, '.env') });

  const app = getElectronApp();

  // 2. Empaquetado: junto a recursos (process.resourcesPath)
  if (app?.isPackaged && process.resourcesPath) {
    dotenv.config({ path: path.join(process.resourcesPath, '.env') });
  }

  // 3. UserData: configurable por usuario final
  if (app?.getPath) {
    try {
      const userDataPath = app.getPath('userData');
      dotenv.config({ path: path.join(userDataPath, '.env') });
    } catch {
      // app no listo aún (ej. tests)
    }
  }

  _loaded = true;
}

/** Lee variable con default opcional */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getEnvInt(key: string, defaultValue?: number): number {
  const value = getEnv(key, defaultValue?.toString());
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new Error(`Invalid integer for ${key}: ${value}`);
  return parsed;
}

export function getEnvBool(key: string, defaultValue?: boolean): boolean {
  const value = getEnv(key, defaultValue?.toString());
  return value === 'true' || value === '1';
}

/**
 * Valida configuración crítica para producción.
 * Llamar DESPUÉS de loadEnv() en entry points de servidor.
 */
export function validateProductionEnv(): void {
  if (_validated) return;
  // Usar default 'development' para NODE_ENV si no está seteado
  const nodeEnv = getEnv('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    _validated = true;
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'store-pos-dev-secret') {
    throw new Error(
      '🔒 JWT_SECRET no configurado para producción.\n' +
      'Crea un .env con JWT_SECRET=<clave-segura-aleatoria> ' +
      'o configura la variable de entorno.\n' +
      'Genera una con: openssl rand -hex 32'
    );
  }

  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin?.includes('127.0.0.1') || corsOrigin?.includes('localhost')) {
    console.warn('⚠️  CORS_ORIGIN apunta a localhost en producción. Configura tu dominio real.');
  }

  _validated = true;
}

/**
 * Genera .env con JWT_SECRET aleatorio en userData si no existe.
 * Solo en app empaquetada (app.isPackaged).
 * Llamar desde electron/main.ts AL INICIO, antes de cargar backend.
 */
export function ensureEnvFileExists(): void {
  const app = getElectronApp();
  if (!app?.isPackaged) return;

  try {
    const userDataPath = app.getPath('userData');
    const envPath = path.join(userDataPath, '.env');
    
    if (!require('fs').existsSync(envPath)) {
      const secret = require('crypto').randomBytes(32).toString('hex');
      const content = [
        `# Generado automáticamente en primer arranque`,
        `JWT_SECRET=${secret}`,
        `NODE_ENV=production`,
        `API_PORT=8001`,
        `CORS_ORIGIN=*`,
        ``
      ].join('\n');
      
      require('fs').writeFileSync(envPath, content, { mode: 0o600 });
      console.log('🔐 Generado .env seguro en:', envPath);
    }
  } catch (err) {
    console.error('❌ No se pudo generar .env automático:', err);
  }
}