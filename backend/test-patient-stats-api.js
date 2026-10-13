const jwt = require('jsonwebtoken');

async function testPatientStatsAPI() {
  try {
    // Créer un token JWT pour le patient (ID: 1 qui est le patient existant)
    const payload = {
      sub: 1, // patient ID
      email: 'medaminegobji@gmail.com',
      role: 'patient'
    };

    const token = jwt.sign(payload, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '1h' });
    console.log('Token généré pour le patient ID 1');

    // Tester l'API
    const response = await fetch('http://localhost:5000/api/patients/stats/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Statistiques patient récupérées avec succès:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Détails erreur:', errorText);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

testPatientStatsAPI();