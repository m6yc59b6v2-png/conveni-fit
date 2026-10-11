// Run: node tests/single-meal-variety.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const begin=html.indexOf('function suggestOne()');
const end=html.indexOf("$('mealMode').addEventListener",begin);
assert(begin>=0&&end>begin,'single meal suggestion exists');
const body=html.slice(begin,end);
assert(body.includes('const shortlist=ranked.slice(0,Math.min(ranked.length,120))'),'ranked shortlist preserved');
assert(body.includes('const recent=candidates.slice(-Math.min(candidates.length,6))'),'recent variety considered');
assert(body.includes('prior.items.some(q=>q.id===p.id)'),'product repetition penalized');
assert(body.includes('const selected=candidates[suggestionVariant%candidates.length]'),'next suggestion rotates');
assert(body.includes('price<=budget'),'budget enforced');
assert(body.includes('!isExcludedProduct(p,excluded)'),'exclusions enforced');
console.log('Single-meal variety static checks passed');
