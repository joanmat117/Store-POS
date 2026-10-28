import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resuelve el directorio de datos de forma consistente entre todos los modos:
 * - Electron (main): usa app.getPath('userData')/POS
 * - Standalone/Dev: usa POS_DATA_DIR env var o ~/POS-data como fallback
 * - Tests: usa directorio temporal
 */
let cachedDataDir: string | null = null;

function getElectronUserDataPath(): string | null {
  if (!process.versions.electron) return null;
  try {
    const electron = require('electron');
    const app = electron.app || electron.remote?.app;
    if (app?.getPath) {
      return path.join(app.getPath('userData'), 'POS');
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export function getDataDir(): string {
  if (cachedDataDir) return cachedDataDir;

  // 1. Variable de entorno (establecida por Electron main)
  if (process.env.POS_DATA_DIR) {
    cachedDataDir = path.resolve(process.env.POS_DATA_DIR);
    return cachedDataDir;
  }

  // 2. Detectar si estamos en Electron
  const electronPath = getElectronUserDataPath();
  if (electronPath) {
    cachedDataDir = electronPath;
    return cachedDataDir;
  }

  // 3. Standalone/Dev: usar directorio en home para persistencia real
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
  cachedDataDir = path.join(homeDir, 'POS-data');
  return cachedDataDir;
}

export function getDbPath(): string {
  return path.join(getDataDir(), 'pos.sqlite');
}

export function getUploadsPath(): string {
  return path.join(getDataDir(), 'uploads');
}

export function getLibraryPath(): string {
  return path.join(getUploadsPath(), 'library');
}

export function ensureDataDirs(): void {
  const uploadsPath = getUploadsPath();
  const libraryPath = getLibraryPath();
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(libraryPath, { recursive: true });
}

// Para testing: permitir resetear el cache
export function _resetCache(): void {
  cachedDataDir = null;
}