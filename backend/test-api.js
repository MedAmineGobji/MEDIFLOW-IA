const jwt = require('jsonwebtoken');
const http = require('http');

// Simuler un token pour le candidat ID 6
const token = jwt.sign({ id: 6, role: 'candidate', email: 'candidat@gmail.com' }, 'your-secret-key');

console.log('Token généré:', token);

// Tester l'API des candidatures
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/job-applications',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const response = JSON.parse(data);
      console.log('Réponse API candidatures:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('Erreur parsing:', error);
      console.log('Données brutes:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Erreur requête:', error.message);
});

req.end();