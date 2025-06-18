#!/usr/bin/env node

/**
 * Generate X (Twitter) Bearer Token from API Key and Secret
 * Run: node scripts/generate-x-bearer-token.js
 */

const https = require('https');

// Get credentials from environment or command line
const API_KEY = process.env.X_API_KEY || process.argv[2];
const API_KEY_SECRET = process.env.X_API_KEY_SECRET || process.argv[3];

if (!API_KEY || !API_KEY_SECRET) {
  console.error('Usage: node generate-x-bearer-token.js [API_KEY] [API_KEY_SECRET]');
  console.error('Or set X_API_KEY and X_API_KEY_SECRET environment variables');
  process.exit(1);
}

// Create credentials string
const credentials = Buffer.from(`${API_KEY}:${API_KEY_SECRET}`).toString('base64');

// Request options
const options = {
  hostname: 'api.twitter.com',
  port: 443,
  path: '/oauth2/token',
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Content-Length': 29
  }
};

// Make request
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.access_token) {
        console.log('\n✅ Bearer Token generated successfully!\n');
        console.log('Add this to your .env.local file:');
        console.log(`X_BEARER_TOKEN=${response.access_token}\n`);
      } else {
        console.error('❌ Failed to generate bearer token:', response);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

// Send the request
req.write('grant_type=client_credentials');
req.end();