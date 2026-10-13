const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const GroqService = require('./backend/src/utils/groqService');

async function testGroq() {
  console.log('🧪 Test du service Groq AI...\n');

  const aiService = new GroqService();

  // CV de test
  const testCV = `
Dr. Marie Dubois
Médecin Cardiologue

FORMATION
- Doctorat en Médecine - Université Paris Descartes (2012)
- DES de Cardiologie - Université Paris Descartes (2015)
- Master en Biologie Cardiovasculaire (2010)

EXPÉRIENCE PROFESSIONNELLE
- Cardiologue Senior - Hôpital Saint-Joseph, Paris (2018-Présent)
  • Consultations spécialisées en cardiologie
  • Suivi de patients post-infarctus
  • Interventions en salle de cathétérisme

- Chef de Clinique - Hôpital Cochin, Paris (2015-2018)
  • Responsable de l'unité de soins intensifs cardiologiques
  • Formation des internes en cardiologie
  • Recherche clinique en insuffisance cardiaque

COMPÉTENCES TECHNIQUES
- Échocardiographie Doppler
- Cathétérisme cardiaque diagnostique et interventionnel
- Holter ECG et MAPA
- Tests d'effort cardiovasculaire
- Implantation de pacemakers et défibrillateurs

COMPÉTENCES CLINIQUES
- Diagnostic et traitement des pathologies cardiovasculaires
- Gestion des urgences cardiologiques
- Suivi des patients à risque cardiovasculaire
- Prévention primaire et secondaire

PUBLICATIONS
- 12 articles dans des revues internationales
- Communications à des congrès européens

LANGUES
- Français (natif)
- Anglais (courant)
- Espagnol (intermédiaire)
  `;

  const jobRequirements = `cardiologie, échocardiographie, cathétérisme, urgences cardiologiques, expérience hospitalière de 5 ans minimum, DES de cardiologie, publications scientifiques`;

  try {
    console.log('🤖 Analyse du CV avec IA...');
    const analysis = await aiService.analyzeCV(testCV, 'Cardiologue Senior', 'Poste de cardiologue expérimenté', jobRequirements);

    console.log('\n📊 RÉSULTATS DE L\'ANALYSE IA:');
    console.log('=====================================');
    console.log(`Recommandation: ${analysis.recommandation}`);
    console.log(`Score: ${analysis.score}/100`);
    console.log(`Niveau de confiance: ${analysis.niveauConfiance}`);
    console.log(`Domaine recommandé: ${analysis.domaineRecommande}`);

    console.log('\n🏆 POINTS FORTS:');
    analysis.pointsForts.forEach((point, i) => console.log(`${i + 1}. ${point}`));

    console.log('\n⚠️ LACUNES:');
    analysis.lacunes.forEach((point, i) => console.log(`${i + 1}. ${point}`));

    console.log('\n✅ ADÉQUATION AU POSTE:');
    console.log(`Score: ${analysis.adequationPoste.score}%`);
    console.log('Exigences satisfaites:', analysis.adequationPoste.exigencesSatisfaites);
    console.log('Exigences manquantes:', analysis.adequationPoste.exigencesManquantes);

    console.log('\n💬 QUESTIONS D\'ENTRETIEN:');
    analysis.questionsEntretien.forEach((question, i) => console.log(`${i + 1}. ${question}`));

    console.log('\n📝 ANALYSE DÉTAILLÉE:');
    console.log(analysis.analyseDetaillee);

    console.log('\n✅ Test réussi ! L\'IA fonctionne correctement.');

  } catch (error) {
    console.error('❌ Erreur lors du test IA:', error.message);
    console.log('\n💡 Conseils:');
    console.log('1. Vérifiez que OPENAI_API_KEY est défini dans backend/.env');
    console.log('2. Assurez-vous que votre clé API Groq est valide');
    console.log('3. Vérifiez votre connexion internet');
  }
}

// Exécuter le test
testGroq();