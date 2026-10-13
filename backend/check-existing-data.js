const db = require('./src/config/database');
const { users, patients, doctors, appointments, medicalRecords, prescriptions } = require('../database/schema');

async function checkExistingData() {
  try {
    console.log('=== Vérification des données existantes ===');

    const allUsers = await db.select().from(users);
    console.log(`\nUtilisateurs (${allUsers.length}):`);
    allUsers.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    const allPatients = await db.select().from(patients);
    console.log(`\nPatients (${allPatients.length}):`);
    allPatients.forEach(patient => {
      console.log(`  ID: ${patient.id}, Name: ${patient.firstName} ${patient.lastName}`);
    });

    const allDoctors = await db.select().from(doctors);
    console.log(`\nMédecins (${allDoctors.length}):`);
    allDoctors.forEach(doctor => {
      console.log(`  ID: ${doctor.id}, Name: ${doctor.firstName} ${doctor.lastName}`);
    });

    const allAppointments = await db.select().from(appointments);
    console.log(`\nRendez-vous (${allAppointments.length}):`);
    allAppointments.forEach(apt => {
      console.log(`  ID: ${apt.id}, Patient: ${apt.patientId}, Doctor: ${apt.doctorId}, Date: ${apt.appointmentDate}, Status: ${apt.status}`);
    });

    const allRecords = await db.select().from(medicalRecords);
    console.log(`\nDossiers médicaux (${allRecords.length}):`);
    allRecords.forEach(record => {
      console.log(`  ID: ${record.id}, Patient: ${record.patientId}, Doctor: ${record.doctorId}`);
    });

    const allPrescriptions = await db.select().from(prescriptions);
    console.log(`\nPrescriptions (${allPrescriptions.length}):`);
    allPrescriptions.forEach(prescription => {
      console.log(`  ID: ${prescription.id}, Patient: ${prescription.patientId}, Doctor: ${prescription.doctorId}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

checkExistingData();