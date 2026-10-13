// Test script to verify CV analysis functionality
const fetch = require('node-fetch');

async function testCVAnalysisAPI() {
  try {
    console.log('Testing CV Analysis API...');

    // Test getting all analyses
    const response = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but test the route
      }
    });

    console.log('API Response Status:', response.status);

    if (response.status === 401) {
      console.log('✅ API route exists and authentication is working');
    } else {
      console.log('Response:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testCVAnalysisAPI();