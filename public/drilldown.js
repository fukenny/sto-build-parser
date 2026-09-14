const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value):'—';
const rate=(n,d)=>Number.isFinite(n)&&d>0?(100*n/d).toFixed(1)+'%':'—';
let serial=0;
function expandable(name,cells,details) {
 const id='evidence-detail-'+serial++;
 return `<tr class="damage-summary"><td><button class="damage-toggle" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">▸</span> ${esc(name)}</button></td>${cells.map(cell=>`<td>${cell}</td>`).join('')}</tr><tr id="${id}" class="damage-detail" hidden><td colspan="${cells.length+1}"><div class="damage-inset">${details}</div></td></tr>`;
}
export function sourceRows(rows,healing=false) {
 const groups=new Map();
 for(const row of rows){if(!groups.has(row.source))groups.set(row.source,[]);groups.get(row.source).push(row);}
 return [...groups].sort((a,b)=>b[1].reduce((s,r)=>s+r.total,0)-a[1].reduce((s,r)=>s+r.total,0)).map(([source,items])=>{
  const merged=new Map();for(const r of items){const a=merged.get(r.ability)||{total:0,hull:0,shield:0};a.total+=r.total;a.hull+=r.hull||0;a.shield+=r.shield||0;merged.set(r.ability,a);}
  const details=`<h3>${healing?'Healing abilities':'Incoming abilities'} · ${esc(source)}</h3><table><thead><tr><th>Ability</th>${healing?'<th>Healing received</th>':'<th>Hull damage</th><th>Shield damage</th>'}</tr></thead><tbody>${[...merged].sort((a,b)=>b[1].total-a[1].total).map(([name,r])=>`<tr><th scope="row">${esc(name)}</th>${healing?`<td>${num(r.total)}</td>`:`<td>${num(r.hull)}</td><td>${num(r.shield)}</td>`}</tr>`).join('')}</tbody></table><p class="muted">Identical recorded source and ability names are combined.${healing?' Logged healing may include overhealing.':''}</p>`;
  return expandable(source,[num(items.reduce((sum,r)=>sum+r.total,0))],details);
 }).join('')||`<tr><td colspan="2">No ${healing?'healing received':'incoming damage'} recorded for this player.</td></tr>`;
}
export function comparisonRows(rows,baselineCount,candidateCount) {
 return rows.map(r=>expandable(r.name,[esc(r.source),num(r.baseline?.dps),num(r.candidate?.dps),r.delta===null?'—':`${r.delta>=0?'+':''}${num(r.delta)}${r.percent===null?'':` (${r.percent>=0?'+':''}${r.percent.toFixed(1)}%)`}`],`<h3>${esc(r.name)} · supporting evidence</h3><table><thead><tr><th>Metric</th><th>Baseline</th><th>Candidate</th></tr></thead><tbody><tr><th scope="row">Mean damage</th><td>${num(r.baseline?.damage)}</td><td>${num(r.candidate?.damage)}</td></tr><tr><th scope="row">Matching runs</th><td>${num(baselineCount)}</td><td>${num(candidateCount)}</td></tr></tbody></table><p class="muted">Averages include every matching run, including zero when a source is absent. — means data is unavailable. Differences do not establish a cause.</p>`)).join('')||'<tr><td colspan="5">No recorded contributions to compare.</td></tr>';
}
export function damageRows(abilities,total,duration) {
 return abilities.map((a,index)=>{
  const id='ability-detail-'+index;
  const targets=Array.isArray(a.targets)?a.targets:null;
  return `<tr class="damage-summary"><td><button class="damage-toggle" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">▸</span> ${esc(a.name)}</button></td><td>${esc(a.source)}</td><td>${num(a.total)}</td><td>${rate(a.total,total)}</td><td>${num(a.total/Math.max(1,duration))}</td><td>${num(a.events)}</td></tr>
  <tr id="${id}" class="damage-detail" hidden><td colspan="6"><div class="damage-inset"><h3>${esc(a.name)} · ${esc(a.source)}</h3><dl class="damage-stats"><div><dt>Hit rate</dt><dd>${rate(a.hullHits,a.hullHits+a.misses)}</dd></div><div><dt>Hits</dt><dd>${num(a.hullHits)}</dd></div><div><dt>Misses</dt><dd>${num(a.misses)}</dd></div><div><dt>Critical hits</dt><dd>${num(a.criticalHits)}</dd></div><div><dt>Flank hits</dt><dd>${num(a.flankHits)}</dd></div><div><dt>Flank rate</dt><dd>${rate(a.flankHits,a.hullHits)}</dd></div><div><dt>Crit rate</dt><dd>${rate(a.criticalHits,a.hullHits)}</dd></div><div><dt>Crit damage</dt><dd>${num(a.criticalDamage)}</dd></div><div><dt>Flank damage</dt><dd>${num(a.flankDamage)}</dd></div><div><dt>Largest non-shield hit</dt><dd>${num(a.maxHit)}</dd></div></dl>
  ${targets?`<table aria-label="${esc(a.name)} target breakdown"><thead><tr><th scope="col">Recorded target</th><th scope="col">Damage</th><th scope="col">Hull</th><th scope="col">Shield</th><th scope="col">Hits</th><th scope="col">Misses</th><th scope="col">Crit hits</th><th scope="col">Flank hits</th></tr></thead><tbody>${targets.map(t=>`<tr><th scope="row">${esc(t.name)}</th><td>${num(t.total)}</td><td>${num(t.hull)}</td><td>${num(t.shield)}</td><td>${num(t.hullHits)}</td><td>${num(t.misses)}</td><td>${num(t.criticalHits)}</td><td>${num(t.flankHits)}</td></tr>`).join('')||'<tr><td colspan="8">No target records.</td></tr>'}</tbody></table>`:'<p>Target details were not recorded in this summary. Analyze the original log again.</p>'}
  <p class="muted">Identical target names are combined. Hit counts and rates use non-shield records; damage includes hull + shield. Critical and flank damage can overlap.</p></div></td></tr>`;
 }).join('');
}
export function bindDamageRows(container) {
 container.addEventListener('click',event=>{
  const button=event.target.closest('.damage-toggle');
  if(!button||!container.contains(button))return;
  const row=container.querySelector('#'+button.getAttribute('aria-controls'));
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));
  button.querySelector('span').textContent=open?'▾':'▸';
  row.hidden=!open;
 });
}
