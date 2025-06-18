#!/usr/bin/env node

/**
 * Test X API v2 directly
 */

const https = require('https');

const BEARER_TOKEN = process.env.X_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error('X_BEARER_TOKEN environment variable not set');
  process.exit(1);
}

console.log('Bearer token length:', BEARER_TOKEN.length);
console.log('Bearer token preview:', BEARER_TOKEN.substring(0, 20) + '...');

// Test with a known tweet
const testTweetId = '20'; // Jack's first tweet

const options = {
  hostname: 'api.twitter.com',
  path: `/2/tweets?ids=${testTweetId}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=name,username`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  }
};

console.log('\nMaking request to:', options.hostname + options.path);

const req = https.request(options, (res) => {
  console.log('\nResponse Status:', res.statusCode);
  console.log('Response Headers:');
  console.log('  x-rate-limit-limit:', res.headers['x-rate-limit-limit']);
  console.log('  x-rate-limit-remaining:', res.headers['x-rate-limit-remaining']);
  console.log('  x-rate-limit-reset:', res.headers['x-rate-limit-reset']);
  
  if (res.headers['x-rate-limit-reset']) {
    const resetDate = new Date(parseInt(res.headers['x-rate-limit-reset']) * 1000);
    console.log('  Reset time:', resetDate.toLocaleString());
  }
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();