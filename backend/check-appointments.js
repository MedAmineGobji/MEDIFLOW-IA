const { eq, isNull } = require('drizzle-orm');
const { appointments, patients, doctors } = require('../database/schema');
const db = require('./src/config/database');

async function fixAppointments() {
  try {
    console.log('Fixing appointments with null patientId...');

    // Delete appointments with null patientId using isNull
    await db.delete(appointments).where(isNull(appointments.patientId));

    console.log('Deleted invalid appointments');

    // Check remaining appointments
    const allAppointments = await db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
      notes: appointments.notes,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

    console.log('Remaining appointments:', allAppointments.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixAppointments();