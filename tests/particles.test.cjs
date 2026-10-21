const assert=require('node:assert/strict');
const {phaseAt}=require('../dist/particles.js');
for(const [t,state] of [[-20,'ice'],[-1,'ice'],[0,'melting'],[1,'water'],[25,'water'],[99,'water'],[100,'boiling'],[101,'gas'],[120,'gas']])assert.equal(phaseAt(t),state);
for(const t of [NaN,Infinity,-21,121])assert.throws(()=>phaseAt(t),RangeError);
assert.deepEqual([120,100,25,0,-20].map(phaseAt),['gas','boiling','water','melting','ice']);
console.log('Estados del agua: límites, coexistencia a 0 y 100 °C, enfriamiento y entradas inválidas correctos.');
