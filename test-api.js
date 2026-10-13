const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function testCVAnalysis() {
  try {
    const testFilePath = path.join(__dirname, 'test-cv.txt');

    if (!fs.existsSync(testFilePath)) {
      console.log('Fichier de test non trouvé');
      return;
    }

    const form = new FormData();
    form.append('cv', fs.createReadStream(testFilePath));

    const response = await axios.post('http://localhost:5000/api/cv-analysis/analyze', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('Réponse de l\'API:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Erreur lors du test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testCVAnalysis();