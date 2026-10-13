import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './database/schema.js',
  out: './database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});