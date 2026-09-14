import test from 'node:test';
import assert from 'node:assert/strict';
import {createParser,parseLine} from '../lib/parser.mjs';
import {compareRuns} from '../lib/comparison.mjs';
const line=(time,ability,type,m1,m2=0,extra={})=>`${time}::Captain,P[1@2 Captain@account],${extra.pet||''},${extra.pet?'C[5 Pet]':'*'},${extra.self?'Captain':'Target'},${extra.self?'P[1@2 Captain@account]':'C[2 Enemy]'},${ability},Pn.1,${type},${extra.flags||''},${m1},${m2}`;
test('shield absorption is damage, shield and hull healing stay out of offense',()=>{
  const p=createParser();
  p.add(line('26:09:07:08:00:00.0','Beam','Phaser',100,120));
  p.add(line('26:09:07:08:00:00.0','Beam','Shield',-25,-40));
  p.add(line('26:09:07:08:00:01.0','Heal','Shield',-30,0));
  p.add(line('26:09:07:08:00:02.0','Heal','HitPoints',-40));
  const r=p.finish().encounters[0];assert.equal(r.players[0].total,125);assert.equal(r.players[0].healing,70);assert.equal(r.players[0].dps,62.5);
});
test('owned pets group with owner; self damage excluded; NPC damage not credited',()=>{
  const p=createParser();p.add(line('26:09:07:08:00:00.0','Beam','Phaser',100));p.add(line('26:09:07:08:00:01.0','Torpedo','Kinetic',50,0,{pet:'Valkyrie'}));p.add(line('26:09:07:08:00:02.0','Feedback','Phaser',90,0,{self:true}));
  p.add(line('26:09:07:08:00:03.0','Beam','Phaser',500).replace('Captain,P[1@2 Captain@account]','NPC,C[3 NPC]'));
  const r=p.finish().encounters[0].players[0];assert.equal(r.total,150);assert.equal(r.pets,50);assert.equal(r.incoming,90);assert.equal(r.abilities.length,2);
});
test('encounter gap handles midnight and does not combine separated runs',()=>{
  const p=createParser();p.add(line('26:09:07:23:59:59.0','Beam','Phaser',100));p.add(line('26:09:08:00:00:01.0','Beam','Phaser',100));p.add(line('26:09:08:00:02:00.0','Beam','Phaser',100));const r=p.finish();assert.equal(r.encounters.length,2);assert.equal(r.encounters[0].duration,2);assert.equal(r.encounters[1].duration,1);
});
test('malformed lines are visible, identities stable, critical shield records not counted as hull hits',()=>{
  assert.equal(parseLine('broken'),null);const p=createParser();p.add('broken');p.add(line('26:09:07:08:00:00.0','Beam','Shield',-10,-10,{flags:'Critical'}));const r=p.finish();assert.equal(r.skipped,1);assert.equal(r.encounters[0].players[0].abilities[0].hullHits,0);
  const q=createParser();q.add(line('26:09:07:08:00:00.0','Beam','Shield',-10,-10,{flags:'Critical'}));assert.equal(q.finish().encounters[0].id,r.encounters[0].id);
});
test('comparison shows sample count and does not invent significance',()=>{
  const run=dps=>({duration:10,player:{dps,direct:dps*10,pets:0,incoming:0,healing:0}});
  const r=compareRuns([run(100),run(200)],[run(180)]);assert.equal(r.baseline.mean,150);assert.ok(Math.abs(r.delta-20)<1e-10);assert.match(r.message,/Early observation/);assert.equal(compareRuns([],[]).delta,null);
  assert.equal(compareRuns([run(100)],[]).delta,null);
});

test('combat details separate misses, overlapping crit/flank damage, shield records and pet sources',()=>{
 const p=createParser();const t='26:09:07:08:00:00.0';
 p.add(line(t,'Beam','Phaser',100,0,{flags:'Critical|Flank'}));
 p.add(line(t,'Beam','Shield',-30,-40,{flags:'Critical|Flank'}));
 p.add(line(t,'Beam','Phaser',50));
 p.add(line(t,'Beam','Phaser',0,0,{flags:'Miss'}));
 p.add(line(t,'Beam','Phaser',70,0,{pet:'Valkyrie',flags:'Flank'}));
 p.add(line(t,'Heal','HitPoints',-80,0,{flags:'Critical'}));
  const r=p.finish();assert.equal(r.parserVersion,4);
 const a=r.encounters[0].players[0].abilities.find(a=>!a.pet);
 assert.equal(a.hullHits,2);assert.equal(a.misses,1);assert.equal(a.criticalHits,1);assert.equal(a.flankHits,1);
 assert.equal(a.criticalDamage,100);assert.equal(a.flankDamage,100);assert.equal(a.maxHit,100);assert.equal(a.total,180);
 const pet=r.encounters[0].players[0].abilities.find(a=>a.pet);assert.equal(pet.flankHits,1);assert.equal(pet.flankDamage,70);
});
