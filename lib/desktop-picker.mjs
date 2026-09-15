import {randomUUID} from 'node:crypto';
export function pickDesktopFolder(defaultPath,channel=process) {
 return desktopRequest('desktop-pick-folder',defaultPath,channel);
}
export function desktopRequest(type,defaultPath='',channel=process) {
 return new Promise((resolve,reject)=>{
  const id=randomUUID();
  const cleanup=()=>{clearTimeout(timer);channel.off('message',receive);channel.off('disconnect',disconnect);};
  const fail=error=>{cleanup();reject(error);};
  const disconnect=()=>fail(new Error('Desktop window disconnected.'));
  const receive=message=>{
   if(message?.type!=='desktop-folder-result'||message.id!==id)return;
   cleanup();
   if(message.error)reject(new Error(type==='desktop-open-data'?'Could not open the data folder.':'Could not open the folder picker. Paste your folder path instead.'));
   else if(typeof message.folder==='string'&&message.folder.length<=2048)resolve(message.folder);
   else reject(new Error('Invalid folder selection.'));
  };
  const timer=setTimeout(()=>fail(new Error('Folder selection timed out. Please try again.')),120000);
  channel.on('message',receive);channel.once('disconnect',disconnect);
  try {channel.send({type,id,defaultPath},error=>{if(error)fail(error);});}catch(error){fail(error);}
 });
}
