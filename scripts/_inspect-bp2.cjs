const fs = require('fs');
const bpFile = 'make-blueprints/latest Integration Webhooks - Phase 1 Safe (With Parser Template) - corrected-import-v8b-new-secret.blueprint.json';
const bp = JSON.parse(fs.readFileSync(bpFile, 'utf8'));

// Deep traverse the entire JSON tree and collect every object that has an "id" and "module" key
function findAllModules(obj, results=[]) {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const item of obj) findAllModules(item, results);
    } else {
      if (typeof obj.id === 'number' && obj.module) {
        results.push({ id: obj.id, module: obj.module, params: JSON.stringify(obj.parameters || {}).substring(0, 600) });
      }
      for (const key of Object.keys(obj)) {
        if (key !== 'parameters') findAllModules(obj[key], results);
      }
    }
  }
  return results;
}

const all = findAllModules(bp);
// Sort by id
all.sort((a,b) => a.id - b.id);
console.log('Total modules:', all.length);
console.log('All module IDs:', all.map(m=>m.id).join(', '));
// Show PATCH/update ones
const patch = all.filter(m => [7,8,112,120,121,123,127].includes(m.id));
console.log('\nTarget modules:');
console.log(JSON.stringify(patch, null, 2));
