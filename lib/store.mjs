import {writeFile,rename} from 'node:fs/promises';
export function createStore(initial,file) {
 let state=initial,queue=Promise.resolve(),closed=false;
 return {get state(){return state;}, drain(){closed=true;return queue;},
  transact(change){
   if(closed)return Promise.reject(Error('Shakedown is shutting down.'));
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
