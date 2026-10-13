# MediFlow AI 🏥🤖

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> **Système CRM intelligent pour cliniques médicales** - Gestion complète des patients, médecins, rendez-vous et recrutement médical avec analyse IA des CV.

MediFlow AI est une plateforme complète de gestion hospitalière qui révolutionne le recrutement médical grâce à l'intelligence artificielle. Combinez la puissance d'une API REST robuste (Node.js/Express + Drizzle ORM) avec une interface moderne (Next.js/Tailwind CSS) pour une expérience utilisateur exceptionnelle.

## ✨ Fonctionnalités Principales

### 👥 Gestion des Utilisateurs Multi-Rôles
- **Authentification JWT** sécurisée avec refresh tokens
- **5 rôles distincts** : Admin, Médecin, Patient, RH Recruteur, Candidat
- **Profils personnalisés** selon le rôle avec permissions granulaires

### 🏥 Gestion Médicale Complète
- **CRUD Patients** : Dossiers complets avec antécédents médicaux
- **CRUD Médecins** : Spécialisations, disponibilités, statistiques
- **Rendez-vous** : Planification, modification, annulation avec notifications
- **Dossiers Médicaux** : Historique complet, prescriptions, diagnostics

### 🎯 Recrutement Intelligent avec IA
- **Analyse automatique des CV** avec extraction intelligente du texte
- **Scoring IA** sur 100 points basé sur compétences médicales
- **Recommandations automatisées** : RECOMMANDÉ/À CONSIDÉRER/NON RECOMMANDÉ
- **Rapports détaillés** avec points forts, lacunes et questions d'entretien
- **Comparaison de candidats** pour optimisation du recrutement

### 📊 Tableaux de Bord Personnalisés
- **Admin** : Vue d'ensemble globale avec statistiques temps réel
- **Médecin** : Agenda, patients, dossiers médicaux
- **Patient** : Rendez-vous, historique médical, prescriptions
- **RH** : Gestion candidats, offres d'emploi, analyses IA
- **Candidat** : Suivi candidatures, analyses CV

## 🏗️ Architecture Technique

```
MediFlowAI/
├── backend/                          # 🖥️ API Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # 🔌 Connexion PostgreSQL + Drizzle
│   │   ├── controllers/              # 🎮 Logique métier
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── doctorController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── medicalRecordController.js
│   │   │   ├── jobApplicationController.js
│   │   │   ├── candidateController.js
│   │   │   └── cvAnalysisController.js  # 🧠 Analyse IA des CV
│   │   ├── middleware/
│   │   │   └── auth.js                # 🔐 JWT Auth + Authorization
│   │   ├── routes/                    # 🛣️ Endpoints REST
│   │   │   ├── auth.js
│   │   │   ├── patients.js
│   │   │   ├── doctors.js
│   │   │   ├── appointments.js
│   │   │   ├── medical-records.js
│   │   │   ├── job-applications.js
│   │   │   ├── candidates.js
│   │   │   └── cv-analysis.js         # 📄 Analyse CV
│   │   ├── utils/                     # 🛠️ Utilitaires
│   │   │   ├── cvAnalyzer.js          # 🤖 IA Google Gemini
│   │   │   └── cvExtractor.js         # 📑 Extraction texte
│   │   └── index.js                   # 🚀 Point d'entrée serveur
│   ├── uploads/cv/                    # 📎 Stockage CV
│   ├── package.json
│   └── .env.example
├── database/                          # 🗄️ Schéma + Migrations
│   ├── schema.js                      # 📋 Définition tables Drizzle
│   └── migrations/                    # 🔄 Scripts migration
├── frontend/                          # 🎨 Interface Next.js
│   ├── app/                           # 📱 Pages (App Router)
│   │   ├── layout.tsx                 # 🎭 Layout principal
│   │   ├── page.tsx                   # 🏠 Page d'accueil
│   │   ├── login/page.tsx             # 🔑 Connexion
│   │   ├── signup/page.tsx            # 📝 Inscription
│   │   ├── dashboard/page.tsx         # 📊 Dashboard Admin
│   │   ├── patients/page.tsx          # 👥 Gestion Patients
│   │   ├── doctors/page.tsx           # 👨‍⚕️ Gestion Médecins
│   │   ├── appointments/page.tsx      # 📅 Rendez-vous
│   │   ├── medical-records/page.tsx   # 📋 Dossiers Médicaux
│   │   ├── doctor-dashboard/page.tsx  # 🩺 Espace Médecin
│   │   ├── patient-dashboard/page.tsx # 🏥 Espace Patient
│   │   ├── hr-dashboard/page.tsx      # 👔 Espace RH
│   │   ├── candidates/page.tsx        # 👥 Liste Candidats
│   │   ├── job-applications/page.tsx  # 📄 Candidatures
│   │   └── job-offers/page.tsx        # 💼 Offres d'emploi
│   ├── components/                    # 🧩 Composants réutilisables
│   │   ├── ui/                        # 🎨 Composants UI (shadcn/ui)
│   │   └── forms/                     # 📝 Formulaires
│   ├── lib/                           # 🔧 Utilitaires frontend
│   │   ├── useAuth.ts                 # 🎣 Hook authentification
│   │   └── RoleGuard.tsx              # 🛡️ Protection routes
│   ├── types/                         # 📝 Types TypeScript
│   ├── styles/
│   │   └── globals.css                # 🎨 Styles Tailwind
│   ├── public/                        # 🖼️ Assets statiques
│   ├── package.json
│   └── tsconfig.json
├── seed.js                            # 🌱 Script amorçage données
├── drizzle.config.js                  # ⚙️ Configuration Drizzle
├── package.json                       # 📦 Dépendances racine
└── README.md                          # 📖 Documentation
```

## 🛠️ Stack Technique

### Backend
- **Runtime** : Node.js ≥18
- **Framework** : Express.js
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : JWT (jsonwebtoken) + bcryptjs
- **Sécurité** : Helmet, CORS, validation des entrées
- **IA** : Google Gemini AI pour analyse CV
- **Upload** : Multer pour gestion fichiers

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : shadcn/ui
- **State Management** : React Hooks + Context
- **HTTP Client** : Fetch API natif

### DevOps & Outils
- **ORM** : Drizzle Kit pour migrations
- **Linting** : ESLint
- **Testing** : Jest (planifié)
- **Documentation** : JSDoc + OpenAPI (planifié)

## 🚀 Démarrage Rapide

### 📋 Prérequis
- **Node.js** ≥18.0.0
- **PostgreSQL** ≥13
- **npm** ou **yarn**
- **Git**

### ⚡ Installation en 5 Minutes

#### 1. Clonage et Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/MediFlowAI.git
cd MediFlowAI

# Installation des dépendances
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

#### 2. Configuration Base de Données
```bash
# Créer la base de données PostgreSQL
createdb mediflow_ai

# Variables d'environnement (backend/.env)
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials PostgreSQL
```

#### 3. Configuration IA (Optionnel)
```bash
# Pour l'analyse de CV, ajouter dans backend/.env
GOOGLE_AI_API_KEY=votre_clé_google_ai
```

#### 4. Migration Base de Données
```bash
# Générer et appliquer les migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

#### 5. Amorçage des Données
```bash
# Peupler la base avec des données de test
node seed.js
```

#### 6. Lancement des Services
```bash
# Terminal 1 - Backend
cd backend && npm run dev
# API disponible sur http://localhost:5000

# Terminal 2 - Frontend
cd frontend && npm run dev
# Application disponible sur http://localhost:3000
```

### 🎯 Comptes de Test
Après le seed, utilisez ces comptes :
- **Admin** : admin@mediflow.com / admin123
- **Médecin** : doctor@mediflow.com / doctor123
- **Patient** : patient@mediflow.com / patient123
- **RH** : hr@mediflow.com / hr123
- **Candidat** : candidate@mediflow.com / candidate123

## 📡 API Documentation

### 🔐 Authentification
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mediflow.com",
  "password": "admin123",
  "role": "admin"
}
```

### 👥 Gestion Patients
```http
GET    /api/patients          # Liste patients (admin/doctor)
GET    /api/patients/:id      # Détail patient
POST   /api/patients          # Créer patient (admin)
PUT    /api/patients/:id      # Modifier patient (admin)
DELETE /api/patients/:id      # Supprimer patient (admin)
```

### 🧠 Analyse IA des CV
```http
POST /api/cv-analysis/analyze
Content-Type: multipart/form-data

# Fichier CV + ID offre d'emploi optionnel
# Retourne analyse complète avec score et recommandations
```

### 📅 Rendez-vous
```http
GET    /api/appointments      # Liste RDV avec patients/médecins
POST   /api/appointments      # Créer RDV
PUT    /api/appointments/:id  # Modifier statut/date
DELETE /api/appointments/:id  # Annuler RDV (admin)
```

## 🎨 Interface Utilisateur

### 🎯 Pages Principales

#### Dashboard Admin
- 📊 Statistiques temps réel (patients, RDV, médecins)
- 📈 Graphiques d'activité mensuelle
- 👥 Gestion utilisateurs et rôles
- ⚙️ Configuration système

#### Espace Médecin
- 📅 Agenda des rendez-vous
- 👥 Liste patients avec dossiers
- 📋 Création dossiers médicaux
- 💊 Gestion prescriptions

#### Espace Patient
- 📅 Mes rendez-vous
- 📋 Mon dossier médical
- 💊 Mes prescriptions
- 📞 Contact médecins

#### Espace RH
- 👥 Gestion candidats et CV
- 🤖 Analyse IA automatique
- 💼 Gestion offres d'emploi
- 📄 Suivi candidatures

## 🧠 Intelligence Artificielle - Analyse CV

### 🔍 Extraction Intelligente du Texte
- **Multi-format** : PDF, DOCX, TXT
- **OCR intégré** pour PDFs scannés
- **Nettoyage automatique** : suppression headers/footers
- **Structuration** : détection sections (expérience, formation, compétences)

### 📊 Système de Scoring IA
- **Score composite /100** basé sur 4 critères :
  - 🩺 Compétences médicales (40%)
  - 🏥 Expérience professionnelle (30%)
  - 🎯 Adéquation au poste (20%)
  - 👥 Qualités transversales (10%)
- **Niveau confiance** : Élevé/Moyen/Faible

### 🎯 Recommandations Automatisées
- **RECOMMANDÉ** (≥80) : Profil excellent, entretien immédiat
- **À CONSIDÉRER** (60-79) : Bon potentiel avec développement
- **NON RECOMMANDÉ** (<60) : Ne correspond pas aux critères

### 📋 Rapport Détaillé Généré
- **Analyse compétences** avec exemples du CV
- **Points forts et lacunes** identifiés
- **Questions d'entretien** suggérées automatiquement
- **Plan développement** personnalisé

## 🧪 Tests et Qualité

### Tests Unitaires
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Tests d'Intégration
```bash
# Tests API
npm run test:api

# Tests E2E (planifié)
npm run test:e2e
```

### Qualité Code
```bash
# Linting
npm run lint

# Formatage
npm run format

# Type checking
npm run type-check
```

## 🚀 Déploiement

### Production Backend
```bash
cd backend
npm run build
npm start
```

### Production Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker (Planifié)
```bash
# Build et run avec Docker Compose
docker-compose up -d
```

### Variables Environnement Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
JWT_SECRET=votre_secret_jwt_prod
GOOGLE_AI_API_KEY=votre_clé_prod
```

## 🤝 Contribution

### Processus de Contribution
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** configuré pour la qualité
- **Prettier** pour le formatage
- **TypeScript** strict pour le frontend
- **Tests** requis pour les nouvelles fonctionnalités

### Types de Contributions
- 🐛 **Bug fixes**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Documentation**
- 🎨 **UI/UX améliorations**
- 🧪 **Tests**
- 🔧 **Outils et scripts**

## 📈 Roadmap

### Phase 1 ✅ (Actuelle)
- [x] Authentification multi-rôles
- [x] CRUD complet patients/médecins/RDV
- [x] Tableaux de bord personnalisés
- [x] Analyse IA des CV

### Phase 2 🔄 (En cours)
- [ ] Notifications temps réel (WebSocket)
- [ ] Téléconsultation intégrée
- [ ] API mobile React Native
- [ ] Système de facturation

### Phase 3 📋 (Planifié)
- [ ] IA prédictive pour diagnostics
- [ ] Intégration équipements médicaux
- [ ] Analytics avancés
- [ ] Multi-établissements

## 📞 Support

### Issues et Bugs
- 🐛 [GitHub Issues](https://github.com/votre-username/MediFlowAI/issues)
- 📧 Email : support@mediflow.ai

### Documentation
- 📖 [Wiki](https://github.com/votre-username/MediFlowAI/wiki)
- 🎥 [Tutoriels vidéo](https://youtube.com/mediflow-ai)

## 📄 Licence

Distribué sous licence **ISC**. Voir `LICENSE` pour plus d'informations.

---

<div align="center">

**MediFlow AI** - Révolutionnez la gestion hospitalière avec l'IA 🤖🏥

[🌟 Star us on GitHub](https://github.com/votre-username/MediFlowAI) • [📧 Contact](mailto:contact@mediflow.ai) • [🌐 Website](https://mediflow.ai)

</div>
