import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {pickDesktopFolder} from '../lib/desktop-picker.mjs';
test('desktop picker matches responses, preserves Unicode paths and handles cancel and disconnect',async()=>{
 for(const folder of ['C:\\Games\\Étoile\\GameClient','']) {
  const channel=new EventEmitter();
  channel.send=(message,callback)=>{callback();queueMicrotask(()=>{
   channel.emit('message',{type:'desktop-folder-result',id:'unrelated',folder:'wrong'});
   channel.emit('message',{type:'desktop-folder-result',id:message.id,folder});
  });};
  assert.equal(await pickDesktopFolder('',channel),folder);
  assert.equal(channel.listenerCount('message'),0);assert.equal(channel.listenerCount('disconnect'),0);
 }
 const channel=new EventEmitter();channel.send=()=>queueMicrotask(()=>channel.emit('disconnect'));
 await assert.rejects(pickDesktopFolder('',channel),/disconnected/);
 assert.equal(channel.listenerCount('message'),0);
});
