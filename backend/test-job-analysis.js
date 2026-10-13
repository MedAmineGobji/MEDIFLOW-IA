const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const CVExtractor = require('./src/utils/cvExtractor');
const CVAnalyzer = require('./src/utils/cvAnalyzer');

async function testJobSpecificAnalysis() {
  try {
    console.log('🧪 Test d\'analyse CV selon l\'offre d\'emploi...\n');

    // Créer un CV de test
    const testCVPath = path.join(__dirname, 'test-cv-job.txt');
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
    console.log('✅ CV de test créé');

    // Extraire le texte
    const cvExtractor = new CVExtractor();
    const cvText = await cvExtractor.extractText(testCVPath);
    console.log('✅ Texte extrait');

    const cvAnalyzer = new CVAnalyzer();

    // Test 1: Analyse générale (sans offre spécifique)
    console.log('\n📊 Test 1: Analyse générale (sans offre)');
    const generalAnalysis = await cvAnalyzer.analyzeCV(cvText, '', '', '');
    console.log('Score général:', generalAnalysis.score);
    console.log('Recommandation:', generalAnalysis.recommandation);

    // Test 2: Analyse pour poste de Cardiologue Senior
    console.log('\n📊 Test 2: Analyse pour poste de Cardiologue Senior');
    const jobSpecificAnalysis = await cvAnalyzer.analyzeCV(
      cvText,
      'Cardiologue Senior',
      'Poste de cardiologue expérimenté dans un hôpital universitaire',
      'DES de cardiologie, 5 ans expérience minimum, compétences en échocardiographie et cathétérisme, expérience en recherche clinique'
    );
    console.log('Score spécifique:', jobSpecificAnalysis.score);
    console.log('Recommandation:', jobSpecificAnalysis.recommandation);

    // Test 3: Analyse pour poste différent (Pédiatre)
    console.log('\n📊 Test 3: Analyse pour poste de Pédiatre (non adapté)');
    const mismatchAnalysis = await cvAnalyzer.analyzeCV(
      cvText,
      'Pédiatre Senior',
      'Poste de pédiatre spécialisé dans les soins néonatals',
      'DES de pédiatrie, expérience en néonatologie, compétences en soins intensifs pédiatriques'
    );
    console.log('Score inadapté:', mismatchAnalysis.score);
    console.log('Recommandation:', mismatchAnalysis.recommandation);

    // Comparaison
    console.log('\n📈 Comparaison des scores:');
    console.log(`Général: ${generalAnalysis.score}/100`);
    console.log(`Spécifique (Cardiologie): ${jobSpecificAnalysis.score}/100`);
    console.log(`Non adapté (Pédiatrie): ${mismatchAnalysis.score}/100`);

    // Nettoyer
    fs.unlinkSync(testCVPath);
    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testJobSpecificAnalysis();