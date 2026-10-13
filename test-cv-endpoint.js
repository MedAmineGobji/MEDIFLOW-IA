const fs = require('fs');
const path = require('path');
const http = require('http');

// Test rapide de l'endpoint CV analysis
async function testCVAnalysis() {
  try {
    console.log('🧪 Test de l\'endpoint CV Analysis...\n');

    // Créer un fichier de test simple
    const testCVPath = path.join(__dirname, 'test-cv.txt');
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

    // Créer une requête multipart/form-data manuellement
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="cv"; filename="test-cv.txt"',
      'Content-Type: text/plain',
      '',
      testContent,
      `--${boundary}--`
    ].join('\r\n');

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/cv-analysis/analyze',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    console.log('📤 Envoi de la requête...');

    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(formData);
      req.end();
    });

    console.log('📥 Status:', response.status);
    console.log('📄 Response:', response.data);

    // Nettoyer
    fs.unlinkSync(testCVPath);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testCVAnalysis();