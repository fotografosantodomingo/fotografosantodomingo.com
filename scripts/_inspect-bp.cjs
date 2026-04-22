const fs = require('fs');
const bpFile = 'make-blueprints/latest Integration Webhooks - Phase 1 Safe (With Parser Template) - corrected-import-v8b-new-secret.blueprint.json';
const bp = JSON.parse(fs.readFileSync(bpFile, 'utf8'));

function findAll(arr) {
  if (!Array.isArray(arr)) return [];
  let result = [];
  for (const m of arr) {
    if ([7,8,112,120,121,123,127].includes(m.id)) {
      result.push({
        id: m.id,
        module: m.module,
        params: JSON.stringify(m.parameters || {}).substring(0, 800),
      });
    }
    if (Array.isArray(m.routes)) {
      for (const r of m.routes) {
        result = result.concat(findAll(r));
      }
    }
  }
  return result;
}

const found = findAll(bp.flow || []);
console.log(JSON.stringify(found, null, 2));
