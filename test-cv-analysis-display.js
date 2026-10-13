// Test rapide de l'API CV analysis
const testCVAnalysis = async () => {
  try {
    // Simuler un fichier
    const testContent = 'John Doe\nSoftware Developer\n5 years experience\nJavaScript, React, Node.js';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'test-cv.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('cv', file);

    console.log('🧪 Test de l\'analyse CV...');

    const response = await fetch('http://localhost:5000/api/cv-analysis/analyze', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Remplacer par un vrai token
      },
      body: formData
    });

    const result = await response.json();
    console.log('📊 Status:', response.status);
    console.log('📊 Response:', result);

    if (result.success) {
      console.log('✅ Analyse réussie!');
      console.log('📊 Données:', result.data);
      console.log('📊 Score:', result.data.score);
      console.log('📊 Recommandation:', result.data.recommandation);
    } else {
      console.log('❌ Échec:', result.message);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Exécuter le test
testCVAnalysis();