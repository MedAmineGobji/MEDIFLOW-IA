# Migration vers Groq AI (Analyse CV gratuite)

## ✅ Ce qui a été fait

1. **SDK installé** : `groq-sdk@0.37.0` installé avec succès
2. **Service créé** : `GroqService` remplace `OpenAIService`
3. **Configuration mise à jour** : `.env` configuré pour Groq
4. **Analyseur mis à jour** : `cvAnalyzer.js` utilise maintenant Groq
5. **Test script mis à jour** : `test-ai-analysis.js` utilise Groq

## 🔑 Obtenir une clé API Groq gratuite

### Étape 1 : Créer un compte Groq
1. Allez sur [https://console.groq.com/](https://console.groq.com/)
2. Cliquez sur "Sign up" (inscription gratuite)
3. Utilisez votre email ou compte Google/GitHub

### Étape 2 : Générer une clé API
1. Dans le dashboard, allez dans "API Keys"
2. Cliquez sur "Create API Key"
3. Donnez un nom à votre clé (ex: "MediFlowAI")
4. Copiez la clé générée

### Étape 3 : Configurer votre projet
1. Ouvrez `backend/.env`
2. Remplacez `your-groq-api-key-here` par votre vraie clé API :
```env
GROQ_API_KEY="gsk_votre_clé_api_ici"
USE_AI_ANALYSIS="true"
```

## 🧪 Tester l'analyse IA gratuite

Une fois la clé configurée, testez avec :

```bash
# Depuis la racine du projet
node test-ai-analysis.js
```

Vous devriez voir une analyse complète du CV de test avec :
- Score de recommandation
- Compétences identifiées
- Analyse détaillée
- Questions d'entretien suggérées

## 🎯 Avantages de Groq vs OpenAI

| Aspect | Groq | OpenAI |
|--------|------|--------|
| **Coût** | 100% gratuit | Payant après quota |
| **Vitesse** | Ultra-rapide (GPU) | Rapide |
| **Modèles** | Mixtral 8x7B, Llama | GPT-4, GPT-3.5 |
| **Limites** | 30 requêtes/minute | Quota mensuel |

## 🔧 Architecture technique

Le système maintient la **compatibilité hybride** :
- **IA prioritaire** : Utilise Groq quand disponible
- **Fallback automatique** : Bascule sur règles si IA échoue
- **Format unifié** : Même structure de réponse pour le frontend

## 🚀 Utilisation en production

1. **Clé API configurée** ✅
2. **Test réussi** : `node test-ai-analysis.js`
3. **Frontend prêt** : Interface CV avec sélection d'offres
4. **Backend opérationnel** : API `/api/cv/analyze` avec IA

## 📊 Métriques d'analyse IA

Groq fournit des analyses structurées :
- **Recommandation** : RECOMMANDÉ / À CONSIDÉRER / NON RECOMMANDÉ
- **Score** : 0-100 basé sur l'adéquation
- **Adéquation poste** : Analyse spécifique selon l'offre sélectionnée
- **Questions d'entretien** : 5 questions personnalisées

---

**Prochaine étape** : Configurez votre clé API Groq et testez ! 🎉