const GroqService = require('./groqService');

class CVAnalyzer {
  constructor() {
    // Mots-clés pour l'analyse médicale (fallback si IA non disponible)
    this.medicalKeywords = {
      specialities: {
        'cardiologie': 10,
        'neurologie': 9,
        'pédiatrie': 8,
        'gynécologie': 8,
        'chirurgie': 9,
        'urgences': 8,
        'radiologie': 7,
        'anesthésie': 8,
        'médecine générale': 7,
        'ophtalmologie': 6,
        'dermatologie': 6,
        'psychiatrie': 7,
        'rhumatologie': 6,
        'endocrinologie': 7,
        'néphrologie': 7,
        'hépatologie': 7,
        'pneumologie': 7,
        'gastro-entérologie': 7,
        'hématologie': 8,
        'oncologie': 9,
        'infectiologie': 8
      },
      skills: {
        'diagnostic': 8,
        'traitement': 7,
        'suivi patient': 6,
        'urgence': 9,
        'réanimation': 10,
        'chirurgie': 9,
        'imagerie': 6,
        'biologie': 5,
        'prescription': 7,
        'consultation': 6,
        'hospitalisation': 7,
        'soins intensifs': 9,
        'pédiatrie': 8,
        'gériatrie': 6,
        'prévention': 5,
        'éducation thérapeutique': 6
      },
      experience: {
        'chef de clinique': 10,
        'praticien hospitalier': 9,
        'interne': 7,
        'résident': 6,
        'médecin généraliste': 6,
        'spécialiste': 8,
        'urgentiste': 8,
        'chirurgien': 9,
        'anesthésiste': 9,
        'radiologue': 7,
        'biologiste': 6,
        'pharmacien': 5
      },
      education: {
        'doctorat': 10,
        'phd': 10,
        'master': 8,
        'bac+5': 8,
        'bac+4': 7,
        'des': 9,
        'desc': 9,
        'internat': 8,
        'résidanat': 7,
        'cap': 5,
        'bts': 4,
        'dut': 4
      }
    };

    this.statusMapping = {
      'nouveau': 'Nouveau',
      'en cours': 'En cours',
      'entretien prévu': 'Entretien prévu',
      'accepté': 'Accepté',
      'refusé': 'Refusé'
    };

    // Service IA
    this.groqService = null;
    this.useAI = process.env.USE_AI_ANALYSIS === 'true';

    if (this.useAI) {
      try {
        this.groqService = new GroqService();
        console.log('🤖 Analyse IA activée avec Groq');
      } catch (error) {
        console.warn('⚠️ Impossible d\'initialiser le service IA, utilisation du système de règles:', error.message);
        this.useAI = false;
      }
    } else {
      console.log('📋 Utilisation du système d\'analyse par règles');
    }
  }

  /**
   * Analyse un CV avec l'IA ou le système de règles
   * @param {string} cvText - Le texte extrait du CV
   * @param {string} jobTitle - Le titre du poste (optionnel)
   * @param {string} jobDescription - La description du poste (optionnel)
   * @param {string} jobRequirements - Les exigences du poste (optionnel)
   * @returns {Promise<Object>} Analyse complète du CV
   */
  async analyzeCV(cvText, jobTitle = '', jobDescription = '', jobRequirements = '') {
    try {
      // Utiliser l'IA si disponible
      if (this.useAI && this.groqService) {
        console.log('🤖 Analyse avec IA Groq...');
        const aiAnalysis = await this.groqService.analyzeCV(cvText, jobTitle, jobDescription, jobRequirements);

        // Adapter le format de l'IA au format attendu par le frontend
        return {
          recommandation: aiAnalysis.recommandation,
          score: aiAnalysis.score,
          competences: aiAnalysis.competences,
          experience: aiAnalysis.experience,
          formation: aiAnalysis.formation,
          pointsForts: aiAnalysis.pointsForts,
          lacunes: aiAnalysis.lacunes,
          analyseDetaillee: aiAnalysis.analyseDetaillee,
          questionsEntretien: aiAnalysis.questionsEntretien,
          domaineRecommande: aiAnalysis.domaineRecommande,
          niveauConfiance: aiAnalysis.niveauConfiance,
          jobMatch: {
            score: aiAnalysis.adequationPoste.score,
            matches: aiAnalysis.adequationPoste.exigencesSatisfaites
          },
          requirementsAnalysis: {
            score: aiAnalysis.adequationPoste.score,
            matchedRequirements: aiAnalysis.adequationPoste.exigencesSatisfaites,
            missingRequirements: aiAnalysis.adequationPoste.exigencesManquantes,
            totalRequirements: aiAnalysis.adequationPoste.exigencesSatisfaites.length + aiAnalysis.adequationPoste.exigencesManquantes.length
          },
          analyzedAt: new Date().toISOString(),
          version: '2.0-IA',
          aiPowered: true
        };
      }

      // Fallback vers le système de règles
      console.log('📋 Analyse avec système de règles...');
      return this.analyzeCVWithRules(cvText, jobTitle, jobDescription, jobRequirements);

    } catch (error) {
      console.error('Erreur lors de l\'analyse du CV:', error);

      // En cas d'erreur IA, utiliser le système de règles comme fallback
      if (this.useAI) {
        console.log('⚠️ Erreur IA, basculement vers système de règles...');
        try {
          return this.analyzeCVWithRules(cvText, jobTitle, jobDescription, jobRequirements);
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
        }
      }

      throw new Error('Impossible d\'analyser le CV');
    }
  }

  /**
   * Analyse un CV avec le système de règles (méthode originale)
   */
  analyzeCVWithRules(cvText, jobTitle = '', jobDescription = '', jobRequirements = '') {
    const text = cvText.toLowerCase();

    // Analyse des différentes dimensions
    const specialities = this.analyzeSpecialities(text);
    const skills = this.analyzeSkills(text);
    const experience = this.analyzeExperience(text);
    const education = this.analyzeEducation(text);

    // Calcul du score composite
    let finalScore = this.calculateScore(specialities, skills, experience, education);

    // Ajuster le score si des exigences spécifiques sont fournies
    let requirementsAnalysis = null;
    if (jobRequirements) {
      requirementsAnalysis = this.analyzeRequirementsMatch(text, jobRequirements);
      finalScore = Math.round((finalScore * 0.7) + (requirementsAnalysis.score * 0.3));
      finalScore = Math.min(finalScore, 100);
    }

    // Détermination de la recommandation
    const recommandation = this.getRecommendation(finalScore);

    // Analyse de l'adéquation au poste
    const jobMatch = this.analyzeJobMatch(text, jobTitle, jobDescription, jobRequirements);

    // Génération de l'analyse détaillée
    const analysis = {
      recommandation: recommandation || 'NON RECOMMANDÉ',
      score: finalScore || 0,
      competences: Array.isArray(specialities.found) && Array.isArray(skills.found) ? [...specialities.found, ...skills.found] : [],
      experience: experience.summary || 'Expérience non spécifiée',
      formation: education.level || 'Formation non spécifiée',
      pointsForts: Array.isArray(this.generateStrengths(specialities, skills, experience, education)) ? this.generateStrengths(specialities, skills, experience, education) : [],
      lacunes: Array.isArray(this.generateWeaknesses(specialities, skills, experience, education)) ? this.generateWeaknesses(specialities, skills, experience, education) : [],
      analyseDetaillee: this.generateDetailedAnalysis(specialities, skills, experience, education, jobMatch) || 'Analyse non disponible',
      questionsEntretien: Array.isArray(this.generateInterviewQuestions(specialities, skills, experience)) ? this.generateInterviewQuestions(specialities, skills, experience) : [],
      domaineRecommande: this.recommendDomain(specialities, skills) || 'Domaine non déterminé',
      niveauConfiance: this.getConfidenceLevel(text) || 'FAIBLE',
      jobMatch: jobMatch,
      requirementsAnalysis: requirementsAnalysis,
      analyzedAt: new Date().toISOString(),
      version: '1.0-rules',
      aiPowered: false
    };

    return analysis;
  }


  analyzeSpecialities(text) {
    const found = [];
    let totalScore = 0;

    for (const [speciality, score] of Object.entries(this.medicalKeywords.specialities)) {
      if (text.includes(speciality)) {
        found.push(speciality);
        totalScore += score;
      }
    }

    return {
      found,
      score: found.length > 0 ? Math.min(totalScore / found.length, 10) : 0
    };
  }

  analyzeSkills(text) {
    const found = [];
    let totalScore = 0;

    for (const [skill, score] of Object.entries(this.medicalKeywords.skills)) {
      if (text.includes(skill)) {
        found.push(skill);
        totalScore += score;
      }
    }

    return {
      found,
      score: found.length > 0 ? Math.min(totalScore / found.length, 10) : 0
    };
  }

  analyzeExperience(text) {
    const found = [];
    let totalScore = 0;
    let years = 0;

    // Détection des années d'expérience
    const yearPatterns = [
      /(\d+)\s*ans?\s*d['']?\s*expérience/g,
      /expérience\s*:\s*(\d+)\s*ans?/g,
      /(\d+)\s*années?\s*d['']?\s*expériences?/g
    ];

    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        years = Math.max(years, parseInt(match[1]));
      }
    }

    for (const [exp, score] of Object.entries(this.medicalKeywords.experience)) {
      if (text.includes(exp)) {
        found.push(exp);
        totalScore += score;
      }
    }

    return {
      found,
      score: found.length > 0 ? Math.min(totalScore / found.length, 10) : 0,
      years,
      summary: `${years} années d'expérience${found.length > 0 ? ` en tant que ${found.join(', ')}` : ''}`
    };
  }

  analyzeEducation(text) {
    let level = 'Non déterminé';
    let score = 0;

    for (const [edu, eduScore] of Object.entries(this.medicalKeywords.education)) {
      if (text.includes(edu)) {
        level = edu;
        score = eduScore;
        break; // Prendre le niveau le plus élevé trouvé
      }
    }

    return { level, score };
  }

  calculateScore(specialities, skills, experience, education) {
    // Poids des différentes composantes
    const weights = {
      specialities: 0.3,
      skills: 0.25,
      experience: 0.25,
      education: 0.2
    };

    const score = Math.round(
      (specialities.score * weights.specialities * 10) +
      (skills.score * weights.skills * 10) +
      (experience.score * weights.experience * 10) +
      (education.score * weights.education * 10)
    );

    return Math.min(Math.max(score, 0), 100);
  }

  getRecommendation(score) {
    if (score >= 80) return 'RECOMMANDÉ';
    if (score >= 60) return 'À CONSIDÉRER';
    return 'NON RECOMMANDÉ';
  }

  analyzeJobMatch(text, jobTitle, jobDescription, jobRequirements = '') {
    if (!jobTitle && !jobDescription && !jobRequirements) return { score: 0, matches: [] };

    const jobText = (jobTitle + ' ' + jobDescription + ' ' + jobRequirements).toLowerCase();
    const matches = [];

    // Vérifier les correspondances entre CV et poste
    for (const [speciality] of Object.entries(this.medicalKeywords.specialities)) {
      if (text.includes(speciality) && jobText.includes(speciality)) {
        matches.push(speciality);
      }
    }

    for (const [skill] of Object.entries(this.medicalKeywords.skills)) {
      if (text.includes(skill) && jobText.includes(skill)) {
        matches.push(skill);
      }
    }

    return {
      score: matches.length * 10,
      matches
    };
  }

  analyzeRequirementsMatch(text, jobRequirements) {
    if (!jobRequirements) return { score: 0, matchedRequirements: [], missingRequirements: [] };

    const requirements = jobRequirements.toLowerCase().split(/[,\n;]/).map(req => req.trim()).filter(req => req.length > 0);
    const matchedRequirements = [];
    const missingRequirements = [];

    for (const requirement of requirements) {
      // Vérifier si l'exigence est mentionnée dans le CV
      if (text.includes(requirement) || requirement.split(' ').some(word => text.includes(word))) {
        matchedRequirements.push(requirement);
      } else {
        missingRequirements.push(requirement);
      }
    }

    const matchScore = requirements.length > 0 ? (matchedRequirements.length / requirements.length) * 100 : 0;

    return {
      score: Math.round(matchScore),
      matchedRequirements,
      missingRequirements,
      totalRequirements: requirements.length
    };
  }

  generateStrengths(specialities, skills, experience, education) {
    const strengths = [];

    if (specialities.found.length > 0) {
      strengths.push(`Spécialisation en ${specialities.found.join(', ')}`);
    }

    if (skills.found.length > 0) {
      strengths.push(`Compétences clés: ${skills.found.slice(0, 3).join(', ')}`);
    }

    if (experience.years > 0) {
      strengths.push(`${experience.years} années d'expérience professionnelle`);
    }

    if (education.score >= 8) {
      strengths.push(`Formation supérieure (${education.level})`);
    }

    return strengths;
  }

  generateWeaknesses(specialities, skills, experience, education) {
    const weaknesses = [];

    if (specialities.found.length === 0) {
      weaknesses.push('Spécialisation médicale non clairement identifiée');
    }

    if (skills.found.length < 3) {
      weaknesses.push('Nombre limité de compétences techniques mentionnées');
    }

    if (experience.years < 3) {
      weaknesses.push('Expérience professionnelle limitée');
    }

    if (education.score < 6) {
      weaknesses.push('Niveau de formation à confirmer');
    }

    return weaknesses;
  }

  generateDetailedAnalysis(specialities, skills, experience, education, jobMatch) {
    let analysis = 'Analyse du profil candidat:\n\n';

    analysis += `• Formation: ${education.level}\n`;
    analysis += `• Expérience: ${experience.summary}\n`;
    analysis += `• Spécialisations: ${specialities.found.join(', ') || 'Non spécifiées'}\n`;
    analysis += `• Compétences: ${skills.found.join(', ') || 'À développer'}\n`;

    if (jobMatch.matches.length > 0) {
      analysis += `• Adéquation au poste: Bonne correspondance (${jobMatch.matches.join(', ')})\n`;
    }

    return analysis;
  }

  generateInterviewQuestions(specialities, skills, experience) {
    const questions = [
      'Pouvez-vous nous parler de votre expérience la plus marquante ?',
      'Quelles sont vos motivations pour rejoindre notre établissement ?'
    ];

    if (specialities.found.length > 0) {
      questions.push(`Pouvez-vous détailler votre expérience en ${specialities.found[0]} ?`);
    }

    if (skills.found.length > 0) {
      questions.push(`Comment mettez-vous en pratique vos compétences en ${skills.found[0]} ?`);
    }

    return questions.slice(0, 5); // Maximum 5 questions
  }

  recommendDomain(specialities, skills) {
    if (specialities.found.length > 0) {
      return specialities.found[0];
    }

    if (skills.found.includes('urgence') || skills.found.includes('réanimation')) {
      return 'Médecine d\'urgence';
    }

    if (skills.found.includes('chirurgie')) {
      return 'Chirurgie';
    }

    return 'Médecine générale';
  }

  getConfidenceLevel(text) {
    const wordCount = text.split(' ').length;

    if (wordCount > 500) return 'ÉLEVÉ';
    if (wordCount > 200) return 'MOYEN';
    return 'FAIBLE';
  }

  /**
   * Analyse comparative entre plusieurs CV
   */
  async compareCVs(cvAnalyses, jobRequirements) {
    try {
      // Trier par score décroissant
      const sorted = cvAnalyses.sort((a, b) => b.score - a.score);

      const classement = sorted.map((analysis, index) => ({
        candidatIndex: cvAnalyses.indexOf(analysis),
        position: index + 1,
        justification: `Score: ${analysis.score}/100 - ${analysis.recommandation}`
      }));

      const recommandationGlobale = `Le candidat ${classement[0].candidatIndex + 1} présente le meilleur profil avec un score de ${sorted[0].score}/100.`;

      return {
        classement,
        recommandationGlobale
      };
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      return null;
    }
  }
}

module.exports = CVAnalyzer;