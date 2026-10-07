import {describeItemDetails} from './item-details.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function detailsMarkup(item){
 if(item.itemId==='0')return '';
 const details=describeItemDetails(item.itemDetails);
 if(details.status)return item.itemDetails?.status==='conflicting-records'?`<small>Conflicting item records — check this item in STO.</small>`:'';
 const labels=[details.mark,details.rarity,details.modifiers].filter(value=>value&&!value.endsWith('unavailable'));
 return labels.length?`<small class="item-properties">${escape(labels.join(' · '))}</small>`:'';
}
// Observed slot IDs, checked against Elston and Sunnyside captures and equipment UI.
// Console categories describe the equipped slot, not the console's item type.
const bags={53:'Fore weapons',54:'Aft weapons',65:'Deflector',60:'Impulse engines',62:'Warp / singularity core',58:'Shield',72:'Universal console slots',69:'Engineering console slots',71:'Science console slots',68:'Tactical console slots',73:'Devices',74:'Hangar Pets',61:'Vanity Impulse',59:'Vanity Shields',66:'Vanity Deflector (unverified)',80:'Active Duty Officers'};
const bagOrder=[53,54,74,65,60,62,58,72,69,71,68,73,66,61,59];
export function equipmentGroups(items){
 return [...new Set(items.map(i=>i.bag))].sort((a,b)=>{
  const rank=id=>id===80?bagOrder.length+1:bagOrder.includes(id)?bagOrder.indexOf(id):bagOrder.length;
  return rank(a)-rank(b)||a-b;
 }).map(id=>({id,label:bags[id]||`Unverified slot category · ${id}`,items:items.filter(i=>i.bag===id).sort((a,b)=>a.slot-b.slot)}));
}
export function equipmentMarkup(snapshot){
 if(!snapshot)return '';
 const items=snapshot.loadout.items;
 const groups=equipmentGroups(items);
 const incomplete=items.some(i=>i.itemId!=='0'&&(()=>{const d=describeItemDetails(i.itemDetails);return d.status||d.modifierNote||d.mark?.endsWith('unavailable')||d.rarity?.endsWith('unavailable');})());
 return `<section class="captured-equipment"><h2>Captured equipment · ${escape(snapshot.loadout.name)}</h2><p>${escape(snapshot.ship.name)} · ${escape(snapshot.character)} · Captured ${escape(new Date(snapshot.capturedAt).toLocaleString())}</p><p class="muted">Saved snapshot, not a live connection. Item details reflect capture time. Confirm this setup matches your flight.${incomplete?' Some item details weren’t captured or decoded; missing values are not assumed to be zero.':''}</p><div class="equipment-grid">${groups.map(group=>`<section><h3>${escape(group.label)}</h3>${group.items.map(i=>`<div class="equipment-slot"><span class="equipment-number">${i.slot+1}</span><div><strong>${escape(i.itemId==='0'?'Empty saved slot':i.name||i.definition||'Unresolved item')}</strong>${detailsMarkup(i)}</div></div>`).join('')}</section>`).join('')}</div><details class="capture-diagnostics"><summary>Capture details</summary><p>Traits and bridge officer assignments are not captured. Console headings identify slot type. Mark, rarity and modifiers are not proven historical loadout-save values. IDs are retained for troubleshooting.</p>${groups.map(group=>`<h3>${escape(group.label)}</h3>${group.items.map(i=>{const d=describeItemDetails(i.itemDetails);return `<p>Slot ${i.slot+1} · ${escape(i.name||i.definition||'Empty saved slot')}<br>Item ${escape(i.itemId)} · category ${group.id}${i.ownerItem?' · character-owned':''}${i.itemId!=='0'?`<br>${escape(d.status||[d.mark,d.rarity,d.modifiers,d.modifierNote].filter(Boolean).join(' · '))}`:''}</p>`;}).join('')}`).join('')}</details></section>`;
}
export function installShipCapture({api,getState,onImported}){
 const dialog=document.createElement('dialog');dialog.className='ship-capture-dialog';dialog.setAttribute('aria-labelledby','capture-title');
 dialog.innerHTML=`<div class="panel-heading"><h2 id="capture-title">Capture my ship · experimental</h2><button type="button" id="capture-close">Close</button></div><p>Save your loadout in STO and enter space. This read-only preview needs STO running on this computer. Nothing is imported until you confirm.</p><div class="two-col"><label>STO character name<input id="capture-character" maxlength="100" autocomplete="off"></label><label>Saved STO loadout name<input id="capture-name" maxlength="100" autocomplete="off"></label></div><button id="capture-read" class="primary">Read saved loadout</button><p id="capture-status" role="status"></p><div id="capture-preview" hidden><p id="capture-warning"></p><div class="two-col"><label>Detected ship reference<select id="capture-ship"></select></label><label>Saved record<select id="capture-record"></select></label></div><div id="capture-equipment"></div><h2>Save to Shakedown</h2><div class="two-col"><label>Ship profile<select id="capture-profile"></select></label><label>Shakedown loadout<select id="capture-loadout"></select></label></div><label>New variation name<input id="capture-variation" value="Baseline" maxlength="300"></label><label class="capture-confirm"><input id="capture-confirm" type="checkbox"> I checked the ship and equipment. This saved loadout belongs to this ship.</label><button id="capture-import" class="primary" disabled>Import equipment snapshot</button><p>Existing variations and runs are preserved. For each combat log, you must confirm which equipment setup you flew.</p></div>`;
 document.body.append(dialog);const $=id=>dialog.querySelector('#capture-'+id);let capture,reading=false,opener;
 $('close').onclick=()=>dialog.close();dialog.onclose=()=>opener?.focus();
 function render(){ $('confirm').checked=false;$('import').disabled=true;const ship=capture.ships[+$('ship').value],loadout=capture.records[+$('record').value];$('equipment').innerHTML=equipmentMarkup({...capture,ship,loadout}); }
 function profiles(){const state=getState();$('profile').innerHTML='<option value="">Create detected ship profile</option>'+state.profiles.map(p=>`<option value="${escape(p.id)}">${escape(p.name)}</option>`).join('');const match=state.profiles.find(p=>p.name.toLowerCase()===capture.ships[+$('ship').value].name.toLowerCase());if(match)$('profile').value=match.id;loadouts();}
 function loadouts(){const list=getState().loadouts.filter(l=>l.profileId===$('profile').value);$('loadout').innerHTML='<option value="">Use captured name (create if needed)</option>'+list.map(l=>`<option value="${escape(l.id)}">${escape(l.name)}</option>`).join('');}
 $('profile').onchange=loadouts;$('ship').onchange=()=>{render();profiles();};$('record').onchange=render;
 $('confirm').onchange=()=>{$('import').disabled=!$('confirm').checked;};
 $('read').onclick=async()=>{if(reading)return;reading=true;$('read').disabled=true;$('preview').hidden=true;$('status').textContent='Reading STO… this can take up to 140 seconds. You can close this preview while it finishes.';try{
  capture=await api('ship-capture',{character:$('character').value,loadout:$('name').value});
  $('ship').innerHTML=capture.ships.map((s,i)=>`<option value="${i}">${escape(s.name)} · ${escape(s.id)}</option>`).join('');
  $('record').innerHTML=capture.records.map((r,i)=>`<option value="${i}">Record ${i+1} · ${r.items.length} entries · save counter ${r.lastSave}${i===0?' (newest found)':''}</option>`).join('');
  $('record').value='0';$('warning').textContent=capture.warning;$('status').textContent=`Found ${capture.records.length} record(s). Newest does not guarantee correct ownership—review the equipment.`;$('preview').hidden=false;render();profiles();
 }catch(e){$('status').textContent=e.message;}finally{reading=false;$('read').disabled=false;}};
 $('import').onclick=async()=>{$('import').disabled=true;try{const result=await api('ship-capture/import',{captureId:capture.id,shipIndex:+$('ship').value,recordIndex:+$('record').value,profileId:$('profile').value,loadoutId:$('loadout').value,variationName:$('variation').value,confirmed:$('confirm').checked});await onImported(result);dialog.close();}catch(e){$('status').textContent=e.message;$('import').disabled=!$('confirm').checked;}};
 for(const id of ['shipyard','builds']){const button=document.createElement('button');button.type='button';button.className='capture-launch';button.textContent='Capture my ship';button.onclick=()=>{opener=button;dialog.showModal();$('character').focus();};document.querySelector(`#${id} .page-title`).append(button);}
}
