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

// Print all module IDs and types
console.log('=== ALL MODULES ===');
for (const m of all) {
  console.log(`Module ${m.id}: ${m.module}`);
}

// Print social platform modules and their mapper
console.log('\n=== SOCIAL + BLOGGER MODULES (12, 20, 21, 23, 27, 127) ===');
for (const m of all) {
  if ([12, 20, 21, 23, 27, 127].includes(m.id)) {
    console.log(`\n--- Module ${m.id}: ${m.module} ---`);
    console.log(JSON.stringify(m.full.mapper || m.full.parameters || {}, null, 2).substring(0, 1000));
  }
}
