const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/add_prescriptions_table.sql'),
      'utf8'
    );

    await client.query(migrationSQL);
    console.log('✅ Migration de la table prescriptions réussie !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
