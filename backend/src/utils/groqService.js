const Groq = require('groq-sdk');

class GroqService {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Analyse un CV avec l'IA Groq (gratuite)
   * @param {string} cvText - Le texte extrait du CV
   * @param {string} jobTitle - Titre du poste (optionnel)
   * @param {string} jobDescription - Description du poste (optionnel)
   * @param {string} jobRequirements - Exigences du poste (optionnel)
   * @returns {Promise<Object>} Analyse IA du CV
   */
  async analyzeCV(cvText, jobTitle = '', jobDescription = '', jobRequirements = '') {
    try {
      const prompt = this.buildAnalysisPrompt(cvText, jobTitle, jobDescription, jobRequirements);

      const response = await this.client.chat.completions.create({
        model: "llama-3.1-8b-instant", // Modèle gratuit et rapide de Groq
        messages: [
          {
            role: "system",
            content: `Vous êtes un expert en recrutement médical avec plus de 20 ans d'expérience.
            Analysez les CV de candidats pour des postes médicaux avec précision et objectivité.
            Fournissez des analyses détaillées, constructives et basées sur des critères médicaux professionnels.
            Répondez en français pour les analyses.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Pour des réponses cohérentes
        max_tokens: 1500, // Réduit pour éviter les erreurs de limite
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(content);

      // Validation et nettoyage de la réponse
      return this.validateAndCleanAnalysis(analysis);

    } catch (error) {
      console.error('Erreur lors de l\'analyse IA Groq:', error);
      throw new Error('Erreur lors de l\'analyse IA du CV');
    }
  }

  /**
   * Construit le prompt d'analyse selon le contexte
   */
  buildAnalysisPrompt(cvText, jobTitle, jobDescription, jobRequirements) {
    let prompt = `Analysez ce CV de candidat médical et fournissez une évaluation complète au format JSON.

CV à analyser:
${cvText.substring(0, 2000)}... (tronqué pour la concision)

`;

    if (jobTitle || jobDescription || jobRequirements) {
      prompt += `
CONTEXTE DU POSTE:
- Titre: ${jobTitle || 'Non spécifié'}
- Description: ${jobDescription || 'Non spécifiée'}
- Exigences: ${jobRequirements || 'Non spécifiées'}

`;
    }

    prompt += `
Fournissez votre analyse au format JSON avec cette structure exacte:
{
  "recommandation": "RECOMMANDÉ" | "À CONSIDÉRER" | "NON RECOMMANDÉ",
  "score": nombre entre 0 et 100,
  "competences": ["compétence1", "compétence2", ...],
  "experience": "résumé de l'expérience en une phrase",
  "formation": "niveau de formation identifié",
  "pointsForts": ["point fort 1", "point fort 2", ...],
  "lacunes": ["lacune 1", "lacune 2", ...],
  "analyseDetaillee": "analyse détaillée du profil avec JUSTIFICATION CLAIRE de votre recommandation (pourquoi recommandé ou non recommandé) - 4-5 phrases",
  "questionsEntretien": ["question1 spécifique au poste", "question2 spécifique au poste", "question3 générale domaine médical", "question4 générale domaine médical", "question5 éthique/déontologie médicale"],
  "domaineRecommande": "domaine médical recommandé",
  "niveauConfiance": "ÉLEVÉ" | "MOYEN" | "FAIBLE",
  "adequationPoste": {
    "score": nombre entre 0 et 100,
    "exigencesSatisfaites": ["exigence1", "exigence2", ...],
    "exigencesManquantes": ["exigence1", "exigence2", ...],
    "commentaires": "commentaires sur l'adéquation au poste"
  }
}

IMPORTANT pour les questions d'entretien:
- Questions 1-2: Spécifiques à la description du poste (si fournie) ou au profil du candidat
- Questions 3-4: Questions générales du domaine médical (pratiques cliniques, protocoles, urgences)
- Question 5: Question sur l'éthique et la déontologie médicale

IMPORTANT pour analyseDetaillee:
- Commencez par dire clairement si le profil est recommandé ou non
- Expliquez POURQUOI (quels critères sont satisfaits ou manquants)
- Mentionnez les points qui justifient la décision
- Soyez factuel et constructif

Critères d'évaluation:
- Score basé sur l'expérience, compétences, formation et adéquation au poste
- Soyez objectif et factuel
- Privilégiez les candidats avec expérience clinique
- Évaluez la progression de carrière et les responsabilités
- Considérez l'adéquation aux exigences spécifiques du poste si fournies`;

    return prompt;
  }

  /**
   * Valide et nettoie la réponse de l'IA
   */
  validateAndCleanAnalysis(analysis) {
    // Structure attendue
    const defaultAnalysis = {
      recommandation: 'À CONSIDÉRER',
      score: 50,
      competences: [],
      experience: 'Expérience à évaluer',
      formation: 'Formation à confirmer',
      pointsForts: [],
      lacunes: [],
      analyseDetaillee: 'Analyse en cours d\'évaluation',
      questionsEntretien: [
        'Pouvez-vous décrire votre expérience la plus pertinente pour ce poste ?',
        'Comment vos compétences répondent-elles aux exigences du poste ?',
        'Comment gérez-vous les situations d\'urgence médicale ?',
        'Décrivez votre approche pour maintenir vos connaissances médicales à jour',
        'Comment abordez-vous les dilemmes éthiques dans votre pratique médicale ?'
      ],
      domaineRecommande: 'Médecine générale',
      niveauConfiance: 'MOYEN',
      adequationPoste: {
        score: 50,
        exigencesSatisfaites: [],
        exigencesManquantes: [],
        commentaires: 'Évaluation en cours'
      }
    };

    // Validation et nettoyage
    const cleaned = { ...defaultAnalysis };

    if (analysis.recommandation && ['RECOMMANDÉ', 'À CONSIDÉRER', 'NON RECOMMANDÉ'].includes(analysis.recommandation)) {
      cleaned.recommandation = analysis.recommandation;
    }

    if (typeof analysis.score === 'number' && analysis.score >= 0 && analysis.score <= 100) {
      cleaned.score = Math.round(analysis.score);
    }

    if (Array.isArray(analysis.competences)) {
      cleaned.competences = analysis.competences.slice(0, 10); // Max 10 compétences
    }

    if (analysis.experience && typeof analysis.experience === 'string') {
      cleaned.experience = analysis.experience.substring(0, 200);
    }

    if (analysis.formation && typeof analysis.formation === 'string') {
      cleaned.formation = analysis.formation.substring(0, 100);
    }

    if (Array.isArray(analysis.pointsForts)) {
      cleaned.pointsForts = analysis.pointsForts.slice(0, 5);
    }

    if (Array.isArray(analysis.lacunes)) {
      cleaned.lacunes = analysis.lacunes.slice(0, 5);
    }

    if (analysis.analyseDetaillee && typeof analysis.analyseDetaillee === 'string') {
      cleaned.analyseDetaillee = analysis.analyseDetaillee.substring(0, 500);
    }

    if (Array.isArray(analysis.questionsEntretien)) {
      cleaned.questionsEntretien = analysis.questionsEntretien.slice(0, 5);
    }

    if (analysis.domaineRecommande && typeof analysis.domaineRecommande === 'string') {
      cleaned.domaineRecommande = analysis.domaineRecommande.substring(0, 100);
    }

    if (analysis.niveauConfiance && ['ÉLEVÉ', 'MOYEN', 'FAIBLE'].includes(analysis.niveauConfiance)) {
      cleaned.niveauConfiance = analysis.niveauConfiance;
    }

    // Gestion de l'adéquation au poste
    if (analysis.adequationPoste && typeof analysis.adequationPoste === 'object') {
      if (typeof analysis.adequationPoste.score === 'number') {
        cleaned.adequationPoste.score = Math.round(Math.max(0, Math.min(100, analysis.adequationPoste.score)));
      }

      if (Array.isArray(analysis.adequationPoste.exigencesSatisfaites)) {
        cleaned.adequationPoste.exigencesSatisfaites = analysis.adequationPoste.exigencesSatisfaites.slice(0, 10);
      }

      if (Array.isArray(analysis.adequationPoste.exigencesManquantes)) {
        cleaned.adequationPoste.exigencesManquantes = analysis.adequationPoste.exigencesManquantes.slice(0, 10);
      }

      if (analysis.adequationPoste.commentaires && typeof analysis.adequationPoste.commentaires === 'string') {
        cleaned.adequationPoste.commentaires = analysis.adequationPoste.commentaires.substring(0, 300);
      }
    }

    return cleaned;
  }

  /**
   * Compare plusieurs CV avec l'IA
   */
  async compareCVs(cvAnalyses, jobRequirements = '') {
    try {
      const prompt = `Comparez ces ${cvAnalyses.length} candidats pour un poste médical.
      Classez-les par ordre de recommandation et justifiez votre choix.

Candidats à comparer:
${cvAnalyses.map((cv, index) =>
  `Candidat ${index + 1}:
  Score: ${cv.score}/100
  Expérience: ${cv.experience}
  Formation: ${cv.formation}
  Compétences: ${cv.competences?.join(', ') || 'Non spécifiées'}
  Points forts: ${cv.pointsForts?.join(', ') || 'Non spécifiés'}`
).join('\n\n')}

${jobRequirements ? `Exigences du poste: ${jobRequirements}` : ''}

Fournissez une comparaison au format JSON:
{
  "classement": [
    {
      "candidatIndex": 0,
      "score": 85,
      "justification": "Excellente expérience...",
      "pointsForts": ["expérience", "compétences"],
      "pointsFaibles": ["manque de spécialisation"]
    }
  ],
  "recommandationGlobale": "Résumé de la comparaison"
}`;

      const response = await this.client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en recrutement médical. Comparez objectivement les candidats."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Erreur lors de la comparaison IA Groq:', error);
      throw new Error('Erreur lors de la comparaison IA des CV');
    }
  }
}

module.exports = GroqService;