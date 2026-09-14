const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value):'—';
const rate=(n,d)=>Number.isFinite(n)&&d>0?(100*n/d).toFixed(1)+'%':'—';
export function damageRows(abilities,total,duration) {
 return abilities.map((a,index)=>{
  const id='ability-detail-'+index;
  const targets=Array.isArray(a.targets)?a.targets:null;
  return `<tr class="damage-summary"><td><button class="damage-toggle" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">▸</span> ${esc(a.name)}</button></td><td>${esc(a.source)}</td><td>${num(a.total)}</td><td>${rate(a.total,total)}</td><td>${num(a.total/Math.max(1,duration))}</td><td>${num(a.events)}</td></tr>
  <tr id="${id}" class="damage-detail" hidden><td colspan="6"><div class="damage-inset"><h3>${esc(a.name)} · ${esc(a.source)}</h3><dl class="damage-stats"><div><dt>Hit rate</dt><dd>${rate(a.hullHits,a.hullHits+a.misses)}</dd></div><div><dt>Crit rate</dt><dd>${rate(a.criticalHits,a.hullHits)}</dd></div><div><dt>Crit damage</dt><dd>${num(a.criticalDamage)}</dd></div><div><dt>Flank damage</dt><dd>${num(a.flankDamage)}</dd></div><div><dt>Largest non-shield hit</dt><dd>${num(a.maxHit)}</dd></div></dl>
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
