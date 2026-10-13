# Guide des Rôles Multiples - MediFlow AI

## 📋 Vue d'ensemble

Le système MediFlow AI supporte maintenant l'assignation de **plusieurs rôles** à un seul utilisateur. Cela permet à une personne d'avoir accès à différentes fonctionnalités selon ses responsabilités.

## 🎯 Cas d'usage

### Exemples pratiques :
- **Médecin + Admin** : Un médecin chef peut gérer les patients ET administrer le système
- **Patient + Candidat** : Un patient peut aussi postuler pour un emploi dans l'hôpital
- **RH Recruteur + Admin** : Un responsable RH peut gérer les recrutements ET administrer les utilisateurs
- **Docteur + Patient** : Un médecin peut aussi être un patient dans le système

## 🔧 Comment utiliser

### 1. Accéder à la gestion des rôles

**En tant qu'administrateur:**
- Depuis le **Dashboard Admin**, cliquez sur le bouton **"Gestion Utilisateurs"** (en haut à droite)
- Ou cliquez sur la carte **"Gestion Rôles"** dans les KPI
- Ou depuis le **Dashboard principal**, cliquez sur **"Gestion des Rôles"** dans les Actions Rapides

### 2. Modifier les rôles d'un utilisateur

1. Dans la page **Gestion des Utilisateurs**, trouvez l'utilisateur dans la liste
2. Cliquez sur l'icône **Modifier** (crayon) à côté de l'utilisateur
3. Une fenêtre modale s'ouvre avec la liste des rôles disponibles
4. **Sélectionnez un ou plusieurs rôles** en cliquant sur les cases
5. Les rôles sélectionnés apparaissent avec une coche et un fond coloré
6. Cliquez sur **"Confirmer"** pour sauvegarder

### 3. Visualiser les rôles multiples

Dans le tableau des utilisateurs, les rôles apparaissent sous forme de **badges colorés** :
- 🟣 **Administrateur** : Violet/Rose
- 🟢 **Médecin** : Vert
- 🔵 **Patient** : Cyan/Bleu
- 🟠 **RH Recruteur** : Orange/Rouge
- 🟡 **Candidat** : Jaune

Un utilisateur avec plusieurs rôles affichera plusieurs badges.

## 🔐 Système d'autorisation

### Fonctionnement :
- L'utilisateur peut accéder à **toutes les fonctionnalités** de ses rôles assignés
- L'authentification vérifie **automatiquement** tous les rôles
- Compatible avec l'ancien système (rôle unique)

### Exemples :
- Si vous êtes **Admin + Médecin**, vous pouvez :
  - Gérer tous les utilisateurs (Admin)
  - Consulter et modifier les patients (Médecin)
  - Accéder aux deux dashboards

## 💾 Structure technique

### Base de données :
- **users.role** : Rôle principal (pour compatibilité)
- **users.roles** : Array de rôles (nouveau système)

### Tables spécifiques aux rôles :
Quand vous assignez plusieurs rôles, des entrées sont créées dans toutes les tables correspondantes :
- `patients` pour le rôle Patient
- `doctors` pour le rôle Médecin
- `admins` pour le rôle Admin
- `hrRecruiters` pour le rôle RH Recruteur
- `candidates` pour le rôle Candidat

## ⚠️ Important

### Règles :
1. **Au moins un rôle** doit toujours être assigné
2. Le **premier rôle** sélectionné devient le rôle principal
3. Les anciennes entrées dans les tables de rôles sont **supprimées** lors du changement
4. Les nouvelles entrées sont **créées automatiquement**

### Sécurité :
- Seuls les **administrateurs** peuvent modifier les rôles
- Les modifications sont **journalisées** dans la console
- Les tokens JWT incluent **tous les rôles** de l'utilisateur

## 🚀 Migration depuis l'ancien système

Le système est **rétrocompatible** :
- Les utilisateurs avec un seul rôle (ancien système) continuent de fonctionner
- Lors de la première connexion, le rôle unique est automatiquement converti en array
- Aucune action manuelle n'est requise

## 🔍 Dépannage

### Problème : Les rôles multiples ne s'affichent pas
**Solution :** Déconnectez-vous et reconnectez-vous pour obtenir un nouveau token JWT avec les rôles mis à jour

### Problème : Accès refusé malgré le bon rôle
**Solution :** Vérifiez que le rôle est bien dans la liste `users.roles` de l'utilisateur en base de données

### Problème : Impossible de désélectionner tous les rôles
**Solution :** C'est normal ! Au moins un rôle doit être assigné pour maintenir l'intégrité du système

## 📝 Logs et Debugging

Les modifications de rôles sont journalisées :
```
🔄 Modification des rôles de l'utilisateur 5 vers [admin, doctor]
✅ Rôles modifiés: patient → [admin, doctor]
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Version :** 2.0  
**Date :** Décembre 2024  
**Système :** MediFlow AI
