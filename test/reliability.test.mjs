import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {backupState} from '../lib/backup.mjs';
import {sortValue} from '../public/table-sort.js';
test('backup snapshots are independent and separate backups never overwrite each other',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-backup-'));
 try{
  const state={profiles:[{name:'Elston'}],runs:[{id:'saved'}]};
  const first=backupState(state,dir);state.profiles[0].name='Changed';
  const [a,b]=await Promise.all([first,backupState(state,dir)]);
  assert.notEqual(a,b);assert.equal(JSON.parse(await readFile(path.join(a,'state.json'))).profiles[0].name,'Elston');
  assert.equal(JSON.parse(await readFile(path.join(b,'state.json'))).profiles[0].name,'Changed');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('table sort reads damage units, percentages, signed deltas and missing values',()=>{
 assert.equal(sortValue('2.4M').number,2400000);assert.equal(sortValue('12,400').number,12400);
 assert.equal(sortValue('+2,000 (+20.0%)').number,2000);assert.equal(sortValue('8.2%').number,8.2);
 assert.equal(sortValue('—').missing,true);assert.equal(sortValue('▸ Phaser').text,'Phaser');
});
