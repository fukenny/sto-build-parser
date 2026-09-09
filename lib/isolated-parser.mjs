import {fork} from 'node:child_process';
const children=new Set();
export async function stopParsers() {
 await Promise.all([...children].map(child=>new Promise(resolve=>{
  child.once('exit',resolve);child.kill();
 })));
}
export function parseIsolated(files,{timeoutMs=60000,heapMb=256}={}) {
 return new Promise((resolve,reject)=>{
  const child=fork(new URL('./parse-worker.mjs',import.meta.url),[],{execArgv:[`--max-old-space-size=${heapMb}`],windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
  children.add(child);child.once('exit',()=>children.delete(child));
  let done=false;
  const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);child.kill();error?reject(error):resolve(result);};
  const timer=setTimeout(()=>finish(Error('Import exceeded its time limit. Select fewer logs.')),timeoutMs);
  child.on('message',message=>finish(message.error?Error(message.error):null,message.result));
  child.on('error',()=>finish(Error('Unable to start the isolated parser.')));
  child.on('exit',()=>finish(Error('Import stopped after exceeding resources or a parser failure. Your saved data is unchanged.')));
  child.send(files,error=>{if(error)finish(Error('Unable to send logs to the isolated parser.'));});
 });
}
