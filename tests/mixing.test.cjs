const assert=require('node:assert/strict');
const {initial,pour,capacities}=require('../dist/mixing.js');
const totals=v=>[v.reduce((n,g)=>n+g.mass,0),v.reduce((n,g)=>n+g.mass*(g.temperature??0),0)];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
let initialState=initial();
let mixed=pour(initialState,0,2);
assert.deepEqual(initialState,initial());
assert.equal(mixed.moved,25);assert.equal(mixed.temperature,22);
assert.deepEqual(mixed.vessels[0],{mass:75,temperature:70});
assert.deepEqual(mixed.vessels[2],{mass:125,temperature:22});
assert.equal(pour(initial(),2,0).temperature,58);
assert.equal(pour(initial(),0,1).temperature,34);
let state=initial();for(let i=0;i<4;i++)state=pour(state,0,2).vessels;
assert.deepEqual(state[0],{mass:0,temperature:null});assert.equal(state[2].temperature,40);
assert.throws(()=>pour(state,0,1),/vacío/);
let refilled=pour(state,2,0);assert.equal(refilled.temperature,40);
let same=pour(refilled.vessels,0,2);assert.equal(same.temperature,40);
assert.throws(()=>pour(initial(),0,0),/diferentes/);
assert.throws(()=>pour(initial(),0,1,NaN),/positiva/);
const partial=pour([{mass:5,temperature:70},{mass:298,temperature:10},{mass:47,temperature:25}],0,1);
assert.equal(partial.moved,2);assert.equal(partial.vessels[1].mass,capacities[1]);
assert.throws(()=>pour(partial.vessels,0,1),/lleno/);
// Many ordered pours: preserve mass and thermal-energy proxy sum(m*T),
// keep the mixture bounded by the incoming and receiving temperatures.
state=initial();const expected=totals(state);
for(let n=0;n<400;n++){
 const source=n%3,destination=(source+(n%2?1:2))%3;
 if(state[source].mass===0||state[destination].mass===capacities[destination])continue;
 const before=state;const result=pour(state,source,destination);state=result.vessels;
 totals(state).forEach((v,i)=>near(v,expected[i]));
 if(before[destination].mass>0){const temperatures=[before[source].temperature,before[destination].temperature];assert.ok(result.temperature>=Math.min(...temperatures)-1e-9&&result.temperature<=Math.max(...temperatures)+1e-9);}
 assert.ok(state.every((v,i)=>v.mass>=0&&v.mass<=capacities[i]));
}
console.log('Mezclas: temperaturas, conservación, vaciado, llenado, límites y 400 vertidos comprobados.');

// Both complete side portions fit the center, regardless of mixing order.
for(const order of [[0,0,0,0,2,2,2,2],[2,2,2,2,0,0,0,0],[0,2,0,2,0,2,0,2]]){
 let glasses=initial();
 for(const source of order)glasses=pour(glasses,source,1).vessels;
 assert.equal(glasses[1].mass,300); near(glasses[1].temperature,35);
 assert.equal(glasses[0].mass,0);assert.equal(glasses[2].mass,0);
 totals(glasses).forEach((v,i)=>near(v,totals(initial())[i]));
}
assert.throws(()=>pour([{mass:251,temperature:70},{mass:0,temperature:null},{mass:0,temperature:null}],0,1),/no válido/);
console.log("Centro de 300 g: vaciado completo de ambos laterales y mezcla a 35 °C comprobados.");
