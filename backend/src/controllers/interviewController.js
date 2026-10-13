const { eq, and, sql } = require('drizzle-orm');
const { interviews, jobApplications, users, jobOffers, notifications, hrRecruiters, candidates } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

/**
 * Planifier un entretien
 */
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, interviewDate, interviewTime, notes } = req.body;
    const interviewerId = req.user.sub;

    if (!applicationId || !interviewDate) {
      return res.status(400).json({
        success: false,
        message: 'ID de candidature et date d\'entretien requis'
      });
    }

    // Vérifier que l'utilisateur est autorisé (HR ou admin) - support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isAuthorized = userRoles.some(role => ['hrRecruiter', 'admin'].includes(role));
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Vérifier que la candidature existe
    const application = await db.select().from(jobApplications).where(eq(jobApplications.id, parseInt(applicationId))).limit(1);
    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable'
      });
    }

    // Créer l'entretien
    const newInterview = await db.insert(interviews).values({
      applicationId: parseInt(applicationId),
      interviewerId: interviewerId,
      interviewDate: new Date(interviewDate),
      interviewTime: interviewTime,
      notes: notes,
      status: 'scheduled'
    }).returning();

    // Mettre à jour le statut de la candidature
    await db.update(jobApplications)
      .set({ status: 'en cours' })
      .where(eq(jobApplications.id, parseInt(applicationId)));

    // Créer une notification pour le candidat
    const applicationInfo = await db.select({
      candidateUserId: jobApplications.candidateUserId,
      jobTitle: jobOffers.title
    })
      .from(jobApplications)
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .where(eq(jobApplications.id, parseInt(applicationId)))
      .limit(1);

    if (applicationInfo.length > 0) {
      const candidateId = applicationInfo[0].candidateUserId;
      const jobTitle = applicationInfo[0].jobTitle;
      const formattedDate = new Date(interviewDate).toLocaleDateString('fr-FR');

      await db.insert(notifications).values({
        userId: candidateId,
        title: 'Entretien planifié',
        message: `Un entretien a été planifié pour le poste de ${jobTitle} le ${formattedDate} à ${interviewTime}.`,
        type: 'interview_scheduled',
        relatedId: newInterview[0].id
      });

      // Notifier les admins
      await notifyAdmins({
        title: 'Entretien planifié',
        message: `Un entretien a été planifié pour ${jobTitle} avec le candidat ${candidateId}.`,
        type: 'interview_scheduled',
        relatedId: newInterview[0].id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Entretien planifié avec succès',
      data: newInterview[0]
    });

  } catch (error) {
    console.error('Erreur lors de la planification d\'entretien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Récupérer les entretiens d'une candidature
 */
const getInterviewsByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'ID de candidature requis'
      });
    }

    // Support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];

    // Vérifier que l'utilisateur est autorisé (RH, admin ou candidat concerné)
    console.log('🔐 Vérification autorisation getInterviewsByApplication:', {
      userId: req.user.sub,
      userRole: req.user.role,
      userRoles: userRoles,
      applicationId: applicationId
    })

    const isHROrAdmin = userRoles.some(role => ['hrRecruiter', 'admin'].includes(role));
    const isCandidate = userRoles.includes('candidate');

    if (isHROrAdmin) {
      // RH et admin peuvent voir tous les entretiens
      console.log('✅ Accès autorisé: RH/Admin')
    } else if (isCandidate) {
      // Le candidat ne peut voir que ses propres entretiens
      const application = await db.select({ candidateUserId: jobApplications.candidateUserId })
        .from(jobApplications)
        .where(eq(jobApplications.id, parseInt(applicationId)))
        .limit(1);

      console.log('👤 Candidat - Application:', application, 'User ID:', req.user.sub)

      const userId = req.user.sub
      if (application.length === 0 || application[0].candidateUserId !== userId) {
        console.log('❌ Accès refusé: candidature ne correspond pas')
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
      console.log('✅ Accès autorisé: Candidat propriétaire')
    } else {
      console.log('❌ Accès refusé: rôle non autorisé')
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const interviewList = await db.select({
      id: interviews.id,
      applicationId: interviews.applicationId,
      interviewDate: interviews.interviewDate,
      interviewTime: interviews.interviewTime,
      status: interviews.status,
      candidateResponse: interviews.candidateResponse,
      notes: interviews.notes,
      feedback: interviews.feedback,
      createdAt: interviews.createdAt,
      interviewerId: interviews.interviewerId,
      interviewer: {
        id: users.id,
        email: users.email
      }
    })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .where(eq(interviews.applicationId, parseInt(applicationId)))
      .orderBy(interviews.createdAt);

    res.json({
      success: true,
      data: interviewList
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des entretiens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Récupérer tous les entretiens (pour les RH)
 */
const getAllInterviews = async (req, res) => {
  try {
    console.log('📅 getAllInterviews appelé par:', { userId: req.user.sub, userRole: req.user.role, userRoles: req.user.roles })
    
    // Vérifier que l'utilisateur est autorisé - support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isAuthorized = userRoles.some(role => ['hrRecruiter', 'admin'].includes(role));
    
    console.log('🔍 Vérification autorisation getAllInterviews:', { userRoles, isAuthorized })
    
    if (!isAuthorized) {
      console.log('❌ getAllInterviews - Accès refusé')
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const interviewList = await db.select({
      id: interviews.id,
      interviewDate: interviews.interviewDate,
      interviewTime: interviews.interviewTime,
      status: interviews.status,
      candidateResponse: interviews.candidateResponse,
      notes: interviews.notes,
      feedback: interviews.feedback,
      createdAt: interviews.createdAt,
      application: {
        id: jobApplications.id,
        status: jobApplications.status,
        jobOffer: {
          title: jobOffers.title,
          department: jobOffers.department
        }
      },
      interviewer: {
        id: users.id,
        email: users.email
      }
    })
      .from(interviews)
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .orderBy(interviews.interviewDate);

    console.log('✅ getAllInterviews - Entretiens récupérés:', interviewList.length)

    res.json({
      success: true,
      data: interviewList
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des entretiens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Mettre à jour le statut d'un entretien
 */
const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID et statut requis'
      });
    }

    // Vérifier que l'utilisateur est autorisé - support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isAuthorized = userRoles.some(role => ['hrRecruiter', 'admin'].includes(role));
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const updatedInterview = await db.update(interviews)
      .set({
        status: status,
        feedback: feedback,
        updatedAt: new Date()
      })
      .where(eq(interviews.id, parseInt(id)))
      .returning();

    if (updatedInterview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entretien introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Statut d\'entretien mis à jour',
      data: updatedInterview[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut d\'entretien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Supprimer un entretien
 */
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'entretien requis'
      });
    }

    // Vérifier que l'utilisateur est autorisé - support des rôles multiples
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isAuthorized = userRoles.some(role => ['hrRecruiter', 'admin'].includes(role));
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await db.delete(interviews).where(eq(interviews.id, parseInt(id)));

    res.json({
      success: true,
      message: 'Entretien supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression d\'entretien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const respondToInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'
    const userId = req.user.sub;

    console.log('🔔 Réponse à l\'entretien:', { interviewId: id, response, userId, userRole: req.user.role, userRoles: req.user.roles });

    if (!response || !['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Réponse invalide. Utilisez "accepted" ou "declined"'
      });
    }

    // Support des rôles multiples - vérifier que l'utilisateur est un candidat
    const userRoles = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.length > 0 
      ? req.user.roles 
      : [req.user.role];
    
    const isCandidate = userRoles.includes('candidate');
    
    if (!isCandidate) {
      console.log('❌ Accès refusé: roles =', userRoles);
      return res.status(403).json({
        success: false,
        message: 'Seuls les candidats peuvent répondre aux entretiens'
      });
    }

    // Vérifier que l'entretien existe
    const interviewResult = await db.select()
      .from(interviews)
      .where(eq(interviews.id, parseInt(id)))
      .limit(1);

    console.log('📄 Entretien trouvé:', interviewResult);

    if (interviewResult.length === 0) {
      console.log('❌ Entretien introuvable');
      return res.status(404).json({
        success: false,
        message: 'Entretien introuvable'
      });
    }

    const interview = interviewResult[0];

    // Récupérer la candidature associée pour vérifier le propriétaire
    const applicationResult = await db.select()
      .from(jobApplications)
      .where(eq(jobApplications.id, interview.applicationId))
      .limit(1);

    if (applicationResult.length === 0) {
      console.log('❌ Candidature introuvable');
      return res.status(404).json({
        success: false,
        message: 'Candidature associée introuvable'
      });
    }

    const application = applicationResult[0];

    console.log('🔍 Vérification propriétaire:', {
      candidateUserId: application.candidateUserId,
      userId: userId
    });

    if (application.candidateUserId !== userId) {
      console.log('❌ Accès refusé: candidat non propriétaire');
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas répondre à cet entretien'
      });
    }

    console.log('✅ Mise à jour de la réponse');

    // Mettre à jour la réponse du candidat
    await db.update(interviews)
      .set({
        candidateResponse: response,
        updatedAt: new Date()
      })
      .where(eq(interviews.id, parseInt(id)));

    // Notifier les admins de la réponse
    const [info] = await db.select({
      applicantEmail: users.email,
      jobTitle: jobOffers.title
    })
      .from(interviews)
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .leftJoin(users, eq(jobApplications.candidateUserId, users.id))
      .where(eq(interviews.id, parseInt(id)));

    await notifyAdmins({
      title: 'Réponse à un entretien',
      message: `Le candidat ${info.applicantEmail} a ${response === 'accepted' ? 'accepté' : 'refusé'} l'entretien pour: ${info.jobTitle}.`,
      type: 'interview_response',
      relatedId: parseInt(id)
    });

    res.json({
      success: true,
      message: `Entretien ${response === 'accepted' ? 'accepté' : 'refusé'} avec succès`
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réponse à l\'entretien:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  scheduleInterview,
  getInterviewsByApplication,
  getAllInterviews,
  updateInterviewStatus,
  deleteInterview,
  respondToInterview
};
