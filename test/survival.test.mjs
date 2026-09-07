import test from 'node:test';
import assert from 'node:assert/strict';
import {createParser} from '../lib/parser.mjs';
import {summarize} from '../lib/comparison.mjs';

const event=(second,owner,source,type,amount,secondary=0)=>`26:09:07:08:00:${second}::${owner.startsWith('P')?'Captain':'Enemy'},${owner},${source?'Owned pet':''},${source||'*'},Captain,P[1 Captain],Ability,Pn.1,${type},,${amount},${secondary}`;
test('survivability records damage layers, same-second pressure, and received healing ownership',()=>{
  const parser=createParser();
  parser.add(event('00.0','C[2 Enemy]','','Phaser',100));
  parser.add(event('00.5','C[2 Enemy]','','Shield',-40,-60));
  parser.add(event('01.0','P[1 Captain]','','HitPoints',-30));
  parser.add(event('02.0','P[3 Friend]','','Shield',-20));
  parser.add(event('03.0','P[1 Captain]','C[9 Pet]','HitPoints',-10));
  const result=parser.finish().encounters[0];
  const p=result.players.find(p=>p.id==='P[1 Captain]');
  assert.equal(p.total,0); // Purely defensive activity remains inspectable.
  assert.equal(p.incoming,140);
  assert.equal(p.survival.hull,100);assert.equal(p.survival.shield,40);
  assert.equal(p.survival.receivedHull,40);assert.equal(p.survival.receivedShield,20);
  assert.equal(p.survival.selfHealing,40);assert.equal(p.survival.externalHealing,20);
  assert.equal(p.survival.largestHit,100);
  assert.deepEqual(p.survival.peakSecond,{second:0,damage:140});
  assert.equal(p.survival.sources[0].total,140);
  assert.equal(p.survival.healers.reduce((sum,r)=>sum+r.total,0),60);
});
test('damage to pets is not credited as damage to owner',()=>{
  const parser=createParser();
  parser.add(event('00.0','C[2 Enemy]','','Phaser',100));
  parser.add(event('01.0','C[2 Enemy]','','Phaser',900).replace('Captain,P[1 Captain],Ability','Pet,C[9 Pet],Ability'));
  assert.equal(parser.finish().encounters[0].players[0].incoming,100);
});
test('healing without a target is disclosed without assuming a recipient',()=>{
  const parser=createParser();
  parser.add(event('00.0','C[2 Enemy]','','Phaser',100));
  parser.add(event('01.0','P[1 Captain]','','HitPoints',-75).replace('Captain,P[1 Captain],Ability',',*,Ability'));
  const s=parser.finish().encounters[0].players[0].survival;
  assert.equal(s.unspecifiedHealing,75);assert.equal(s.receivedHull,0);
});
test('old saved summaries retain unknown survivability rather than invented zeros',()=>{
  const old={duration:10,player:{dps:10,direct:100,pets:0,incoming:50,healing:0}};
  const current={duration:10,player:{...old.player,survival:{hull:40,shield:10,receivedHull:20,receivedShield:0}}};
  assert.equal(summarize([old,current]).hullTaken,null);
  assert.equal(summarize([current]).hullTaken,4);
  assert.equal(summarize([current]).hullHealing,2);
  assert.equal(summarize([old,current]).survivalCount,1);
});
