import {patrols,difficulties,battleTypes,tfos,battleTypeOf} from './patrols.js';
const $ = id => document.getElementById(id);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value||0);
const compact = value => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value||0);
let detailId=null;
function openLoadoutComparison(id){
 $('compare-loadout').value=id;buildOptions();
 const builds=shipBuilds().filter(b=>b.loadoutId===id&&!b.archived);
 $('baseline').value=builds[0]?.id||'';$('candidate').value=builds[1]?.id||'';
 const run=state.runs.find(r=>r.buildId===builds[0]?.id&&r.spaceConfirmed);
 if(run){$('compare-player').value=run.player.id;const form=patrolForm('compare',run);$('compare-patrol').innerHTML=form.html;form.bind();}
 $('comparison').innerHTML='<p>Choose two setups and matching conditions, then Compare evidence. Every matching run contributes equally.</p>';page('compare');
}
function renderVariation(){
 const build=state.builds.find(b=>b.id===detailId);if(!build){detailId=null;return;}
 const runs=state.runs.filter(r=>r.buildId===build.id);
 $('variation-content').innerHTML=`<article><div class="page-title"><div><div class="eyebrow">${esc(buildLabel(build))}</div><h1>${esc(build.name)}${build.archived?' · Archived':''}</h1><p>One equipment setup · ${runs.length} saved runs</p></div></div><details id="detail-history"><summary>Run history (${runs.length})</summary><p>Select two runs for the same character, battle type, mission, difficulty, party and combat scope.</p><div class="table-wrap"><table><thead><tr><th>Select</th><th>Date / combat</th><th>Character</th><th>DPS</th><th>Actions</th></tr></thead><tbody>${runs.map(r=>`<tr><td><input class="run-picker" type="checkbox" value="${esc(r.id)}" aria-label="Select ${esc(r.stamp)}"></td><td>${esc(r.stamp)}<br>${esc(r.context)}<br><small>${r.scope==='full-log'?'Entire log':'Individual encounter'}${r.spaceConfirmed?'':' · Needs confirmation'}</small></td><td>${esc(r.player.name)}</td><td>${num(r.player.dps)}</td><td><button data-edit-run="${esc(r.id)}">Edit label / variation</button></td></tr>`).join('')||'<tr><td colspan="5">No runs yet. Analyze a new run with this setup.</td></tr>'}</tbody></table></div><button id="detail-compare" disabled>Compare selected runs</button><div id="detail-result" aria-live="polite"></div></details><div class="variation-actions"><button id="detail-add" class="primary" ${build.archived?'disabled':''}>Analyze a new run with ${esc(build.name)}</button><button id="detail-copy" ${build.archived?'disabled':''}>Create variation from this setup</button><button id="detail-archive">${build.archived?'Restore':'Archive'} variation</button><button id="detail-compare-builds">Compare variations in this loadout</button></div><div class="panel"><h2>Equipment & change notes</h2><pre>${esc(build.notes||'No equipment notes recorded.')}</pre><p>Notes describe the setup you used; equipment is not detected from STO. Repeated unchanged flights belong to this same variation.</p></div></article>`;
 $('detail-history').onchange=()=>{$('detail-compare').disabled=$('variation-content').querySelectorAll('.run-picker:checked').length!==2;};
 action('detail-compare',async()=>{const ids=[...$('variation-content').querySelectorAll('.run-picker:checked')].map(el=>el.value);const r=await api('runs/compare',{ids});
 const row=(label,a,b)=>`<tr><td>${label}</td><td>${a===null?'Not recorded':num(a)}</td><td>${b===null?'Not recorded':num(b)}</td></tr>`;
 $('detail-result').innerHTML=`<h2>Same setup · two flights</h2><p>${esc(r.message)}</p><p>${esc(r.runs[0].stamp)} → ${esc(r.runs[1].stamp)}</p><div class="verdict">${r.delta===null?'No percentage available':(r.delta>=0?'+':'')+r.delta.toFixed(1)+'% observed DPS difference'}</div><div class="table-wrap"><table><thead><tr><th>Metric</th><th>First run</th><th>Second run</th></tr></thead><tbody>${row('Total DPS',r.baseline.mean,r.candidate.mean)}${row('Ship DPS',r.baseline.direct,r.candidate.direct)}${row('Pet DPS',r.baseline.pets,r.candidate.pets)}${row('Damage taken / sec',r.baseline.incoming,r.candidate.incoming)}${row('Hull healing / sec',r.baseline.hullHealing,r.candidate.hullHealing)}</tbody></table></div>`+contributionTables(r);});
 action('detail-add',async()=>{
  analysis=null;$('results').hidden=true;$('empty').hidden=false;$('encounter').disabled=true;$('player').disabled=true;
  buildOptions();$('save-build').value=build.id;$('space-confirmed').checked=false;
  $('analysis-target').textContent='Next run: '+buildLabel(build)+'. Import the log after your flight and select only the new combat.';
  page('analyze');notice('Setup selected. Import a new run before saving.');
 });
 $('detail-copy').onclick=()=>{
  const dialog=document.createElement('dialog');dialog.innerHTML='<form><h2>Create variation from this setup</h2><p>Copies equipment notes. Saved runs stay with the original variation.</p><label>New variation name<input name="name" required maxlength="300"></label><label>Equipment & change notes<textarea name="notes" maxlength="10000"></textarea></label><p role="alert"></p><div class="variation-actions"><button type="submit">Create variation</button><button type="button">Cancel</button></div></form>';document.body.append(dialog);dialog.querySelector('textarea').value=build.notes||'';dialog.onclose=()=>dialog.remove();dialog.querySelector('[type=button]').onclick=()=>dialog.close();dialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const submit=dialog.querySelector('[type=submit]');submit.disabled=true;try{const copy=await api('variation/copy',{id:build.id,name:dialog.querySelector('input').value,notes:dialog.querySelector('textarea').value});detailId=copy.id;await refresh();dialog.close();notice('Variation created with copied notes and no runs.');}catch(error){dialog.querySelector('[role=alert]').textContent=error.message;submit.disabled=false;}};dialog.showModal();
 };
 action('detail-archive',async()=>{await api('variation/archive',{id:build.id,archived:!build.archived});await refresh();notice(build.archived?'Variation restored.':'Variation archived; all runs retained. Enable Show archived variations in the ship profile to find it later.');});
 $('detail-compare-builds').onclick=()=>openLoadoutComparison(build.loadoutId);
}
let state, analysis, activeShip="", sessionToken=sessionStorage.getItem("sto-session")||"";
function notice(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
let exiting=false, lifetimeController;
async function keepServerConnected(){
 while(!exiting){
  try{
   lifetimeController=new AbortController();
   const response=await fetch('/api/lifetime',{headers:{'X-STO-Token':sessionToken},signal:lifetimeController.signal});
   if(!response.ok)break;
   const reader=response.body.getReader();
   while(!(await reader.read()).done){}
  }catch{}
  if(!exiting)await new Promise(resolve=>setTimeout(resolve,1000));
 }
}
window.addEventListener('pagehide',()=>{exiting=true;lifetimeController?.abort();});
window.addEventListener('pageshow',event=>{if(event.persisted){exiting=false;void keepServerConnected();}});
const exitButton=document.createElement('button');
exitButton.textContent='Exit Shakedown';exitButton.id='exit-shakedown';
exitButton.className='nav exit-nav';
exitButton.innerHTML='<span aria-hidden="true">⏻</span><span>Exit Shakedown</span>';
document.querySelector('.aside-bottom').prepend(exitButton);
exitButton.onclick=async()=>{
 exitButton.disabled=true;
 try{
  await api('shutdown',{});exiting=true;lifetimeController?.abort();sessionStorage.removeItem('sto-session');
  document.querySelector('main').replaceChildren();
  const message=document.createElement('h1');message.textContent='Shakedown has stopped. You can close this tab.';
  document.querySelector('main').append(message);
  document.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=true);
 }catch(e){notice(e.message,true);exitButton.disabled=false;}
};
async function api(route,body){const r=await fetch('/api/'+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-STO-Token':sessionToken},body:body===undefined?undefined:JSON.stringify(body)});const value=await r.json();if(!r.ok)throw new Error(value.error||'Request failed');return value;}
function page(id){$('analysis-target').hidden=id!=='analyze'||!$('analysis-target').textContent;window.scrollTo(0,0);document.querySelector("main").scrollTo(0,0);document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===(['builds','variation-detail'].includes(id)?'shipyard':id)));}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));
function action(id,fn){$(id).onclick=async()=>{const b=$(id);b.disabled=true;notice('');try{await fn();}catch(e){notice(e.message,true);}finally{b.disabled=false;}};}
function options(id,items,placeholder){const select=$(id),previous=select.value;select.innerHTML=(placeholder?`<option value="">${esc(placeholder)}</option>`:'')+items.map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('');if(items.some(x=>x.value===previous))select.value=previous;}
function buildLabel(b){return `${b.ship} / ${state.loadouts?.find(l=>l.id===b.loadoutId)?.name||'Imported'} / ${b.name}`;}
function shipBuilds(){return state.builds.filter(b=>state.loadouts.find(l=>l.id===b.loadoutId)?.profileId===activeShip);}
function buildOptions(){
 const loadouts=state.loadouts.filter(l=>l.profileId===activeShip);
 options('compare-loadout',loadouts.map(l=>({value:l.id,label:l.name})));
 options('save-build',shipBuilds().filter(b=>!b.archived).map(b=>({value:b.id,label:buildLabel(b)})),'Choose a variation');
 for(const id of ['baseline','candidate'])options(id,shipBuilds().filter(b=>!b.archived && b.loadoutId===$('compare-loadout').value).map(b=>({value:b.id,label:b.name})),'Choose a variation');
 const ids=new Set(shipBuilds().map(b=>b.id)),runs=state.runs.filter(r=>ids.has(r.buildId));
 const players=[...new Map(runs.map(r=>[r.player.id,r.player])).values()];
 options('compare-player',players.map(p=>({value:p.id,label:p.name+' · '+p.id})),'Choose a player');
}
function renderBuildCards(){
 const builds=shipBuilds().filter(b=>$('show-archived').checked||!b.archived);
 $('build-list').innerHTML=builds.map(b=>`<article class="panel build-card"><div class="eyebrow">${esc(b.ship)} / ${esc(state.loadouts.find(l=>l.id===b.loadoutId)?.name)}</div><h2>${esc(b.name)}${b.archived?' · Archived':''}</h2><pre>${esc(b.notes||'No equipment notes yet.')}</pre><p>${state.runs.filter(r=>r.buildId===b.id).length} saved runs</p><button data-open-variation="${esc(b.id)}">Open setup & runs →</button></article>`).join('')||'<p>No visible variations. Add a loadout or show archived variations.</p>';
}

async function refresh(){state=await api('state');if(!state.profiles.some(p=>p.id===activeShip))activeShip=state.profiles[0]?.id||'';options('workspace-ship',state.profiles.map(p=>({value:p.id,label:p.name})),'Choose a ship');$('workspace-ship').value=activeShip;renderShips();$('folder-path').value=state.folder;$('folder-summary').textContent=state.folder||'No folder selected yet. Choose your own STO log location to begin.';options('log',state.logs.map(l=>({value:l.name,label:`${l.name} · ${(l.size/1e6).toFixed(1)} MB`})),'Choose a combat log');buildOptions();renderBuilds();if(detailId)renderVariation();if(state.folderError)notice(state.folderError,true);}
action('refresh',async()=>{await refresh();notice('Log list refreshed. Import a log again to read newly written events.');});
action('browse',async()=>{notice('Select a folder in the Windows folder picker.');const r=await api('browse',{});if(r.folder){$('folder-path').value=r.folder;notice('Folder selected. Click “Use this folder” to validate and remember it.');}else notice('Folder selection cancelled.');});
action('save-folder',async()=>{await api('folder',{folder:$('folder-path').value});analysis=null;$('results').hidden=true;$('empty').hidden=false;$('encounter').disabled=true;$('player').disabled=true;$('parse-note').textContent='';await refresh();page('analyze');notice('Folder saved. Select a combat log to analyze.');});
action('analyze-button', async () => {
  if (![...$('log').selectedOptions].some(o=>o.value)) throw new Error('Choose a combat log first.');
  notice('Reading combat log…');
  analysis = await api('analyze', {names: [...$('log').selectedOptions].map(o=>o.value).filter(Boolean)});
  $('parse-note').textContent = `${num(analysis.valid)} records · ${analysis.encounters.length} detected encounters · ${analysis.files.length} source files · ${analysis.duplicates||0} overlapping records removed · ${analysis.skipped} skipped records · ${analysis.outOfOrder} out-of-order timestamps.`;
  options('encounter', [
    ...(analysis.fullLog ? [{value: analysis.fullLog.id, label: 'Entire log · all recorded combat (including gaps)'}] : []),
    ...analysis.encounters.map((e,i) => ({value:e.id, label:`Encounter ${i+1} · ${e.stamp} · ${e.duration.toFixed(1)}s · ${e.targets.slice(0,3).join(', ') || 'Unknown targets'}`}))
  ]);
  // Keep the single-encounter default; full-file analysis is an explicit choice.
  if (analysis.encounters.length) $('encounter').value = analysis.encounters[0].id;
  $('encounter').disabled = !analysis.encounters.length;
  selectEncounter();
  notice(analysis.encounters.length ? 'Log imported. Choose your combat selection and character.' : 'No encounters with player damage found. Try another log.');
});
function currentEncounter() {
  return analysis?.fullLog?.id === $('encounter').value ? analysis.fullLog : analysis?.encounters.find(e => e.id === $('encounter').value);
}
function selectEncounter() {
  const encounter = currentEncounter();
  $('selection-note').textContent = encounter?.scope === 'full-log'
    ? 'Entire log selected: includes every player and target in the selected files. DPS includes gaps between fights. This may contain multiple missions or build changes; it is not automatically one complete mission. Save only if the build stayed the same, and use a separate session label.'
    : 'Individual encounter selected: all recorded players and enemies in this combat stretch. Enemy names are clues only. Select your character to inspect their performance.';
  options('player', (encounter?.players || []).map(p => ({value:p.id,label:`${p.name} · ${p.id}`})), 'Choose your character');
  $('player').disabled = !encounter;
  renderPlayer();
}
$('encounter').onchange=selectEncounter;$('player').onchange=renderPlayer;
function selection(){const encounter=currentEncounter();return {encounter,player:encounter?.players.find(p=>p.id===$('player').value)};}
function metric(label,value,note){return `<div class="metric"><small>${label}</small><strong>${value}</strong><p>${note}</p></div>`;}
function renderPlayer(){const {encounter:e,player:p}=selection();$('results').hidden=!p;$('empty').hidden=!!p;if(!p)return;renderSurvival(p,e);$('metrics').innerHTML=metric(e.scope==='full-log'?'FULL-LOG DPS':'ENCOUNTER DPS',num(p.dps),`${e.duration.toFixed(1)}s encounter · hull + shield`)+metric('TOTAL DAMAGE',compact(p.total),`${compact(p.hull)} hull / ${compact(p.shield)} shield`)+metric('PETS & SUMMONS',compact(p.pets),`${p.total?(100*p.pets/p.total).toFixed(1):0}% of outgoing damage`)+metric('DAMAGE TAKEN',compact(p.incoming),`${compact(p.healing)} logged outgoing healing`);$('abilities').innerHTML=p.abilities.map(a=>{const share=p.total?100*a.total/p.total:0;return `<tr><td>${esc(a.name)}</td><td class="${a.pet?'pet':''}">${esc(a.source)}</td><td>${num(a.total)}</td><td>${share.toFixed(1)}%<div class="share"><i style="width:${share.toFixed(2)}%"></i></div></td><td>${num(a.total/e.duration)}</td><td>${num(a.events)}</td></tr>`;}).join('');}
action('create-build',async()=>{const build=await api('variation',{profileId:activeShip,loadoutId:$('loadout').value,name:$('build-name').value,notes:$('build-notes').value});await refresh();chooseShip(state.loadouts.find(l=>l.id===build.loadoutId).profileId);$('save-build').value=build.id;$('build-name').value='';$('build-notes').value='';notice(`Created ${build.ship} / ${build.name}. Return to Analyze a run to attach evidence.`);});
action('save-run',async()=>{const {encounter,player}=selection();if(!player)throw new Error('Select a player first.');const saved=await api('run',{encounterId:encounter.id,playerId:player.id,buildId:$('save-build').value,...patrolValue('save'),spaceConfirmed:$('space-confirmed').checked});detailId=saved.buildId;await refresh();page('variation-detail');$('detail-history').open=true;notice('Run saved to this variation. Select two flights in Run history to compare.');});
action('compare-button',async()=>{if(!$('compare-player').value)throw new Error('Select a player and encounter / difficulty.');const r=await api('compare',{baseline:$('baseline').value,candidate:$('candidate').value,playerId:$('compare-player').value,...patrolValue('compare')});const a=r.baseline,b=r.candidate;const delta=r.delta===null?'More evidence needed':`${r.delta>=0?'+':''}${r.delta.toFixed(1)}% observed DPS`;const row=(label,x,y)=>`<tr><td>${label}</td><td>${!a.count?"No matching runs":x===null?"Not recorded":num(x)}</td><td>${!b.count?"No matching runs":y===null?"Not recorded":num(y)}</td></tr>`;$('comparison').innerHTML=`<div class="eyebrow">OBSERVED COMPARISON · NO CAUSAL VERDICT</div><div class="verdict">${delta}</div><p>${esc(r.message)}</p><div class="table-wrap"><table><thead><tr><th>Metric</th><th>Baseline (${a.count} runs)</th><th>Candidate (${b.count} runs)</th></tr></thead><tbody>${row('Mean encounter DPS',a.mean,b.mean)}${row('Lowest run DPS',a.min,b.min)}${row('Highest run DPS',a.max,b.max)}${row('Run-to-run standard deviation',a.sd,b.sd)}${row('Ship / player DPS',a.direct,b.direct)}${row('Pets & summons DPS',a.pets,b.pets)}${row('Damage taken per second',a.incoming,b.incoming)}${row('Incoming hull damage / second',a.hullTaken,b.hullTaken)}${row('Incoming shield damage / second',a.shieldTaken,b.shieldTaken)}${row('Hull healing received / second',a.hullHealing,b.hullHealing)}${row('Shield healing received / second',a.shieldHealing,b.shieldHealing)}</tbody></table></div><p class="muted">Each run has equal weight. Match difficulty, team conditions, and piloting as closely as possible. Logged healing can include overhealing and is not a survival rating. “Not recorded” means one or more saved runs predate v0.2.0; it does not mean zero healing.</p>`;$('comparison').insertAdjacentHTML('beforeend',contributionTables(r));});
async function startSession(){
 const secret=new URLSearchParams(location.hash.slice(1)).get('session');
 if(secret){history.replaceState(null,'',location.pathname);const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret})});const result=await response.json();if(!response.ok)throw Error(result.error);sessionToken=result.token;sessionStorage.setItem('sto-session',sessionToken);}
 if(!sessionToken)throw Error('Open Shakedown using Start.cmd. This page has no private session.');
 void keepServerConnected();
 await refresh();
}
startSession().catch(e=>notice(e.message,true));

function renderSurvival(player, encounter) {
  const s = player.survival;
  if (!s) return;
  $('survival-metrics').innerHTML =
    metric('HULL DAMAGE TAKEN', compact(s.hull), `${num(s.hull/encounter.duration)} per second`) +
    metric('SHIELD DAMAGE TAKEN', compact(s.shield), `${num(s.shield/encounter.duration)} per second`) +
    metric('EXPLICIT HEALING RECEIVED', compact(s.receivedHull+s.receivedShield), `${compact(s.receivedHull)} hull / ${compact(s.receivedShield)} shield`) +
    metric('LARGEST DAMAGE RECORD', compact(s.largestHit), 'One hull or shield record; not a combined attack');
  $('damage-sources').innerHTML = s.sources.map(r=>`<tr><td>${esc(r.source)}<br><span class="muted">${esc(r.ability)}</span></td><td>${num(r.hull)}</td><td>${num(r.shield)}</td></tr>`).join('') || '<tr><td colspan="3">No incoming damage recorded for this player.</td></tr>';
  $('healing-sources').innerHTML = s.healers.map(r=>`<tr><td>${esc(r.source)}<br><span class="muted">${esc(r.ability)}</span></td><td>${num(r.total)}</td></tr>`).join('') || '<tr><td colspan="2">No healing received recorded for this player.</td></tr>';
  const width = Math.max(1, Math.ceil((encounter.duration+1)/80));
  const bins = Array.from({length:Math.ceil((encounter.duration+1)/width)},()=>0);
  for (const point of s.pressure) bins[Math.min(bins.length-1,Math.floor(point.second/width))] += point.damage;
  const peak = Math.max(1,...bins);
  $('pressure-note').textContent = `Each bar covers ${width}s from encounter start. Peak one-second bucket: ${num(s.peakSecond.damage)} at +${s.peakSecond.second}s. Healing received: ${compact(s.selfHealing)} self / owned sources; ${compact(s.externalHealing)} other sources. Additional outgoing healing with unspecified target: ${compact(s.unspecifiedHealing||0)} (excluded from received totals). Hover or focus a bar for its damage total.`;
  $('pressure-chart').innerHTML = bins.map((damage,i)=>`<div class="pressure-bar" tabindex="0" style="height:${Math.max(2,100*damage/peak)}%" title="+${i*width}–${(i+1)*width}s: ${num(damage)} damage" aria-label="${i*width} to ${(i+1)*width} seconds: ${num(damage)} damage"></div>`).join('');
  $('pressure-chart').setAttribute('aria-label', `Incoming damage over ${encounter.duration.toFixed(1)} seconds. Peak second ${s.peakSecond.second}: ${num(s.peakSecond.damage)} damage.`);
}


function patrolForm(prefix,value={}) {
 const chosen=patrols.find(p=>p.id===value.patrolId);
 const html=`<label>Battle type<select id="${prefix}-battle-type">${battleTypes.map(t=>`<option ${t===(battleTypeOf(value))?'selected':''}>${t}</option>`).join('')}</select></label><label id="${prefix}-tfo-label">Space TFO<select id="${prefix}-tfo"><option value="">Choose TFO</option>${(value.battleType==='TFO'&&value.missionName&&!tfos.includes(value.missionName)?[value.missionName,...tfos]:tfos).map(name=>`<option value="${esc(name)}" ${name===value.missionName?'selected':''}>${esc(name)}</option>`).join('')}</select><small>Mission missing? Choose Other and enter its name.</small></label><label id="${prefix}-name-label">Mission name<input id="${prefix}-name" maxlength="200" value="${esc(value.missionName||'')}" placeholder="Enter the mission or encounter name"><small>Use the same mission name when comparing runs.</small></label><label id="${prefix}-category-label">Patrol category<select id="${prefix}-category">${[...new Set(patrols.map(p=>p.category))].map(c=>`<option ${c===chosen?.category?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label id="${prefix}-mission-label">Space patrol<select id="${prefix}-mission"></select></label><label>Difficulty<select id="${prefix}-difficulty"><option value="">Choose difficulty</option>${difficulties.map(d=>`<option ${d===value.difficulty?'selected':''}>${d}</option>`).join('')}</select></label><label>Party<select id="${prefix}-party"><option ${value.party!=='Group'?'selected':''}>Solo</option><option ${value.party==='Group'?'selected':''}>Group</option></select></label><p id="${prefix}-patrol-help" class="muted">* Enemy groups can vary between runs and affect results. Hard / Normal in a patrol name is separate from difficulty.</p>`;
 return {html,bind(){const changeType=()=>{const patrol=$(prefix+'-battle-type').value==='Patrol';for(const suffix of ['-category-label','-mission-label','-patrol-help'])$(prefix+suffix).hidden=!patrol;$(prefix+'-name-label').hidden=$(prefix+'-battle-type').value!=='Other';$(prefix+'-tfo-label').hidden=$(prefix+'-battle-type').value!=='TFO';};$(prefix+'-battle-type').onchange=changeType;changeType();const update=()=>options(prefix+'-mission',patrols.filter(p=>p.category===$(prefix+'-category').value).map(p=>({value:p.id,label:p.name+(p.random?' *':'')})),'Choose patrol');$(prefix+'-category').onchange=update;update();if(chosen)$(prefix+'-mission').value=chosen.id;}};
}
function patrolValue(prefix){return {battleType:$(prefix+'-battle-type').value,missionName:$(prefix+'-battle-type').value==='TFO'?$(prefix+'-tfo').value:$(prefix+'-name').value,patrolId:$(prefix+'-mission').value,difficulty:$(prefix+'-difficulty').value,party:$(prefix+'-party').value};}
for(const prefix of ['save','compare']){const form=patrolForm(prefix);$(prefix+'-patrol').innerHTML=form.html;form.bind();}
function renderShips(){
 $('ship-cards').innerHTML=state.profiles.map(p=>`<article class="panel"><h2>${esc(p.name)}</h2><p>${state.loadouts.filter(l=>l.profileId===p.id).length} loadouts</p><button data-ship="${esc(p.id)}">Open ship profile →</button> <button data-rename-ship="${esc(p.id)}">Rename ship</button></article>`).join('')||'<p>No ships yet. Add your first ship above.</p>';
 const profile=state.profiles.find(p=>p.id===activeShip);
 $('profile-title').textContent=profile?profile.name+' / Ship profile':'Choose a ship in Shipyard';
 $('profile-content').hidden=!profile;
 options('loadout',state.loadouts.filter(l=>l.profileId===activeShip).map(l=>({value:l.id,label:l.name})));
 $('variation-form').hidden=!$('loadout').options.length;
}
function chooseShip(id){detailId=null;$('analysis-target').textContent='';$('analysis-target').hidden=true;activeShip=id;$('loadout').value='';$('workspace-ship').value=id;renderShips();buildOptions();renderBuilds();$('comparison').innerHTML='<p>Select variations in this ship’s loadout to compare.</p>';}
$('workspace-ship').onchange=()=>{chooseShip($('workspace-ship').value);if(!$('shipyard').hidden||!$('variation-detail').hidden)page('builds');};
$('ship-cards').onclick=e=>{if(e.target.dataset.renameShip){renameShip(e.target.dataset.renameShip);return;}if(e.target.dataset.ship){chooseShip(e.target.dataset.ship);page('builds');}};
$('compare-loadout').onchange=()=>{buildOptions();$('comparison').innerHTML='<p>Choose variations to compare.</p>';};
function contributionTables(result){
 const table=(title,rows)=>`<h2>${title}</h2><div class="table-wrap"><table><thead><tr><th>Recorded source / ability</th><th>Baseline mean damage</th><th>Candidate mean damage</th><th>Baseline DPS</th><th>Candidate DPS</th><th>DPS change</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}<br><small>${esc(r.source)}</small></td><td>${r.baseline?num(r.baseline.damage):'Not recorded'}</td><td>${r.candidate?num(r.candidate.damage):'Not recorded'}</td><td>${r.baseline?num(r.baseline.dps):'Not recorded'}</td><td>${r.candidate?num(r.candidate.dps):'Not recorded'}</td><td>${r.delta===null?'—':(r.delta>=0?'+':'')+num(r.delta)}${r.percent===null?'': ' ('+(r.percent>=0?'+':'')+r.percent.toFixed(1)+'%)'}</td></tr>`).join('')||'<tr><td colspan="6">No recorded contributions to compare.</td></tr>'}</tbody></table></div>`;
 return (result.random?'<p>* Enemy groups vary in this patrol; opposition can affect the comparison.</p>':'')+table('Pets & summons · combined by recorded name',result.petSources)+table('Weapon & ability comparison',result.weapons)+'<p class="muted">DPS is averaged across all matching runs, including zero contribution when a source is absent. Identically named pets are combined. Rank, hangar count, and equipped weapon count are not inferred. Record two Advanced versus one Advanced + one Elite in your variation notes.</p>';
}
function editRunHandler(event){
 if(event.target.dataset.openVariation){detailId=event.target.dataset.openVariation;renderVariation();page('variation-detail');return;}
 const id=event.target.dataset.editRun;if(!id)return;const r=state.runs.find(r=>r.id===id),card=event.target.closest('article');if(card.querySelector('.run-editor'))card.querySelector('.run-editor').remove();
 const editor=document.createElement('div');editor.className='run-editor';const prefix='edit-'+id,form=patrolForm(prefix,r);
 editor.innerHTML=form.html+`<label>Variation<select class="edit-build">${shipBuilds().map(b=>`<option value="${esc(b.id)}" ${b.id===r.buildId?'selected':''}>${esc(buildLabel(b))}</option>`).join('')}</select></label><label class="edit-confirmation"><input type="checkbox" class="confirm"> Complete space battle; equipment unchanged; no ground combat.</label><button class="apply-edit">Save correction</button><button class="cancel-edit">Cancel</button>`;
 card.append(editor);form.bind();editor.scrollIntoView({block:'start',behavior:'smooth'});editor.querySelector('select').focus({preventScroll:true});editor.querySelector('.cancel-edit').onclick=()=>editor.remove();editor.querySelector('.apply-edit').onclick=async()=>{try{await api('run/edit',{id,...patrolValue(prefix),spaceConfirmed:editor.querySelector('.confirm').checked,buildId:editor.querySelector('.edit-build').value});await refresh();notice('Run updated; previous workspace backed up.');}catch(e){notice(e.message,true);}};
}
$('profile-content').addEventListener('click',editRunHandler);
$('variation-content').addEventListener('click',editRunHandler);

function renderBuilds(){
 renderBuildCards();const list=$('build-list'),cards=[...list.children],builds=shipBuilds().filter(b=>$('show-archived').checked||!b.archived);if(!builds.length)return;
 const groups=new Map();builds.forEach((b,i)=>{if(!groups.has(b.loadoutId))groups.set(b.loadoutId,[]);groups.get(b.loadoutId).push(cards[i]);});
 list.replaceChildren();for(const [id,items] of groups){const section=document.createElement('section');section.className='loadout-group';const title=document.createElement('h2');title.textContent=state.loadouts.find(l=>l.id===id)?.name||'Loadout';section.append(title);const compare=document.createElement('button');compare.textContent='Compare variations →';compare.onclick=()=>openLoadoutComparison(id);section.append(compare);const grid=document.createElement('div');grid.className='build-grid';grid.append(...items);section.append(grid);list.append(section);}
}

action('add-ship',async()=>{const profile=await api('profile',{name:$('new-ship-name').value});await refresh();chooseShip(profile.id);$('new-ship-name').value='';page('builds');notice('Ship added. Add its first loadout below.');});
action('add-loadout',async()=>{const build=await api('loadout',{profileId:activeShip,name:$('new-loadout-name').value,notes:$('baseline-notes').value});await refresh();$('loadout').value=build.loadoutId;$('new-loadout-name').value='';$('baseline-notes').value='';notice('Loadout and Baseline created. You can now save runs to that Baseline.');});

$('show-archived').onchange=renderBuilds;
$('back-profile').onclick=()=>page('builds');

function renameShip(id){
 const profile=state.profiles.find(p=>p.id===id);if(!profile)return;
 const dialog=document.createElement('dialog');dialog.innerHTML='<form><h2>Rename ship</h2><label>Reference ship name<input required maxlength="300" name="name"></label><p>Your loadouts, variations, and saved runs stay with this ship.</p><p role="alert"></p><div class="variation-actions"><button type="submit">Save name</button><button type="button">Cancel</button></div></form>';
 document.body.append(dialog);const input=dialog.querySelector('input');input.value=profile.name;dialog.onclose=()=>dialog.remove();dialog.querySelector('[type=button]').onclick=()=>dialog.close();
 dialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=dialog.querySelector('[type=submit]');button.disabled=true;try{await api('profile/rename',{id,name:input.value});await refresh();dialog.close();notice('Ship renamed. All saved runs retained.');}catch(error){dialog.querySelector('[role=alert]').textContent=error.message;button.disabled=false;}};
 dialog.showModal();input.focus();input.select();
}
