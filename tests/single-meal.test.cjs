// Run: node tests/single-meal.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('data/products.json','utf8'));
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'app script found');
const start=script[1].indexOf('function suggestOne(){');
const end=script[1].indexOf('function suggest(){',start);
assert(start>=0&&end>start,'single meal implementation exists');
const els={chain:{value:'lawson'},goal:{value:'balance'},budget:{value:'500'},exclude:{value:''},mealTime:{value:'昼食'},mealMode:{value:'single'},budgetLabel:{textContent:''},result:{innerHTML:'',textContent:''}};
const $=id=>els[id]||(els[id]={value:'',textContent:'',innerHTML:'',addEventListener(){}});
const context={getEl:$,testDb:data,console,navigator:{},alert(){},prompt(){},Math,Map,Set,Number,String};
vm.createContext(context);
vm.runInContext("const $=globalThis.getEl;const db=globalThis.testDb;const names={seven:'セブン',family:'ファミマ',lawson:'ローソン'};const yen=n=>Number(n).toLocaleString('ja-JP')+'円';const escapeHtml=s=>String(s).replace(/[&<>\"]/g,'');let suggestionVariant=0;"+script[1].slice(start,end)+"globalThis.run=()=>suggestOne();",context);
for(const chain of ['lawson','family','seven']){
 for(const budget of [300,500,700,1000]){
  els.chain.value=chain;els.budget.value=String(budget);
  context.run();
  const output=els.result.innerHTML||els.result.textContent;
  assert(output,'nonempty result');
  const total=output.match(/<strong>合計 ([\d,]+)円<\/strong>/);
  if(total)assert(Number(total[1].replaceAll(',',''))<=budget,'single meal within budget');
 }
}
console.log('Single-meal smoke tests passed');
