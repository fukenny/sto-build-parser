import {writeFile,rename} from 'node:fs/promises';
export function createStore(initial,file) {
 let state=initial,queue=Promise.resolve();
 return {get state(){return state;},
  transact(change){
   const task=queue.then(async()=>{
    const draft=structuredClone(state),result=await change(draft);
    await writeFile(file+'.tmp',JSON.stringify(draft,null,2));
    await rename(file+'.tmp',file);
    state=draft;return result;
   });
   queue=task.catch(()=>{});return task;
  }
 };
}
