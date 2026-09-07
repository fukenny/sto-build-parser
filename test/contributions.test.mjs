import test from 'node:test';
import assert from 'node:assert/strict';
import {contributions} from '../lib/comparison.mjs';
import {conditions,conditionKey,patrols} from '../public/patrols.js';
test('pet contributions average every run and separate recorded names without inferring rank',()=>{
 const run=(abilities,duration=10)=>({duration,player:{abilities}});
 const hit=(source,total)=>({pet:true,source,name:'Beam',total});
 const rows=contributions([run([hit('Advanced',200)]),run([])],[run([hit('Advanced',100),hit('Elite',300)])],true);
 const advanced=rows.find(r=>r.name==='Advanced'),elite=rows.find(r=>r.name==='Elite');
 assert.equal(advanced.baseline.dps,10);assert.equal(advanced.candidate.dps,10);
 assert.equal(elite.baseline.dps,0);assert.equal(elite.candidate.dps,30);assert.equal(elite.percent,null);
 assert.equal(contributions([], [run([hit('Elite',100)])],true)[0].baseline,null);
});
test('patrol catalog excludes ground and keeps mission variant, difficulty and party distinct',()=>{
 assert.equal(patrols.length,27);assert.ok(!patrols.some(p=>p.name.includes('Jupiter Station Showdown')));
 const a=conditions({patrolId:'jupiter-gauntlet-hard',difficulty:'Elite',party:'Solo'});
 assert.notEqual(conditionKey(a),conditionKey({...a,party:'Group'}));
 assert.throws(()=>conditions({...a,patrolId:'unknown'}));
});
