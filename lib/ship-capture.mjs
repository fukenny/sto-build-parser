import {execFile} from 'node:child_process';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
let child;
export function stopCapture(){child?.kill();}
export async function captureShip(root,character,loadout){
 if(process.platform!=='win32')throw Error('Live capture requires Windows and a running STO client.');
 if(child)throw Error('A capture is already running.');
 const ps=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
 return new Promise((resolve,reject)=>{
  child=execFile(ps,['-NoProfile','-NonInteractive','-File',path.join(root,'launcher/capture/Capture.ps1'),'-CharacterName',character,'-LoadoutName',loadout],{windowsHide:true,timeout:140000,maxBuffer:2*1024*1024},(error,stdout,stderr)=>{
   child=null;
   if(error)return reject(Error(error.killed?'Capture timed out. No data was imported.':(stderr.trim().split('\n')[0]||'Capture failed. Check that STO is running.')));
   try{
    const result=JSON.parse(stdout.replace(/^\uFEFF/,''));
    if(!result.records?.length||!result.ships?.length)throw Error('Empty capture');
    // Identical records can occupy multiple memory addresses. Keep different saves.
    result.records=[...new Map(result.records.map(record=>[JSON.stringify(record),record])).values()];
    resolve(result);
   }catch{reject(Error('The reader returned an invalid capture.'));}
  });
 });
}
export function importSnapshot(state,snapshot,{profileId,loadoutId,variationName}){
 const name=String(variationName||'').trim();if(!name||name.length>300)throw Error('Enter a variation name.');
 let profile=profileId?state.profiles.find(p=>p.id===profileId):null;
 if(profileId&&!profile)throw Error('Ship profile no longer exists.');
 if(!profile){
  if(state.profiles.some(p=>p.name.toLowerCase()===snapshot.ship.name.toLowerCase()))throw Error('A matching ship exists. Select it instead.');
  profile={id:randomUUID(),name:snapshot.ship.name};state.profiles.push(profile);
 }
 let loadout=loadoutId?state.loadouts.find(l=>l.id===loadoutId&&l.profileId===profile.id):null;
 if(loadoutId&&!loadout)throw Error('Choose a loadout belonging to this ship.');
 if(!loadout){loadout=state.loadouts.find(l=>l.profileId===profile.id&&l.name.toLowerCase()===snapshot.loadout.name.toLowerCase());if(!loadout){loadout={id:randomUUID(),profileId:profile.id,name:snapshot.loadout.name};state.loadouts.push(loadout);}}
 if(state.builds.some(b=>b.loadoutId===loadout.id&&b.name.toLowerCase()===name.toLowerCase()))throw Error('That variation already exists. Choose a new name to preserve its equipment and runs.');
 const build={id:randomUUID(),loadoutId:loadout.id,ship:profile.name,name,notes:'Equipment captured from saved STO loadout '+snapshot.loadout.name,createdAt:new Date().toISOString(),equipmentSnapshot:structuredClone(snapshot)};
 state.builds.push(build);return {profileId:profile.id,buildId:build.id};
}
