const { eq, count, sql, gte, and, desc } = require('drizzle-orm');
const { patients, doctors, appointments, medicalRecords, prescriptions, jobOffers, jobApplications, users, cvAnalyses, interviews } = require('../../../database/schema');
const db = require('../config/database');

const getGlobalStats = async (req, res) => {
  try {
    console.log('📊 Getting global stats for admin');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Compter tous les patients
    const totalPatients = await db.select({ count: count() }).from(patients);

    // Compter tous les médecins
    const totalDoctors = await db.select({ count: count() }).from(doctors);

    // Compter tous les rendez-vous
    const totalAppointments = await db.select({ count: count() }).from(appointments);

    // Rendez-vous par statut
    const acceptedAppointments = await db.select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, 'accepté'));

    const pendingAppointments = await db.select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, 'en attente'));

    const rejectedAppointments = await db.select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, 'refusé'));

    // Rendez-vous ce mois
    const appointmentsThisMonth = await db.select({ count: count() })
      .from(appointments)
      .where(gte(appointments.appointmentDate, startOfMonth));

    // Compter tous les dossiers médicaux
    const totalMedicalRecords = await db.select({ count: count() }).from(medicalRecords);

    // Compter toutes les prescriptions
    const totalPrescriptions = await db.select({ count: count() }).from(prescriptions);

    // Compter les offres d'emploi
    const totalJobOffers = await db.select({ count: count() }).from(jobOffers);
    const activeJobOffers = await db.select({ count: count() })
      .from(jobOffers)
      .where(eq(jobOffers.status, 'active'));

    // Compter les candidatures
    const totalApplications = await db.select({ count: count() }).from(jobApplications);

    // Compter les utilisateurs par rôle
    const adminUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));

    const patientUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, 'patient'));

    const doctorUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, 'doctor'));

    const hrUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, 'hrRecruiter'));

    const candidateUsers = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, 'candidate'));

    // Rendez-vous par mois (12 derniers mois)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const appointmentsByMonth = await db.select()
      .from(appointments)
      .where(gte(appointments.appointmentDate, twelveMonthsAgo))
      .orderBy(appointments.appointmentDate);

    // Grouper par mois
    const monthlyData = [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthNum = monthDate.getMonth();
      const monthYear = monthDate.getFullYear();

      const count = appointmentsByMonth.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getFullYear() === monthYear && aptDate.getMonth() === monthNum;
      }).length;

      monthlyData.push({
        month: monthNames[monthNum],
        appointments: count
      });
    }

    // Top 5 médecins par nombre de rendez-vous
    const topDoctorsData = await db.select({
      doctorId: appointments.doctorId,
      count: sql`COUNT(*)::int`,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      specialty: doctors.specialty
    })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .groupBy(appointments.doctorId, doctors.firstName, doctors.lastName, doctors.specialty)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5);

    const stats = {
      totalPatients: totalPatients[0]?.count || 0,
      totalDoctors: totalDoctors[0]?.count || 0,
      totalAppointments: totalAppointments[0]?.count || 0,
      acceptedAppointments: acceptedAppointments[0]?.count || 0,
      pendingAppointments: pendingAppointments[0]?.count || 0,
      rejectedAppointments: rejectedAppointments[0]?.count || 0,
      appointmentsThisMonth: appointmentsThisMonth[0]?.count || 0,
      totalMedicalRecords: totalMedicalRecords[0]?.count || 0,
      totalPrescriptions: totalPrescriptions[0]?.count || 0,
      totalJobOffers: totalJobOffers[0]?.count || 0,
      activeJobOffers: activeJobOffers[0]?.count || 0,
      totalApplications: totalApplications[0]?.count || 0,
      usersByRole: {
        admin: adminUsers[0]?.count || 0,
        patient: patientUsers[0]?.count || 0,
        doctor: doctorUsers[0]?.count || 0,
        hrRecruiter: hrUsers[0]?.count || 0,
        candidate: candidateUsers[0]?.count || 0,
      },
      monthlyData: monthlyData,
      topDoctors: topDoctorsData
    };

    console.log('📊 Global stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getRecentNotifications = async (req, res) => {
  try {
    console.log('🔔 Getting recent notifications for admin');

    const notifications = [];
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Nouveaux rendez-vous en attente (derniers 3 jours)
    console.log('  - Fetching pending appointments...');
    const pendingAppointmentsData = await db.select({
      id: appointments.id,
      date: appointments.appointmentDate,
      createdAt: appointments.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(
        eq(appointments.status, 'en attente'),
        gte(appointments.createdAt, threeDaysAgo)
      ))
      .orderBy(desc(appointments.createdAt))
      .limit(5);

    pendingAppointmentsData.forEach(apt => {
      notifications.push({
        id: `apt-${apt.id}`,
        type: 'appointment',
        title: 'Nouveau rendez-vous en attente',
        message: `${apt.patientFirstName} ${apt.patientLastName} avec Dr. ${apt.doctorFirstName} ${apt.doctorLastName}`,
        timestamp: apt.createdAt,
        icon: 'calendar',
        color: 'orange'
      });
    });

    // Nouvelles candidatures (derniers 3 jours)
    console.log('  - Fetching recent applications...');
    const recentApplications = await db.select({
      id: jobApplications.id,
      createdAt: jobApplications.createdAt,
      jobTitle: jobOffers.title,
      candidateFirstName: users.email, // Using email as name if no join to profile
    })
      .from(jobApplications)
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .leftJoin(users, eq(jobApplications.candidateUserId, users.id))
      .where(gte(jobApplications.createdAt, threeDaysAgo))
      .orderBy(desc(jobApplications.createdAt))
      .limit(5);

    recentApplications.forEach(app => {
      notifications.push({
        id: `app-${app.id}`,
        type: 'application',
        title: 'Nouvelle candidature',
        message: `Candidature reçue pour: ${app.jobTitle || 'un poste'} par ${app.candidateFirstName}`,
        timestamp: app.createdAt,
        icon: 'file',
        color: 'blue'
      });
    });

    // Nouveaux dossiers médicaux (derniers 3 jours)
    console.log('  - Fetching recent medical records...');
    const recentRecords = await db.select({
      id: medicalRecords.id,
      createdAt: medicalRecords.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .where(gte(medicalRecords.createdAt, threeDaysAgo))
      .limit(5);

    recentRecords.forEach(record => {
      notifications.push({
        id: `record-${record.id}`,
        type: 'record',
        title: 'Nouveau dossier médical',
        message: `Dr. ${record.doctorFirstName} ${record.doctorLastName} a ajouté un dossier pour ${record.patientFirstName} ${record.patientLastName}`,
        timestamp: record.createdAt,
        icon: 'file-text',
        color: 'cyan'
      });
    });

    // Nouvelles prescriptions (derniers 3 jours)
    console.log('  - Fetching recent prescriptions...');
    const recentPrescriptions = await db.select({
      id: prescriptions.id,
      createdAt: prescriptions.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(gte(prescriptions.createdAt, threeDaysAgo))
      .limit(5);

    recentPrescriptions.forEach(p => {
      notifications.push({
        id: `presc-${p.id}`,
        type: 'prescription',
        title: 'Nouvelle ordonnance',
        message: `Nouvelle prescription pour ${p.patientFirstName} ${p.patientLastName} par Dr. ${p.doctorFirstName} ${p.doctorLastName}`,
        timestamp: p.createdAt,
        icon: 'pill',
        color: 'purple'
      });
    });

    // Nouveaux patients (derniers 3 jours)
    console.log('  - Fetching recent patients...');
    const recentPatients = await db.select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      createdAt: patients.createdAt,
    })
      .from(patients)
      .where(gte(patients.createdAt, threeDaysAgo))
      .orderBy(desc(patients.createdAt))
      .limit(5);

    recentPatients.forEach(patient => {
      notifications.push({
        id: `patient-${patient.id}`,
        type: 'patient',
        title: 'Nouveau patient inscrit',
        message: `${patient.firstName} ${patient.lastName} a créé un compte`,
        timestamp: patient.createdAt,
        icon: 'user',
        color: 'green'
      });
    });

    // Nouveaux médecins (derniers 3 jours)
    console.log('  - Fetching recent doctors...');
    const recentDoctors = await db.select({
      id: doctors.id,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      specialty: doctors.specialty,
      createdAt: doctors.createdAt,
    })
      .from(doctors)
      .where(gte(doctors.createdAt, threeDaysAgo))
      .orderBy(desc(doctors.createdAt))
      .limit(5);

    recentDoctors.forEach(doctor => {
      notifications.push({
        id: `doctor-${doctor.id}`,
        type: 'doctor',
        title: 'Nouveau médecin inscrit',
        message: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty || 'Médecin'}`,
        timestamp: doctor.createdAt,
        icon: 'stethoscope',
        color: 'purple'
      });
    });

    // Nouveaux entretiens planifiés (derniers 3 jours)
    console.log('  - Fetching recent interviews...');
    const recentInterviews = await db.select({
      id: interviews.id,
      createdAt: interviews.createdAt,
      jobTitle: jobOffers.title,
      candidateFirstName: users.email,
    })
      .from(interviews)
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .leftJoin(users, eq(jobApplications.candidateUserId, users.id))
      .where(gte(interviews.createdAt, threeDaysAgo))
      .limit(5);

    recentInterviews.forEach(interview => {
      notifications.push({
        id: `interview-${interview.id}`,
        type: 'interview',
        title: 'Entretien planifié',
        message: `Nouvel entretien pour ${interview.jobTitle} avec ${interview.candidateFirstName}`,
        timestamp: interview.createdAt,
        icon: 'phone',
        color: 'blue'
      });
    });

    // Nouvelles analyses CV (derniers 3 jours)
    console.log('  - Fetching recent analyses...');
    const recentAnalyses = await db.select({
      id: cvAnalyses.id,
      createdAt: cvAnalyses.createdAt,
      recommandation: cvAnalyses.recommandation,
      score: cvAnalyses.score,
      jobTitle: jobOffers.title,
    })
      .from(cvAnalyses)
      .leftJoin(jobApplications, eq(cvAnalyses.applicationId, jobApplications.id))
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .where(gte(cvAnalyses.createdAt, threeDaysAgo))
      .limit(5);

    recentAnalyses.forEach(analysis => {
      notifications.push({
        id: `analysis-${analysis.id}`,
        type: 'analysis',
        title: 'Analyse IA terminée',
        message: `Verdict: ${analysis.recommandation} (${analysis.score}/100) pour ${analysis.jobTitle}`,
        timestamp: analysis.createdAt,
        icon: 'brain',
        color: 'pink'
      });
    });

    // Rendez-vous acceptés récemment (derniers 3 jours)
    console.log('  - Fetching accepted appointments...');
    const acceptedAppointments = await db.select({
      id: appointments.id,
      updatedAt: appointments.updatedAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
    })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(
        eq(appointments.status, 'accepté'),
        gte(appointments.updatedAt, threeDaysAgo)
      ))
      .orderBy(desc(appointments.updatedAt))
      .limit(3);

    acceptedAppointments.forEach(apt => {
      notifications.push({
        id: `apt-accepted-${apt.id}`,
        type: 'appointment-accepted',
        title: 'Rendez-vous accepté',
        message: `Dr. ${apt.doctorFirstName} ${apt.doctorLastName} a accepté le rendez-vous de ${apt.patientFirstName} ${apt.patientLastName}`,
        timestamp: apt.updatedAt,
        icon: 'check',
        color: 'green'
      });
    });

    console.log('🔔 Sorting notifications...');
    // Trier toutes les notifications par date (plus récentes d'abord)
    notifications.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });

    // Limiter à 15 notifications
    const limitedNotifications = notifications.slice(0, 15);

    console.log(`🔔 Found ${limitedNotifications.length} recent notifications`);
    res.json(limitedNotifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications',
      error: error.message,
      stack: error.stack,
      details: error
    });
  }
};

module.exports = { getGlobalStats, getRecentNotifications };
