// Read-only tours: opening a guide never creates or changes saved data.
export function installShipyardGuides() {
 const dialog=document.createElement('dialog');
 dialog.className='page-guide';
 dialog.setAttribute('aria-labelledby','guide-title');
 dialog.setAttribute('aria-describedby','guide-copy');
 dialog.innerHTML='<div class="guide-spotlight" aria-hidden="true"></div><section class="guide-card"><p id="guide-progress" class="eyebrow"></p><h2 id="guide-title"></h2><p id="guide-copy"></p><div class="guide-actions"><button type="button" data-guide="close">Close</button><button type="button" data-guide="back">Back</button><button type="button" data-guide="next">Next</button></div></section>';
 document.body.append(dialog);
 const card=dialog.querySelector('.guide-card'),spot=dialog.querySelector('.guide-spotlight');
 let steps=[],index=0,opener,target;
 const step=(selector,title,copy)=>({selector,title,copy});
 function position(){
  if(!dialog.open||!target)return;
  const r=target.getBoundingClientRect(),pad=6;
  Object.assign(spot.style,{left:Math.max(0,r.left-pad)+'px',top:Math.max(0,r.top-pad)+'px',width:Math.min(innerWidth,r.width+pad*2)+'px',height:r.height+pad*2+'px'});
  const h=card.offsetHeight,w=card.offsetWidth;
  const below=r.bottom+16,above=r.top-h-16;
  const top=below+h<innerHeight-12?below:above>=12?above:Math.max(12,innerHeight-h-12);
  Object.assign(card.style,{top:Math.max(12,Math.min(top,innerHeight-h-12))+'px',left:Math.max(12,Math.min(r.left,innerWidth-w-12))+'px'});
 }
 function show(){
  const s=steps[index];target=document.querySelector(s.selector);
  if(!target){dialog.close();return;}
  target.scrollIntoView({block:'center',behavior:'instant'});
  dialog.querySelector('#guide-title').textContent=s.title;
  dialog.querySelector('#guide-copy').textContent=s.copy;
  dialog.querySelector('#guide-progress').textContent=`SHIPYARD GUIDE · ${index+1} / ${steps.length}`;
  dialog.querySelector('[data-guide=back]').disabled=index===0;
  dialog.querySelector('[data-guide=next]').textContent=index===steps.length-1?'Finish':'Next';
  position();
 }
 dialog.querySelector('[data-guide=close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-guide=back]').onclick=()=>{if(index>0){index--;show();}};
 dialog.querySelector('[data-guide=next]').onclick=()=>{if(index===steps.length-1)dialog.close();else{index++;show();}};
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 window.addEventListener('resize',position);
 document.addEventListener('scroll',position,true);
 for(const id of ['shipyard','builds']){
  const button=document.createElement('button');button.type='button';button.className='page-guide-launch';button.textContent='Tour Shipyard';
  document.querySelector(`#${id} .page-title`).append(button);
  button.onclick=()=>{
   opener=button;index=0;
   if(id==='shipyard'){
    steps=[step('#ship-name-help','Your ship is a reference profile','Shakedown does not connect to STO or import your equipment. STO writes combat logs to your computer; you choose those files separately when analyzing a run.'),step('#new-ship-name','Name your ship','Use a name you recognize. It does not have to match STO exactly. This name organizes your loadouts, variations, and saved runs.'),step('#add-ship','Create the profile','After closing this guide, enter a name and choose Add ship. The guide itself does not create anything.')];
    if(document.querySelector('#ship-cards [data-ship]'))steps.push(step('#ship-cards .ship-pill-list','Choose an existing ship','Select a ship pill to show its loadouts and saved-run counts in the panel beside it.'),step('#ship-cards [data-ship]','Open its ship profile','Open this profile to add loadouts and variations. The Tour Shipyard button there explains the next steps.'));
    else steps.push(step('#ship-cards','What comes next','Your ships will appear here. Once you add one, open its profile and use Tour Shipyard there to learn about loadouts and Baseline variations.'));
   }else{
    steps=[step('#show-loadout-form','Start with a loadout','A loadout is a build concept, such as Beam Broadside. Add a loadout creates its first Baseline variation. Close the guide to use the form; nothing is saved during this tour.'),step('.profile-create-fields','Record your starting setup','Give the loadout a name and describe the equipment in its Baseline notes. These are your reference notes; Shakedown does not detect your equipped items.'),step('#show-variation-form','Change equipment? Add a variation','Choose Add a variation, select its loadout, and name the change. Keep additional flights with unchanged equipment in the existing variation.'),step('#build-list','Save evidence to the matching setup','After creating a loadout, open a variation with Open setup & runs, then analyze a new run. Choose logs from that ship and equipment setup, check the character and combat, and save the run to that variation.')];
   }
   dialog.showModal();show();dialog.querySelector('[data-guide=next]').focus();
  };
 }
}
