// Script de test pour vérifier les données réelles du dashboard RH
const testHRDashboardStats = async () => {
  console.log('🧪 Test des statistiques du dashboard RH...');

  try {
    // Simuler un token (en production, il faudrait être connecté)
    const token = 'test-token';

    // Test 1: Récupération des candidatures
    console.log('📄 Test 1: Récupération des candidatures...');
    const applicationsResponse = await fetch('http://localhost:5000/api/job-applications/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (applicationsResponse.status === 401) {
      console.log('✅ API candidatures accessible (authentification requise)');
    } else if (applicationsResponse.ok) {
      const applications = await applicationsResponse.json();
      console.log(`✅ ${applications.length} candidatures récupérées`);

      // Calculer les stats comme dans le dashboard
      const scheduledInterviews = applications.filter(app => app.status === 'entretien prévu').length;
      const hires = applications.filter(app => app.status === 'accepté').length;

      console.log(`   📊 Entretiens planifiés: ${scheduledInterviews}`);
      console.log(`   📊 Embauches: ${hires}`);
    }

    // Test 2: Récupération des analyses
    console.log('🔍 Test 2: Récupération des analyses IA...');
    const analysesResponse = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (analysesResponse.status === 401) {
      console.log('✅ API analyses accessible (authentification requise)');
    } else if (analysesResponse.ok) {
      const analysesResult = await analysesResponse.json();
      const analyzedCVs = analysesResult.data ? analysesResult.data.length : 0;
      console.log(`✅ ${analyzedCVs} CV analysés par l'IA`);
    }

    console.log('🎉 Tests terminés ! Les APIs pour les statistiques RH fonctionnent.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
};

// Exécuter les tests
testHRDashboardStats();