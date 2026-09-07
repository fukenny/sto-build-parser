import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';

export const PARSER_VERSION = 1;
export function parseLine(line) {
  const match = /^(\d{2}):(\d{2}):(\d{2}):(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)::(.*)$/.exec(line);
  if (!match) return null;
  const fields = match[7].split(',');
  if (fields.length !== 12) return null;
  const [owner, ownerId, source, sourceId, target, targetId, ability, abilityId, type, flags, m1, m2] = fields.map(x => x.trim());
  if (!m1 || !m2 || !Number.isFinite(+m1) || !Number.isFinite(+m2)) return null;
  const [, y, mo, d, h, mi, s] = match;
  const time = Date.UTC(2000 + +y, +mo - 1, +d, +h, +mi, Math.floor(+s), Math.round((+s % 1) * 1000));
  const heal = (type === 'HitPoints' && +m1 < 0) || (type === 'Shield' && +m1 < 0 && +m2 >= 0);
  return {time, stamp: `${2000 + +y}-${mo}-${d} ${h}:${mi}:${s}`, owner, ownerId, source, sourceId, target, targetId, ability, abilityId, type, flags, amount: Math.abs(+m1), heal};
}

function newPlayer(id, name) {
  return {id, name, hull: 0, shield: 0, direct: 0, pets: 0, incoming: 0, healing: 0, abilities: new Map(), timeline: new Map()};
}
export function createParser(gapSeconds = 60) {
  const encounters = [];
  let current, hash, valid = 0, skipped = 0, outOfOrder = 0;
  function finish() {
    if (!current) return;
    const duration = Math.max(1, (current.end - current.start) / 1000);
    const players = [...current.players.values()].map(p => ({...p, total: p.hull + p.shield, dps: (p.hull + p.shield) / duration, abilities: [...p.abilities.values()].sort((a,b) => b.total - a.total), timeline: [...p.timeline].map(([second, damage]) => ({second, damage}))})).sort((a,b) => b.total - a.total);
    if (players.some(p => p.total > 0)) encounters.push({id: hash.digest('hex'), start: current.start, stamp: current.stamp, end: current.end, duration, events: current.events, targets: [...current.targets].slice(0,8), players});
    current = null;
  }
  return {
    add(line) {
      if (!line.trim()) return;
      const e = parseLine(line);
      if (!e) { skipped++; return; }
      valid++;
      if (current && e.time < current.end) outOfOrder++;
      if (current && e.time - current.end > gapSeconds * 1000) finish();
      if (!current) { current = {start: e.time, end: e.time, stamp: e.stamp, events: 0, players: new Map(), targets: new Set()}; hash = createHash('sha256'); }
      hash.update(line.trim() + '\n');
      current.end = Math.max(current.end, e.time);
      current.events++;
      const player = (id, name) => { if (!current.players.has(id)) current.players.set(id, newPlayer(id, name)); return current.players.get(id); };
      if (e.targetId.startsWith('P[')) {
        const recipient = player(e.targetId, e.target);
        if (!e.heal) recipient.incoming += e.amount;
      }
      if (!e.ownerId.startsWith('P[')) return;
      const p = player(e.ownerId, e.owner);
      if (e.heal) { p.healing += e.amount; return; }
      // Self-damage and owner-attributed feedback events are not outgoing offense.
      if (e.ownerId === e.targetId || e.ability === '*') return;
      if (e.target && e.targetId.startsWith('C[')) current.targets.add(e.target);
      const pet = !!e.source && e.sourceId !== e.ownerId;
      p[e.type === 'Shield' ? 'shield' : 'hull'] += e.amount;
      p[pet ? 'pets' : 'direct'] += e.amount;
      const key = JSON.stringify([pet ? e.source : '', e.ability]);
      if (!p.abilities.has(key)) p.abilities.set(key, {name: e.ability, source: pet ? e.source : 'Ship / player', pet, total: 0, hull: 0, shield: 0, events: 0, hullHits: 0, criticalHits: 0});
      const a = p.abilities.get(key);
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
    const lines = createInterface({input, crlfDelay: Infinity});
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
