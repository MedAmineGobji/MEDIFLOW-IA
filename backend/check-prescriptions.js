const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPrescriptions() {
  try {
    const result = await pool.query('SELECT id, patient_id, diagnosis, medications FROM prescriptions LIMIT 5');
    console.log('\n💊 PRESCRIPTIONS DANS LA BASE:');
    result.rows.forEach(row => {
      console.log('\nID:', row.id);
      console.log('Patient ID:', row.patient_id);
      console.log('Diagnostic:', row.diagnosis);
      console.log('Medications (raw):', row.medications);
      console.log('Type:', typeof row.medications);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkPrescriptions();
