const { eq, and, gte, lte, count, sql } = require('drizzle-orm');
const { doctors, appointments, medicalRecords, prescriptions, patients, users } = require('../../../database/schema');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await db.select().from(doctors);
    res.json(allDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await db.select().from(doctors).where(eq(doctors.id, parseInt(id))).limit(1);
    if (doctor.length === 0) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }
    res.json(doctor[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createDoctor = async (req, res) => {
  const { firstName, lastName, email, phone, specialty, password } = req.body;
  try {
    // Check if email already exists
    const existingDoctor = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1);
    if (existingDoctor.length > 0) {
      return res.status(400).json({ message: 'Un médecin avec cet email existe déjà' });
    }

    // Create the doctor record
    const newDoctor = await db.insert(doctors).values({
      firstName,
      lastName,
      email,
      phone,
      specialty,
    }).returning();

    // If password is provided, create a user account for this doctor
    if (password) {
      try {
        // Check if user already exists for this email
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!existingUser.length > 0) {
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Create user account
          await db.insert(users).values({
            email,
            passwordHash: hashedPassword,
            role: 'doctor',
          });
        }
      } catch (userError) {
        console.error('Erreur lors de la création du compte utilisateur:', userError);
        // Don't fail the doctor creation if user account creation fails
      }
    }

    res.status(201).json(newDoctor[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, specialty, password } = req.body;
  const doctorId = parseInt(id);
  
  try {
    const updatedDoctor = await db.update(doctors)
      .set({
        firstName,
        lastName,
        email,
        phone,
        specialty,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, doctorId))
      .returning();
    
    if (updatedDoctor.length === 0) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    // If password is provided, update the user account password
    if (password) {
      try {
        // Get the current doctor's email to find the user account
        const oldEmail = updatedDoctor[0].email;
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user account - find by the doctor's email
        const userUpdate = await db.update(users)
          .set({
            passwordHash: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(users.email, oldEmail))
          .returning();
        
        // If user doesn't exist, create one
        if (userUpdate.length === 0) {
          try {
            await db.insert(users).values({
              email: oldEmail,
              passwordHash: hashedPassword,
              role: 'doctor',
            });
          } catch (createError) {
            console.error('Erreur lors de la création du compte utilisateur:', createError);
          }
        }
      } catch (userError) {
        console.error('Erreur lors de la mise à jour du mot de passe:', userError);
        // Don't fail the doctor update if password update fails
      }
    }

    res.json(updatedDoctor[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  const doctorId = parseInt(id);
  try {
    // Check if doctor exists
    const doctor = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
    if (doctor.length === 0) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    // Get all appointments for this doctor
    const doctorAppointments = await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));

    // If there are appointments, we need to handle them
    if (doctorAppointments.length > 0) {
      // Option 1: Delete related appointments, medical records, and prescriptions
      // Delete prescriptions first (they reference appointments)
      await db.delete(prescriptions).where(eq(prescriptions.doctorId, doctorId));
      
      // Delete medical records
      await db.delete(medicalRecords).where(eq(medicalRecords.doctorId, doctorId));
      
      // Delete appointments
      await db.delete(appointments).where(eq(appointments.doctorId, doctorId));
    }

    // Now delete the doctor
    const deletedDoctor = await db.delete(doctors).where(eq(doctors.id, doctorId)).returning();
    
    res.json({ 
      message: 'Médecin et ses données associées ont été supprimés avec succès',
      appointmentsDeleted: doctorAppointments.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression du médecin' });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.sub;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Patients aujourd'hui (rendez-vous confirmés)
    const patientsTodayResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDate, startOfToday),
        lte(appointments.appointmentDate, endOfToday),
        eq(appointments.status, 'accepté')
      ));

    // Rendez-vous cette semaine
    const appointmentsThisWeekResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDate, startOfWeek),
        lte(appointments.appointmentDate, endOfWeek)
      ));

    // Dossiers médicaux ce mois
    const medicalRecordsThisMonthResult = await db.select({ count: count() })
      .from(medicalRecords)
      .where(and(
        eq(medicalRecords.doctorId, doctorId),
        gte(medicalRecords.createdAt, startOfMonth)
      ));

    // Prescriptions aujourd'hui
    const prescriptionsTodayResult = await db.select({ count: count() })
      .from(prescriptions)
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        gte(prescriptions.createdAt, startOfToday),
        lte(prescriptions.createdAt, endOfToday)
      ));

    // Nombre total de patients uniques
    const uniquePatientsResult = await db.select({
      count: sql`COUNT(DISTINCT ${appointments.patientId})`
    })
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));

    // Rendez-vous en attente
    const pendingAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, 'en attente')
      ));

    const stats = {
      patientsToday: patientsTodayResult[0]?.count || 0,
      appointmentsThisWeek: appointmentsThisWeekResult[0]?.count || 0,
      medicalRecordsThisMonth: medicalRecordsThisMonthResult[0]?.count || 0,
      prescriptionsToday: prescriptionsTodayResult[0]?.count || 0,
      totalUniquePatients: uniquePatientsResult[0]?.count || 0,
      pendingAppointments: pendingAppointmentsResult[0]?.count || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getDoctorStats };