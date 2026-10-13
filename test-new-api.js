const testAnalyzeExistingCV = async () => {
  try {
    // Simuler une requête à la nouvelle API
    const response = await fetch('http://localhost:5000/api/cv-analysis/analyze-existing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Remplacer par un vrai token
      },
      body: JSON.stringify({
        cvUrl: '/uploads/cv/cv-1768489978752-156114841.txt', // Un CV existant
        jobOfferId: '1',
        applicationId: '1'
      })
    });

    const result = await response.json();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Exécuter le test
testAnalyzeExistingCV();