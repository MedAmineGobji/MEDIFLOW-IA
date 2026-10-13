const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage de la migration...');
    
    // Add proposed_date column
    await client.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS proposed_date TIMESTAMP;
    `);
    console.log('✅ Colonne proposed_date ajoutée');
    
    // Add proposed_by column
    await client.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS proposed_by TEXT;
    `);
    console.log('✅ Colonne proposed_by ajoutée');
    
    console.log('✨ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
