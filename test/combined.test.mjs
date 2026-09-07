import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {parseFile,parseFiles} from '../lib/parser.mjs';
test('rotated files merge in time order, deduplicate overlaps and retain repeated hits and original IDs',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-merge-'));
 const row=s=>`26:09:07:08:00:${s}.0::Captain,P[1@2 Captain@account],,*,Enemy,C[2 Enemy],Beam,Pn.1,Phaser,,100,110\n`;
 try {
  const a=path.join(dir,'a.log'),b=path.join(dir,'b.log');
  await writeFile(a,row('00')+row('10')+row('10'));
  await writeFile(b,row('10')+row('10')+row('20'));
  const original=await parseFile(a), merged=await parseFiles([b,a]);
  assert.equal(merged.encounters.length,1);assert.equal(merged.valid,4);assert.equal(merged.duplicates,2);
  assert.equal(merged.encounters[0].duration,20);assert.equal(merged.encounters[0].players[0].dps,20);
  assert.ok(merged.encounters[0].encounterIds.includes(original.encounters[0].id));
  assert.equal(merged.encounters[0].id,(await parseFiles([a,b])).encounters[0].id);
 } finally {await rm(dir,{recursive:true,force:true});}
});
