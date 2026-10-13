const { eq } = require('drizzle-orm');
const { appointments, medicalRecords, prescriptions } = require('../database/schema');
const db = require('./src/config/database');

async function addRealisticStatsData() {
  try {
    console.log('Ajout de données réalistes pour les statistiques...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    // Rendez-vous pour aujourd'hui (acceptés)
    const todayAppointments = [
      {
        patientId: 3, // patient user
        doctorId: 2,  // doctor user
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
        notes: 'Consultation de routine',
        status: 'accepté'
      },
      {
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30, 0),
        notes: 'Suivi médical',
        status: 'accepté'
      },
      {
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0),
        notes: 'Consultation urgence',
        status: 'accepté'
      }
    ];

    // Rendez-vous pour cette semaine
    const weekAppointments = [
      {
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(weekAgo.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 jours dans le passé
        notes: 'Contrôle mensuel',
        status: 'accepté'
      },
      {
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(weekAgo.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 jours dans le passé
        notes: 'Consultation spécialisée',
        status: 'accepté'
      },
      {
        patientId: 3,
        doctorId: 2,
        appointmentDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // dans 2 jours
        notes: 'Rendez-vous de suivi',
        status: 'prévu'
      }
    ];

    // Dossiers médicaux pour ce mois
    const monthRecords = [
      {
        patientId: 3,
        doctorId: 2,
        diagnosis: 'Hypertension artérielle',
        treatment: 'Médicaments antihypertenseurs',
        prescription: 'Amlodipine 5mg - 1cp/jour',
        notes: 'Patient stable, suivi régulier nécessaire'
      },
      {
        patientId: 3,
        doctorId: 2,
        diagnosis: 'Grippe saisonnière',
        treatment: 'Repos et médicaments symptomatiques',
        prescription: 'Paracétamol 500mg - 3cp/jour si fièvre',
        notes: 'Récupération en cours'
      },
      {
        patientId: 3,
        doctorId: 2,
        diagnosis: 'Contrôle annuel',
        treatment: 'Rien de particulier',
        prescription: 'Suppléments vitaminiques',
        notes: 'Bonne santé générale'
      }
    ];

    // Prescriptions pour aujourd'hui
    const todayPrescriptions = [
      {
        patientId: 3,
        doctorId: 2,
        medications: 'Amlodipine 5mg - 1 comprimé par jour pendant 30 jours',
        instructions: 'Prendre le matin avec un verre d\'eau'
      },
      {
        patientId: 3,
        doctorId: 2,
        medications: 'Paracétamol 500mg - 1 comprimé toutes les 6 heures si nécessaire',
        instructions: 'Maximum 3g par jour'
      }
    ];

    // Insérer les données
    console.log('Ajout des rendez-vous...');
    for (const apt of [...todayAppointments, ...weekAppointments]) {
      await db.insert(appointments).values(apt);
    }

    console.log('Ajout des dossiers médicaux...');
    for (const record of monthRecords) {
      await db.insert(medicalRecords).values(record);
    }

    console.log('Ajout des prescriptions...');
    for (const prescription of todayPrescriptions) {
      await db.insert(prescriptions).values(prescription);
    }

    console.log('Données réalistes ajoutées avec succès !');

    // Vérifier les totaux
    const totalAppointments = await db.select().from(appointments).where(eq(appointments.doctorId, 2));
    const totalRecords = await db.select().from(medicalRecords).where(eq(medicalRecords.doctorId, 2));
    const totalPrescriptions = await db.select().from(prescriptions).where(eq(prescriptions.doctorId, 2));

    console.log(`Total rendez-vous: ${totalAppointments.length}`);
    console.log(`Total dossiers médicaux: ${totalRecords.length}`);
    console.log(`Total prescriptions: ${totalPrescriptions.length}`);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addRealisticStatsData();