import fs from 'fs';
import path from 'path';

const src = path.resolve('server/db/migrations');
const dest = path.resolve('server/dist/db/migrations');

try {
  fs.cpSync(src, dest, { recursive: true });
  console.log('✅ Migrations copiadas a', dest);
} catch (err) {
  console.error('❌ Error copiando migrations:', err.message);
  process.exit(1);
}