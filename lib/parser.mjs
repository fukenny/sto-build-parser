import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const PARSER_VERSION = 2;
async function* boundedLines(input) {
 let pending='';
 for await(const chunk of input){pending+=chunk;let i;while((i=pending.indexOf('\n'))>=0){if(i>16384)throw Error('Log record exceeds 16 KB.');yield pending.slice(0,i).replace(/\r$/,'');pending=pending.slice(i+1);}if(pending.length>16384)throw Error('Log record exceeds 16 KB.');}
 if(pending)yield pending.replace(/\r$/,'');
}
function limit(size,max,label){if(size>max)throw Error(`Import exceeds ${label} limit. Select a smaller combat selection.`);}
export function parseLine(line) {
  if(line.length>16384)throw Error('Log record exceeds 16 KB.');
  const match = /^(\d{2}):(\d{2}):(\d{2}):(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)::(.*)$/.exec(line);
  if (!match) return null;
  const fields = match[7].split(',');
  if (fields.length !== 12) return null;
  const [owner, ownerId, source, sourceId, target, targetId, ability, abilityId, type, flags, m1, m2] = fields.map(x => x.trim());
  if (!m1 || !m2 || !Number.isFinite(+m1) || !Number.isFinite(+m2) || Math.abs(+m1)>1e12 || Math.abs(+m2)>1e12) return null;
  const [, y, mo, d, h, mi, s] = match;
  const time = Date.UTC(2000 + +y, +mo - 1, +d, +h, +mi, Math.floor(+s), Math.round((+s % 1) * 1000));
  const date=new Date(time);
  if(+s>=60 || +h>23 || +mi>59 || date.getUTCFullYear()!==2000+ +y || date.getUTCMonth()!==+mo-1 || date.getUTCDate()!==+d) return null;
  const heal = (type === 'HitPoints' && +m1 < 0) || (type === 'Shield' && +m1 < 0 && +m2 >= 0);
  return {time, stamp: `${2000 + +y}-${mo}-${d} ${h}:${mi}:${s}`, owner, ownerId, source, sourceId, target, targetId, ability, abilityId, type, flags, amount: Math.abs(+m1), heal};
}

function newPlayer(id, name) {
  return {id, name, hull: 0, shield: 0, direct: 0, pets: 0, incoming: 0, healing: 0, abilities: new Map(), timeline: new Map(), survival: {hull:0, shield:0, receivedHull:0, receivedShield:0, selfHealing:0, externalHealing:0, largestHit:0, sources:new Map(), healers:new Map(), pressure:new Map()}};
}
function finishSurvival(s) {
  const pressure = [...s.pressure].map(([second,damage])=>({second,damage})).sort((a,b)=>a.second-b.second);
  return {...s, sources:[...s.sources.values()].sort((a,b)=>b.total-a.total), healers:[...s.healers.values()].sort((a,b)=>b.total-a.total), pressure, peakSecond:pressure.reduce((peak,p)=>p.damage>peak.damage?p:peak,{second:0,damage:0})};
}
export function createParser(gapSeconds = 60) {
  const encounters = [];
  let current, hash, valid = 0, skipped = 0, outOfOrder = 0;
  function finish() {
    if (!current) return;
    const duration = Math.max(1, (current.end - current.start) / 1000);
    const players = [...current.players.values()].map(p => ({...p, total: p.hull + p.shield, dps: (p.hull + p.shield) / duration, abilities: [...p.abilities.values()].sort((a,b) => b.total - a.total), timeline: [...p.timeline].map(([second, damage]) => ({second, damage}))})).sort((a,b) => b.total - a.total);
    for (const p of players) p.survival = finishSurvival(p.survival);
    if (players.some(p => p.total > 0 || p.incoming > 0 || p.survival.receivedHull + p.survival.receivedShield > 0)) encounters.push({id: hash.digest('hex'), start: current.start, stamp: current.stamp, end: current.end, duration, events: current.events, targets: [...current.targets].slice(0,8), players});
    current = null;
  }
  return {
    add(line) {
      if (!line.trim()) return;
      const e = parseLine(line);
      if (!e) { skipped++; return; }
      valid++;
      limit(valid,500000,'record count');limit(encounters.length,5000,'encounter count');
      if (current && e.time < current.end) outOfOrder++;
      if (current && e.time - current.end > gapSeconds * 1000) finish();
      if (!current) { current = {start: e.time, end: e.time, stamp: e.stamp, events: 0, players: new Map(), targets: new Set()}; hash = createHash('sha256'); }
      hash.update(line.trim() + '\n');
      current.end = Math.max(current.end, e.time);
      current.events++;
      const player = (id, name) => { if (!current.players.has(id)) {limit(current.players.size+1,100,'player count');current.players.set(id, newPlayer(id, name));} return current.players.get(id); };
      if (e.targetId.startsWith('P[')) {
        const recipient = player(e.targetId, e.target);
        const s = recipient.survival;
        const key = JSON.stringify([e.ownerId,e.sourceId,e.ability]);
        const source = e.source || e.owner || 'Unknown source';
        if (e.heal) {
          s[e.type === 'Shield' ? 'receivedShield' : 'receivedHull'] += e.amount;
          s[e.ownerId === e.targetId ? 'selfHealing' : 'externalHealing'] += e.amount;
          if (!s.healers.has(key)) s.healers.set(key,{source,ability:e.ability,total:0});
          s.healers.get(key).total += e.amount;
          limit(s.healers.size,2000,'healing source count');
        } else {
          recipient.incoming += e.amount;
          s[e.type === 'Shield' ? 'shield' : 'hull'] += e.amount;
          s.largestHit = Math.max(s.largestHit,e.amount);
          if (!s.sources.has(key)) s.sources.set(key,{source,ability:e.ability,hull:0,shield:0,total:0});
          const row=s.sources.get(key);row.total+=e.amount;row[e.type==='Shield'?'shield':'hull']+=e.amount;
          const second=Math.max(0,Math.floor((e.time-current.start)/1000));
          s.pressure.set(second,(s.pressure.get(second)||0)+e.amount);
          limit(s.sources.size,2000,'damage source count');limit(s.pressure.size,50000,'timeline count');
        }
      }
      if (!e.ownerId.startsWith('P[')) return;
      const p = player(e.ownerId, e.owner);
      if (e.heal) {
        p.healing += e.amount;
        if (!e.target || e.targetId === '*') p.survival.unspecifiedHealing = (p.survival.unspecifiedHealing || 0) + e.amount;
        return;
      }
      // Self-damage and owner-attributed feedback events are not outgoing offense.
      if (e.ownerId === e.targetId || e.ability === '*') return;
      if (e.target && e.targetId.startsWith('C[')) current.targets.add(e.target);
      const pet = !!e.source && e.sourceId !== e.ownerId;
      p[e.type === 'Shield' ? 'shield' : 'hull'] += e.amount;
      p[pet ? 'pets' : 'direct'] += e.amount;
      const key = JSON.stringify([pet ? e.source : '', e.ability]);
      if (!p.abilities.has(key)) p.abilities.set(key, {name: e.ability, source: pet ? e.source : 'Ship / player', pet, total: 0, hull: 0, shield: 0, events: 0, hullHits: 0, criticalHits: 0});
      const a = p.abilities.get(key);
      limit(p.abilities.size,2000,'ability count');
      a.total += e.amount; a[e.type === 'Shield' ? 'shield' : 'hull'] += e.amount; a.events++;
      if (e.type !== 'Shield' && !e.flags.includes('Miss')) { a.hullHits++; if (e.flags.includes('Critical')) a.criticalHits++; }
      const second = Math.max(0, Math.floor((e.time - current.start) / 1000));
      p.timeline.set(second, (p.timeline.get(second) || 0) + e.amount);
    },
    finish() { finish(); return {parserVersion: PARSER_VERSION, gapSeconds, valid, skipped, outOfOrder, encounters}; }
  };
}
export async function parseFile(file, gapSeconds = 60) {
  const info = await stat(file);
  if (info.size > 512 * 1024 * 1024) throw new Error('This prototype supports logs up to 512 MB. Select a rotated log.');
  const parser = createParser(gapSeconds);
  const wholeFile = createParser(Infinity);
  if (info.size) {
    // Snapshot the size so a live file cannot grow indefinitely during import.
    const input = createReadStream(file, {end: info.size - 1, encoding: 'utf8'});
    const lines = boundedLines(input);
    for await (const line of lines) { parser.add(line); wholeFile.add(line); }
  }
  const result = parser.finish();
  const fullLog = wholeFile.finish().encounters[0];
  if (fullLog) {
    fullLog.id = 'full:' + fullLog.id;
    fullLog.scope = 'full-log';
    fullLog.encounterIds = result.encounters.map(e => e.id);
  }
  return {...result, fullLog, bytes: info.size};
}

// Rotated files are merged by timestamp. Exact overlaps use the greatest
// occurrence count in any one file, preserving repeated hits within that file.
export async function parseFiles(files, gapSeconds = 60) {
  if (files.length === 1) return parseFile(files[0], gapSeconds);
  if (!files.length || files.length > 12) throw new Error('Select between 1 and 12 logs.');
  const sizes = await Promise.all(files.map(file => stat(file)));
  const bytes = sizes.reduce((sum,s) => sum+s.size,0);
  if (bytes > 128*1024*1024) throw new Error('Combined imports support up to 128 MB. Select fewer adjacent logs.');
  const records = new Map(), fragments = [];
  let skipped=0, outOfOrder=0, duplicates=0;
  for (let i=0; i<files.length; i++) {
    const original=createParser(gapSeconds), counts=new Map();
    if (sizes[i].size) {
      const input=createReadStream(files[i],{end:sizes[i].size-1,encoding:'utf8'});
      for await (const raw of boundedLines(input)) {
        original.add(raw);
        const line=raw.trim(), event=parseLine(line);
        if (!event) continue;
        counts.set(line,(counts.get(line)||0)+1);
        if (!records.has(line)) records.set(line,{line,time:event.time,count:0});
        limit(records.size,250000,'combined unique record count');
      }
    }
    const result=original.finish();
    skipped+=result.skipped; outOfOrder+=result.outOfOrder;
    fragments.push(...result.encounters);
    for (const [line,count] of counts) {
      const record=records.get(line);
      duplicates+=Math.min(record.count,count);
      record.count=Math.max(record.count,count);
    }
  }
  const parser=createParser(gapSeconds), whole=createParser(Infinity);
  for (const record of [...records.values()].sort((a,b)=>a.time-b.time || a.line.localeCompare(b.line))) {
    for (let n=0;n<record.count;n++) { parser.add(record.line); whole.add(record.line); }
  }
  const result=parser.finish();
  for (const e of result.encounters) e.encounterIds=[...new Set([e.id,...fragments.filter(f=>f.start<=e.end && f.end>=e.start).map(f=>f.id)])];
  const fullLog=whole.finish().encounters[0];
  if(fullLog) {fullLog.id='full:'+fullLog.id;fullLog.scope='full-log';fullLog.encounterIds=[...new Set(result.encounters.flatMap(e=>e.encounterIds))];}
  return {...result,skipped,outOfOrder,duplicates,fullLog,bytes};
}
