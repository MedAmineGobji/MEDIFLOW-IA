const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage de la migration...');
    
    // Add rejection_reason column to appointments table
    await client.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);
    console.log('✅ Colonne rejection_reason ajoutée');
    
    // Update default status to 'en attente'
    await client.query(`
      ALTER TABLE appointments 
      ALTER COLUMN status SET DEFAULT 'en attente';
    `);
    console.log('✅ Statut par défaut mis à jour vers "en attente"');
    
    console.log('✨ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
