export function summarize(runs) {
  const values = runs.map(r => r.player.dps);
  const mean = values.reduce((a,b) => a+b, 0) / (values.length || 1);
  const sd = values.length > 1 ? Math.sqrt(values.reduce((s,x) => s + (x-mean)**2, 0)/(values.length-1)) : 0;
  const avg = key => runs.reduce((s,r) => s + r.player[key]/r.duration, 0)/(runs.length || 1);
  const survivalCount=runs.filter(r=>r.player.survival).length;
  const survivalRate=key=>survivalCount===runs.length && runs.length ? runs.reduce((s,r)=>s+r.player.survival[key]/r.duration,0)/runs.length : null;
  return {count: values.length, mean, sd, min: values.length ? Math.min(...values) : 0, max: values.length ? Math.max(...values) : 0, direct: avg('direct'), pets: avg('pets'), incoming: avg('incoming'), healing: avg('healing'), survivalCount, hullTaken:survivalRate('hull'), shieldTaken:survivalRate('shield'), hullHealing:survivalRate('receivedHull'), shieldHealing:survivalRate('receivedShield')};
}
export function compareRuns(baseline, candidate) {
  const a = summarize(baseline), b = summarize(candidate);
  const delta = a.count && b.count && a.mean > 0 ? (b.mean/a.mean-1)*100 : null;
  let message = 'Save runs for both versions to compare them.';
  if (a.count && b.count) message = a.count < 3 || b.count < 3
    ? 'Early observation only. Collect at least three comparable runs per version before interpreting the difference.'
    : 'Observed averages only. Run ranges show variability; team composition, piloting, and encounter conditions may explain the difference. This is not a causal build verdict.';
  return {baseline: a, candidate: b, delta, message, weapons: contributions(baseline,candidate,false), petSources: contributions(baseline,candidate,true)};
}

export function contributions(baseline,candidate,byPet) {
 const keys=new Map();
 const summarizeSide=runs=>{
  const totals=new Map();
  for(const run of runs) for(const ability of run.player.abilities||[]) {
   if(byPet && !ability.pet) continue;
   const key=JSON.stringify(byPet?[ability.source]:[!!ability.pet,ability.source,ability.name]);
   keys.set(key,{name:byPet?ability.source:ability.name,source:ability.source,pet:!!ability.pet});
   const row=totals.get(key)||{damage:0,dps:0};
   row.damage+=ability.total/runs.length;row.dps+=ability.total/run.duration/runs.length;totals.set(key,row);
  }
  return {totals,known:runs.length>0 && runs.every(r=>Array.isArray(r.player.abilities))};
 };
 const a=summarizeSide(baseline),b=summarizeSide(candidate);
 return [...keys].map(([key,label])=>{
  const x=a.known?(a.totals.get(key)||{damage:0,dps:0}):null,y=b.known?(b.totals.get(key)||{damage:0,dps:0}):null;
  return {...label,baseline:x,candidate:y,delta:x&&y?y.dps-x.dps:null,percent:x&&y&&x.dps>0?(y.dps/x.dps-1)*100:null};
 }).sort((x,y)=>Math.max(y.baseline?.dps||0,y.candidate?.dps||0)-Math.max(x.baseline?.dps||0,x.candidate?.dps||0));
}
