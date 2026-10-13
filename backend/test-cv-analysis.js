const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Test simple de l'extraction et analyse CV
async function testCVAnalysis() {
  try {
    console.log('🧪 Test de l\'analyse CV...\n');

    // Importer les modules nécessaires
    const CVExtractor = require('./src/utils/cvExtractor');
    const CVAnalyzer = require('./src/utils/cvAnalyzer');

    // Créer un fichier de test
    const testCVPath = path.join(__dirname, 'test-cv.txt');
    const testContent = `
Dr. Marie Dubois
Médecin Cardiologue

FORMATION
- Doctorat en Médecine - Université Paris Descartes (2012)
- DES de Cardiologie - Université Paris Descartes (2015)

EXPÉRIENCE PROFESSIONNELLE
- Cardiologue Senior - Hôpital Saint-Louis (2015-2024)
- Chef de clinique en cardiologie (2018-2024)
- Recherche clinique en insuffisance cardiaque

COMPÉTENCES
- Échocardiographie
- Cathétérisme cardiaque
- Urgences cardiologiques
- Formation des internes
    `;

    fs.writeFileSync(testCVPath, testContent);
    console.log('✅ Fichier de test créé');

    // Extraire le texte
    const cvExtractor = new CVExtractor();
    const cvText = await cvExtractor.extractText(testCVPath);
    console.log('✅ Texte extrait:', cvText.substring(0, 100) + '...');

    // Forcer l'utilisation de l'IA pour le test
    process.env.USE_AI_ANALYSIS = 'true';

    // Analyser le CV
    const cvAnalyzer = new CVAnalyzer();
    const analysis = await cvAnalyzer.analyzeCV(cvText, 'Cardiologue Senior', 'Poste de cardiologue expérimenté', 'DES de cardiologie, 5 ans expérience');

    console.log('✅ Analyse terminée:');
    console.log('Recommandation:', analysis.recommandation);
    console.log('Score:', analysis.score);
    console.log('Compétences:', analysis.competences?.slice(0, 3));

    // Nettoyer
    fs.unlinkSync(testCVPath);
    console.log('✅ Test réussi !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCVAnalysis();