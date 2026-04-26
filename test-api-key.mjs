#!/usr/bin/env node

import https from 'https';

const API_KEY = 'AIzaSyB18Sif-t6X5pBDn0S36x6d_6hZclohsmw';
const TEST_URL = `https://maps.googleapis.com/maps/api/staticmap?center=42.1955,-88.3601&zoom=20&size=400x400&maptype=satellite&key=${API_KEY}`;

console.log('Testing Google Maps API key...\n');
console.log('API Key:', API_KEY);
console.log('Testing with Static Maps API (satellite imagery)...\n');

https.get(TEST_URL, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('\n✅ API Key is VALID');
      console.log('Image size:', data.length, 'bytes');
    } else if (res.statusCode === 403) {
      console.log('\n❌ API Key REJECTED (403 Forbidden)');
      console.log('Possible causes:');
      console.log('  - API key is invalid or revoked');
      console.log('  - Maps API is not enabled on the project');
      console.log('  - Project has billing issues');
      console.log('  - API key has domain restrictions');
    } else if (res.statusCode === 400) {
      console.log('\n⚠️  Bad Request (400)');
      console.log('Response:', data.substring(0, 500));
    } else {
      console.log('\n⚠️  Unexpected status:', res.statusCode);
      console.log('Response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('❌ Network Error:', err.message);
});
