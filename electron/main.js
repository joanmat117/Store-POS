// electron/main.js
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { logger } from '../server/logger.js';
import { API_PORT, getJwtSecret } from '../server/config/constants.js';

// ========== ENV SETUP - PRIMERO, ANTES DE NADA ==========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Generar .env seguro en primer arranque empaquetado (si no existe)
function ensureEnvFileExists() {
  if (!app.isPackaged) return;

  try {
    const userDataPath = app.getPath('userData');
    const envPath = path.join(userDataPath, '.env');
    
    if (!fs.existsSync(envPath)) {
      const secret = require('crypto').randomBytes(32).toString('hex');
      const content = [
        `# Generado automáticamente en primer arranque`,
        `JWT_SECRET=${secret}`,
        `NODE_ENV=production`,
        `API_PORT=8001`,
        `CORS_ORIGIN=*`,
        ``
      ].join('\n');
      
      fs.writeFileSync(envPath, content, { mode: 0o600 });
      console.log('🔐 Generado .env seguro en:', envPath);
    }
  } catch (err) {
    console.error('❌ No se pudo generar .env automático:', err);
  }
}

// 2. Cargar variables de entorno (respeta .env generado arriba)
function loadEnv() {
  // Dev: raíz del proyecto
  const projectRoot = path.resolve(__dirname, '../');
  dotenv.config({ path: path.join(projectRoot, '.env') });

  // Empaquetado: junto a recursos
  if (app.isPackaged && process.resourcesPath) {
    dotenv.config({ path: path.join(process.resourcesPath, '.env') });
  }

  // UserData: configurable por usuario final
  try {
    const userDataPath = app.getPath('userData');
    dotenv.config({ path: path.join(userDataPath, '.env') });
  } catch {
    // app no listo aún
  }
}

ensureEnvFileExists();
loadEnv();

const isDev = !app.isPackaged;
const PORT = API_PORT;

let mainWindow = null;
let stopServer = null;

function getUserDataPaths() {
  const root = path.join(app.getPath('userData'), 'POS');
  return {
    root,
    dbDir: path.join(root, 'server', 'databases'),
    dbFile: path.join(root, 'server', 'databases', 'pos.sqlite'),
    uploads: path.join(root, 'uploads'),
    localConfig: path.join(root, 'local-config.json'),
  };
}

function ensureDirs(paths) {
  fs.mkdirSync(paths.dbDir, { recursive: true });
  fs.mkdirSync(paths.uploads, { recursive: true });
}

function readLocalConfig(paths) {
  const defaults = {
    mode: 'Standalone Point of Sale',
    serverIp: '',
    till: 1,
    apiPort: PORT,
  };
  try {
    if (fs.existsSync(paths.localConfig)) {
      return { ...defaults, ...JSON.parse(fs.readFileSync(paths.localConfig, 'utf8')) };
    }
  } catch (err) {
    logger.warn({ err, configPath: paths.localConfig }, 'Failed to read local config, using defaults');
  }
  return defaults;
}

function writeLocalConfig(paths, config) {
  ensureDirs(paths);
  fs.writeFileSync(paths.localConfig, JSON.stringify(config, null, 2));
}

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function shouldStartServer(mode) {
  return (
    mode === 'Standalone Point of Sale' ||
    mode === 'Network Point of Sale Server'
  );
}

async function startApiServer(paths, mode) {
  if (!shouldStartServer(mode)) {
    return null;
  }

  // Dev: use ts-node/esm with .ts files | Prod: use compiled .js from dist/
  const entryPoint = isDev ? '../server/index.ts' : '../server/dist/index.js';
  const { createServer } = await import(entryPoint);
  
  const host = mode === 'Network Point of Sale Server' ? '0.0.0.0' : '127.0.0.1';
  const expressApp = await createServer({
    dbPath: paths.dbFile,
    uploadsPath: paths.uploads,
    jwtSecret: getJwtSecret(),
  });

  const httpServer = await new Promise((resolve, reject) => {
    const server = expressApp.listen(PORT, host, () => {
      console.log(`POS API listening on ${host}:${PORT}`);
      resolve(server);
    });
    server.on('error', reject);
  });

  return () =>
    new Promise((resolve) => {
      httpServer.close(() => resolve());
    });
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const iconPath = fs.existsSync(path.join(__dirname, '..', 'build', 'icon.ico'))
    ? path.join(__dirname, '..', 'build', 'icon.ico')
    : path.join(__dirname, '..', 'public', 'favicon.ico');
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('get-paths', () => {
  const paths = getUserDataPaths();
  return {
    uploads: paths.uploads,
    userData: paths.root,
  };
});

ipcMain.handle('get-local-config', () => {
  const paths = getUserDataPaths();
  return readLocalConfig(paths);
});

ipcMain.handle('set-local-config', (_event, config) => {
  const paths = getUserDataPaths();
  const current = readLocalConfig(paths);
  const next = { ...current, ...config };
  writeLocalConfig(paths, next);
  return next;
});

ipcMain.handle('get-lan-ip', () => getLanIp());

ipcMain.handle('get-api-info', () => {
  const paths = getUserDataPaths();
  const config = readLocalConfig(paths);
  const isTerminal = config.mode === 'Network Point of Sale Terminal';
  const host = isTerminal ? config.serverIp || '127.0.0.1' : '127.0.0.1';
  return {
    baseUrl: `http://${host}:${config.apiPort || PORT}/api`,
    healthUrl: `http://${host}:${config.apiPort || PORT}/`,
    mode: config.mode,
    serverIp: config.serverIp,
    till: config.till,
    lanIp: getLanIp(),
    localServerRunning: shouldStartServer(config.mode),
  };
});

ipcMain.on('app-quit', () => {
  app.quit();
});

ipcMain.on('app-reload', () => {
  if (mainWindow) mainWindow.reload();
});

app.whenReady().then(async () => {
  const paths = getUserDataPaths();
  ensureDirs(paths);
  const config = readLocalConfig(paths);
  writeLocalConfig(paths, config);

  try {
    stopServer = await startApiServer(paths, config.mode);
  } catch (err) {
    logger.error({ err, mode: config.mode }, 'Failed to start API server');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (stopServer) {
    await stopServer();
    stopServer = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (stopServer) {
    await stopServer();
    stopServer = null;
  }
});