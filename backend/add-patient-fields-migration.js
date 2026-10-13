const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addPatientFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ajout des colonnes bloodGroup et allergies à la table patients...');
    
    // Vérifier si les colonnes existent déjà
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      AND column_name IN ('blood_group', 'allergies');
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    // Ajouter blood_group si elle n'existe pas
    if (!existingColumns.includes('blood_group')) {
      await client.query(`
        ALTER TABLE patients 
        ADD COLUMN blood_group TEXT;
      `);
      console.log('✅ Colonne blood_group ajoutée avec succès');
    } else {
      console.log('ℹ️ Colonne blood_group existe déjà');
    }
    
    // Ajouter allergies si elle n'existe pas
    if (!existingColumns.includes('allergies')) {
      await client.query(`
        ALTER TABLE patients 
        ADD COLUMN allergies TEXT;
      `);
      console.log('✅ Colonne allergies ajoutée avec succès');
    } else {
      console.log('ℹ️ Colonne allergies existe déjà');
    }
    
    console.log('✅ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPatientFields();
