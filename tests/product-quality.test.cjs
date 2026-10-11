// Run: node tests/product-quality.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('data/products.json','utf8'));
assert(Array.isArray(data.products),'products array exists');
const ids=new Set();
const issues=[];
const warnings=[];
for(const p of data.products){
 if(!p.id||ids.has(p.id))issues.push('missing/duplicate ID: '+p.id);
 ids.add(p.id);
 if(p.status!=='verified')continue;
 for(const field of ['price','kcal','protein']){
  if(!Number.isFinite(p[field])||p[field]<0)issues.push(p.id+': invalid '+field);
 }
 for(const field of ['fat','carbs']){
  if(p[field]!=null&&(!Number.isFinite(p[field])||p[field]<0))issues.push(p.id+': invalid '+field);
 }
 if(!/^https:\/\//.test(p.source_url||''))issues.push(p.id+': missing HTTPS source');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.verified_at||''))issues.push(p.id+': missing verification date');
 if(!Array.isArray(p.allergens)||!p.allergens.length)warnings.push(p.id+': allergen information missing');
}
console.log('Products: '+data.products.length+' / Verified: '+data.products.filter(p=>p.status==='verified').length);
console.log('Allergen information warnings: '+warnings.length);
warnings.forEach(w=>console.log('WARN '+w));
issues.forEach(e=>console.error('ERROR '+e));
assert.equal(issues.length,0,'verified product data must pass quality checks');
console.log('Product quality checks passed');
