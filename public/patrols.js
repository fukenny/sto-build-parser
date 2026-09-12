// Catalog transcribed from the creator's in-game Patrols screenshots.
// Jupiter Station Showdown is excluded because this release covers space only.
const groups = {
 'Delta Quadrant': ['Aftermath (Nassordin System)','Blockade Runner (Zahl System)','Gone Dark (Nular System)','Preying Upon the Weak (Farn System)','Satellite Defense (Kelsid System)','Showdown (Nanipia System)','Tempting Targets (Kinbar System)','Unity (Brothra System)','Wanted (Argala System)'],
 'Age of Discovery': ['Rescue and Search (Kern System)','Ruins of Doom (Imaga System)','Sentinels (Donatu System)','The Ninth Rule (Kinjer System)','Within the Briars (Briar Patch)'],
 'Klingon Civil War': ['Clash Above Ceron (Ceron System)','Jailbreak at Rura Penthe (Rura Penthe System)',"Redemption Over Qu’Vat (Qu’Vat System)",'Strike at Seedea (Seedea System)','To Die With Honor (Forcas System)','Trouble Over Terrh (Terrh System)'],
 'Mirror Universe': ['Bringers of War - Hard (Sol System)','Bringers of War - Normal (Sol System)','Jupiter Gauntlet - Hard (Sol System)','Jupiter Gauntlet - Normal (Sol System)','Khonshu Khaibit (Eta Serpentis System)'],
 'Borg Multiverse': ['Out of Control (Sitor System)','Unwanted Guests (Kinjer System)']
};
export const patrols = Object.entries(groups).flatMap(([category,names])=>names.map(name=>({
 id:name.split(' (')[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),name,category,
 random:/^(Bringers of War|Jupiter Gauntlet|The Ninth Rule)/.test(name)
})));
export const difficulties=['Normal','Advanced','Elite'];
export const battleTypes=['Patrol','TFO','DSE'];
const missionName=value=>typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
export function conditions(input) {
 const battleType=input.battleType??'Patrol';
 if(!battleTypes.includes(battleType)||!difficulties.includes(input.difficulty)||!['Solo','Group'].includes(input.party))throw new Error('Choose a battle type, difficulty, and Solo / Group.');
 const patrol=patrols.find(p=>p.id===input.patrolId);
 const mission=battleType==='Patrol'?'':missionName(input.missionName);
 if(battleType==='Patrol'&&!patrol)throw new Error('Choose a listed space patrol.');
 if(battleType!=='Patrol'&&(!mission||mission.length>200))throw new Error('Enter a mission name up to 200 characters.');
 return {battleType,patrolId:battleType==='Patrol'?patrol.id:null,missionName:mission,difficulty:input.difficulty,party:input.party,context:(battleType==='Patrol'?patrol.name:battleType+' / '+mission)+' / '+input.difficulty+' / '+input.party};
}
export const conditionKey=r=>{
 const type=r.battleType??'Patrol';
 const mission=type==='Patrol'?r.patrolId:missionName(r.missionName).toLowerCase();
 return mission?JSON.stringify([type,mission,r.difficulty,r.party]):'';
};
