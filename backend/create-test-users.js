const bcrypt = require('bcryptjs');
const { db } = require('./src/config/database');
const { users } = require('../database/schema');

async function createTestUsers() {
  try {
    console.log('Création d\'utilisateurs de test...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        email: 'admin@mediflow.com',
        passwordHash: hashedPassword,
        role: 'admin'
      },
      {
        email: 'doctor@mediflow.com',
        passwordHash: hashedPassword,
        role: 'doctor'
      },
      {
        email: 'patient@mediflow.com',
        passwordHash: hashedPassword,
        role: 'patient'
      },
      {
        email: 'hr@mediflow.com',
        passwordHash: hashedPassword,
        role: 'hrRecruiter'
      },
      {
        email: 'candidate@mediflow.com',
        passwordHash: hashedPassword,
        role: 'candidate'
      }
    ];

    for (const user of testUsers) {
      try {
        await db.insert(users).values(user);
        console.log(`Utilisateur créé: ${user.email} (${user.role})`);
      } catch (error) {
        console.log(`Utilisateur ${user.email} existe déjà`);
      }
    }

    console.log('Utilisateurs de test créés avec succès');
    console.log('Mot de passe pour tous: password123');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();