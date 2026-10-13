const { eq } = require('drizzle-orm');
const { jobApplications, jobOffers, users } = require('../database/schema');
const db = require('./src/config/database');

async function createTestApplications() {
  try {
    console.log('Création de candidatures de test...');

    // Récupérer l'utilisateur candidat
    const candidate = await db.select().from(users).where(eq(users.email, 'candidate@mediflow.com')).limit(1);
    if (candidate.length === 0) {
      console.log('Utilisateur candidat non trouvé');
      return;
    }

    // Récupérer quelques offres d'emploi
    const offers = await db.select().from(jobOffers).limit(3);
    if (offers.length === 0) {
      console.log('Aucune offre d\'emploi trouvée');
      return;
    }

    // Créer des candidatures de test
    const testApplications = [
      {
        jobOfferId: offers[0].id,
        candidateUserId: candidate[0].id,
        cvUrl: '/uploads/cv/test-cv-1.pdf',
        coverLetter: 'Je suis très intéressé par ce poste d\'infirmière. Avec mon expérience de 5 ans dans le domaine médical, je pense pouvoir apporter une réelle valeur ajoutée à votre équipe.',
        status: 'en cours'
      },
      {
        jobOfferId: offers[1]?.id || offers[0].id,
        candidateUserId: candidate[0].id,
        cvUrl: '/uploads/cv/test-cv-2.pdf',
        coverLetter: 'En tant que médecin expérimenté, je souhaite rejoindre votre clinique pour continuer à offrir des soins de qualité à vos patients.',
        status: 'soumise'
      }
    ];

    for (const app of testApplications) {
      await db.insert(jobApplications).values(app);
      console.log('Candidature créée pour l\'offre:', app.jobOfferId);
    }

    console.log('Candidatures de test créées avec succès');

  } catch (error) {
    console.error('Erreur lors de la création des candidatures:', error);
  }
}

createTestApplications();