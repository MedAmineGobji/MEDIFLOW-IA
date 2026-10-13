const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { eq } = require('drizzle-orm');
const { users, patients, doctors, admins, hrRecruiters, candidates } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { 
        sub: user[0].id, 
        role: user[0].role, 
        roles: user[0].roles && Array.isArray(user[0].roles) ? user[0].roles : [user[0].role],
        email: user[0].email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      role: user[0].role,
      roles: user[0].roles && Array.isArray(user[0].roles) ? user[0].roles : [user[0].role],
      id: user[0].id,
      email: user[0].email,
      firstName: user[0].firstName,
      lastName: user[0].lastName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const me = async (req, res) => {
  const { sub, role, roles, email } = req.user;

  try {
    // Récupérer d'abord les informations complètes de l'utilisateur depuis la table users
    const userFromDB = await db.select().from(users).where(eq(users.id, sub)).limit(1);
    
    if (userFromDB.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userRoles = userFromDB[0].roles && Array.isArray(userFromDB[0].roles) && userFromDB[0].roles.length > 0
      ? userFromDB[0].roles
      : [userFromDB[0].role];

    let userDetails;

    // Utiliser le rôle principal pour chercher les détails
    const primaryRole = userFromDB[0].role;

    switch (primaryRole) {
      case 'patient':
        userDetails = await db.select().from(patients).where(eq(patients.id, sub)).limit(1);
        break;
      case 'doctor':
        userDetails = await db.select().from(doctors).where(eq(doctors.id, sub)).limit(1);
        break;
      case 'admin':
        // Pour admin, chercher par email car l'ID de users != ID de admins
        userDetails = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        break;
      case 'hrRecruiter':
        userDetails = await db.select().from(hrRecruiters).where(eq(hrRecruiters.email, email)).limit(1);
        break;
      case 'candidate':
        userDetails = await db.select().from(candidates).where(eq(candidates.email, email)).limit(1);
        break;
      default:
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    if (userDetails.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ ...userDetails[0], role: primaryRole, roles: userRoles, id: sub });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const signup = async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;

  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  // Bloquer la création d'admin via l'inscription
  if (role === 'admin') {
    return res.status(403).json({ message: 'Les comptes administrateur doivent être créés manuellement' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer dans la table users
    const newUser = await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      role,
    }).returning();

    // Insérer dans la table spécifique selon le rôle
    let specificTable;
    // Aligner l'id entre users et la table spécifique au rôle pour que /me fonctionne
    let specificData = { id: newUser[0].id, firstName, lastName, email };

    switch (role) {
      case 'patient':
        specificTable = patients;
        break;
      case 'doctor':
        specificTable = doctors;
        break;
      case 'hrRecruiter':
        specificTable = hrRecruiters;
        break;
      case 'candidate':
        specificTable = candidates;
        break;
      default:
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    await db.insert(specificTable).values(specificData);

    // Notifier les admins de la nouvelle inscription
    const roleNames = {
      patient: 'Patient',
      doctor: 'Médecin',
      hrRecruiter: 'Recruteur RH',
      candidate: 'Candidat'
    };

    await notifyAdmins({
      title: 'Nouvelle inscription',
      message: `${roleNames[role]} : ${firstName} ${lastName} (${email}) s'est inscrit sur la plateforme.`,
      type: 'new_user',
      relatedId: newUser[0].id
    });

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Prénom, nom et email requis' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== req.user.email) {
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Mettre à jour l'email dans la table users
    await db.update(users)
      .set({ email })
      .where(eq(users.id, userId));

    // Mettre à jour les informations dans la table spécifique selon le rôle
    const updateData = { firstName, lastName, email };
    if (phone !== undefined && phone !== null && phone !== '') {
      updateData.phone = phone;
    }

    let specificTable;
    switch (req.user.role) {
      case 'patient':
        specificTable = patients;
        break;
      case 'doctor':
        specificTable = doctors;
        break;
      case 'admin':
        specificTable = admins;
        break;
      case 'hrRecruiter':
        specificTable = hrRecruiters;
        break;
      case 'candidate':
        specificTable = candidates;
        break;
      default:
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    await db.update(specificTable)
      .set(updateData)
      .where(eq(specificTable.id, userId));

    res.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: { id: userId, firstName, lastName, email, phone }
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { login, me, signup, updateProfile };