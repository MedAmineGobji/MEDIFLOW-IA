const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant. Vérifiez backend/.env');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

module.exports = db;