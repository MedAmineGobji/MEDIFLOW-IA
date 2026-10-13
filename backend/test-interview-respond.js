const jwt = require('jsonwebtoken');
const http = require('http');

// JWT secret from .env
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Create token for candidate (assuming ID 6 exists)
const token = jwt.sign({
  sub: 6,
  role: 'candidate',
  email: 'candidat@gmail.com'
}, JWT_SECRET);

console.log('Testing interview respond endpoint...');
console.log('Token:', token);

// Test responding to interview (assuming interview ID 7 exists)
const postData = JSON.stringify({
  response: 'accepted'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/interviews/7/respond',
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Making request to:', options.path);

const req = http.request(options, (res) => {
  let data = '';
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(postData);
req.end();