import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./pos.sqlite',
  },
  verbose: true,
  strict: true,
});