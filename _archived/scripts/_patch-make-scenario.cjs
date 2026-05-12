/**
 * Patch the 4 PATCH modules in the live Make.com scenario blueprint
 * with corrected social link URL expressions, then push via API.
 */
const https = require('https');
const fs = require('fs');

const API_TOKEN = 'ed89e46b-845c-4cd6-a8cf-899e7b830a6a';
const SCENARIO_ID = 9108116;
const BASE_URL = 'eu2.make.com';

// Fixed body content per module
const FIXED_BODIES = {
  112: JSON.stringify({
    id: '{{7.data.post_id}}',
    status: 'published',
    facebook_post_url: '{{ifempty(12.permalink_url; concat("https://www.facebook.com/"; 12.id))}}',
  }, null, 2),
  120: JSON.stringify({
    id: '{{7.data.post_id}}',
    status: 'published',
    linkedin_post_url: '{{concat("https://www.linkedin.com/feed/update/"; 20.id; "/")}}',
  }, null, 2),
  121: JSON.stringify({
    id: '{{7.data.post_id}}',
    status: 'published',
    instagram_post_url: '{{ifempty(21.permalink; concat("https://www.instagram.com/p/"; 21.id; "/"))}}',
  }, null, 2),
  123: JSON.stringify({
    id: '{{7.data.post_id}}',
    status: 'published',
    pinterest_post_url: '{{concat("https://www.pinterest.com/pin/"; 23.id; "/")}}',
  }, null, 2),
};

function patchModules(obj) {
  let count = 0;
  if (!obj || typeof obj !== 'object') return count;
  if (Array.isArray(obj)) {
    for (const item of obj) count += patchModules(item);
    return count;
  }
  if (typeof obj.id === 'number' && FIXED_BODIES[obj.id]) {
    if (obj.mapper) {
      const oldBody = obj.mapper.jsonStringBodyContent;
      obj.mapper.jsonStringBodyContent = FIXED_BODIES[obj.id];
      console.log(`  Patched module ${obj.id}`);
      console.log(`    OLD: ${String(oldBody).substring(0, 80)}...`);
      console.log(`    NEW: ${FIXED_BODIES[obj.id].substring(0, 80)}...`);
      count++;
    }
  }
  for (const key of Object.keys(obj)) {
    count += patchModules(obj[key]);
  }
  return count;
}

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_URL,
      path: `/api/v2${path}`,
      method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  HTTP ${res.statusCode}`);
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

(async () => {
  // 1. Load the saved blueprint
  const raw = JSON.parse(fs.readFileSync('/tmp/live_blueprint.json', 'utf8'));
  const blueprint = raw.response.blueprint;
  const scheduling = raw.response.scheduling;

  // 2. Patch modules
  console.log('Patching modules...');
  const patchCount = patchModules(blueprint);
  console.log(`Total modules patched: ${patchCount}`);

  if (patchCount !== 4) {
    console.error('ERROR: Expected to patch 4 modules, got', patchCount);
    process.exit(1);
  }

  // 3. Push updated blueprint — Make API requires these as JSON strings
  console.log('\nPushing to Make.com API...');
  const result = await apiRequest('PATCH', `/scenarios/${SCENARIO_ID}`, {
    blueprint: JSON.stringify(blueprint),
    scheduling: JSON.stringify(scheduling),
  });

  console.log('Response status:', result.status);
  if (result.status === 200) {
    console.log('SUCCESS: Scenario updated!');
    const updated = result.body;
    console.log('Scenario name:', updated?.scenario?.name || updated?.name || '(unknown)');
  } else {
    console.log('FAILED:', JSON.stringify(result.body).substring(0, 1000));
  }
})();
