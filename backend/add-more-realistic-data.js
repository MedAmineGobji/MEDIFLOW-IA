const { eq, sql } = require('drizzle-orm');
const { appointments, medicalRecords, prescriptions } = require('../database/schema');
const db = require('./src/config/database');

async function addMoreRealisticData() {
  try {
    console.log('Ajout de données supplémentaires réalistes...');

    const today = new Date();

    // Ajouter des rendez-vous pour les derniers jours
    const recentAppointments = [
      // Hier
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0, 0),
        notes: 'Consultation de suivi',
        status: 'accepté'
      },
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 14, 30, 0),
        notes: 'Contrôle de routine',
        status: 'accepté'
      },
      // Avant-hier
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 15, 0),
        notes: 'Consultation urgente',
        status: 'accepté'
      },
      // Il y a 3 jours
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 11, 0, 0),
        notes: 'Bilan de santé',
        status: 'accepté'
      },
      // Il y a 5 jours
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 15, 45, 0),
        notes: 'Consultation spécialisée',
        status: 'accepté'
      }
    ];

    // Ajouter des dossiers médicaux pour ce mois
    const monthMedicalRecords = [
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Diabète de type 2',
        treatment: 'Régime alimentaire strict et médicaments',
        prescription: 'Metformine 500mg - 2cp/jour',
        notes: 'Suivi glycémique régulier nécessaire'
      },
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Asthme allergique',
        treatment: 'Traitement de fond et éviction allergènes',
        prescription: 'Seretide 250/25 - 2 inhalations/jour',
        notes: 'Amélioration notable avec le traitement'
      },
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Dépression légère',
        treatment: 'Thérapie cognitivo-comportementale',
        prescription: 'Paroxétine 20mg - 1cp/jour',
        notes: 'Suivi psychiatrique recommandé'
      },
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Arthrose cervicale',
        treatment: 'Kinésithérapie et antalgiques',
        prescription: 'Ibuprofène 400mg - 1cp/8h si douleur',
        notes: 'Rééducation fonctionnelle en cours'
      }
    ];

    // Ajouter des prescriptions pour aujourd'hui et hier
    const recentPrescriptions = [
      // Aujourd'hui
      {
        patientId: 1,
        doctorId: 14,
        medications: 'Amoxicilline 500mg - 1 comprimé 3 fois par jour pendant 7 jours\nIbuprofène 400mg - 1 comprimé toutes les 8 heures si douleur',
        instructions: 'Prendre l\'antibiotique jusqu\'au bout même si amélioration'
      },
      // Hier
      {
        patientId: 1,
        doctorId: 14,
        medications: 'Oméprazole 20mg - 1 gélule par jour pendant 4 semaines\nDiazepam 5mg - 1 comprimé le soir si anxiété',
        instructions: 'Prendre à jeun le matin pour l\'oméprazole'
      }
    ];

    console.log('Ajout des rendez-vous supplémentaires...');
    for (const apt of recentAppointments) {
      await db.insert(appointments).values(apt);
    }

    console.log('Ajout des dossiers médicaux supplémentaires...');
    for (const record of monthMedicalRecords) {
      await db.insert(medicalRecords).values(record);
    }

    console.log('Ajout des prescriptions supplémentaires...');
    for (const prescription of recentPrescriptions) {
      await db.insert(prescriptions).values(prescription);
    }

    console.log('✅ Données supplémentaires ajoutées avec succès !');

    // Statistiques finales
    const doctorId = 14;
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayAppointments = await db.select().from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .where(sql`${appointments.appointmentDate} >= ${startOfToday} AND ${appointments.appointmentDate} < ${new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)} AND ${appointments.status} = 'accepté'`);

    const weekAppointments = await db.select().from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .where(sql`${appointments.appointmentDate} >= ${startOfWeek}`);

    const monthRecords = await db.select().from(medicalRecords)
      .where(eq(appointments.doctorId, doctorId))
      .where(sql`${medicalRecords.createdAt} >= ${startOfMonth}`);

    const todayPrescriptions = await db.select().from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .where(sql`${prescriptions.createdAt} >= ${startOfToday} AND ${prescriptions.createdAt} < ${new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)}`);

    console.log('\n📊 Statistiques après ajout:');
    console.log(`Patients aujourd'hui: ${todayAppointments.length}`);
    console.log(`Rendez-vous cette semaine: ${weekAppointments.length}`);
    console.log(`Dossiers médicaux ce mois: ${monthRecords.length}`);
    console.log(`Prescriptions aujourd'hui: ${todayPrescriptions.length}`);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addMoreRealisticData();