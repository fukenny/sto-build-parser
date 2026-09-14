import test from 'node:test';
import assert from 'node:assert/strict';
import {createParser} from '../lib/parser.mjs';
import {damageRows} from '../public/drilldown.js';
const line=(target,type,amount,flags='',pet='')=>`26:09:14:08:00:00.0::Captain,P[1@2 Captain],${pet},${pet?'C[9 Pet]':'*'},${target},C[2 Enemy],Beam,Pn.1,${type},${flags},${amount},${type==='Shield'?-50:0}`;
test('target drilldowns reconcile with ability totals and separate pet, shield, misses and overlapping flags',()=>{
 const parser=createParser();
 for(const row of [line('Cruiser','Phaser',100,'Critical Flank'),line('Cruiser','Shield',-50,'Critical'),line('Raider','Phaser',20),line('Raider','Phaser',0,'Miss'),line('Cruiser','Phaser',30,'','Valkyrie')])parser.add(row);
 const abilities=parser.finish().encounters[0].players[0].abilities;
 const ship=abilities.find(a=>!a.pet),pet=abilities.find(a=>a.pet);
 assert.equal(ship.total,170);assert.equal(ship.targets.reduce((n,t)=>n+t.total,0),ship.total);
 assert.equal(ship.targets[0].total,150);assert.equal(ship.targets[0].hullHits,1);
 assert.equal(ship.targets[0].criticalHits,1);assert.equal(ship.targets[0].flankHits,1);
 assert.equal(ship.targets[0].criticalDamage,100);assert.equal(ship.targets[0].flankDamage,100);
 assert.equal(ship.targets[1].misses,1);assert.equal(pet.targets[0].total,30);
 assert.deepEqual(JSON.parse(JSON.stringify(ship.targets)),ship.targets);
});
test('drilldown markup escapes log text and keeps unknown rates unavailable',()=>{
 const html=damageRows([{name:'<img onerror="x">',source:'<script>',total:5,events:1,targets:[{name:'<target>',total:5}]}],5,1);
 assert(!html.includes('<img'));assert(!html.includes('<script>'));assert(html.includes('&lt;target&gt;'));
 assert(html.includes('aria-expanded="false"'));assert(html.includes('class="damage-detail" hidden'));
 assert(html.includes('—'));
 assert(damageRows([{name:'Old',total:1}],1,1).includes('Analyze the original log again'));
});
