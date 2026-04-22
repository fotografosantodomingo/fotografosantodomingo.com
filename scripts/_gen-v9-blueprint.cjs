/**
 * Generate v9 blueprint with corrected social URL construction.
 *
 * Changes per module:
 *  112 (Facebook PATCH):   use concat("https://www.facebook.com/"; 12.id) since CreatePostWithPhotos
 *                          returns composite page_id_post_id in 12.id; permalink_url tried first
 *  120 (LinkedIn PATCH):   use concat("https://www.linkedin.com/feed/update/"; 20.id; "/")
 *                          since Make returns share URN e.g. urn:li:share:12345
 *  121 (Instagram PATCH):  use ifempty(21.permalink; concat("https://www.instagram.com/p/"; 21.id; "/"))
 *  123 (Pinterest PATCH):  use concat("https://www.pinterest.com/pin/"; 23.id; "/")
 *                          23.id is always returned on successful pin creation
 */
const fs = require('fs');

const SRC = 'make-blueprints/latest Integration Webhooks - Phase 1 Safe (With Parser Template) - corrected-import-v8b-new-secret.blueprint.json';
const DST = 'make-blueprints/latest Integration Webhooks - Phase 1 Safe (With Parser Template) - v9-fixed-social-urls.blueprint.json';

const bp = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// Map of module id → new jsonStringBodyContent
const PATCHES = {
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

let modified = 0;

function patchModules(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) patchModules(item);
    return;
  }
  if (typeof obj.id === 'number' && PATCHES[obj.id] && obj.mapper) {
    obj.mapper.jsonStringBodyContent = PATCHES[obj.id];
    modified++;
    console.log(`Patched module ${obj.id}`);
  }
  for (const key of Object.keys(obj)) {
    patchModules(obj[key]);
  }
}

patchModules(bp);
fs.writeFileSync(DST, JSON.stringify(bp, null, 4));
console.log(`\nTotal modules patched: ${modified}`);
console.log(`Written: ${DST}`);
