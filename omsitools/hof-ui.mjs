import {convertHofBytes,readHofZip} from './hof-fokgyem.mjs';
import {makeZip} from './engine.mjs';
const $=id=>document.getElementById(id);
const input=$('hofInput'),run=$('hofRun'),zip=$('hofZip'),report=$('hofResults'),status=$('hofStatus');
let files=[];
function download(name,bytes,type='application/octet-stream'){
 const url=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function reset(){files=[];zip.disabled=true;report.replaceChildren();status.textContent='Válaszd ki a HOF-fájlokat vagy ZIP-csomagokat.';}
input.addEventListener('change',reset);$('hofRepair').addEventListener('change',reset);
run.addEventListener('click',async()=>{
 reset();run.disabled=true;input.disabled=true;$('hofRepair').disabled=true;
 let ok=0,failed=0,warn=0,used=new Set(),log=['FOK-GYEM 1.1 HOF konverter',''];
 const add=(name,info,bytes)=>{const row=document.createElement('div');row.className='filebox';const title=document.createElement('strong');title.textContent=name;const p=document.createElement('p');p.className='hint';p.textContent=info;row.append(title,p);if(bytes){const b=document.createElement('button');b.type='button';b.textContent='HOF letöltése';b.addEventListener('click',()=>download(name,bytes));row.append(b);}report.append(row);log.push(name+'\n'+info+'\n');};
 try{
  if(!input.files.length)throw Error('Nincs kiválasztott fájl.');
  if(input.files.length>2000||[...input.files].reduce((s,f)=>s+f.size,0)>100*1024*1024)throw Error('Legfeljebb 2000 fájl és 100 MB bemenet.');
  let total=0,n=0;
  for(const f of input.files){
   let entries;
   try{entries=/\.zip$/i.test(f.name)?await readHofZip(await f.arrayBuffer()):/\.hof$/i.test(f.name)?[{name:f.name,bytes:new Uint8Array(await f.arrayBuffer())}]:[];if(!entries.length)throw Error('Nem található HOF-fájl.');}
   catch(e){failed++;add(f.name,'HIBA: '+e.message);continue;}
   for(const entry of entries){
    if(++n>2000||(total+=entry.bytes.length)>200*1024*1024)throw Error('A feldolgozási méretkorlát elérve.');
    try{
     if(entry.bytes.length>20*1024*1024)throw Error('Egy HOF legfeljebb 20 MB lehet.');
     const r=convertHofBytes(entry.name,entry.bytes,{repair:$('hofRepair').checked});
     let name=r.filename,k=2;while(used.has(name.toLowerCase()))name=r.filename.replace(/\.hof$/i,'_'+k+++'.hof');
     used.add(name.toLowerCase());files.push({path:name,bytes:r.bytes});ok++;warn+=r.warnings.length;
     add(name,r.name+' | '+r.encoding+' | '+r.termini+' célállomás, '+r.routes+' útvonal, '+r.added+' pótolt megálló. '+(r.warnings.join(' | ')||'Nincs észlelt szerkezeti figyelmeztetés.'),r.bytes);
    }catch(e){failed++;add(entry.name,'HIBA: '+e.message);}
    if(n%10===0){status.textContent=ok+' sikeres, '+failed+' hibás; feldolgozás…';await new Promise(r=>setTimeout(r,0));}
   }
  }
 }catch(e){failed++;add('Feldolgozás','HIBA: '+e.message);}
 finally{run.disabled=false;input.disabled=false;$('hofRepair').disabled=false;status.textContent=ok+' sikeres, '+failed+' hibás, '+warn+' figyelmeztetés. A játékon belüli működés külön ellenőrzendő.';if(ok){files.push({path:'FOKGYEM_ELLENORZES.txt',bytes:new TextEncoder().encode(log.join('\r\n'))});zip.disabled=false;}}
});
zip.addEventListener('click',()=>{try{download('HOF_FOKGYEM_1.1.zip',makeZip(files),'application/zip');}catch(e){status.textContent=e.message;}});
