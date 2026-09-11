const views=document.querySelectorAll('.view');
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 views.forEach(view=>view.hidden=view.id!==button.dataset.view);
 document.querySelectorAll('nav button').forEach(item=>{item.classList.toggle('active',item.dataset.view===button.dataset.view);if(item.dataset.view===button.dataset.view)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');});
}));
const data={baseline:[['01','03:42','12,341','22,753','35,094'],['02','03:38','12,950','23,295','36,245'],['03','03:46','12,811','23,669','36,480']],valkyrie:[['01','03:40','13,005','23,240','36,245']]};
function select(id){document.querySelector('#runs').innerHTML=data[id].map(row=>`<tr><td>${row[0]}</td><td>Strike at Seedea</td>${row.slice(1).map(value=>`<td>${value}</td>`).join('')}</tr>`).join('');document.querySelector('#variation').textContent=id==='baseline'?'BASELINE':'ELITE VALKYRIE TEST';document.querySelector('#equipment').textContent=id==='baseline'?'Two Advanced Valkyrie hangars. Equipment unchanged across these runs.':'One Elite Valkyrie hangar + one Advanced Valkyrie hangar.';document.querySelector('#count').textContent=id==='baseline'?'03':'01';document.querySelector('#mean').textContent=id==='baseline'?'35,940':'36,245';for(const key of Object.keys(data))document.getElementById(key).classList.toggle('selected',key===id);}
for(const id of Object.keys(data))document.getElementById(id).onclick=()=>select(id);select('baseline');
document.querySelector('#exit').onclick=()=>{views.forEach(view=>view.hidden=true);document.querySelector('#status').textContent='Preview finished. You can close this tab. No application server was started.';};
