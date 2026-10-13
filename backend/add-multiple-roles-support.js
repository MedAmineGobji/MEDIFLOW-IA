const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addMultipleRolesSupport() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ajout du support pour plusieurs rôles...');
    
    // Vérifier si la colonne roles existe déjà
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'roles';
    `);
    
    if (checkColumn.rows.length === 0) {
      // Ajouter la colonne roles (array de text)
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN roles TEXT[];
      `);
      console.log('✅ Colonne roles ajoutée');
      
      // Migrer les données existantes : copier role vers roles[]
      await client.query(`
        UPDATE users 
        SET roles = ARRAY[role]::TEXT[]
        WHERE roles IS NULL;
      `);
      console.log('✅ Données migrées de role vers roles[]');
      
      // On garde l'ancienne colonne role pour la compatibilité, mais on pourrait la supprimer plus tard
      console.log('ℹ️  La colonne role est conservée pour compatibilité');
    } else {
      console.log('ℹ️  La colonne roles existe déjà');
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

addMultipleRolesSupport();
