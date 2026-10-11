// Run: node tests/integration-static.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const products=JSON.parse(fs.readFileSync('data/products.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert(scripts.length>=1,'inline scripts exist');
for(const script of scripts)new vm.Script(script,{filename:'index.html'});
assert(manifest.display==='standalone','installable display mode');
assert(fs.existsSync('service-worker.js'),'service worker exists');
assert(fs.existsSync('icons/conveni-fit.svg'),'icon exists');
assert(html.includes('serviceWorker.register'),'service worker registered');
for(const id of ['mealMode','mealTime','exclude','result','diaryYesterday','diaryToday','diaryEntries','savedMealPlan']){
 // savedMealPlan is inserted dynamically, so it is allowed in script.
 assert(html.includes(id),'UI control '+id);
}
assert(html.includes('selectedExclusions()'),'multi-exclusion helper');
assert(html.includes('isExcludedProduct(p,excluded)'),'multi-exclusion filter');
assert(html.includes('function suggestOne()'),'single meal');
assert(html.includes('const shoppingItems='),'shopping checklist');
assert(html.includes('function renderMealPlan()'),'meal plan');
assert.equal((html.match(/\$\('result'\)\.addEventListener\('change'/g)||[]).length,1,'one delegated checklist listener');
assert(!html.includes("$('exclude').value"),'no obsolete single exclusion selector');
assert(products.products.length>=150,'product data present');
const ids=products.products.map(x=>x.id);
assert.equal(new Set(ids).size,ids.length,'unique product IDs');
console.log('Integration static checks passed');
