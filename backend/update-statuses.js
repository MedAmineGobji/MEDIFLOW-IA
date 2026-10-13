const { eq } = require('drizzle-orm');
const { appointments } = require('../database/schema');
const db = require('./src/config/database');

async function updateStatuses() {
  try {
    console.log('Mise à jour des statuts...');

    // Mettre à jour tous les statuts 'scheduled' vers 'prévu'
    const result = await db.update(appointments)
      .set({ status: 'prévu' })
      .where(eq(appointments.status, 'scheduled'));

    console.log('Statuts mis à jour avec succès');

    // Vérifier les statuts actuels
    const allAppointments = await db.select().from(appointments);
    console.log('Statuts actuels:');
    allAppointments.forEach(apt => {
      console.log(`ID: ${apt.id}, Status: ${apt.status}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

updateStatuses();