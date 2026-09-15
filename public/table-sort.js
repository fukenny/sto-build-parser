export function sortValue(text) {
 const value=text.trim().replace(/[▸▾]/g,'').trim();
 if(!value||/^(—|Not recorded|No matching runs)$/i.test(value))return {missing:true};
 const match=/^([+-]?[\d,]+(?:\.\d+)?)([KMB])?%?(?:\s*\([^)]*\))?$/i.exec(value);
 return match?{number:Number(match[1].replaceAll(',',''))*({K:1e3,M:1e6,B:1e9}[match[2]?.toUpperCase()]||1)}:{text:value};
}
export function enableTableSorting(root) {
 const prepare=()=>root.querySelectorAll('table').forEach(table=>{
  const headers=table.tHead?.rows[0]?.cells;if(!headers)return;
  for(const [index,th] of [...headers].entries()){
   if(th.querySelector('.table-sort')||/^(Select|Actions)$/i.test(th.textContent.trim()))continue;
   const button=document.createElement('button');button.className='table-sort';button.textContent=th.textContent;button.type='button';button.title='Sort by '+th.textContent;
   th.replaceChildren(button);th.setAttribute('aria-sort','none');
   button.onclick=()=>{
    const body=table.tBodies[0];if(!body)return;
    const groups=[];
    for(const row of [...body.rows]){
     if(row.classList.contains('damage-detail')&&groups.length){groups.at(-1).rows.push(row);continue;}
     if(row.cells.length!==headers.length)continue;
     groups.push({rows:[row],value:sortValue(row.cells[index].textContent),index:groups.length});
    }
    const descending=th.getAttribute('aria-sort')==='none'?groups.some(g=>g.value.number!==undefined):th.getAttribute('aria-sort')==='ascending';
    for(const h of headers)h.setAttribute('aria-sort','none');th.setAttribute('aria-sort',descending?'descending':'ascending');
    groups.sort((a,b)=>{
     if(a.value.missing||b.value.missing)return Number(!!a.value.missing)-Number(!!b.value.missing)||a.index-b.index;
     const result=a.value.number!==undefined&&b.value.number!==undefined?a.value.number-b.value.number:String(a.value.text??a.value.number).localeCompare(String(b.value.text??b.value.number),undefined,{numeric:true,sensitivity:'base'});
     return (descending?-result:result)||a.index-b.index;
    });
    for(const group of groups)body.append(...group.rows);
   };
  }
 });
 prepare();const observer=new MutationObserver(prepare);observer.observe(root,{childList:true,subtree:true});return observer;
}
