const { eq } = require('drizzle-orm');
const { users, patients, doctors, admins, hrRecruiters, candidates, appointments, medicalRecords, prescriptions, interviews, jobApplications, cvAnalyses } = require('../../../database/schema');
const db = require('../config/database');

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    console.log('📋 Récupération de tous les utilisateurs');
    
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      roles: users.roles,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { roles: newRoles } = req.body; // Peut être un array ou une string

  // Convertir en array si nécessaire
  const rolesArray = Array.isArray(newRoles) ? newRoles : [newRoles];

  // Vérifier que tous les rôles sont valides
  const validRoles = ['admin', 'doctor', 'patient', 'hrRecruiter', 'candidate'];
  const invalidRoles = rolesArray.filter(r => !validRoles.includes(r));
  
  if (invalidRoles.length > 0) {
    return res.status(400).json({ message: `Rôles invalides: ${invalidRoles.join(', ')}` });
  }

  if (rolesArray.length === 0) {
    return res.status(400).json({ message: 'Au moins un rôle doit être spécifié' });
  }

  try {
    console.log(`🔄 Modification des rôles de l'utilisateur ${id} vers [${rolesArray.join(', ')}]`);
    
    // Récupérer l'utilisateur actuel
    const currentUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    
    if (currentUser.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const oldRoles = currentUser[0].roles || [currentUser[0].role];
    const userEmail = currentUser[0].email;

    // Mettre à jour les rôles dans la table users
    await db.update(users)
      .set({ 
        roles: rolesArray,
        role: rolesArray[0], // Le premier rôle devient le rôle principal pour compatibilité
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(id)));

    // Créer des entrées dans les tables correspondant aux nouveaux rôles (si elles n'existent pas déjà)
    const baseData = {
      id: parseInt(id),
      firstName: 'À définir',
      lastName: 'À définir',
      email: userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    for (const role of rolesArray) {
      switch (role) {
        case 'patient':
          // Vérifier si l'entrée existe déjà
          const existingPatient = await db.select().from(patients).where(eq(patients.id, parseInt(id))).limit(1);
          if (existingPatient.length === 0) {
            await db.insert(patients).values(baseData);
          }
          break;
        case 'doctor':
          const existingDoctor = await db.select().from(doctors).where(eq(doctors.id, parseInt(id))).limit(1);
          if (existingDoctor.length === 0) {
            await db.insert(doctors).values(baseData);
          }
          break;
        case 'admin':
          const existingAdmin = await db.select().from(admins).where(eq(admins.id, parseInt(id))).limit(1);
          if (existingAdmin.length === 0) {
            await db.insert(admins).values(baseData);
          }
          break;
        case 'hrRecruiter':
          const existingHR = await db.select().from(hrRecruiters).where(eq(hrRecruiters.id, parseInt(id))).limit(1);
          if (existingHR.length === 0) {
            await db.insert(hrRecruiters).values(baseData);
          }
          break;
        case 'candidate':
          const existingCandidate = await db.select().from(candidates).where(eq(candidates.id, parseInt(id))).limit(1);
          if (existingCandidate.length === 0) {
            await db.insert(candidates).values(baseData);
          }
          break;
      }
    }

    console.log(`✅ Rôles modifiés: [${oldRoles.join(', ')}] → [${rolesArray.join(', ')}]`);
    
    const updatedUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    res.json({ message: 'Rôles modifiés avec succès', user: updatedUser[0] });
  } catch (error) {
    console.error('Erreur lors de la modification des rôles:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Suppression de l'utilisateur ${id}`);
    
    // Récupérer l'utilisateur
    const user = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userRole = user[0].role;
    const userId = parseInt(id);

    // Supprimer de la table spécifique au rôle
    switch (userRole) {
      case 'patient':
        await db.delete(patients).where(eq(patients.id, userId));
        break;
      case 'doctor':
        // Handle cascading deletes for doctor
        // Delete prescriptions first (they reference appointments and doctor)
        await db.delete(prescriptions).where(eq(prescriptions.doctorId, userId));
        
        // Delete medical records
        await db.delete(medicalRecords).where(eq(medicalRecords.doctorId, userId));
        
        // Delete appointments
        await db.delete(appointments).where(eq(appointments.doctorId, userId));
        
        // Now delete the doctor
        await db.delete(doctors).where(eq(doctors.id, userId));
        break;
      case 'admin':
        await db.delete(admins).where(eq(admins.id, userId));
        break;
      case 'hrRecruiter':
        // Handle cascading deletes for hrRecruiter
        // Delete interviews where this user is the interviewer
        await db.delete(interviews).where(eq(interviews.interviewerId, userId));
        
        // Now delete the hrRecruiter
        await db.delete(hrRecruiters).where(eq(hrRecruiters.id, userId));
        break;
      case 'candidate':
        // Handle cascading deletes for candidate
        // Get all job applications for this candidate
        const candidateApplications = await db.select().from(jobApplications).where(eq(jobApplications.candidateUserId, userId));
        
        // Delete related data for each application
        for (const application of candidateApplications) {
          // Delete CV analyses
          await db.delete(cvAnalyses).where(eq(cvAnalyses.applicationId, application.id));
          
          // Delete interviews
          await db.delete(interviews).where(eq(interviews.applicationId, application.id));
        }
        
        // Delete job applications
        await db.delete(jobApplications).where(eq(jobApplications.candidateUserId, userId));
        
        // Now delete the candidate
        await db.delete(candidates).where(eq(candidates.id, userId));
        break;
    }

    // Supprimer de la table users
    await db.delete(users).where(eq(users.id, parseInt(id)));

    console.log(`✅ Utilisateur supprimé: ${user[0].email}`);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser
};
