# 🔐 Création d'un Compte Administrateur

## ⚠️ Important
Les comptes administrateur **NE PEUVENT PAS** être créés via la page d'inscription. Ils doivent être créés manuellement pour des raisons de sécurité.

## Méthode 1 : Script Node.js (Recommandé)

Utilisez le script `create-admin.js` pour créer un admin de manière interactive :

```bash
cd backend
node create-admin.js
```

Le script vous demandera :
- Prénom de l'admin
- Nom de l'admin  
- Email de l'admin
- Mot de passe (minimum 6 caractères)

## Méthode 2 : SQL Direct

Si vous préférez créer l'admin directement en SQL, connectez-vous à votre base de données PostgreSQL et exécutez :

```sql
-- Remplacez les valeurs entre guillemets par vos propres données
-- Le mot de passe sera hashé, utilisez bcryptjs pour générer le hash

-- 1. Insérer l'utilisateur dans la table users
INSERT INTO users (email, password_hash, role, roles)
VALUES (
  'admin@mediflow.ai',
  '$2a$10$...', -- Hash bcrypt du mot de passe
  'admin',
  ARRAY['admin']
)
RETURNING id;

-- 2. Insérer les détails dans la table admins (utilisez l'id retourné ci-dessus)
INSERT INTO admins (id, first_name, last_name, email)
VALUES (
  1, -- Remplacez par l'id retourné à l'étape 1
  'Admin',
  'MediFlow',
  'admin@mediflow.ai'
);
```

## Générer un Hash Bcrypt

Pour générer un hash bcrypt de votre mot de passe, vous pouvez utiliser ce petit script Node.js :

```javascript
const bcrypt = require('bcryptjs');
const password = 'VotreMotDePasse123';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Ou en ligne de commande :
```bash
node -e "require('bcryptjs').hash('VotreMotDePasse123', 10).then(h => console.log(h))"
```

## Vérification

Après création, vérifiez que l'admin existe :

```sql
SELECT u.id, u.email, u.role, a.first_name, a.last_name
FROM users u
JOIN admins a ON u.id = a.id
WHERE u.role = 'admin';
```

## 🔔 Notifications Admin

Une fois connecté, l'admin recevra des notifications pour tous les événements importants :

- ✅ Nouvelles inscriptions (patients, médecins, RH, candidats)
- ✅ Nouveaux rendez-vous
- ✅ Rendez-vous acceptés/refusés
- ✅ Nouvelles ordonnances
- ✅ Nouveaux dossiers médicaux
- ✅ Nouvelles candidatures
- ✅ Entretiens planifiés
- ✅ Réponses aux entretiens
- ✅ Nouvelles offres d'emploi
- ✅ Offres supprimées
- ✅ Analyses IA de CV terminées

## Sécurité

⚠️ **IMPORTANT** : Changez immédiatement le mot de passe par défaut après la première connexion via la page de profil !
