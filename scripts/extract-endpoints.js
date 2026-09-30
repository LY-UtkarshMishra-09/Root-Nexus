process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');

async function extractAllEndpoints() {
  const url = 'https://webportal.jiit.ac.in:6011/studentportal/main.b245565e3c2f3033.js';
  console.log('Fetching', url);
  const js = await fetch(url).then(r => r.text());
  console.log('Downloaded JS bundle, size:', js.length);

  // Match all endpoints like "/token/...", "/StudentClassAttendance/...", etc.
  const regex = /["'](\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)+)["']/g;
  let match;
  const endpoints = new Set();
  while ((match = regex.exec(js)) !== null) {
    const ep = match[1];
    if (!ep.includes('assets/') && !ep.includes('node_modules') && !ep.includes('.png') && !ep.includes('.jpg')) {
      endpoints.add(ep);
    }
  }

  const sorted = Array.from(endpoints).sort();
  console.log('Found', sorted.length, 'API endpoints:');
  sorted.forEach(ep => console.log(' -', ep));

  // Also extract encryption service logic
  const encIdx = js.indexOf('encryptUsingAES256');
  if (encIdx !== -1) {
    console.log('\n=== AES Encryption Implementation in CampusLynx ===');
    console.log(js.slice(Math.max(0, encIdx - 200), encIdx + 800));
  }
}

extractAllEndpoints().catch(console.error);
