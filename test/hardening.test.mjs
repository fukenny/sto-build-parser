import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createStore} from '../lib/store.mjs';
import {parseIsolated} from '../lib/isolated-parser.mjs';
import {parseFile,parseLine} from '../lib/parser.mjs';
test('failed writes roll back, queue recovers, concurrent mutations persist serially',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-store-')),file=path.join(dir,'state.json');
 try{
  const store=createStore({values:[]},file);await mkdir(file+'.tmp');
  await assert.rejects(store.transact(s=>s.values.push('lost')));assert.deepEqual(store.state.values,[]);
  await rm(file+'.tmp',{recursive:true});
  await Promise.all(['a','b','c'].map(v=>store.transact(s=>s.values.push(v))));
  assert.deepEqual(store.state.values,['a','b','c']);assert.deepEqual(JSON.parse(await readFile(file,'utf8')),store.state);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('isolated parser rejects hostile input, times out safely, then parses normal logs identically',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-limits-')),file=path.join(dir,'combatlog.log');
 const line=i=>`26:09:08:08:00:00.0::Player,P[${i}@2 Test],,*,Enemy,C[2 Enemy],Beam,Pn.1,Phaser,,1,1\n`;
 try{
  await writeFile(file,'x'.repeat(20000));await assert.rejects(parseIsolated([file]),/16 KB/);
  await writeFile(file,Array.from({length:101},(_,i)=>line(i)).join(''));await assert.rejects(parseIsolated([file]),/player count/);
  await writeFile(file,line(1));await assert.rejects(parseIsolated([file],{timeoutMs:1}),/time limit/);
  assert.deepEqual(await parseIsolated([file]),await parseFile(file));
  assert.equal(parseLine(line(1).trim().replace('08:00:00.0','99:00:00.0')),null);
  assert.equal(parseLine(line(1).trim().replace(',1,1',',1e300,1')),null);
 }finally{await rm(dir,{recursive:true,force:true});}
});
