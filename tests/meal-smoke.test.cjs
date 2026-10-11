// Run locally: node tests/meal-smoke.test.cjs
// Uses built-in Node APIs; no npm dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('data/products.json','utf8'));
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'main application script exists');
const elements={chain:{value:'family'},goal:{value:'diet'},budget:{value:'1800'},exclude:{value:''},result:{innerHTML:'',textContent:''}};
const $=id=>elements[id]??(elements[id]={innerHTML:'',textContent:'',value:'',addEventListener(){}});
const context={document:{getElementById:$,querySelectorAll:()=>[]},navigator:{},window:{},console,alert(){},prompt(){},setTimeout(){},Date,Map,Set,Math,Number,String,Array,Promise};
vm.createContext(context);
// Extract only suggestion function, keeping other page features untouched.
const start=script[1].indexOf('function suggest(){');
const end=script[1].indexOf('\n\nconst PROFILE_KEY=',start);
assert(start>=0&&end>start,'suggestion function boundaries');
const fn=script[1].slice(start,end);
vm.runInContext(`const $=globalThis.getEl;const names={seven:'セブン',family:'ファミマ',lawson:'ローソン'};const yen=n=>Number(n).toLocaleString('ja-JP')+'円';const escapeHtml=s=>String(s).replace(/[&<>"]/g,'');let db=globalThis.testDb,suggestionVariant=0;${fn};globalThis.runSuggest=()=>suggest();globalThis.next=()=>{suggestionVariant++;suggest()};`,Object.assign(context,{getEl:$,testDb:data}));
for(const chain of ['family','seven','lawson']){
 for(const budget of [1500,1800,2000,2500]){
  elements.chain.value=chain;elements.budget.value=String(budget);
  context.runSuggest();
  const text=elements.result.innerHTML||elements.result.textContent;
  assert(text,'result exists for '+chain+' '+budget);
  if(text.includes('1日合計')){
   const m=text.match(/1日合計 ([\d,]+)円/);
   assert(m,'day total present');
   assert(Number(m[1].replaceAll(',',''))<=budget,'stays within budget');
   const first=text;
   context.next();
   assert(elements.result.innerHTML,'next suggestion works');
   const nextText=elements.result.innerHTML;
   const nextTotal=nextText.match(/1日合計 ([\\d,]+)円/);
   assert(nextTotal,'next suggestion day total present');
   assert(Number(nextTotal[1].replaceAll(',',''))<=budget,'next suggestion stays within budget');
  }
 }
}
console.log('Smoke tests passed: 3 chains x 4 budgets');
