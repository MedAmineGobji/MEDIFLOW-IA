const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n=== CRÉATION D\'UN COMPTE ADMINISTRATEUR ===\n');
    
    const firstName = await question('Prénom de l\'admin: ');
    const lastName = await question('Nom de l\'admin: ');
    const email = await question('Email de l\'admin: ');
    const password = await question('Mot de passe (minimum 6 caractères): ');
    
    if (!firstName || !lastName || !email || !password) {
      console.error('❌ Tous les champs sont obligatoires!');
      rl.close();
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.error('❌ Le mot de passe doit contenir au moins 6 caractères!');
      rl.close();
      process.exit(1);
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.error('❌ Cet email existe déjà!');
      rl.close();
      await pool.end();
      process.exit(1);
    }
    
    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur admin
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
      [email, passwordHash, 'admin']
    );
    
    const userId = userResult.rows[0].id;
    
    // Créer l'entrée admin
    await pool.query(
      'INSERT INTO admins (first_name, last_name, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [firstName, lastName, email, 'admin']
    );
    
    console.log('\n✅ Compte administrateur créé avec succès!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nom: ${firstName} ${lastName}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log('\n⚠️  IMPORTANT: Gardez ces informations en sécurité!\n');
    
    rl.close();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    rl.close();
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
