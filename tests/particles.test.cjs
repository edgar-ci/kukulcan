const assert=require('node:assert/strict');
const {phaseAt}=require('../dist/particles.js');
for(const [t,state] of [[-20,'ice'],[-1,'ice'],[0,'melting'],[1,'water'],[25,'water'],[99,'water'],[100,'boiling'],[101,'gas'],[120,'gas']])assert.equal(phaseAt(t),state);
for(const t of [NaN,Infinity,-21,121])assert.throws(()=>phaseAt(t),RangeError);
assert.deepEqual([120,100,25,0,-20].map(phaseAt),['gas','boiling','water','melting','ice']);
console.log('Estados del agua: límites, coexistencia a 0 y 100 °C, enfriamiento y entradas inválidas correctos.');
const {particleCount,createMotion,advanceMotion}=require('../dist/particles.js');
const motion=createMotion(-20);const start=motion.points.map(p=>({...p}));
advanceMotion(motion,120,0);
assert.deepEqual(motion.points,start); // input alone never teleports particles
advanceMotion(motion,120,1/60);
assert.equal(motion.points.length,64);
assert.ok(motion.temperature>-20&&motion.temperature<120);
assert.ok(motion.points.every((p,i)=>Math.hypot(p.x-start[i].x,p.y-start[i].y)<5));
for(let i=0;i<360;i++)advanceMotion(motion,120,1/60);
assert.ok(motion.points.every(p=>p.weights[2]>.999));
const hot=motion.points.map(p=>({...p}));advanceMotion(motion,-20,0);
assert.deepEqual(motion.points,hot); // reversal starts from current positions
for(let i=0;i<600;i++)advanceMotion(motion,-20,1/60);
assert.ok(motion.points.every(p=>p.weights[0]>.999));
assert.ok(motion.points.every(p=>Number.isFinite(p.x)&&p.x>=5.5&&p.x<=314.5&&p.y>=5.5&&p.y<=204.5));
advanceMotion(motion,120,0,true);
assert.ok(motion.points.every(p=>p.weights[2]===1));
console.log('64 partículas: transición continua, inversión, límites y modo sin movimiento correctos.');
