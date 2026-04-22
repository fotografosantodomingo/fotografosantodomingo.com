/**
 * Build and create a new Make.com scenario that:
 * 1. Runs every 12 hours (scheduling: indefinitely, interval: 43200)
 * 2. Calls /api/admin/next-unprocessed-photo to get the oldest unprocessed Cloudinary image
 * 3. Stops gracefully if no photo found (found === false)
 * 4. Runs the full existing pipeline (OpenAI → JSON → create-post → log → social → PATCH)
 *
 * Strategy:
 * - Module 200: HTTP GET next-unprocessed-photo (replaces webhook trigger)
 * - All {{1.public_id}} → {{200.data.public_id}}
 * - All {{1.asset_folder}} → {{200.data.asset_folder}}
 * - Add a filter on module 200's connection to module 2: only run if 200.data.found = true
 * - Remove module 1 (webhook) from the flow
 */
const https = require('https');
const fs = require('fs');

const API_TOKEN = 'ed89e46b-845c-4cd6-a8cf-899e7b830a6a';
const TEAM_ID = 1852253;
const ADMIN_SECRET = 'jtUeqi7u3yn01vcxgj4Z2mqw6D2E4kODSCekO6L3-WQ';
const BASE_URL = 'https://www.fotografosantodomingo.com';

// Load the live blueprint as starting point
const raw = JSON.parse(fs.readFileSync('/tmp/live_blueprint.json', 'utf8'));
const originalBp = raw.response.blueprint;

// Deep clone
const bp = JSON.parse(JSON.stringify(originalBp));

// ─── Step 1: Replace all {{1.X}} references ────────────────────────────────
const REMAP = {
  '{{1.public_id}}':        '{{200.data.public_id}}',
  '{{1.asset_folder}}':     '{{200.data.asset_folder}}',
  '{{1.format}}':           '{{200.data.format}}',
  '{{1.notification_type}}':'{{200.data.notification_type}}',
  '{{1.secure_url}}':       '{{200.data.secure_url}}',
};

function remapRefs(obj) {
  if (typeof obj === 'string') {
    let result = obj;
    for (const [from, to] of Object.entries(REMAP)) {
      result = result.replaceAll(from, to);
    }
    return result;
  }
  if (Array.isArray(obj)) return obj.map(remapRefs);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = remapRefs(v);
    return out;
  }
  return obj;
}

// ─── Step 2: Build module 200 — HTTP GET next-unprocessed-photo ─────────────
const module200 = {
  id: 200,
  module: 'http:MakeRequest',
  version: 4,
  parameters: { tlsType: '', proxyKeychain: '', authenticationType: 'noAuth' },
  mapper: {
    url: `${BASE_URL}/api/admin/next-unprocessed-photo`,
    method: 'get',
    headers: [
      { name: 'Authorization', value: `Bearer ${ADMIN_SECRET}` },
    ],
    contentType: 'json',
    shareCookies: false,
    parseResponse: true,
    allowRedirects: true,
    stopOnHttpError: false,
    requestCompressedContent: false,
  },
  // Filter: only continue if found = true
  filter: {
    name: 'Photo found',
    conditions: [[
      {
        a: '{{200.data.found}}',
        b: 'true',
        o: 'text:equal',
      },
    ]],
  },
  metadata: { designer: { x: -400, y: 0 } },
};

// ─── Step 3: Remove old webhook module (id=1) from flow, prepend module 200 ─
const oldFlow = bp.flow.filter(m => m.id !== 1);
// Remap all references in the remaining flow
const remappedFlow = remapRefs(oldFlow);
// Prepend module 200
bp.flow = [module200, ...remappedFlow];

// ─── Step 4: Verify module 2 (OpenAI) now references 200 ────────────────────
const raw2 = JSON.stringify(bp);
const oldRefs = (raw2.match(/\{\{1\./g) || []).length;
const newRefs = (raw2.match(/\{\{200\./g) || []).length;
console.log(`Old {{1.X}} refs remaining: ${oldRefs}`);
console.log(`New {{200.X}} refs added: ${newRefs}`);

// ─── Step 5: POST new scenario to Make ──────────────────────────────────────
function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'eu2.make.com',
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
        console.log(`HTTP ${res.statusCode}`);
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
  console.log('\nCreating new scheduled scenario in Make.com...');
  const result = await apiRequest('POST', '/scenarios', {
    teamId: TEAM_ID,
    name: 'Auto Blog Publisher - Scheduled Every 12h',
    blueprint: JSON.stringify(bp),
    scheduling: JSON.stringify({ type: 'indefinitely', interval: 43200 }),
  });

  if (result.status === 201 || result.status === 200) {
    const scenario = result.body.scenario || result.body;
    console.log('\n✅ Scenario created!');
    console.log('  ID:', scenario.id);
    console.log('  Name:', scenario.name);
    console.log('  Active:', scenario.isActive);
    fs.writeFileSync('/tmp/new_scenario_id.txt', String(scenario.id));
  } else {
    console.log('\n❌ Failed:', JSON.stringify(result.body).substring(0, 2000));
  }
})();
