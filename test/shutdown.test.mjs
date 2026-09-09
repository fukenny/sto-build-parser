import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function launch(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),'sto-shutdown-'));
 const proc=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',STO_DATA_DIR:dir,STO_CLOSE_GRACE_MS:'500'},stdio:['ignore','pipe','pipe']});
 const exited=once(proc,'exit');let output='';
 const launchUrl=await new Promise((resolve,reject)=>{proc.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\/#session=[a-f0-9]+/);if(match)resolve(new URL(match[0]));});proc.once('error',reject);});
 t.after(async()=>{if(proc.exitCode===null)proc.kill();await exited;await rm(dir,{recursive:true,force:true});});
 const base=launchUrl.origin;
 const session=await fetch(base+'/api/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({secret:launchUrl.hash.slice(9)})});
 const {token}=await session.json();assert.ok(token);
 const headers={'X-STO-Token':token,'Content-Type':'application/json'};
 const connect=async()=>{const controller=new AbortController();const r=await fetch(base+'/api/lifetime',{headers,signal:controller.signal});assert.equal(r.status,200);return ()=>controller.abort();};
 return {proc,exited,base,headers,connect,dir};
}
test('last browser disconnect exits; refresh and another tab keep server alive',{timeout:10000},async t=>{
 const s=await launch(t);const close1=await s.connect(),close2=await s.connect();
 close1();await new Promise(r=>setTimeout(r,700));assert.equal(s.proc.exitCode,null);
 close2();await new Promise(r=>setTimeout(r,100));const close3=await s.connect();
 await new Promise(r=>setTimeout(r,700));assert.equal(s.proc.exitCode,null);
 close3();assert.equal((await s.exited)[0],0);
 await assert.rejects(fetch(s.base));
});
test('Exit requires session authorization and preserves saved work',{timeout:10000},async t=>{
 const s=await launch(t);await s.connect();
 assert.equal((await fetch(s.base+'/api/shutdown',{method:'POST',body:'{}'})).status,400);
 assert.equal((await fetch(s.base+'/api/shutdown',{method:'POST',headers:{...s.headers,Origin:'https://example.com'},body:'{}'})).status,400);
 const save=await fetch(s.base+'/api/build',{method:'POST',headers:s.headers,body:JSON.stringify({ship:'Shutdown test',name:'Baseline'})});assert.equal(save.status,200);
 assert.equal((await fetch(s.base+'/api/shutdown',{method:'POST',headers:s.headers,body:'{}'})).status,200);
 assert.equal((await s.exited)[0],0);
 assert.equal(JSON.parse(await readFile(path.join(s.dir,'state.json'),'utf8')).builds[0].name,'Baseline');
 await assert.rejects(fetch(s.base));
});
