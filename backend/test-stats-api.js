const jwt = require('jsonwebtoken');

async function testStatsAPI() {
  try {
    // Créer un token JWT pour le médecin (ID: 14 qui semble actif)
    const payload = {
      sub: 14, // doctor ID
      email: 'med@gmail.com',
      role: 'doctor'
    };

    const token = jwt.sign(payload, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '1h' });
    console.log('Token généré pour le médecin ID 14');

    // Tester l'API
    const response = await fetch('http://localhost:5000/api/doctors/stats/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Statistiques récupérées avec succès:');
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

testStatsAPI();