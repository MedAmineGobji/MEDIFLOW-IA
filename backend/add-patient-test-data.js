const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { appointments, medicalRecords, prescriptions, doctors } = require('../database/schema');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function addTestData() {
  try {
    // ID du patient test (change selon ton patient)
    const patientId = 1; // À adapter avec l'ID de ton patient

    // Créer un médecin test s'il n'existe pas
    const doctorResult = await db.select().from(doctors).limit(1);
    let doctorId = doctorResult[0]?.id;
    
    if (!doctorId) {
      const newDoctor = await db.insert(doctors).values({
        firstName: 'Dr',
        lastName: 'Test',
        speciality: 'Médecin Généraliste',
        email: 'doctor@test.com',
        phone: '0123456789',
      }).returning();
      doctorId = newDoctor[0].id;
      console.log('✅ Médecin créé:', newDoctor[0]);
    }

    // Ajouter des rendez-vous pour les 12 derniers mois
    const appointmentDates = [
      new Date(2025, 0, 15), // janvier
      new Date(2025, 1, 10), // février
      new Date(2025, 2, 20), // mars
      new Date(2025, 3, 5),  // avril
      new Date(2025, 4, 12), // mai
      new Date(2025, 5, 8),  // juin
      new Date(2025, 6, 18), // juillet
      new Date(2025, 7, 25), // août
      new Date(2025, 8, 14), // septembre
      new Date(2025, 9, 9),  // octobre
      new Date(2025, 10, 3), // novembre
      new Date(2025, 11, 28), // décembre
      new Date(2026, 0, 10), // janvier 2026
    ];

    const statuses = ['accepté', 'en attente', 'accepté'];
    
    for (let i = 0; i < appointmentDates.length; i++) {
      const appointment = await db.insert(appointments).values({
        patientId,
        doctorId,
        appointmentDate: appointmentDates[i],
        status: statuses[i % statuses.length],
        notes: `Consultation de suivi - Rendez-vous ${i + 1}`,
      }).returning();
      console.log(`✅ Rendez-vous ${i + 1} créé:`, appointment[0].appointmentDate);
    }

    // Ajouter des dossiers médicaux
    const recordTypes = [
      'Consultation générale',
      'Bilan sanguin',
      'Examen cardiaque',
      'Consultation dentaire',
      'Radiographie poumon',
      'Bilan thyroïde',
      'Examen dermatologique',
      'Consultation nutritionniste',
      'Visite de suivi',
      'Examen ophthalmologique',
    ];

    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 10);
      
      const record = await db.insert(medicalRecords).values({
        patientId,
        doctorId,
        recordType: recordTypes[i],
        notes: `Notes pour ${recordTypes[i]} - Résultats normaux`,
        createdAt: date,
      }).returning();
      console.log(`✅ Dossier médical ${i + 1} créé:`, record[0].recordType);
    }

    // Ajouter des prescriptions avec diagnostics
    const diagnoses = [
      { name: 'Hypertension', medications: ['Lisinopril 10mg', 'Amlodipine 5mg'] },
      { name: 'Diabète type 2', medications: ['Metformine 500mg', 'Glibenclamide 5mg'] },
      { name: 'Infection respiratoire', medications: ['Amoxicilline 500mg', 'Paracétamol 500mg'] },
      { name: 'Arthrite', medications: ['Ibuprofène 400mg', 'Diclofénac 50mg'] },
      { name: 'Cholestérol élevé', medications: ['Atorvastatine 20mg', 'Ezetimibe 10mg'] },
    ];

    for (let i = 0; i < diagnoses.length; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      for (let j = 0; j < 2; j++) {
        const prescription = await db.insert(prescriptions).values({
          patientId,
          doctorId,
          diagnosis: diagnoses[i].name,
          medications: JSON.stringify(diagnoses[i].medications), // Convertir en JSON string
          dosage: 'Voir détails',
          startDate: date,
          endDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          createdAt: date,
        }).returning();
        console.log(`✅ Prescription ${i + 1}.${j + 1} créée:`, diagnoses[i].name);
      }
    }

    console.log('\n✅ Toutes les données de test ont été ajoutées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données:', error);
    process.exit(1);
  }
}

addTestData();
