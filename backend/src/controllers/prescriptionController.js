const { eq, and, sql } = require('drizzle-orm');
const { prescriptions, appointments, patients, doctors, notifications } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

// Créer une ordonnance
const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medications, diagnosis, additionalNotes } = req.body;

    // Support des rôles multiples - vérifier que c'est bien un médecin
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isDoctor = userRoles.includes('doctor');
    
    if (!isDoctor) {
      return res.status(403).json({ message: 'Seuls les médecins peuvent créer des ordonnances' });
    }

    // Vérifier que le rendez-vous existe et appartient au médecin
    const appointment = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.doctorId, req.user.sub)
        )
      )
      .limit(1);

    if (!appointment.length) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    // Créer l'ordonnance
    const newPrescription = await db.insert(prescriptions).values({
      appointmentId,
      patientId: appointment[0].patientId,
      doctorId: req.user.sub,
      medications: JSON.stringify(medications),
      diagnosis,
      additionalNotes,
    }).returning();

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
    if (doctorInfo.length > 0) {
      await db.insert(notifications).values({
        userId: appointment[0].patientId,
        title: 'Nouvelle ordonnance disponible',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} vous a prescrit une nouvelle ordonnance suite à votre consultation.`,
        type: 'prescription_created',
        relatedId: newPrescription[0].id
      });
    }

    // Notifier les admins
    if (patientInfo.length > 0 && doctorInfo.length > 0) {
      await notifyAdmins({
        title: 'Nouvelle ordonnance',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a prescrit une ordonnance pour ${patientInfo[0].firstName} ${patientInfo[0].lastName}.`,
        type: 'prescription_created',
        relatedId: newPrescription[0].id
      });
    }

    res.status(201).json({
      message: 'Ordonnance créée avec succès',
      prescription: newPrescription[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ordonnance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir toutes les ordonnances (filtrées par rôle)
const getAllPrescriptions = async (req, res) => {
  try {
    console.log('📋 getAllPrescriptions appelé par:', { 
      userId: req.user.sub, 
      userRole: req.user.role, 
      userRoles: req.user.roles 
    });

    let query = db.select({
      id: prescriptions.id,
      appointmentId: prescriptions.appointmentId,
      patientId: prescriptions.patientId,
      doctorId: prescriptions.doctorId,
      medications: prescriptions.medications,
      diagnosis: prescriptions.diagnosis,
      additionalNotes: prescriptions.additionalNotes,
      createdAt: prescriptions.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialty: doctors.specialty,
      appointmentDate: appointments.appointmentDate,
    })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(appointments, eq(prescriptions.appointmentId, appointments.id));

    // Filtrer selon le rôle - support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isPatient = userRoles.includes('patient');
    const isDoctor = userRoles.includes('doctor');
    
    console.log('🔍 Vérification rôles ordonnances:', { userRoles, isPatient, isDoctor });
    
    if (isPatient && !isDoctor) {
      // Patient uniquement voit ses ordonnances
      console.log('👤 Filtre patient uniquement:', req.user.sub);
      query = query.where(eq(prescriptions.patientId, req.user.sub));
    } else if (isDoctor && !isPatient) {
      // Médecin uniquement voit ses ordonnances
      console.log('👨‍⚕️ Filtre médecin uniquement:', req.user.sub);
      query = query.where(eq(prescriptions.doctorId, req.user.sub));
    } else if (isPatient && isDoctor) {
      // Utilisateur avec les deux rôles voit ses ordonnances en tant que patient ET médecin
      console.log('👤👨‍⚕️ Filtre patient ET médecin:', req.user.sub);
      query = query.where(
        sql`${prescriptions.patientId} = ${req.user.sub} OR ${prescriptions.doctorId} = ${req.user.sub}`
      );
    } else {
      console.log('🔓 Pas de filtre (admin ou autre rôle)');
    }
    // Si admin ou autre rôle, pas de filtre (voit tout)

    const allPrescriptions = await query;
    
    console.log('✅ Ordonnances trouvées:', allPrescriptions.length);

    // Parser les medications JSON (ou garder tel quel si c'est déjà un objet)
    const parsedPrescriptions = allPrescriptions.map(p => {
      let medications = p.medications;

      // Si medications est une string, essayer de la parser comme JSON
      if (typeof medications === 'string') {
        try {
          medications = JSON.parse(medications);
        } catch (e) {
          // Si ce n'est pas du JSON valide, garder comme string
          console.log('Medications is not JSON, keeping as string:', medications);
        }
      }

      return {
        ...p,
        medications: medications
      };
    });

    res.json(parsedPrescriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des ordonnances:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir une ordonnance par ID
const getPrescriptionById = async (req, res) => {
  const { id } = req.params;
  try {
    const prescription = await db.select({
      id: prescriptions.id,
      appointmentId: prescriptions.appointmentId,
      patientId: prescriptions.patientId,
      doctorId: prescriptions.doctorId,
      medications: prescriptions.medications,
      diagnosis: prescriptions.diagnosis,
      additionalNotes: prescriptions.additionalNotes,
      createdAt: prescriptions.createdAt,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialty: doctors.specialty,
      appointmentDate: appointments.appointmentDate,
    })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .where(eq(prescriptions.id, id))
      .limit(1);

    if (!prescription.length) {
      return res.status(404).json({ message: 'Ordonnance introuvable' });
    }

    // Vérifier les permissions
    if (req.user.role === 'patient' && prescription[0].patientId !== req.user.sub) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    if (req.user.role === 'doctor' && prescription[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Parser medications si c'est une string JSON
    let medications = prescription[0].medications;
    if (typeof medications === 'string') {
      try {
        medications = JSON.parse(medications);
      } catch (e) {
        // Si ce n'est pas du JSON valide, garder comme string
        console.log('Medications is not JSON, keeping as string');
      }
    }

    const parsedPrescription = {
      ...prescription[0],
      medications: medications
    };

    res.json(parsedPrescription);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ordonnance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les ordonnances par rendez-vous
const getPrescriptionsByAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const appointmentPrescriptions = await db.select({
      id: prescriptions.id,
      appointmentId: prescriptions.appointmentId,
      patientId: prescriptions.patientId,
      doctorId: prescriptions.doctorId,
      medications: prescriptions.medications,
      diagnosis: prescriptions.diagnosis,
      additionalNotes: prescriptions.additionalNotes,
      createdAt: prescriptions.createdAt,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialty: doctors.specialty,
    })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(eq(prescriptions.appointmentId, appointmentId));

    const parsedPrescriptions = appointmentPrescriptions.map(p => ({
      ...p,
      medications: JSON.parse(p.medications)
    }));

    res.json(parsedPrescriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des ordonnances:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByAppointment,
};
