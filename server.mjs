import http from 'node:http';
import {readFile, writeFile, mkdir, rename, readdir, stat, realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes, randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {parseFiles} from './lib/parser.mjs';
import {compareRuns} from './lib/comparison.mjs';
import {conditions,conditionKey,patrols} from './public/patrols.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const {version} = JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const data = process.env.STO_DATA_DIR || path.join(root, 'data');
await mkdir(data, {recursive:true});
const statePath = path.join(data, 'state.json');
let state;
try { state = JSON.parse(await readFile(statePath, 'utf8')); }
catch(e) { if(e.code !== 'ENOENT') throw e; state = {folder:'', builds:[], runs:[]}; }
if(!state.profiles) {
  if(state.builds.length || state.runs.length) await writeFile(path.join(data,`pre-v040-${Date.now()}.json`),JSON.stringify(state,null,2));
  state.profiles=[]; state.loadouts=[];
  for(const build of state.builds) {
    let profile=state.profiles.find(p=>p.name.toLowerCase()===build.ship.toLowerCase());
    if(!profile) {profile={id:randomUUID(),name:build.ship};state.profiles.push(profile);}
    let loadout=state.loadouts.find(l=>l.profileId===profile.id);
    if(!loadout) {loadout={id:randomUUID(),profileId:profile.id,name:build.name};state.loadouts.push(loadout);build.originalName=build.name;build.name='Baseline';}
    build.loadoutId=loadout.id;
  }
  state.schemaVersion=2;
  await writeFile(statePath,JSON.stringify(state,null,2));
}
const token = randomBytes(32).toString('hex');
let saving = Promise.resolve(), analysis = null, parsing = false, picking = false;
function save() { const snapshot = JSON.stringify(state, null, 2); saving = saving.then(async () => { await writeFile(statePath+'.tmp', snapshot); await rename(statePath+'.tmp',statePath); }); return saving; }
function demand(condition, message) { if(!condition) throw new Error(message); }
const text = (value, name, max=300) => { demand(typeof value === 'string' && value.trim() && value.length <= max, `Enter ${name} (up to ${max} characters).`); return value.trim(); };
async function logs(folder=state.folder) {
  if(!folder) return [];
  const names = await readdir(folder, {withFileTypes:true});
  return (await Promise.all(names.filter(x=>x.isFile() && /^combatlog.*\.log$/i.test(x.name)).map(async x=>{const s=await stat(path.join(folder,x.name)); return {name:x.name,size:s.size,modified:s.mtimeMs};}))).sort((a,b)=>b.modified-a.modified);
}
async function body(req) { let raw=''; for await (const chunk of req) {raw+=chunk; demand(raw.length <= 100000,'Request too large.');} return JSON.parse(raw||'{}'); }
const server = http.createServer(async (req,res)=>{
  const json = (obj,code=200)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(obj));};
  try {
    const host = `127.0.0.1:${server.address().port}`;
    demand(req.headers.host === host, 'Invalid local host.');
    const url = new URL(req.url, `http://${host}`);
    if(url.pathname.startsWith('/api/')) {
      demand(req.headers['x-sto-token'] === token, 'Open the app locally to access logs.');
      if(req.headers.origin) demand(req.headers.origin === `http://${host}`, 'Cross-origin access is not allowed.');
      if(req.method === 'GET' && url.pathname === '/api/state') {
        try { return json({...state,logs:await logs()}); }
        catch { return json({...state,logs:[],folderError:'The saved log folder is unavailable. Choose a folder in Log folder settings.'}); }
      }
      demand(req.method === 'POST', 'Unsupported request.');
      const b = await body(req);
      if(url.pathname === '/api/folder') {
        const folder = await realpath(text(b.folder,'a folder path',2048));
        demand((await stat(folder)).isDirectory(),'Select a folder.');
        const found = await logs(folder);
        demand(found.length > 0,'No combatlog*.log files found in that folder. Enable combat logging in STO or choose another folder.');
        state.folder=folder; analysis=null; await save(); return json({folder,logs:found});
      }
      if(url.pathname === '/api/browse') {
        demand(process.platform === 'win32','Paste your folder path instead.');
        demand(!picking,'A folder picker is already open.'); picking=true;
        try {
          const script = "Add-Type -AssemblyName System.Windows.Forms; $picker = New-Object System.Windows.Forms.FolderBrowserDialog; $picker.Description = 'Select the STO GameClient combat log folder'; $picker.ShowNewFolderButton = $false; if ($picker.ShowDialog() -eq 'OK') { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Write($picker.SelectedPath) }; $picker.Dispose()";
          const result=await promisify(execFile)('powershell.exe',['-NoProfile','-STA','-Command',script],{windowsHide:true,timeout:120000});
          return json({folder:result.stdout.trim()});
        } finally {picking=false;}
      }
      if(url.pathname === '/api/analyze') {
        demand(!parsing,'Another log is being read. Please wait.');
        const names=b.names || [b.name], listed=await logs();
        demand(Array.isArray(names) && names.length>0 && names.length<=12 && new Set(names).size===names.length && names.every(name=>typeof name==='string' && listed.some(l=>l.name===name)),'Choose 1–12 listed combat logs.');
        parsing=true;
        try {
          const folder=state.folder;
          const files=await Promise.all(names.map(name=>realpath(path.join(folder,name))));
          demand(files.every(file=>path.dirname(file).toLowerCase()===folder.toLowerCase()),'Log must be in the selected folder.');
          const result=await parseFiles(files);
          demand(state.folder===folder,'Folder changed during import. Import again.');
          analysis={...result,file:names.join(' + '),files:names}; return json(analysis);
        } finally {parsing=false;}
      }
      if(url.pathname === '/api/build') {
        let profile=state.profiles.find(p=>p.name.toLowerCase()===text(b.ship,'a ship name').toLowerCase());
        const loadoutName=text(b.loadout || 'Default loadout','a loadout name');
        const variationName=text(b.name,'a variation name');
        if(!profile) {profile={id:randomUUID(),name:b.ship.trim()};state.profiles.push(profile);}
        let loadout=state.loadouts.find(l=>l.profileId===profile.id && l.name.toLowerCase()===loadoutName.toLowerCase());
        if(!loadout) {loadout={id:randomUUID(),profileId:profile.id,name:loadoutName};state.loadouts.push(loadout);}
        const build={id:randomUUID(), name:text(b.name,'a version name'), ship:text(b.ship,'a ship name'), notes: typeof b.notes==='string' ? b.notes.slice(0,10000) : '', createdAt: new Date().toISOString()};
        build.name=variationName;build.loadoutId=loadout.id;
        state.builds.push(build); await save(); return json(build);
      }
      if(url.pathname === '/api/run') {
        const encounter=analysis?.fullLog?.id===b.encounterId ? analysis.fullLog : analysis?.encounters.find(e=>e.id===b.encounterId), player=encounter?.players.find(p=>p.id===b.playerId);
        demand(player && (player.total>0 || player.incoming>0 || player.survival?.receivedHull + player.survival?.receivedShield > 0),'Select an encounter and a player with recorded combat activity.');
        const build=state.builds.find(x=>x.id===b.buildId); demand(build,'Select a build version.');
        const metadata=conditions(b),context=metadata.context;
        demand(b.spaceConfirmed===true,'Confirm this selection is one complete space patrol with unchanged equipment. Ground combat is unsupported.');
        const encounterIds=encounter.encounterIds || [encounter.id];
        demand(!state.runs.some(r=>r.player.id===player.id && (r.encounterIds || [r.encounterId]).some(id=>encounterIds.includes(id))),'This selection overlaps evidence already saved for this player. The same combat cannot count as an independent run twice.');
        const run={id:randomUUID(),buildId:build.id,encounterId:encounter.id,context,player,stamp:encounter.stamp,duration:encounter.duration,file:analysis.file,parserVersion:analysis.parserVersion,savedAt:new Date().toISOString()};
        run.scope=encounter.scope || 'encounter'; run.encounterIds=encounterIds;
        Object.assign(run,metadata,{spaceConfirmed:true});
        state.runs.push(run); await save(); return json(run);
      }
      if(url.pathname === '/api/run/edit') {
        const run=state.runs.find(r=>r.id===b.id); demand(run,'Choose a saved run.');
        const metadata=conditions(b),context=metadata.context;
        demand(b.spaceConfirmed===true,'Confirm this saved run covers one complete space patrol with unchanged equipment.');
        const build=state.builds.find(x=>x.id===b.buildId); demand(build,'Choose a variation.');
        await writeFile(path.join(data,`backup-${Date.now()}-${randomUUID()}.json`),JSON.stringify(state,null,2));
        Object.assign(run,metadata,{spaceConfirmed:true});run.context=context; run.buildId=build.id; await save(); return json(run);
      }
      if(url.pathname === '/api/compare') {
        demand(b.baseline!==b.candidate,'Choose two different versions.');
        const a=state.builds.find(x=>x.id===b.baseline), c=state.builds.find(x=>x.id===b.candidate);
        demand(a&&c,'Choose two build versions.'); demand(a.ship.toLowerCase()===c.ship.toLowerCase(),'Compare versions of the same ship.');
        demand(a.loadoutId===c.loadoutId,'Choose variations of the same loadout.');
        const metadata=conditions(b);
        const eligible=state.runs.filter(r=>conditionKey(r)===conditionKey(metadata) && r.spaceConfirmed && r.player.id===b.playerId);
        const selected=eligible.filter(r=>r.buildId===a.id || r.buildId===c.id);
        demand(new Set(selected.map(r=>r.scope || 'encounter')).size<=1,'These versions mix entire-log and individual encounter evidence. Use a separate encounter label for full-log sessions so like-for-like runs can be compared.');
        const result=compareRuns(eligible.filter(r=>r.buildId===a.id),eligible.filter(r=>r.buildId===c.id));
        result.random=patrols.find(p=>p.id===metadata.patrolId).random;
        if(!result.baseline.count || !result.candidate.count) {
          const labels=build=>[...new Set(state.runs.filter(r=>r.buildId===build.id && r.player.id===b.playerId).map(r=>r.context))].join('; ') || 'no saved runs for this player';
          result.message=`No matching confirmed runs for one side under “${metadata.context}”. Baseline labels: ${labels(a)}. Candidate labels: ${labels(c)}. Open the ship page and edit older runs to confirm their patrol, difficulty, and Solo / Group.`;
        }
        return json(result);
      }
      throw new Error('Unknown action.');
    }
    demand(req.method === 'GET','Unsupported request.');
    if (url.pathname === '/START-HERE.txt') {
      res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="START-HERE.txt"','X-Content-Type-Options':'nosniff'});
      return res.end(await readFile(path.join(root,'START-HERE.txt')));
    }
    const assets={'/':'index.html','/app.js':'app.js','/patrols.js':'patrols.js','/style.css':'style.css'};
    if(!assets[url.pathname]) {res.writeHead(404);return res.end('Not found');}
    let content=await readFile(path.join(root,'public',assets[url.pathname]),'utf8');
    if(url.pathname==='/') content=content.replace('__TOKEN__',token).replaceAll('__VERSION__',version);
    res.writeHead(200,{'Content-Type':url.pathname.endsWith('.js')?'text/javascript':url.pathname.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"});res.end(content);
  } catch(e) { json({error:e.message},400); }
});
server.listen(Number(process.env.PORT || 4317),'127.0.0.1',()=>{const url=`http://127.0.0.1:${server.address().port}`;console.log(`STO Shakedown: ${url}`);if(process.argv.includes('--open') && process.platform==='win32') execFile('cmd.exe',['/c','start','',url],{windowsHide:true});});
