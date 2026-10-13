const { eq, sql } = require('drizzle-orm');
const { appointments, patients, doctors, notifications } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

const getAllAppointments = async (req, res) => {
  try {
    let query = db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate,
      proposedDate: appointments.proposedDate,
      proposedBy: appointments.proposedBy,
      status: appointments.status,
      notes: appointments.notes,
      rejectionReason: appointments.rejectionReason,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialty: doctors.specialty,
    })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

    // Filter based on user role - support multi-roles
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isPatient = userRoles.includes('patient');
    const isDoctor = userRoles.includes('doctor');
    const isAdmin = userRoles.includes('admin');
    
    if (isPatient && !isDoctor && !isAdmin) {
      // Patient uniquement voit ses propres rendez-vous
      query = query.where(eq(appointments.patientId, req.user.sub));
    } else if (isDoctor && !isPatient && !isAdmin) {
      // Médecin uniquement voit ses rendez-vous
      query = query.where(eq(appointments.doctorId, req.user.sub));
    } else if ((isPatient && isDoctor) && !isAdmin) {
      // Utilisateur avec les deux rôles voit ses rendez-vous en tant que patient ET médecin
      query = query.where(
        sql`${appointments.patientId} = ${req.user.sub} OR ${appointments.doctorId} = ${req.user.sub}`
      );
    }
    // Admin voit tout

    const allAppointments = await query;
    res.json(allAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      patient: {
        firstName: patients.firstName,
        lastName: patients.lastName,
      },
      doctor: {
        firstName: doctors.firstName,
        lastName: doctors.lastName,
        specialty: doctors.specialty,
      },
    })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);
    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json(appointment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, notes } = req.body;
  try {
    let appointmentData = {
      appointmentDate: new Date(appointmentDate),
      notes,
    };

    // Support multi-roles
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isPatient = userRoles.includes('patient');
    const isDoctor = userRoles.includes('doctor');
    const isAdmin = userRoles.includes('admin');

    if (isPatient && !isDoctor && !isAdmin) {
      // Patient crée un rendez-vous pour lui-même
      appointmentData.patientId = req.user.sub;
      appointmentData.doctorId = doctorId;
    } else if (isDoctor && !isPatient && !isAdmin) {
      // Médecin crée un rendez-vous pour un patient
      appointmentData.patientId = patientId;
      appointmentData.doctorId = req.user.sub;
    } else if (isAdmin || (isPatient && isDoctor)) {
      // Admin ou utilisateur avec les deux rôles peut spécifier les deux
      appointmentData.patientId = patientId;
      appointmentData.doctorId = doctorId;
    }

    const newAppointment = await db.insert(appointments).values(appointmentData).returning();

    // Créer des notifications selon qui crée le rendez-vous
    if (isPatient && !isAdmin) {
      // Si un patient crée le RDV, notifier le médecin
      const patientInfo = await db.select({
        firstName: patients.firstName,
        lastName: patients.lastName
      })
        .from(patients)
        .where(eq(patients.id, appointmentData.patientId))
        .limit(1);

      if (patientInfo.length > 0) {
        await db.insert(notifications).values({
          userId: appointmentData.doctorId,
          title: 'Nouvelle demande de rendez-vous',
          message: `${patientInfo[0].firstName} ${patientInfo[0].lastName} a pris un rendez-vous avec vous le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${new Date(appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'appointment_created',
          relatedId: newAppointment[0].id
        });
      }
    } else if ((isDoctor || isAdmin) && !isPatient) {
      // Si un médecin ou admin crée le RDV, notifier le patient
      const doctorInfo = await db.select({
        firstName: doctors.firstName,
        lastName: doctors.lastName
      })
        .from(doctors)
        .where(eq(doctors.id, appointmentData.doctorId))
        .limit(1);

      if (doctorInfo.length > 0) {
        await db.insert(notifications).values({
          userId: appointmentData.patientId,
          title: 'Nouveau rendez-vous programmé',
          message: `${isAdmin ? 'L\'administration' : 'Dr. ' + doctorInfo[0].firstName + ' ' + doctorInfo[0].lastName} vous a programmé un rendez-vous avec Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${new Date(appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'appointment_created',
          relatedId: newAppointment[0].id
        });
      }
    }

    // Notifier les admins si c'est un patient ou un médecin qui crée
    if (!isAdmin) {
      await notifyAdmins({
        title: 'Nouveau rendez-vous',
        message: `Un nouveau rendez-vous a été créé pour le ${new Date(appointmentDate).toLocaleDateString('fr-FR')}.`,
        type: 'appointment_created',
        relatedId: newAppointment[0].id
      });
    }

    res.status(201).json(newAppointment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { patientId, doctorId, appointmentDate, status, notes } = req.body;
  try {
    const updatedAppointment = await db.update(appointments)
      .set({
        patientId,
        doctorId,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();
    if (updatedAppointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json(updatedAppointment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAppointment = await db.delete(appointments).where(eq(appointments.id, parseInt(id))).returning();
    if (deletedAppointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    res.json({ message: 'Rendez-vous supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Accepter un rendez-vous (médecin uniquement)
const acceptAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier que le rendez-vous appartient au médecin connecté
    const appointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (appointment[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedAppointment = await db.update(appointments)
      .set({
        status: 'accepté',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    // Récupérer les informations du patient et du médecin pour les notifications
    const patientInfo = await db.select({
      firstName: patients.firstName,
      lastName: patients.lastName
    })
      .from(patients)
      .where(eq(patients.id, appointment[0].patientId))
      .limit(1);

    const doctorInfo = await db.select({
      firstName: doctors.firstName,
      lastName: doctors.lastName
    })
      .from(doctors)
      .where(eq(doctors.id, req.user.sub))
      .limit(1);

    // Créer une notification pour le patient
    if (patientInfo.length > 0 && doctorInfo.length > 0) {
      await db.insert(notifications).values({
        userId: appointment[0].patientId,
        title: 'Rendez-vous accepté',
        message: `Votre rendez-vous avec Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a été accepté.`,
        type: 'appointment_accepted',
        relatedId: parseInt(id)
      });

      // Notifier les admins
      await notifyAdmins({
        title: 'Rendez-vous accepté',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a accepté le rendez-vous de ${patientInfo[0].firstName} ${patientInfo[0].lastName}.`,
        type: 'appointment_accepted',
        relatedId: parseInt(id)
      });
    }

    res.json({
      message: 'Rendez-vous accepté avec succès',
      appointment: updatedAppointment[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Refuser un rendez-vous (médecin uniquement)
const rejectAppointment = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  try {
    // Vérifier que le rendez-vous appartient au médecin connecté
    const appointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (appointment[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedAppointment = await db.update(appointments)
      .set({
        status: 'refusé',
        rejectionReason: rejectionReason || 'Non disponible',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    // Récupérer les informations du patient et du médecin pour les notifications
    const patientInfo = await db.select({
      firstName: patients.firstName,
      lastName: patients.lastName
    })
      .from(patients)
      .where(eq(patients.id, appointment[0].patientId))
      .limit(1);

    const doctorInfo = await db.select({
      firstName: doctors.firstName,
      lastName: doctors.lastName
    })
      .from(doctors)
      .where(eq(doctors.id, req.user.sub))
      .limit(1);

    // Créer une notification pour le patient
    if (patientInfo.length > 0 && doctorInfo.length > 0) {
      await db.insert(notifications).values({
        userId: appointment[0].patientId,
        title: 'Rendez-vous refusé',
        message: `Votre rendez-vous avec Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a été refusé. Raison: ${rejectionReason || 'Non disponible'}.`,
        type: 'appointment_rejected',
        relatedId: parseInt(id)
      });

      // Notifier les admins
      await notifyAdmins({
        title: 'Rendez-vous refusé',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a refusé le rendez-vous de ${patientInfo[0].firstName} ${patientInfo[0].lastName}.`,
        type: 'appointment_rejected',
        relatedId: parseInt(id)
      });
    }

    res.json({
      message: 'Rendez-vous refusé',
      appointment: updatedAppointment[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Proposer une nouvelle date (médecin uniquement)
const proposeNewDate = async (req, res) => {
  const { id } = req.params;
  const { proposedDate } = req.body;

  try {
    // Vérifier que le rendez-vous appartient au médecin connecté
    const appointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (appointment[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedAppointment = await db.update(appointments)
      .set({
        proposedDate: new Date(proposedDate),
        status: 'date_proposée',
        proposedBy: 'doctor',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    // Créer une notification pour le patient
    await db.insert(notifications).values({
      userId: appointment[0].patientId,
      title: 'Nouvelle date proposée',
      message: `Dr. ${appointment[0].doctorFirstName} ${appointment[0].doctorLastName} vous propose une nouvelle date: ${new Date(proposedDate).toLocaleDateString('fr-FR')}.`,
      type: 'appointment_date_proposed',
      relatedId: parseInt(id)
    });

    res.json({
      message: 'Nouvelle date proposée au patient',
      appointment: updatedAppointment[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Accepter la date proposée (patient ou médecin)
const acceptProposedDate = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur est concerné par ce RDV
    const isPatient = req.user.role === 'patient' && appointment[0].patientId === req.user.sub;
    const isDoctor = req.user.role === 'doctor' && appointment[0].doctorId === req.user.sub;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Le patient accepte la date proposée par le médecin, ou vice versa
    const updatedAppointment = await db.update(appointments)
      .set({
        appointmentDate: appointment[0].proposedDate,
        proposedDate: null,
        proposedBy: null,
        status: 'accepté',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Date acceptée avec succès',
      appointment: updatedAppointment[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Proposer une contre-date (patient uniquement)
const proposeCounterDate = async (req, res) => {
  const { id } = req.params;
  const { proposedDate } = req.body;

  try {
    const appointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (appointment[0].patientId !== req.user.sub) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const updatedAppointment = await db.update(appointments)
      .set({
        proposedDate: new Date(proposedDate),
        status: 'date_proposée',
        proposedBy: 'patient',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    // Créer une notification pour le médecin
    await db.insert(notifications).values({
      userId: appointment[0].doctorId,
      title: 'Nouvelle date proposée par patient',
      message: `Votre patient ${appointment[0].patientFirstName} ${appointment[0].patientLastName} propose une nouvelle date: ${new Date(proposedDate).toLocaleDateString('fr-FR')}.`,
      type: 'appointment_date_proposed',
      relatedId: parseInt(id)
    });

    res.json({
      message: 'Nouvelle date proposée au médecin',
      appointment: updatedAppointment[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  acceptAppointment,
  rejectAppointment,
  proposeNewDate,
  acceptProposedDate,
  proposeCounterDate
};