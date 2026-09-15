import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
export async function backupState(state,dataDirectory) {
 // Capture one committed in-memory state before awaiting filesystem work.
 const snapshot=JSON.stringify(state,null,2);
 const directory=path.join(dataDirectory,'backups',new Date().toISOString().replaceAll(':','-')+'-'+randomUUID());
 await mkdir(directory,{recursive:true});
 await writeFile(path.join(directory,'state.json'),snapshot,{flag:'wx'});
 return directory;
}
