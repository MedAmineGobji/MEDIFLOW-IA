// Test de l'API CV analysis sans applicationId
const testCVAnalysisWithoutApplicationId = async () => {
  try {
    // Créer un fichier de test
    const testContent = 'John Doe\nSoftware Developer\n5 years experience\nJavaScript, React, Node.js';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'test-cv.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('cv', file);
    // Pas d'applicationId envoyé

    const response = await fetch('http://localhost:5000/api/cv-analysis/analyze', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Remplacer par un vrai token
      },
      body: formData
    });

    const result = await response.json();
    console.log('Test result without applicationId:', result);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Exécuter le test
testCVAnalysisWithoutApplicationId();