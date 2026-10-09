import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createStore} from '../lib/store.mjs';
import {captureShip,importSnapshot} from '../lib/ship-capture.mjs';
import {equipmentMarkup,equipmentGroups} from '../public/ship-capture.js';

test('memory name search passes 512 matches and reports its bounded limit',{skip:process.platform!=='win32'},async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'sto-name-search-'));
 try{
  const source=await readFile(new URL('../launcher/capture/Probe-Memory.ps1',import.meta.url),'utf8');
  const csharp=source.match(/Add-Type -TypeDefinition @'\r?\n([\s\S]*?)\r?\n'@/)[1];
  const script=path.join(root,'Search.ps1');
  await writeFile(script,`$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
${csharp}
'@
$needle=[Guid]::NewGuid().ToString('N')
$bytes=[Text.Encoding]::UTF8.GetBytes(($needle+[char]0)*700)
$memory=[Runtime.InteropServices.Marshal]::AllocHGlobal($bytes.Length)
try {
 [Runtime.InteropServices.Marshal]::Copy($bytes,0,$memory,$bytes.Length)
 $scan=[StoProbe]::Run($PID,@($needle),30,2147483648)
 $start=[UInt64]$memory.ToInt64();$end=$start+$bytes.Length
 $hits=@($scan.Candidates | Where-Object { $address=[Convert]::ToUInt64($_.Address.Substring(2),16);$address -ge $start -and $address -lt $end })
 $many=[Text.Encoding]::UTF8.GetBytes(($needle+[char]0)*9000)
 $large=[Runtime.InteropServices.Marshal]::AllocHGlobal($many.Length)
 try {
  [Runtime.InteropServices.Marshal]::Copy($many,0,$large,$many.Length)
  $limited=[StoProbe]::Run($PID,@($needle),30,2147483648)
  @{count=$hits.Count;stop=$scan.StopReason;limited=$limited.CandidateLimitReached} | ConvertTo-Json -Compress
 } finally { [Runtime.InteropServices.Marshal]::FreeHGlobal($large) }
} finally { [Runtime.InteropServices.Marshal]::FreeHGlobal($memory) }
`);
  const {stdout}=await promisify(execFile)(path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe'),['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script],{windowsHide:true,timeout:90000});
  const result=JSON.parse(stdout);assert.equal(result.count,700);assert.equal(result.stop,'address-space-end');assert.equal(result.limited,true);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('capture starts Internet-marked bundled scripts without changing persistent policy',{skip:process.platform!=='win32'},async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'sto-downloaded-capture-'));
 try{
  const dir=path.join(root,'launcher','capture');await mkdir(dir,{recursive:true});
  const script=path.join(dir,'Capture.ps1');
  const helper=path.join(dir,'Helper.ps1');
  await writeFile(script,`param([string]$CharacterName,[string]$LoadoutName)\n. "$PSScriptRoot/Helper.ps1"\n`);
  await writeFile(helper,`@{records=@(@{name=$LoadoutName});ships=@(@{name=$CharacterName})} | ConvertTo-Json -Compress\n`);
  for(const file of [script,helper])await writeFile(file+':Zone.Identifier','[ZoneTransfer]\r\nZoneId=3\r\n');
  const result=await captureShip(root,'Test Captain','Saved loadout');
  assert.equal(result.ships[0].name,'Test Captain');
  assert.equal(result.records[0].name,'Saved loadout');
  assert.match(await readFile(script+':Zone.Identifier','utf8'),/ZoneId=3/);
 }finally{await rm(root,{recursive:true,force:true});}
});

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
 assert.deepEqual(groups.slice(0,15).map(g=>g.label),['Fore weapons','Aft weapons','Hangar Pets','Deflector','Impulse engines','Warp / singularity core','Shield','Universal console slots','Engineering console slots','Science console slots','Tactical console slots','Devices','Vanity Deflector (unverified)','Vanity Impulse','Vanity Shields']);
 assert.equal(groups.find(g=>g.label==='Engineering console slots').items[0].name,'Console - Universal - Assimilated Module');
 assert(groups.slice(15,-1).every(g=>g.label.startsWith('Unverified slot category'))); assert.equal(groups.at(-1).label,'Active Duty Officers');
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
