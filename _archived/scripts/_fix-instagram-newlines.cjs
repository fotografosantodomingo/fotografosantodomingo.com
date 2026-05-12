/**
 * Fix Instagram caption in scenarios 9108116 and 9109071:
 * - Replace literal \\n\\n with actual newlines
 * - Add trim() to caption content to remove any trailing newlines from OpenAI
 */
const https = require('https');

const API_TOKEN = 'ed89e46b-845c-4cd6-a8cf-899e7b830a6a';
const SCENARIOS = [9108116, 9109071];

// The fixed caption uses actual newline characters (\n in JS string = real newline)
const FIXED_CAPTION = '{{trim(ifempty(3.instagram_caption_es; 3.excerpt_es))}}\n\n{{7.data.url_es}}\n\nWhatsApp +1 809 720 9547';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'eu2.make.com',
      path: `/api/v2${path}`,
      method,
      headers: {
        Authorization: `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function patchInstagram(obj) {
  let count = 0;
  if (!obj || typeof obj !== 'object') return count;
  if (Array.isArray(obj)) { for (const i of obj) count += patchInstagram(i); return count; }
  // Module 21 = instagram-business:CreatePostPhoto
  if (obj.id === 21 && obj.mapper && typeof obj.mapper.caption === 'string') {
    const old = obj.mapper.caption;
    obj.mapper.caption = FIXED_CAPTION;
    console.log('  Patched module 21 caption');
    console.log('  OLD repr:', JSON.stringify(old));
    console.log('  NEW repr:', JSON.stringify(FIXED_CAPTION));
    count++;
  }
  for (const v of Object.values(obj)) count += patchInstagram(v);
  return count;
}

(async () => {
  for (const scenarioId of SCENARIOS) {
    console.log(`\n=== Scenario ${scenarioId} ===`);

    // Fetch blueprint
    const fetch = await apiRequest('GET', `/scenarios/${scenarioId}/blueprint`);
    if (fetch.status !== 200) { console.log('Fetch failed:', fetch.status); continue; }

    const blueprint = fetch.body.response.blueprint;
    const scheduling = fetch.body.response.scheduling;

    // Patch
    const n = patchInstagram(blueprint);
    if (n === 0) { console.log('Nothing to patch (already correct?)'); continue; }

    // Push back
    const push = await apiRequest('PATCH', `/scenarios/${scenarioId}`, {
      blueprint: JSON.stringify(blueprint),
      scheduling: JSON.stringify(scheduling),
    });

    if (push.status === 200) {
      console.log(`  ✅ Updated successfully`);
    } else {
      console.log(`  ❌ Failed:`, JSON.stringify(push.body).substring(0, 500));
    }
  }
})();
