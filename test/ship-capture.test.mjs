import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createStore} from '../lib/store.mjs';
import {importSnapshot} from '../lib/ship-capture.mjs';
import {equipmentMarkup,equipmentGroups} from '../public/ship-capture.js';

test('observed ship equipment categories follow slots and keep unknown records separate',()=>{
 const records=[
  [62,'Mycelial Harmonic Matter-Antimatter Core'],[65,'Elite Fleet Intervention Protomatter Deflector Array'],
  [60,'Prevailing Innervated Impulse Engines'],[61,'60th Anniversary Vanity Slipstream'],
  [68,'Console - Tactical - Pax Prefire Chamber'],[69,'Console - Universal - Assimilated Module'],
  [71,'Console - Science - Pax Field Generator'],[72,'Console - Universal - Swarmer Matrix'],
  [73,'Red Matter Capacitor'],[74,'Hangar - Elite Valkyrie Fighter Squadron'],[58,'Shield'],[54,'Turret'],[53,'Beam'],
  [57,''],[59,''],[66,''],[80,'Officer record'],[999,'Unknown']
 ].map(([bag,name])=>({bag,name,slot:0,itemId:'123'}));
 const groups=equipmentGroups(records);
 assert.deepEqual(groups.slice(0,13).map(g=>g.label),['Fore weapons','Aft weapons','Deflector','Impulse engines','Warp / singularity core','Shield','Universal console slots','Engineering console slots','Science console slots','Tactical console slots','Devices','Hangars','Vanity slipstream']);
 assert.equal(groups.find(g=>g.label==='Engineering console slots').items[0].name,'Console - Universal - Assimilated Module');
 assert(groups.slice(13).every(g=>g.label.startsWith('Unverified slot category')));
 assert.equal(groups.flatMap(g=>g.items).length,records.length);
 assert.equal(records[0].bag,62);
});

test('capture import persists independent snapshots and rolls back invalid associations',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-capture-'));
 const file=path.join(dir,'state.json');
 const store=createStore({profiles:[],loadouts:[],builds:[],runs:[{id:'existing'}]},file);
 const snapshot={ship:{id:'123',name:'Test ship'},character:'Captain',capturedAt:new Date().toISOString(),loadout:{name:'Beams',items:[{itemId:'16153689827849148',bag:53,slot:0,name:'Beam'}]}};
 const first=await store.transact(d=>importSnapshot(d,snapshot,{variationName:'Baseline'}));
 snapshot.loadout.items[0].name='Changed weapon';
 assert.equal(store.state.builds[0].equipmentSnapshot.loadout.items[0].name,'Beam');
 const loadoutId=store.state.loadouts[0].id;
 await store.transact(d=>importSnapshot(d,snapshot,{profileId:first.profileId,loadoutId,variationName:'Changed'}));
 const before=structuredClone(store.state);
 await assert.rejects(store.transact(d=>importSnapshot(d,snapshot,{profileId:first.profileId,loadoutId,variationName:'Baseline'})),/already exists/);
 const other=structuredClone(snapshot);other.ship.name='Other ship';
 await assert.rejects(store.transact(d=>importSnapshot(d,other,{loadoutId,variationName:'Bad link'})),/belonging/);
 assert.deepEqual(store.state,before);
 assert.deepEqual(JSON.parse(await readFile(file,'utf8')),before);
 assert.equal(store.state.builds[0].equipmentSnapshot.loadout.items[0].itemId,'16153689827849148');
 assert.deepEqual(store.state.runs,[{id:'existing'}]);
});

test('equipment preview escapes captured text and distinguishes empty slots',()=>{
 const html=equipmentMarkup({ship:{name:'<script>ship</script>'},character:'A&B',capturedAt:new Date().toISOString(),loadout:{name:'<img>',items:[{itemId:'0',bag:53,slot:0},{itemId:'123',bag:53,slot:1,name:'<script>weapon</script>'}]}});
 assert(!html.includes('<script>'));assert(!html.includes('<img>'));
 assert(html.includes('Empty saved slot'));assert(html.includes('A&amp;B'));
});
