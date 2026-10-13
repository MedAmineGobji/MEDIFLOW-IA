const { jobOffers } = require('../database/schema');
const db = require('./src/config/database');

async function createTestJobOffers() {
  try {
    console.log('Création d\'offres d\'emploi de test...');

    const testOffers = [
      {
        title: 'Médecin Généraliste',
        department: 'Médecine Générale',
        location: 'Paris',
        contractType: 'CDI',
        description: 'Nous recherchons un médecin généraliste expérimenté pour rejoindre notre équipe. Le candidat devra être capable de prendre en charge une patientèle variée et assurer des consultations de qualité.',
        requirements: 'Doctorat en médecine, expérience en cabinet, compétences en cardiologie, pédiatrie, urgences médicales, prescription médicamenteuse',
        status: 'active'
      },
      {
        title: 'Infirmier(e) en Médecine Interne',
        department: 'Médecine Interne',
        location: 'Lyon',
        contractType: 'CDI',
        description: 'Poste d\'infirmier en médecine interne dans un service hospitalier dynamique. Missions incluant les soins aux patients, surveillance et accompagnement médical.',
        requirements: 'Diplôme d\'état d\'infirmier, expérience en milieu hospitalier, compétences en soins intensifs, prise de constantes, administration de médicaments',
        status: 'active'
      },
      {
        title: 'Cardiologue Senior',
        department: 'Cardiologie',
        location: 'Marseille',
        contractType: 'CDI',
        description: 'Nous recrutons un cardiologue expérimenté pour développer notre service de cardiologie. Le candidat participera aux consultations, examens et interventions cardiologiques.',
        requirements: 'DESC de cardiologie, expérience hospitalière, compétences en échocardiographie, angiographie, électrophysiologie, urgences cardiologiques',
        status: 'active'
      }
    ];

    for (const offer of testOffers) {
      await db.insert(jobOffers).values(offer);
      console.log('Offre créée:', offer.title);
    }

    console.log('Offres d\'emploi de test créées avec succès');

  } catch (error) {
    console.error('Erreur lors de la création des offres:', error);
  }
}

createTestJobOffers();