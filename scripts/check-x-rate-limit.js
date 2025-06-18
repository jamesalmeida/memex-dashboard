#!/usr/bin/env node

/**
 * Check X API rate limit status
 */

const https = require('https');

const BEARER_TOKEN = process.env.X_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error('X_BEARER_TOKEN environment variable not set');
  process.exit(1);
}

// Check rate limit status endpoint
const options = {
  hostname: 'api.twitter.com',
  path: '/1.1/application/rate_limit_status.json?resources=tweets',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n=== X API Rate Limit Status ===\n');
      
      if (response.resources && response.resources.tweets) {
        const tweetLookup = response.resources.tweets['/tweets/:id'];
        if (tweetLookup) {
          console.log('Tweet Lookup Endpoint (/tweets/:id):');
          console.log(`  Limit: ${tweetLookup.limit}`);
          console.log(`  Remaining: ${tweetLookup.remaining}`);
          console.log(`  Reset: ${new Date(tweetLookup.reset * 1000).toLocaleString()}`);
          
          if (tweetLookup.remaining === 0) {
            const minutesUntilReset = Math.ceil((tweetLookup.reset * 1000 - Date.now()) / 1000 / 60);
            console.log(`\n⚠️  Rate limited! Reset in ${minutesUntilReset} minutes`);
          }
        }
      }
      
      // Also check v2 endpoint
      console.log('\n\nFull response:', JSON.stringify(response, null, 2));
      
    } catch (error) {
      console.error('Error parsing response:', error);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();