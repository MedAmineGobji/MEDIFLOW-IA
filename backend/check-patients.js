const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPatients() {
  try {
    // Vérifier les patients
    const patientsResult = await pool.query('SELECT p.id, p.first_name, p.last_name, p.email, u.id as user_id FROM patients p LEFT JOIN users u ON u.email = p.email');
    console.log('\n📋 PATIENTS DANS LA BASE:');
    console.log(patientsResult.rows);

    // Vérifier les utilisateurs
    const usersResult = await pool.query('SELECT id, email, role FROM users WHERE role = \'patient\'');
    console.log('\n👤 UTILISATEURS PATIENTS:');
    console.log(usersResult.rows);

    // Vérifier les rendez-vous
    const appointmentsResult = await pool.query('SELECT COUNT(*) as count, patient_id FROM appointments GROUP BY patient_id');
    console.log('\n📅 RENDEZ-VOUS PAR PATIENT:');
    console.log(appointmentsResult.rows);

    await pool.end();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkPatients();
