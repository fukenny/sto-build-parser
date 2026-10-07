import test from 'node:test';
import assert from 'node:assert/strict';
import {describeItemDetails} from '../public/item-details.js';
import {equipmentMarkup} from '../public/ship-capture.js';
test('observed item properties show exact mark/rarity and repeated modifiers without inventing unknowns',()=>{
 const details={status:'matched',values:{qualityCode:5,progressionLevel:15,modifierDefinitions:['Spaceitem_Enchancement_Dmg_Beam','Spaceitem_Enchancement_Dmg_Beam','Spaceitem_Enchancement_Accuracy_Beam','Spaceitem_Enchancement_Weapon_Gold_Accuracy_Dam','unknown']}};
 const result=describeItemDetails(details);
 assert.equal(result.mark,'Mk XV');assert.equal(result.rarity,'Epic');assert.equal(result.modifiers,'[Dmg]x2 [Acc] [Ac/Dm]');assert.match(result.modifierNote,/not decoded/);
 assert.equal(describeItemDetails({...details,values:{qualityCode:99,progressionLevel:0}}).mark,'Mark unavailable');
 assert.equal(describeItemDetails({...details,values:{qualityCode:99,progressionLevel:16}}).rarity,'Rarity unavailable');
 for(const status of ['conflicting-records','incomplete-scan','unavailable'])assert.equal(describeItemDetails({...details,status}).mark,undefined);
 assert.equal(describeItemDetails().status,'Not recorded in this capture');
 const html=equipmentMarkup({ship:{name:'Ship'},character:'Captain',capturedAt:new Date().toISOString(),loadout:{name:'Loadout',items:[{bag:53,slot:0,itemId:'16153689827849148',name:'Weapon',itemDetails:details}]}});
 assert(html.includes('Mk XV · Epic'));assert(html.includes('[Dmg]x2'));assert(html.includes('16153689827849148'));
});
