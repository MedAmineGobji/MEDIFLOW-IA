const { eq, sql } = require('drizzle-orm');
const { appointments, medicalRecords, prescriptions } = require('../database/schema');
const db = require('./src/config/database');

async function addPatientRealisticData() {
  try {
    console.log('Ajout de données réalistes pour les statistiques patient...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    // Rendez-vous passés (pour montrer l'historique)
    const pastAppointments = [
      {
        patientId: 1, // patient existant
        doctorId: 14, // médecin existant
        appointmentDate: lastMonth,
        notes: 'Consultation de routine - bilan annuel',
        status: 'accepté'
      },
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: lastWeek,
        notes: 'Suivi médical - contrôle tension',
        status: 'accepté'
      },
      {
        patientId: 1,
        doctorId: 2, // autre médecin
        appointmentDate: yesterday,
        notes: 'Consultation spécialisée',
        status: 'accepté'
      }
    ];

    // Rendez-vous à venir
    const upcomingAppointments = [
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // dans 3 jours
        notes: 'Contrôle post-traitement',
        status: 'accepté'
      },
      {
        patientId: 1,
        doctorId: 14,
        appointmentDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // dans 10 jours
        notes: 'Rendez-vous de suivi',
        status: 'en attente'
      }
    ];

    // Dossiers médicaux
    const medicalRecordsData = [
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Hypertension artérielle légère',
        treatment: 'Régime alimentaire équilibré, activité physique régulière',
        prescription: 'Contrôle tension artérielle mensuel',
        notes: 'Patient stable, bonne observance du traitement'
      },
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Contrôle annuel - bilan de santé',
        treatment: 'Vaccinations à jour, dépistage recommandé',
        prescription: 'Bilan sanguin complet',
        notes: 'Examen clinique normal, suivi régulier conseillé'
      },
      {
        patientId: 1,
        doctorId: 2,
        diagnosis: 'Consultation dermatologique',
        treatment: 'Crème hydratante, protection solaire',
        prescription: 'Photoprotection SPF 50',
        notes: 'Peau sensible, éviter exposition prolongée au soleil'
      },
      {
        patientId: 1,
        doctorId: 14,
        diagnosis: 'Grippe saisonnière',
        treatment: 'Repos, hydratation, médicaments symptomatiques',
        prescription: 'Paracétamol 500mg si fièvre, sirop pour la toux',
        notes: 'Récupération en cours, repos recommandé'
      }
    ];

    // Prescriptions
    const prescriptionsData = [
      {
        patientId: 1,
        doctorId: 14,
        medications: 'Paracétamol 500mg - 1 comprimé toutes les 6 heures si fièvre\nVitamine D3 1000UI - 1 comprimé par jour\nOméga 3 - 1 capsule par jour',
        instructions: 'Respecter les posologies. Ne pas dépasser 3g de paracétamol par jour.'
      },
      {
        patientId: 1,
        doctorId: 14,
        medications: 'Crème solaire SPF 50 - Appliquer généreusement avant toute exposition\nCrème hydratante - 2 applications par jour',
        instructions: 'Appliquer la crème solaire 15 minutes avant l\'exposition au soleil.'
      },
      {
        patientId: 1,
        doctorId: 2,
        medications: 'Bilan sanguin complet - NFS, glycémie, cholestérol, triglycérides\nÉchographie abdominale',
        instructions: 'À jeun pour le bilan sanguin. Prendre rendez-vous dans les 15 jours.'
      }
    ];

    // Insérer les données
    console.log('Ajout des rendez-vous passés...');
    for (const apt of pastAppointments) {
      await db.insert(appointments).values(apt);
    }

    console.log('Ajout des rendez-vous à venir...');
    for (const apt of upcomingAppointments) {
      await db.insert(appointments).values(apt);
    }

    console.log('Ajout des dossiers médicaux...');
    for (const record of medicalRecordsData) {
      await db.insert(medicalRecords).values(record);
    }

    console.log('Ajout des prescriptions...');
    for (const prescription of prescriptionsData) {
      await db.insert(prescriptions).values(prescription);
    }

    console.log('✅ Données réalistes ajoutées avec succès pour le patient !');

    // Vérifier les totaux
    const totalAppointments = await db.select().from(appointments).where(eq(appointments.patientId, 1));
    const totalRecords = await db.select().from(medicalRecords).where(eq(medicalRecords.patientId, 1));
    const totalPrescriptions = await db.select().from(prescriptions).where(eq(prescriptions.patientId, 1));

    console.log(`\n📊 Statistiques du patient:`);
    console.log(`Rendez-vous totaux: ${totalAppointments.length}`);
    console.log(`Dossiers médicaux: ${totalRecords.length}`);
    console.log(`Prescriptions: ${totalPrescriptions.length}`);

    // Calculer les statistiques
    const now = new Date();
    const pastAppointmentsCount = totalAppointments.filter(apt => new Date(apt.appointmentDate) < now).length;
    const upcomingAppointmentsCount = totalAppointments.filter(apt => new Date(apt.appointmentDate) >= now).length;
    const acceptedAppointmentsCount = totalAppointments.filter(apt => apt.status === 'accepté').length;
    const pendingAppointmentsCount = totalAppointments.filter(apt => apt.status === 'en attente').length;

    console.log(`Rendez-vous passés: ${pastAppointmentsCount}`);
    console.log(`Rendez-vous à venir: ${upcomingAppointmentsCount}`);
    console.log(`Rendez-vous acceptés: ${acceptedAppointmentsCount}`);
    console.log(`Rendez-vous en attente: ${pendingAppointmentsCount}`);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addPatientRealisticData();