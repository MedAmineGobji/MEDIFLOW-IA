const { eq } = require('drizzle-orm');
const { users, candidates, hrRecruiters } = require('../database/schema');
const db = require('./src/config/database');

async function createTestCandidates() {
  try {
    console.log('Création d\'entrées candidates et HR de test...');

    // Récupérer les utilisateurs candidats
    const candidateUsers = await db.select().from(users).where(eq(users.role, 'candidate'));
    const hrUsers = await db.select().from(users).where(eq(users.role, 'hrRecruiter'));

    // Créer les entrées candidates
    for (const user of candidateUsers) {
      try {
        await db.insert(candidates).values({
          id: user.id,
          firstName: 'Jean',
          lastName: 'Dupont',
          email: user.email,
          phone: '+33123456789'
        });
        console.log(`Candidat créé: ${user.email}`);
      } catch (error) {
        console.log(`Candidat ${user.email} existe déjà`);
      }
    }

    // Créer les entrées HR
    for (const user of hrUsers) {
      try {
        await db.insert(hrRecruiters).values({
          id: user.id,
          firstName: 'Marie',
          lastName: 'Martin',
          email: user.email,
          phone: '+33123456790',
          department: 'Ressources Humaines'
        });
        console.log(`HR créé: ${user.email}`);
      } catch (error) {
        console.log(`HR ${user.email} existe déjà`);
      }
    }

    console.log('Entrées de test créées avec succès');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

createTestCandidates();