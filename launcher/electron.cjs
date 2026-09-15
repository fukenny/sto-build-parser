const {app, BrowserWindow, dialog, session, shell}=require('electron');
const {fork,execFile}=require('node:child_process');
const path=require('node:path');
let window, backend, stopping=false, exited=false, shutdownTimer, startupTimer;
const root=app.getAppPath();
const home=app.isPackaged?path.dirname(process.execPath):root;
app.setPath('userData',path.join(home,'desktop-profile'));
if(!app.requestSingleInstanceLock()) app.quit();
else {
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
 app.on('before-quit',e=>{if(backend&&!exited){e.preventDefault();stop();}});
 app.whenReady().then(start).catch(fail);
}
function stop(){
 if(stopping)return;stopping=true;clearTimeout(startupTimer);
 if(!backend||exited||!backend.pid){exited=true;app.quit();return;}
 shutdownTimer=setTimeout(()=>{
  // Bound a hung backend and its parser workers; normal shutdown drains writes first.
  if(process.platform==='win32')execFile('taskkill.exe',['/PID',String(backend.pid),'/T','/F'],{windowsHide:true,timeout:5000},()=>{exited=true;app.quit();});
  else {backend.kill('SIGKILL');exited=true;app.quit();}
 },12000);
 if(backend.connected)backend.send({type:'desktop-shutdown'},error=>{if(error)backend.kill();});
 else backend.kill();
}
function fail(error){dialog.showErrorBox('STO Shakedown',String(error.message||error));stop();}
async function start(){
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.setPermissionCheckHandler(()=>false);
 backend=fork(path.join(root,'server.mjs'),[],{execPath:path.join(root,'runtime','node.exe'),cwd:root,windowsHide:true,silent:true,env:{...process.env,PORT:'0',STO_DESKTOP:'1',STO_DATA_DIR:path.join(home,'data')}});
 let selectingFolder=false;
 backend.on('message',async message=>{
  if(message?.type==='desktop-open-data'&&typeof message.id==='string'){
   let error=true;try{error=!!await shell.openPath(path.join(home,'data'));}catch{}
   if(backend.connected)backend.send({type:'desktop-folder-result',id:message.id,folder:'',error},()=>{});
   return;
  }
  if(message?.type!=='desktop-pick-folder'||typeof message.id!=='string')return;
  const reply=value=>{if(backend.connected)backend.send({type:'desktop-folder-result',id:message.id,...value},()=>{});};
  if(selectingFolder||stopping||!window||window.isDestroyed()){reply({error:true});return;}
  selectingFolder=true;
  try {
   const result=await dialog.showOpenDialog(window,{
    title:'Select a combat log to use its folder',buttonLabel:'Use this log folder',
    defaultPath:typeof message.defaultPath==='string'&&message.defaultPath?message.defaultPath:app.getPath('documents'),
    properties:['openFile','dontAddToRecent'],filters:[{name:'Combat logs',extensions:['log']}]
   });
   reply({folder:result.canceled||!result.filePaths[0]?'':path.dirname(result.filePaths[0])});
  }catch{reply({error:true});}finally{selectingFolder=false;}
 });
 let output='', errors='';
 startupTimer=setTimeout(()=>fail(new Error('The local server did not start. Check that this ZIP was fully extracted into a writable folder.')),30000);
 backend.stderr.on('data',b=>{if(errors.length<8000)errors+=b;});
 backend.on('error',error=>{clearTimeout(startupTimer);if(!backend.pid)exited=true;fail(error);});
 backend.on('exit',code=>{clearTimeout(startupTimer);clearTimeout(shutdownTimer);exited=true;if(code&&!stopping)dialog.showErrorBox('STO Shakedown stopped',errors||'The local server stopped unexpectedly.');app.quit();});
 backend.stdout.on('data',async b=>{
  output+=b;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\/#session=[a-f0-9]+/);if(!match||window)return;
  clearTimeout(startupTimer);const url=match[0],origin=new URL(url).origin;output='';
  window=new BrowserWindow({width:1500,height:1000,minWidth:800,minHeight:600,backgroundColor:'#000000',title:'STO Shakedown',autoHideMenuBar:true,show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  window.removeMenu();
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate',(event,target)=>{if(new URL(target).origin!==origin)event.preventDefault();});
  window.webContents.on('will-attach-webview',event=>event.preventDefault());
  window.webContents.on('render-process-gone',()=>stop());
  window.on('close',event=>{if(!exited){event.preventDefault();window.hide();stop();}});
  try{await window.loadURL(url);window.show();}catch(e){fail(e);}
 });
}
