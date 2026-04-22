const fs = require('fs');
const bpFile = 'make-blueprints/latest Integration Webhooks - Phase 1 Safe (With Parser Template) - corrected-import-v8b-new-secret.blueprint.json';
const bp = JSON.parse(fs.readFileSync(bpFile, 'utf8'));

function findAllModules(obj, results=[]) {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const item of obj) findAllModules(item, results);
    } else {
      if (typeof obj.id === 'number' && obj.module) {
        results.push({ id: obj.id, module: obj.module, full: obj });
      }
      for (const key of Object.keys(obj)) {
        findAllModules(obj[key], results);
      }
    }
  }
  return results;
}

const all = findAllModules(bp);
all.sort((a,b) => a.id - b.id);
const patch = all.filter(m => [112,120,121,123].includes(m.id));
for (const m of patch) {
  console.log(`\n=== MODULE ${m.id} ===`);
  console.log(JSON.stringify(m.full, null, 2));
}
