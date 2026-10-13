const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { users, patients, doctors, admins, appointments, medicalRecords } = require('../database/schema');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Créer des utilisateurs avec hash des mots de passe
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedDoctorPassword = await bcrypt.hash('doctor123', 10);
    const hashedPatientPassword = await bcrypt.hash('patient123', 10);

    // Insérer utilisateurs
    await db.insert(users).values([
      { email: 'admin@mediflow.ai', passwordHash: hashedAdminPassword, role: 'admin' },
      { email: 'doctor@mediflow.ai', passwordHash: hashedDoctorPassword, role: 'doctor' },
      { email: 'patient@mediflow.ai', passwordHash: hashedPatientPassword, role: 'patient' },
    ]);

    // Récupérer les IDs des utilisateurs
    const userRecords = await db.select().from(users);
    const adminUser = userRecords.find(u => u.email === 'admin@mediflow.ai');
    const doctorUser = userRecords.find(u => u.email === 'doctor@mediflow.ai');
    const patientUser = userRecords.find(u => u.email === 'patient@mediflow.ai');

    // Insérer admin
    await db.insert(admins).values({
      id: adminUser.id,
      firstName: 'Admin',
      lastName: 'MediFlow',
      email: 'admin@mediflow.ai',
      phone: '+33123456789',
    });

    // Insérer médecin
    await db.insert(doctors).values({
      id: doctorUser.id,
      firstName: 'Dr. Marie',
      lastName: 'Dubois',
      email: 'doctor@mediflow.ai',
      phone: '+33123456790',
      specialty: 'Médecine générale',
    });

    // Insérer patient
    await db.insert(patients).values({
      id: patientUser.id,
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'patient@mediflow.ai',
      phone: '+33123456791',
      dateOfBirth: new Date('1985-05-15'),
      address: '123 Rue de la Santé, Paris',
    });

    // Récupérer les IDs des entités
    const patientRecords = await db.select().from(patients);
    const doctorRecords = await db.select().from(doctors);
    const patient = patientRecords[0];
    const doctor = doctorRecords[0];

    // Insérer rendez-vous
    await db.insert(appointments).values({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate: new Date('2024-01-15T10:00:00'),
      notes: 'Consultation de routine',
    });

    // Insérer dossier médical
    await db.insert(medicalRecords).values({
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosis: 'Hypertension légère',
      treatment: 'Régime alimentaire et exercice',
      prescription: 'IEC 5mg - 1 comprimé par jour',
      notes: 'Patient en bonne santé générale',
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seedDatabase();