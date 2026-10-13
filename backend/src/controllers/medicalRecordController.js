const { eq } = require('drizzle-orm');
const { medicalRecords, patients, doctors, notifications } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

const getAllMedicalRecords = async (req, res) => {
  try {
    console.log('Récupération des dossiers médicaux pour:', req.user);

    let query = db.select({
      id: medicalRecords.id,
      appointmentId: medicalRecords.appointmentId,
      patientId: medicalRecords.patientId,
      doctorId: medicalRecords.doctorId,
      diagnosis: medicalRecords.diagnosis,
      treatment: medicalRecords.treatment,
      prescription: medicalRecords.prescription,
      notes: medicalRecords.notes,
      consultationDate: medicalRecords.consultationDate,
      recordDate: medicalRecords.recordDate,
      createdAt: medicalRecords.createdAt,
      updatedAt: medicalRecords.updatedAt,
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
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(doctors, eq(medicalRecords.doctorId, doctors.id));

    // Filter based on user role
    if (req.user.role === 'patient') {
      query = query.where(eq(medicalRecords.patientId, req.user.sub));
      console.log('Filtrage pour patient:', req.user.sub);
    } else if (req.user.role === 'doctor') {
      query = query.where(eq(medicalRecords.doctorId, req.user.sub));
      console.log('Filtrage pour médecin:', req.user.sub);
    }
    // Admin can see all

    const allRecords = await query;
    console.log('Dossiers trouvés:', allRecords.length);
    res.json(allRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMedicalRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await db.select({
      id: medicalRecords.id,
      appointmentId: medicalRecords.appointmentId,
      patientId: medicalRecords.patientId,
      doctorId: medicalRecords.doctorId,
      diagnosis: medicalRecords.diagnosis,
      treatment: medicalRecords.treatment,
      prescription: medicalRecords.prescription,
      notes: medicalRecords.notes,
      consultationDate: medicalRecords.consultationDate,
      recordDate: medicalRecords.recordDate,
      createdAt: medicalRecords.createdAt,
      updatedAt: medicalRecords.updatedAt,
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
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .where(eq(medicalRecords.id, parseInt(id)))
      .limit(1);
    if (record.length === 0) {
      return res.status(404).json({ message: 'Dossier médical non trouvé' });
    }

    // Vérifier les autorisations
    const medicalRecord = record[0];
    const isPatient = req.user.role === 'patient' && medicalRecord.patientId === req.user.sub;
    const isDoctor = req.user.role === 'doctor' && medicalRecord.doctorId === req.user.sub;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Accès non autorisé à ce dossier médical' });
    }

    res.json(record[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createMedicalRecord = async (req, res) => {
  const { appointmentId, patientId, diagnosis, treatment, prescription, notes, recordDate, consultationDate } = req.body;

  console.log('Création de dossier médical:', {
    user: req.user,
    body: req.body
  });

  // Vérifier que c'est bien un médecin
  if (req.user.role !== 'doctor') {
    console.log('Accès refusé: utilisateur n\'est pas médecin');
    return res.status(403).json({ message: 'Seuls les médecins peuvent créer des dossiers médicaux' });
  }

  try {
    // Vérifier que le patient existe
    const patientExists = await db.select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (patientExists.length === 0) {
      console.log('Patient non trouvé:', patientId);
      return res.status(400).json({ message: 'Patient non trouvé' });
    }

    // Vérifier que le médecin existe
    const doctorExists = await db.select()
      .from(doctors)
      .where(eq(doctors.id, req.user.sub))
      .limit(1);

    if (doctorExists.length === 0) {
      console.log('Médecin non trouvé:', req.user.sub);
      return res.status(400).json({ message: 'Médecin non trouvé' });
    }

    const newRecord = await db.insert(medicalRecords).values({
      appointmentId: appointmentId || null, // Rendre optionnel
      patientId,
      doctorId: req.user.sub, // Utiliser l'ID du médecin connecté
      diagnosis,
      treatment,
      prescription,
      notes,
      consultationDate: consultationDate ? new Date(consultationDate) : null,
      recordDate: recordDate ? new Date(recordDate) : new Date(),
    }).returning();

    console.log('Dossier médical créé:', newRecord[0]);

    // Récupérer les informations du patient et du médecin pour la notification
    const patientInfo = await db.select({
      firstName: patients.firstName,
      lastName: patients.lastName
    })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    const doctorInfo = await db.select({
      firstName: doctors.firstName,
      lastName: doctors.lastName
    })
      .from(doctors)
      .where(eq(doctors.id, req.user.sub))
      .limit(1);

    if (patientInfo.length > 0 && doctorInfo.length > 0) {
      // Créer une notification pour le patient
      await db.insert(notifications).values({
        userId: patientId,
        title: 'Nouveau dossier médical disponible',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a ajouté un nouveau dossier médical suite à votre consultation.`,
        type: 'medical_record_created',
        relatedId: newRecord[0].id
      });

      // Notifier les admins
      await notifyAdmins({
        title: 'Nouveau dossier médical',
        message: `Dr. ${doctorInfo[0].firstName} ${doctorInfo[0].lastName} a créé un dossier médical pour ${patientInfo[0].firstName} ${patientInfo[0].lastName}.`,
        type: 'medical_record_created',
        relatedId: newRecord[0].id
      });
    }

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateMedicalRecord = async (req, res) => {
  const { id } = req.params;
  const { patientId, doctorId, diagnosis, treatment, prescription, notes, recordDate } = req.body;

  // Vérifier que c'est bien un médecin
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Seuls les médecins peuvent modifier des dossiers médicaux' });
  }

  try {
    // Vérifier que le dossier médical appartient au médecin connecté
    const existingRecord = await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Dossier médical non trouvé' });
    }

    if (existingRecord[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres dossiers médicaux' });
    }

    const updatedRecord = await db.update(medicalRecords)
      .set({
        patientId,
        doctorId,
        diagnosis,
        treatment,
        prescription,
        notes,
        recordDate: recordDate ? new Date(recordDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, parseInt(id)))
      .returning();
    if (updatedRecord.length === 0) {
      return res.status(404).json({ message: 'Dossier médical non trouvé' });
    }
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteMedicalRecord = async (req, res) => {
  const { id } = req.params;

  // Vérifier que c'est bien un médecin
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Seuls les médecins peuvent supprimer des dossiers médicaux' });
  }

  try {
    // Vérifier que le dossier médical appartient au médecin connecté
    const existingRecord = await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Dossier médical non trouvé' });
    }

    if (existingRecord[0].doctorId !== req.user.sub) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres dossiers médicaux' });
    }

    const deletedRecord = await db.delete(medicalRecords).where(eq(medicalRecords.id, parseInt(id))).returning();
    if (deletedRecord.length === 0) {
      return res.status(404).json({ message: 'Dossier médical non trouvé' });
    }
    res.json({ message: 'Dossier médical supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord };