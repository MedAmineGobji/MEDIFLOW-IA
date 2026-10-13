const { eq } = require('drizzle-orm');
const { interviews, jobApplications, users, jobOffers, notifications } = require('../database/schema');
const db = require('./src/config/database');

async function createTestInterviews() {
  try {
    console.log('Création d\'entretiens de test...');

    // Récupérer les candidatures existantes
    const applications = await db.select().from(jobApplications);
    if (applications.length === 0) {
      console.log('Aucune candidature trouvée');
      return;
    }

    // Récupérer un utilisateur RH pour être l'intervieweur
    const hrUsers = await db.select().from(users).where(eq(users.role, 'hrRecruiter')).limit(1);
    if (hrUsers.length === 0) {
      console.log('Aucun utilisateur RH trouvé');
      return;
    }

    const interviewerId = hrUsers[0].id;
    console.log('Intervieweur ID:', interviewerId);

    // Créer des entretiens pour chaque candidature
    const testInterviews = [
      {
        applicationId: applications[0].id,
        interviewerId: interviewerId,
        interviewDate: new Date('2026-01-25'), // Date future
        interviewTime: '10:00',
        notes: 'Entretien technique et présentation du poste',
        status: 'scheduled',
        candidateResponse: 'pending'
      },
      {
        applicationId: applications[1]?.id || applications[0].id,
        interviewerId: interviewerId,
        interviewDate: new Date('2026-01-26'), // Date future
        interviewTime: '14:30',
        notes: 'Entretien avec le responsable du service',
        status: 'scheduled',
        candidateResponse: 'pending'
      }
    ];

    for (const interview of testInterviews) {
      try {
        const newInterview = await db.insert(interviews).values(interview).returning();
        console.log('Entretien créé avec ID:', newInterview[0].id);

        // Créer une notification pour le candidat
        const applicationInfo = await db.select({
          candidateUserId: jobApplications.candidateUserId,
          jobTitle: jobOffers.title
        })
        .from(jobApplications)
        .leftJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
        .where(eq(jobApplications.id, interview.applicationId))
        .limit(1);

        if (applicationInfo.length > 0) {
          const candidateId = applicationInfo[0].candidateUserId;
          const jobTitle = applicationInfo[0].jobTitle;
          const formattedDate = interview.interviewDate.toLocaleDateString('fr-FR');

          await db.insert(notifications).values({
            userId: candidateId,
            title: 'Entretien planifié',
            message: `Un entretien a été planifié pour le poste de ${jobTitle} le ${formattedDate} à ${interview.interviewTime}.`,
            type: 'interview_scheduled',
            relatedId: newInterview[0].id
          });

          console.log('Notification créée pour le candidat:', candidateId);
        }

        // Mettre à jour le statut de la candidature
        await db.update(jobApplications)
          .set({ status: 'en cours' })
          .where(eq(jobApplications.id, interview.applicationId));

        console.log('Statut de la candidature mis à jour');
      } catch (error) {
        console.error('Erreur lors de la création d\'un entretien:', error);
      }
    }

    console.log('Entretiens de test créés avec succès');

  } catch (error) {
    console.error('Erreur lors de la création des entretiens:', error);
  } finally {
    process.exit(0);
  }
}

createTestInterviews();