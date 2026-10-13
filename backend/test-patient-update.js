const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testPatientUpdate() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Test de mise à jour du patient...\n');
    
    // Récupérer un patient existant
    const patientQuery = await client.query('SELECT * FROM patients LIMIT 1');
    
    if (patientQuery.rows.length === 0) {
      console.log('❌ Aucun patient trouvé dans la base de données');
      return;
    }
    
    const patient = patientQuery.rows[0];
    console.log('📋 Patient actuel:');
    console.log(`   ID: ${patient.id}`);
    console.log(`   Nom: ${patient.first_name} ${patient.last_name}`);
    console.log(`   Email: ${patient.email}`);
    console.log(`   Groupe sanguin: ${patient.blood_group || 'Non défini'}`);
    console.log(`   Allergies: ${patient.allergies || 'Non défini'}\n`);
    
    // Mettre à jour avec des données de test
    const updateQuery = await client.query(
      `UPDATE patients 
       SET blood_group = $1, 
           allergies = $2, 
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      ['A+', 'Pénicilline, Pollen', patient.id]
    );
    
    const updatedPatient = updateQuery.rows[0];
    console.log('✅ Patient mis à jour avec succès:');
    console.log(`   ID: ${updatedPatient.id}`);
    console.log(`   Nom: ${updatedPatient.first_name} ${updatedPatient.last_name}`);
    console.log(`   Email: ${updatedPatient.email}`);
    console.log(`   Groupe sanguin: ${updatedPatient.blood_group}`);
    console.log(`   Allergies: ${updatedPatient.allergies}`);
    console.log(`   Mis à jour le: ${updatedPatient.updated_at}\n`);
    
    console.log('✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPatientUpdate();
