# 🤖 Système d'Analyse IA des CV - MediFlow AI

## Vue d'ensemble

Le système d'analyse de CV de MediFlow AI peut fonctionner avec deux modes :

1. **🤖 Mode IA** : Utilise OpenAI GPT-4 pour une analyse intelligente et nuancée
2. **📋 Mode Règles** : Système traditionnel basé sur la correspondance de mots-clés

## Configuration de l'IA

### 1. Obtenir une clé API OpenAI

1. Rendez-vous sur [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys" et créez une nouvelle clé
4. Copiez la clé API

### 2. Configuration du Backend

1. Ouvrez le fichier `backend/.env`
2. Ajoutez votre clé API :
   ```env
   OPENAI_API_KEY="sk-your-api-key-here"
   USE_AI_ANALYSIS="true"
   ```

3. Redémarrez le serveur backend :
   ```bash
   cd backend
   npm start
   ```

### 3. Vérification

L'interface affichera un indicateur :
- 🧠 **"Analyse IA"** : Mode IA activé
- 📄 **"Analyse par règles"** : Mode fallback

## Fonctionnalités de l'IA

### Analyse Intelligente
- **Compréhension contextuelle** : L'IA comprend le sens des expériences décrites
- **Évaluation nuancée** : Analyse qualitative de la progression de carrière
- **Recommandations personnalisées** : Questions d'entretien adaptées au profil
- **Adéquation poste** : Évaluation fine de l'adéquation aux exigences

### Avantages vs Système de Règles
- ✅ Analyse plus précise et qualitative
- ✅ Compréhension du langage naturel
- ✅ Adaptation aux contextes complexes
- ✅ Génération de contenu original
- ✅ Évaluation subjective plus fine

## Structure des Données

### Format de Sortie IA
```json
{
  "recommandation": "RECOMMANDÉ | À CONSIDÉRER | NON RECOMMANDÉ",
  "score": 0-100,
  "competences": ["compétence1", "compétence2"],
  "experience": "résumé intelligent",
  "formation": "analyse de formation",
  "pointsForts": ["analyse qualitative"],
  "lacunes": ["évaluation constructive"],
  "analyseDetaillee": "analyse narrative détaillée",
  "questionsEntretien": ["questions adaptées"],
  "domaineRecommande": "recommandation métier",
  "niveauConfiance": "ÉLEVÉ | MOYEN | FAIBLE",
  "adequationPoste": {
    "score": 0-100,
    "exigencesSatisfaites": ["exigences validées"],
    "exigencesManquantes": ["axes d'amélioration"],
    "commentaires": "analyse détaillée"
  }
}
```

## Sécurité et Coûts

### Sécurité
- Clés API stockées de manière sécurisée
- Données médicales traitées confidentiellement
- Validation stricte des réponses IA

### Coûts OpenAI
- **GPT-4o-mini** : ~0.15¢/1K tokens
- Analyse typique : ~500-1000 tokens
- Coût par CV : ~0.1-0.2¢

### Fallback Automatique
En cas d'erreur IA, le système bascule automatiquement vers l'analyse par règles.

## Développement

### Architecture
```
CVAnalyzer
├── OpenAIService (IA)
│   ├── analyzeCV()
│   └── compareCVs()
└── analyzeCVWithRules() (fallback)
```

### Tests
```bash
# Test avec IA
USE_AI_ANALYSIS=true npm test

# Test avec règles
USE_AI_ANALYSIS=false npm test
```

## Dépannage

### Erreur "OpenAI API Key missing"
- Vérifiez que `OPENAI_API_KEY` est défini dans `.env`
- Redémarrez le serveur après modification

### Erreur "Rate limit exceeded"
- Votre quota OpenAI est dépassé
- Passez temporairement en mode règles : `USE_AI_ANALYSIS=false`

### Analyse lente
- GPT-4o-mini est plus rapide que GPT-4
- Considérez le cache pour les analyses répétées

## Évolution Future

- Support d'autres modèles IA (Claude, Gemini)
- Cache intelligent des analyses
- Apprentissage continu sur les retours RH
- Analyse multi-langues
- Intégration de bases de données médicales