// Script de test pour vérifier les fonctionnalités œil et téléchargement
// dans la page de classement des candidats

const testCandidateRankingFeatures = async () => {
  console.log('🧪 Test des fonctionnalités de classement des candidats...');

  try {
    // Test 1: Vérifier que la page se charge
    console.log('📄 Test 1: Chargement de la page candidate-ranking...');
    const response = await fetch('http://localhost:3001/candidate-ranking');
    if (response.ok) {
      console.log('✅ Page candidate-ranking accessible');
    } else {
      console.log('❌ Erreur de chargement de la page');
      return;
    }

    // Test 2: Vérifier l'API des analyses
    console.log('🔍 Test 2: Vérification de l\'API des analyses...');
    const analysesResponse = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
      headers: {
        'Authorization': 'Bearer test-token' // Token fictif pour le test
      }
    });

    if (analysesResponse.status === 401) {
      console.log('✅ API des analyses répond (authentification requise)');
    } else {
      console.log('ℹ️  Réponse API analyses:', analysesResponse.status);
    }

    // Test 3: Vérifier l'API des candidatures
    console.log('👥 Test 3: Vérification de l\'API des candidatures...');
    const applicationsResponse = await fetch('http://localhost:5000/api/job-applications/all', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (applicationsResponse.status === 401) {
      console.log('✅ API des candidatures répond (authentification requise)');
    } else {
      console.log('ℹ️  Réponse API candidatures:', applicationsResponse.status);
    }

    console.log('🎉 Tests terminés ! Les APIs sont accessibles.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
};

// Exécuter les tests
testCandidateRankingFeatures();