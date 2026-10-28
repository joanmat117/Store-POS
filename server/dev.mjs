#!/usr/bin/env node
// Development entry point - starts the server with ts-node/esm
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devServerPath = path.join(__dirname, 'dev-server.ts');

const child = spawn('node', ['--loader', 'ts-node/esm', devServerPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

// Prevent the parent from exiting immediately
setInterval(() => {}, 1000);
