const { eq } = require('drizzle-orm');
const { appointments } = require('../database/schema');
const db = require('./src/config/database');

async function addTestAppointments() {
  try {
    console.log('Ajout de rendez-vous de test...');

    const testAppointments = [
      {
        patientId: 1, // Assumant qu'il y a un patient avec ID 1
        doctorId: 2,  // Assumant qu'il y a un médecin avec ID 2
        appointmentDate: new Date('2026-01-20T10:00:00Z'),
        notes: 'Consultation générale',
        status: 'prévu'
      },
      {
        patientId: 1,
        doctorId: 2,
        appointmentDate: new Date('2026-01-25T14:30:00Z'),
        notes: 'Suivi médical',
        status: 'prévu'
      }
    ];

    for (const apt of testAppointments) {
      await db.insert(appointments).values(apt);
    }

    console.log('Rendez-vous de test ajoutés avec succès');

    // Vérifier les rendez-vous
    const allAppointments = await db.select().from(appointments);
    console.log('Total des rendez-vous:', allAppointments.length);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addTestAppointments();