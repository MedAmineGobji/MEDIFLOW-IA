const { eq, and, sql } = require('drizzle-orm');
const { jobApplications, jobOffers, users, notifications } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins, notifyHRRecruiters } = require('../utils/notificationUtils');

const createJobApplication = async (req, res) => {
  const { jobOfferId, coverLetter } = req.body;
  const file = req.file;

  if (!jobOfferId || !coverLetter || !file) {
    return res.status(400).json({ message: 'Offre, CV et lettre de motivation sont requis' });
  }

  try {
    console.log('📝 Création d\'une candidature pour l\'offre:', jobOfferId);
    
    // Vérifier que l'offre existe
    const offer = await db.select().from(jobOffers).where(eq(jobOffers.id, Number(jobOfferId))).limit(1);
    if (offer.length === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const candidateUserId = req.user?.sub;
    if (!candidateUserId) {
      return res.status(400).json({ message: 'Utilisateur candidat manquant' });
    }

    const cvUrl = `/uploads/cv/${file.filename}`;

    // Créer la candidature
    const newApp = await db.insert(jobApplications).values({
      jobOfferId: Number(jobOfferId),
      candidateUserId: Number(candidateUserId),
      cvUrl,
      coverLetter,
      status: 'soumise' // Statut par défaut selon le schéma
    }).returning();

    console.log('✅ Candidature créée:', newApp[0].id);

    // Récupérer les informations pour la notification
    const candidateInfo = await db.select({
      email: users.email
    })
      .from(users)
      .where(eq(users.id, Number(candidateUserId)))
      .limit(1);

    const notificationData = {
      title: 'Nouvelle candidature',
      message: `${candidateInfo[0]?.email || 'Un candidat'} a postulé pour le poste de ${offer[0].title}.`,
      type: 'application_submitted',
      relatedId: newApp[0].id
    };

    // Notifier les admins ET les RH recruteurs
    await Promise.all([
      notifyAdmins(notificationData),
      notifyHRRecruiters(notificationData)
    ]);

    res.status(201).json(newApp[0]);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la candidature:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const getApplicationsForCandidate = async (req, res) => {
  const candidateUserId = req.user?.sub;
  if (!candidateUserId) {
    return res.status(400).json({ message: 'Utilisateur candidat manquant' });
  }

  try {
    const apps = await db.select({
      id: jobApplications.id,
      jobOfferId: jobApplications.jobOfferId,
      candidateUserId: jobApplications.candidateUserId,
      cvUrl: jobApplications.cvUrl,
      coverLetter: jobApplications.coverLetter,
      status: jobApplications.status,
      createdAt: jobApplications.createdAt,
      updatedAt: jobApplications.updatedAt,
      jobOffer: {
        title: jobOffers.title,
        department: jobOffers.department,
        location: jobOffers.location,
        description: jobOffers.description,
        requirements: jobOffers.requirements,
      }
    })
      .from(jobApplications)
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .where(eq(jobApplications.candidateUserId, Number(candidateUserId)))
      .orderBy(jobApplications.createdAt);

    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const apps = await db.select()
      .from(jobApplications)
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .leftJoin(users, eq(jobApplications.candidateUserId, users.id))
      .orderBy(jobApplications.createdAt);

    // Formater les résultats
    const formattedApps = apps.map(row => ({
      id: row.job_applications.id,
      jobOfferId: row.job_applications.jobOfferId,
      candidateUserId: row.job_applications.candidateUserId,
      cvUrl: row.job_applications.cvUrl,
      coverLetter: row.job_applications.coverLetter,
      status: row.job_applications.status,
      createdAt: row.job_applications.createdAt,
      updatedAt: row.job_applications.updatedAt,
      jobOffer: row.job_offers ? {
        id: row.job_offers.id,
        title: row.job_offers.title,
        department: row.job_offers.department,
        location: row.job_offers.location,
      } : { id: null, title: 'Offre supprimée', department: 'N/A', location: 'N/A' },
      candidate: row.users ? {
        firstName: row.users.firstName,
        lastName: row.users.lastName,
        email: row.users.email,
      } : { firstName: 'Utilisateur', lastName: 'supprimé', email: 'N/A' }
    }));

    res.json(formattedApps);
  } catch (error) {
    console.error('Erreur dans getAllApplications:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Statut requis' });
    }

    // Vérifier que l'utilisateur est RH
    if (req.user.role !== 'hrRecruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Mettre à jour le statut
    const updated = await db.update(jobApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(jobApplications.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    // Récupérer les informations de la candidature et de l'offre pour la notification
    const applicationInfo = await db.select({
      candidateUserId: jobApplications.candidateUserId,
      jobTitle: jobOffers.title
    })
      .from(jobApplications)
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .where(eq(jobApplications.id, parseInt(id)))
      .limit(1);

    // Créer une notification pour le candidat
    if (applicationInfo.length > 0) {
      const candidateId = applicationInfo[0].candidateUserId;
      const jobTitle = applicationInfo[0].jobTitle;

      let notificationTitle = '';
      let notificationMessage = '';

      switch (status) {
        case 'acceptée':
          notificationTitle = 'Candidature acceptée';
          notificationMessage = `Félicitations ! Votre candidature pour le poste de ${jobTitle} a été acceptée.`;
          break;
        case 'refusée':
          notificationTitle = 'Candidature refusée';
          notificationMessage = `Votre candidature pour le poste de ${jobTitle} a été refusée. N'hésitez pas à postuler à d'autres offres.`;
          break;
        case 'en cours':
          notificationTitle = 'Candidature en cours de traitement';
          notificationMessage = `Votre candidature pour le poste de ${jobTitle} est actuellement en cours d'examen.`;
          break;
        default:
          notificationTitle = 'Mise à jour de candidature';
          notificationMessage = `Le statut de votre candidature pour le poste de ${jobTitle} a été mis à jour.`;
      }

      await db.insert(notifications).values({
        userId: candidateId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'application_status',
        relatedId: parseInt(id)
      });

      // Notifier les admins
      await notifyAdmins({
        title: 'Statut de candidature mis à jour',
        message: `La candidature de ${candidateId} pour ${jobTitle} est passée à: ${status}.`,
        type: 'application_status_update',
        relatedId: parseInt(id)
      });
    }

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { createJobApplication, getApplicationsForCandidate, getAllApplications, updateApplicationStatus };

