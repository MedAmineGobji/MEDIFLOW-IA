const { eq } = require('drizzle-orm');
const { jobOffers, jobApplications, users } = require('./database/schema');
const db = require('./backend/src/config/database');

async function addTestJobData() {
  try {
    console.log('Ajout de données de test pour les offres d\'emploi et candidatures...');

    // Créer des offres d'emploi de test
    const testOffers = [
      {
        title: 'Infirmier(ère) en soins intensifs',
        department: 'Soins Intensifs',
        location: 'Paris',
        contractType: 'CDI',
        description: 'Nous recherchons un(e) infirmier(ère) expérimenté(e) pour notre service de soins intensifs.',
        requirements: 'Diplôme d\'infirmier, expérience en soins intensifs, capacité à travailler en équipe.',
        status: 'active'
      },
      {
        title: 'Médecin généraliste',
        department: 'Médecine Générale',
        location: 'Lyon',
        contractType: 'CDI',
        description: 'Poste de médecin généraliste dans notre clinique moderne.',
        requirements: 'Diplôme de médecine, inscription à l\'ordre des médecins.',
        status: 'active'
      },
      {
        title: 'Administrateur(trice) de base de données',
        department: 'Informatique',
        location: 'Toulouse',
        contractType: 'CDD',
        description: 'Gestion et maintenance de nos bases de données médicales.',
        requirements: 'Expérience en administration de bases de données, connaissance de PostgreSQL.',
        status: 'active'
      }
    ];

    const insertedOffers = await db.insert(jobOffers).values(testOffers).returning();
    console.log(`${insertedOffers.length} offres d'emploi créées`);

    // Récupérer l'utilisateur candidat pour créer des candidatures
    const candidateUser = await db.select().from(users).where(eq(users.email, 'candidate@mediflow.com')).limit(1);
    if (candidateUser.length === 0) {
      console.log('Utilisateur candidat non trouvé');
      return;
    }

    // Créer des candidatures de test
    const testApplications = insertedOffers.map((offer, index) => ({
      jobOfferId: offer.id,
      candidateUserId: candidateUser[0].id,
      cvUrl: `/uploads/cv/test-cv-${index + 1}.pdf`,
      coverLetter: `Lettre de motivation pour le poste de ${offer.title}. Je suis très intéressé(e) par cette opportunité.`,
      status: index === 0 ? 'en cours' : 'soumise'
    }));

    const insertedApplications = await db.insert(jobApplications).values(testApplications).returning();
    console.log(`${insertedApplications.length} candidatures créées`);

    console.log('Données de test ajoutées avec succès !');

  } catch (error) {
    console.error('Erreur lors de l\'ajout des données de test:', error);
  }
}

addTestJobData();