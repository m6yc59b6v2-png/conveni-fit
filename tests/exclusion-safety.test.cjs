// Run from repository root: node tests/exclusion-safety.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function isExcludedProduct(');
const end=html.indexOf('function suggestOne()',start);
assert(start>=0&&end>start,'exclusion helper is present');
const context={};
vm.runInNewContext(html.slice(start,end),context);
const excluded=context.isExcludedProduct;
assert.equal(excluded({allergens:[]},[]),false,'no exclusions: no filtering');
assert.equal(excluded({allergens:[]},['卵']),true,'unknown allergen data is excluded');
assert.equal(excluded({},['小麦']),true,'missing allergen data is excluded');
assert.equal(excluded({allergens:['卵']},['卵']),true,'exact allergen match');
assert.equal(excluded({allergens:['乳成分']},['乳']),true,'milk alias');
assert.equal(excluded({allergens:['鶏肉']},['卵']),false,'known nonmatching allergen');
assert(html.includes('アレルギー対応は保証しません'),'allergy disclaimer');
console.log('Exclusion safety checks passed');
