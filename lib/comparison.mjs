export function summarize(runs) {
  const values = runs.map(r => r.player.dps);
  const mean = values.reduce((a,b) => a+b, 0) / (values.length || 1);
  const sd = values.length > 1 ? Math.sqrt(values.reduce((s,x) => s + (x-mean)**2, 0)/(values.length-1)) : 0;
  const avg = key => runs.reduce((s,r) => s + r.player[key]/r.duration, 0)/(runs.length || 1);
  return {count: values.length, mean, sd, min: values.length ? Math.min(...values) : 0, max: values.length ? Math.max(...values) : 0, direct: avg('direct'), pets: avg('pets'), incoming: avg('incoming'), healing: avg('healing')};
}
export function compareRuns(baseline, candidate) {
  const a = summarize(baseline), b = summarize(candidate);
  const delta = a.mean > 0 ? (b.mean/a.mean-1)*100 : null;
  let message = 'Save runs for both versions to compare them.';
  if (a.count && b.count) message = a.count < 3 || b.count < 3
    ? 'Early observation only. Collect at least three comparable runs per version before interpreting the difference.'
    : 'Observed averages only. Run ranges show variability; team composition, piloting, and encounter conditions may explain the difference. This is not a causal build verdict.';
  return {baseline: a, candidate: b, delta, message};
}
