// Test script to check CV analysis API
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('Testing CV Analysis API...');

    // Test without auth first
    const response = await makeRequest('http://localhost:5000/api/cv-analysis/analyses');
    console.log('Status:', response.status);
    console.log('Response:', response.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();