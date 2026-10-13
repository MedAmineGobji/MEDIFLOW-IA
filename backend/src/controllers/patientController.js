const { eq, and, gte, lte, count, sql } = require('drizzle-orm');
const { patients, appointments, medicalRecords, prescriptions, doctors, users } = require('../../../database/schema');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllPatients = async (req, res) => {
  try {
    const allPatients = await db.select().from(patients);
    res.json(allPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await db.select().from(patients).where(eq(patients.id, parseInt(id))).limit(1);
    if (patient.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json(patient[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createPatient = async (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, address, bloodGroup, allergies, password } = req.body;
  try {
    // Check if email already exists
    const existingPatient = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
    if (existingPatient.length > 0) {
      return res.status(400).json({ message: 'Un patient avec cet email existe déjà' });
    }

    // Create the patient record
    const newPatient = await db.insert(patients).values({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      bloodGroup,
      allergies,
    }).returning();

    // If password is provided, create a user account for this patient
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
            role: 'patient',
          });
        }
      } catch (userError) {
        console.error('Erreur lors de la création du compte utilisateur:', userError);
        // Don't fail the patient creation if user account creation fails
      }
    }

    res.status(201).json(newPatient[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, dateOfBirth, address, bloodGroup, allergies, password } = req.body;
  const patientId = parseInt(id);
  
  try {
    const updatedPatient = await db.update(patients)
      .set({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        bloodGroup,
        allergies,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientId))
      .returning();
    
    if (updatedPatient.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }

    // If password is provided, update the user account password
    if (password) {
      try {
        // Get the current patient's email to find the user account
        const oldEmail = updatedPatient[0].email;
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user account - find by the patient's email
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
              role: 'patient',
            });
          } catch (createError) {
            console.error('Erreur lors de la création du compte utilisateur:', createError);
          }
        }
      } catch (userError) {
        console.error('Erreur lors de la mise à jour du mot de passe:', userError);
        // Don't fail the patient update if password update fails
      }
    }

    res.json(updatedPatient[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPatient = await db.delete(patients).where(eq(patients.id, parseInt(id))).returning();
    if (deletedPatient.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json({ message: 'Patient supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user.sub;
    console.log('📊 Getting stats for patient ID:', patientId);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Rendez-vous totaux
    const totalAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(eq(appointments.patientId, patientId));

    // Rendez-vous passés (avant aujourd'hui)
    const pastAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        lte(appointments.appointmentDate, today)
      ));

    // Rendez-vous à venir (après aujourd'hui)
    const upcomingAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        gte(appointments.appointmentDate, startOfToday)
      ));

    // Rendez-vous acceptés
    const acceptedAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        eq(appointments.status, 'accepté')
      ));

    // Rendez-vous en attente
    const pendingAppointmentsResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        eq(appointments.status, 'en attente')
      ));

    // Dossiers médicaux
    const medicalRecordsResult = await db.select({ count: count() })
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId));

    // Prescriptions
    const prescriptionsResult = await db.select({ count: count() })
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));

    // Nombre de médecins consultés
    const uniqueDoctorsResult = await db.select({
      count: sql`COUNT(DISTINCT ${appointments.doctorId})`
    })
      .from(appointments)
      .where(eq(appointments.patientId, patientId));

    // Prochain rendez-vous
    const nextAppointmentResult = await db.select()
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        gte(appointments.appointmentDate, today)
      ))
      .orderBy(appointments.appointmentDate)
      .limit(1);

    // Récupérer les 12 derniers mois de rendez-vous pour le graphique
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const appointmentsByMonth = await db.select()
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        gte(appointments.appointmentDate, twelveMonthsAgo)
      ))
      .orderBy(appointments.appointmentDate);

    // Grouper par mois avec données complètes sur 12 mois
    const monthlyChartData = [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthNum = monthDate.getMonth();
      const count = appointmentsByMonth.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getFullYear() === monthDate.getFullYear() && aptDate.getMonth() === monthDate.getMonth();
      }).length;
      
      monthlyChartData.push({
        month: monthNames[monthNum],
        appointments: count,
        fullMonth: monthKey
      });
    }

    // Récupérer tous les diagnostics depuis les prescriptions avec détails
    const allPrescriptions = await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));

    // Extraire les diagnostics avec détails
    const diagnoses = [];
    const diagnosisMap = {};
    allPrescriptions.forEach(presc => {
      if (presc.diagnosis) {
        if (!diagnosisMap[presc.diagnosis]) {
          diagnosisMap[presc.diagnosis] = {
            name: presc.diagnosis,
            count: 0,
            medications: [],
            lastDate: presc.createdAt
          };
        }
        diagnosisMap[presc.diagnosis].count++;
        if (presc.medications) {
          diagnosisMap[presc.diagnosis].medications = presc.medications;
        }
        if (new Date(presc.createdAt) > new Date(diagnosisMap[presc.diagnosis].lastDate)) {
          diagnosisMap[presc.diagnosis].lastDate = presc.createdAt;
        }
      }
    });

    // Convertir en tableau et trier par date
    Object.values(diagnosisMap).forEach((diagnosis) => {
      diagnoses.push(diagnosis);
    });
    diagnoses.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

    // Récupérer les dossiers médicaux récents avec doctors info
    const recentRecords = await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(sql`${medicalRecords.createdAt} DESC`)
      .limit(10);

    // Récupérer tous les rendez-vous pour les statistiques détaillées
    const allAppointments = await db.select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(appointments.appointmentDate);

    // Calculer les tendances (rendez-vous acceptés vs totaux par mois)
    const appointmentTrendData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthNum = monthDate.getMonth();
      const monthYear = monthDate.getFullYear();
      
      const monthAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getFullYear() === monthYear && aptDate.getMonth() === monthNum;
      });
      
      const acceptedCount = monthAppointments.filter(apt => apt.status === 'accepté').length;
      
      appointmentTrendData.push({
        month: monthNames[monthNum],
        total: monthAppointments.length,
        accepted: acceptedCount,
        pending: monthAppointments.filter(apt => apt.status === 'en attente').length
      });
    }

    const stats = {
      totalAppointments: totalAppointmentsResult[0]?.count || 0,
      pastAppointments: pastAppointmentsResult[0]?.count || 0,
      upcomingAppointments: upcomingAppointmentsResult[0]?.count || 0,
      acceptedAppointments: acceptedAppointmentsResult[0]?.count || 0,
      pendingAppointments: pendingAppointmentsResult[0]?.count || 0,
      medicalRecords: medicalRecordsResult[0]?.count || 0,
      prescriptions: prescriptionsResult[0]?.count || 0,
      uniqueDoctors: uniqueDoctorsResult[0]?.count || 0,
      nextAppointment: nextAppointmentResult[0] || null,
      monthlyChartData: monthlyChartData,
      appointmentTrendData: appointmentTrendData,
      diagnoses: diagnoses,
      recentMedicalRecords: recentRecords
    };

    console.log('📊 Statistiques calculées:', {
      totalAppointments: stats.totalAppointments,
      diagnoses: stats.diagnoses.length,
      monthlyData: stats.monthlyChartData.length,
      trendData: stats.appointmentTrendData.length
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques patient:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.user.sub;
    const patient = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    
    if (patient.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    res.json(patient[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil patient:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.user.sub;
    const { firstName, lastName, email, phone, dateOfBirth, address, bloodGroup, allergies } = req.body;
    
    const updatedPatient = await db.update(patients)
      .set({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        bloodGroup,
        allergies,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientId))
      .returning();
    
    if (updatedPatient.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    res.json(updatedPatient[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil patient:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient, getPatientStats, getPatientProfile, updatePatientProfile };