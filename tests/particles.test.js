import assert from 'node:assert/strict';
import {phaseAt} from '../src/simulations/particles.js';
for(const [t,state] of [[-20,'ice'],[-1,'ice'],[0,'melting'],[1,'water'],[25,'water'],[99,'water'],[100,'boiling'],[101,'gas'],[120,'gas']])assert.equal(phaseAt(t),state);
for(const t of [NaN,Infinity,-21,121])assert.throws(()=>phaseAt(t),RangeError);
assert.deepEqual([120,100,25,0,-20].map(phaseAt),['gas','boiling','water','melting','ice']);
console.log('Estados del agua: límites, coexistencia a 0 y 100 °C, enfriamiento y entradas inválidas correctos.');
import {particleCount,createMotion,advanceMotion} from '../src/simulations/particles.js';
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

// Solid particles remain anchored; all phases retain bounded, finite positions.
for(const temperature of [-20,0,25,80,100,120]){
  const sample=createMotion(temperature);
  const anchors=sample.points.map(point=>({x:point.x,y:point.y}));
  for(let frame=0;frame<240;frame++)advanceMotion(sample,temperature,1/60);
  assert.equal(sample.points.length,64);
  assert.ok(sample.points.every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=12&&point.x<=308&&point.y>=12&&point.y<=198));
  if(temperature===-20)assert.ok(sample.points.every((point,i)=>Math.hypot(point.x-anchors[i].x,point.y-anchors[i].y)<4));
  const paused=structuredClone(sample.points);
  advanceMotion(sample,temperature,0);
  assert.deepEqual(sample.points,paused);
}
