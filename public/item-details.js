// Only labels corroborated by the captured item properties/reference equipment.
const rarities={3:'Very Rare',4:'Ultra Rare',5:'Epic'};
const marks=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const modifiers={
 Spaceitem_Enchancement_Accuracy_Beam:'Acc',
 Spaceitem_Enchancement_Crit_Chance_Beam:'CrtH',
 Spaceitem_Enchancement_Crit_Severity_Beam:'CrtD',
 Spaceitem_Enchancement_Dmg_Beam:'Dmg',
 Spaceitem_Enchancement_Weapon_Gold_Accuracy_Dam:'Ac/Dm',
 Spaceitem_Enchancement_Wide_Arc:'Arc',
 Spaceitem_Enhancement_Shields_Capacity:'Cap'
};
export function describeItemDetails(details){
 if(!details)return {status:'Not recorded in this capture'};
 if(details.status!=='matched'||!details.values)return {status:details.status==='conflicting-records'?'Conflicting item records — details unavailable':details.status==='incomplete-scan'?'Item lookup incomplete — details unavailable':'Item details unavailable'};
 const {qualityCode,progressionLevel,modifierDefinitions=[]}=details.values;
 const counts=new Map();let unresolved=0;
 for(const definition of modifierDefinitions){
  const label=modifiers[definition];
  if(label)counts.set(label,(counts.get(label)||0)+1);else unresolved++;
 }
 return {
  mark:Number.isInteger(progressionLevel)&&progressionLevel>0&&marks[progressionLevel]?`Mk ${marks[progressionLevel]}`:'Mark unavailable',
  rarity:rarities[qualityCode]||'Rarity unavailable',
  modifiers:[...counts].map(([label,count])=>`[${label}]${count>1?'x'+count:''}`).join(' '),
  modifierNote:unresolved?'Additional item properties not decoded':counts.size?'':'No modifiers resolved'
 };
}
