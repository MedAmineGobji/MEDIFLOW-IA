const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixPrescriptions() {
  try {
    // Supprimer toutes les prescriptions existantes
    await pool.query('DELETE FROM prescriptions');
    console.log('✅ Anciennes prescriptions supprimées');

    // Créer de nouvelles prescriptions avec le bon format
    const diagnoses = [
      { name: 'Hypertension', medications: JSON.stringify(['Lisinopril 10mg', 'Amlodipine 5mg']) },
      { name: 'Diabète type 2', medications: JSON.stringify(['Metformine 500mg', 'Glibenclamide 5mg']) },
      { name: 'Infection respiratoire', medications: JSON.stringify(['Amoxicilline 500mg', 'Paracétamol 500mg']) },
      { name: 'Arthrite', medications: JSON.stringify(['Ibuprofène 400mg', 'Diclofénac 50mg']) },
      { name: 'Cholestérol élevé', medications: JSON.stringify(['Atorvastatine 20mg', 'Ezetimibe 10mg']) },
      { name: 'Asthme', medications: JSON.stringify(['Ventoline 100mcg', 'Flixotide 125mcg']) },
    ];

    const patientId = 1;
    const doctorId = 2; // Utiliser un docteur existant

    for (let i = 0; i < diagnoses.length; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      for (let j = 0; j < 2; j++) {
        const result = await pool.query(
          `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, medications, additional_notes, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            patientId,
            doctorId,
            diagnoses[i].name,
            diagnoses[i].medications,
            `Traitement prescrit pour ${diagnoses[i].name}. À prendre selon les indications.`,
            date
          ]
        );
        console.log(`✅ Prescription ${i + 1}.${j + 1} créée:`, diagnoses[i].name);
      }
    }

    console.log('\n✅ Toutes les prescriptions ont été recréées avec succès!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    await pool.end();
    process.exit(1);
  }
}

fixPrescriptions();
