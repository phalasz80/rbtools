/* OMSI Tools: vehicle records, preservation-first diagnostics, and historical research plans. */
const nl = '\r\n';
const str = value => String(value ?? '').trim();
export const TOPICS = {
  urbanBus: 'Menetrend szerinti autóbuszok, típusok és állomány',
  cars: 'Személygépkocsi-állomány, típusarányok és évjáratok',
  parking: 'Álló járművek és parkolási környezet',
  taxi: 'Taxik, személyfuvarozás és megkülönböztető jelzések',
  commercial: 'Teherautók, szállítójárművek, szolgáltatói flották',
  emergency: 'Rendőrségi, tűzoltó- és mentőjárművek',
  liveries: 'Festések, rendszámok, reklámok és üzemeltetők',
  geography: 'Helyi sajátosságok: városrész, járat, határ, utcakép',
};
export const GROUPS = [
  ['NormalCars','Személyautók'], ['Trucks','Teherautók'], ['Commercials','Kisteherautók'],
  ['Taxi','Taxik'], ['Police','Hatósági járművek'], ['Ambulance','Mentők'],
  ['Busses','Autóbuszok (nem menetrendi)'], ['Coaches','Távolsági autóbuszok'],
  ['GDRCars','Keleti járművek'], ['Other','Egyéb AI-csoport']
];
const validYear = x => x === '' || (/^\d{4}$/.test(str(x)) && +x >= 1900 && +x <= 2099);
function normalPath(path) { return str(path).replaceAll('/','\\'); }
function within(record,from,to) {
 const a = record.from ? Number(str(record.from).slice(0,4)) : 0;
 const b = record.to ? Number(str(record.to).slice(0,4)) : 9999;
 return a <= to && b >= from;
}
export function validateVehicle(v) {
 const errs=[];
 if(!str(v.name))errs.push('Hiányzik a jármű neve.');
 for(const key of ['name','aiPath','parkPath','group','depot','hof','fleet','reg','repaint','source'])if(/[\r\n\x00-\x08\x0b\x0c\x0e-\x1f]/.test(str(v[key])))errs.push('Nem megengedett vezérlőkarakter: '+key);
 if(!['random','depot','park'].includes(v.mode))errs.push('Válassz felhasználási módot.');
 if(!validYear(v.from||'')||!validYear(v.to||''))errs.push('Az évhatárok négyjegyűek legyenek (1900–2099).');
 if(v.from&&v.to&&+v.from>+v.to)errs.push('Az időszak kezdete későbbi, mint a vége.');
 if(v.mode==='random' || v.mode==='depot'){
  if(!/\.((bus)|(ovh))$/i.test(normalPath(v.aiPath)))errs.push('Az AI-elérési út .bus vagy .ovh kiterjesztésű legyen.');
  if(!/^vehicles\\/i.test(normalPath(v.aiPath)))errs.push('Az AI-elérési út a Vehicles\\ mappából induljon.');
 }
 if(v.mode==='random'){
  if(!/^[A-Za-z0-9_-]{2,40}$/.test(str(v.group)))errs.push('Az AI-csoport neve 2–40 karakter legyen, szóköz nélkül.');
  if(!Number.isInteger(+v.weight)||+v.weight<1||+v.weight>1000)errs.push('Az AI-súly 1–1000 közötti egész szám legyen.');
 }
 if(v.mode==='depot'){
  if(!str(v.depot)||!str(v.hof))errs.push('Menetrendi járműhöz a csoport és a HOF neve is szükséges.');
  if(!str(v.fleet))errs.push('Menetrendi járműhöz állományszám szükséges.');
  if(/[\t\r\n]/.test(str(v.fleet)+str(v.reg)+str(v.repaint)))errs.push('Tabulátor és sortörés nem lehet az állományszám és festés mezőkben.');
 }
 if(str(v.parkPath)){
  if(!/^vehicles\\/i.test(normalPath(v.parkPath))||!normalPath(v.parkPath).toLowerCase().endsWith('.sco'))errs.push('A parkoló jármű útvonala Vehicles\\...\\*.sco legyen.');
  if(!Number.isInteger(+v.parkWeight)||+v.parkWeight<1||+v.parkWeight>20)errs.push('A parkolási ismétlés 1–20 közötti egész szám legyen.');
 }
 if(v.mode==='park'&&!str(v.parkPath))errs.push('Parklisthez .sco állományt kell megadni.');
 if(v.source && !/^https?:\/\//i.test(v.source))errs.push('A forrás URL-je http(s):// kezdetű legyen.');
 return errs;
}
export function parseAilist(text) {
 const rows=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/),groups=[],warnings=[];
 let section=null, depot=null;
 for(let i=0;i<rows.length;i++){
  let v=rows[i].trim();
  if(!v||v.startsWith('//')||v.startsWith(';'))continue;
  const lower=v.toLowerCase();
  if(lower==='[aigroup_2]'){
   const name=rows[++i]?.trim();if(!name)warnings.push(`Hiányzik a csoportnév (${i+1}. sor).`);
   section={kind:'random',name:name||'',entries:[],start:i+1};groups.push(section);continue;
  }
  if(lower==='[aigroup_depot]'){
   const name=rows[++i]?.trim()||'',hof=rows[++i]?.trim()||'';
   if(!name||!hof)warnings.push(`Hiányos [aigroup_depot] blokk (${i-1}. sor).`);
   depot={name,hof};groups.push({kind:'depot',name,hof,entries:[]});section=null;continue;
  }
  if(lower==='[aigroup_depot_typgroup_2]'){
   const path=rows[++i]?.trim()||'';
   if(!depot)warnings.push(`Menetrendi típus előzetes [aigroup_depot] nélkül (${i}. sor).`);
   if(!/\.((bus)|(ovh))$/i.test(path))warnings.push(`Nem megfelelő menetrendi járműútvonal (${i+1}. sor).`);
   section={kind:'depot-type',name:depot?.name||'',hof:depot?.hof||'',path,entries:[],start:i};groups.push(section);continue;
  }
  if(lower==='[end]'){section=null;continue;}
  if(/^\[.*\]$/.test(v)){
   if(section)warnings.push(`Lezáratlan csoport a(z) ${i+1}. sor előtt.`);
   section=null;
   if(!['[ailist]','[aigroup]','[aigroup_depot_typgroup]'].includes(lower))warnings.push(`Ismeretlen vagy nem feldolgozott szakasz: ${v} (${i+1}. sor).`);
   continue;
  }
  if(!section)continue;
  if(section.kind==='random'){
   const m=/^(.*?\.(?:bus|ovh))(?:\s+([+-]?(?:\d+\.?\d*|\.\d+)))?\s*$/i.exec(v);
   if(!m){warnings.push(`Gyanús AI-sor: ${i+1}. sor (${v.slice(0,65)}).`);continue;}
   if(m[2]!==undefined&&!(+m[2]>0))warnings.push(`Nem pozitív súly (${i+1}. sor).`);
   section.entries.push({path:normalPath(m[1]),weight:m[2]===undefined?null:Number(m[2])});
  } else {
   const parts=rows[i].split('\t');
   if(!parts[0]?.trim())warnings.push(`Hiányzó állományszám (${i+1}. sor).`);
   section.entries.push({fleet:parts[0]?.trim()||'',reg:parts[1]?.trim()||'',repaint:parts[2]?.trim()||''});
  }
 }
 if(section)warnings.push('A fájl vége előtt hiányzik az [end] lezárás.');
 const random=groups.filter(g=>g.kind==='random');
 for(const g of random){const seen=new Set();for(const e of g.entries){const key=e.path.toLowerCase();if(seen.has(key))warnings.push(`${g.name}: ismételt járműhivatkozás (${e.path}); ne töröld automatikusan, lehet szándékos.`);seen.add(key);}}
 if(groups.length===0)warnings.push('Nem találtam OMSI 2 [aigroup_2] vagy menetrendi csoportot. Régi OMSI 1 formátum is lehet.');
 return {groups,warnings,counts:{random:random.reduce((a,b)=>a+b.entries.length,0),scheduled:groups.filter(g=>g.kind==='depot-type').reduce((a,b)=>a+b.entries.length,0)}};
}
export function parseParklist(text){
 const paths=[],warnings=[];
 for(const [i,line] of String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).entries()){
  const value=line.trim();if(!value||value.startsWith('//')||value.startsWith(';')||value.startsWith('['))continue;
  if(!/\.sco$/i.test(value))warnings.push(`A(z) ${i+1}. sor nem .sco objektum: ${value.slice(0,70)}`);
  else paths.push(normalPath(value));
 }
 const counts=new Map();for(const p of paths)counts.set(p.toLowerCase(),(counts.get(p.toLowerCase())||0)+1);
 const repeats=[...counts].filter(x=>x[1]>1);
 if(repeats.length)warnings.push(`${repeats.length} ismétlődő .sco hivatkozás: ezek befolyásolhatják a megjelenési arányokat, ezért nem törlöm őket.`);
 return {paths,warnings,repeats};
}
const groupOrder = ['NormalCars','Trucks','Commercials','Taxi','Police','Ambulance','Busses','Coaches','GDRCars','Other'];
export function buildTrafficFiles(records,from,to,options={}){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<1900||to>2099||from>to)throw new Error('Érvénytelen időszak (1900–2099).');
 const selected=records.filter(r=>within(r,from,to)),errors=[],warnings=[];
 for(let i=0;i<selected.length;i++)for(const e of validateVehicle(selected[i]))errors.push(`${selected[i].name||`#${i+1}`}: ${e}`);
 if(errors.length)throw new Error(errors.join('\n'));
 const evidentiary=selected.filter(r=>r.status==='verified');
 const toUse=options.onlyVerified?evidentiary:selected;
 if(options.onlyVerified&&toUse.length!==selected.length)warnings.push(`${selected.length-toUse.length} nem ellenőrzött rekord kihagyva.`);
 if(!toUse.length)warnings.push('Nincs a vizsgált időszakra kiválasztott, felhasználható jármű.');
 const unscheduled=new Map(),depots=new Map(),parks=[];
 for(const r of toUse){
  if(r.from&&+r.from>from||r.to&&+r.to<to)warnings.push(`${r.name}: nem fedi le a teljes ${from}–${to} időszakot. Az AI-lista a generált időszakon belül nem kapcsol ki automatikusan.`);
  if(r.mode==='random'){
   if(!unscheduled.has(r.group))unscheduled.set(r.group,[]);
   unscheduled.get(r.group).push({path:normalPath(r.aiPath),weight:Number(r.weight)});
  }
  if(r.mode==='depot'){
   const key=r.depot+'\u0000'+r.hof;
   if(!depots.has(key))depots.set(key,new Map());
   const types=depots.get(key),path=normalPath(r.aiPath);
   if(!types.has(path))types.set(path,[]);
   // OMSI2 date fields need day-level verified dates; leaving fields blank preserves normal operation.
   types.get(path).push(r);
  }
  if(r.parkPath)for(let i=0;i<Number(r.parkWeight||1);i++)parks.push(normalPath(r.parkPath));
 }
 let ai=[];
 for(const name of [...unscheduled.keys()].sort((a,b)=>groupOrder.indexOf(a)-groupOrder.indexOf(b)||a.localeCompare(b))){
  ai.push('[aigroup_2]',name);
  for(const e of unscheduled.get(name))ai.push(e.path+'\t'+e.weight);
  ai.push('[end]','');
 }
 for(const [k,types] of depots){const [depot,hof]=k.split('\u0000');ai.push('[aigroup_depot]',depot,hof,'');
  for(const [path,vehicles] of types){ai.push('[aigroup_depot_typgroup_2]',path);
   for(const v of vehicles){
    const fields=[str(v.fleet),str(v.reg),str(v.repaint)];
    if(v.validFrom||v.validTo){
     const validFull=x=>!x||/^\d{8}$/.test(x);
     if(!validFull(v.validFrom)||!validFull(v.validTo))throw new Error(v.name+': az OMSI időhatár YYYYMMDD alakú legyen.');
     fields.push(str(v.validFrom),str(v.validTo));
    }
    ai.push(fields.join('\t'));
   }ai.push('[end]','');
  }
 }
 if(!ai.length)warnings.push('Az ailists.cfg üres; csak ellenőrzéshez használd.');
 if(!parks.length)warnings.push('Nincs parkoló jármű megadva.');
 return {ailist:ai.join(nl).trimEnd()+nl,parklist:parks.join(nl)+(parks.length?nl:''),selected:toUse,warnings};
}
function safeSearch(q){return 'https://www.google.com/search?q='+encodeURIComponent(q);}
export function researchPlan(project){
 const {place='',area='',operator='',route='',start=1980,end=1990,topics=[],where='',what='',notes=''}=project;
 const loc=[str(place),str(area),str(operator)].filter(Boolean).join(' '),period=`${start} ${end}`;
 const rows=[];
 const labels={urbanBus:['Bus Fuhrpark Bestand Wagennummern','autóbusz állomány járműtípus viszonylat'],cars:['Straßenbild PKW Zulassungsstatistik','autópark statisztika közúti személyautók'],parking:['parkende Autos Straßenansicht','parkoló autók korabeli fényképek'],taxi:['Taxi Fahrzeuge Kennzeichen','taxi állomány és rendszám'],commercial:['Lieferwagen LKW Fuhrpark','kisteherautó tehergépkocsi állomány'],emergency:['Polizei Feuerwehr Rettungswagen Fahrzeuge','rendőrség mentő tűzoltó járműpark'],liveries:['Bus Fahrzeug Werbung Lackierung Kennzeichen','jármű festés reklám rendszám'],geography:['Straßenbild historische Fotos','korabeli utcakép képeslap térkép']};
 for(const k of topics){if(!labels[k])continue;for(const term of labels[k]){const query=[loc,route,period,term].filter(Boolean).join(' ');rows.push({topic:TOPICS[k],query,url:safeSearch(query)});}}
 const intro=[`# OMSI történeti járműkutatás: ${str(place)||'helyszín nélkül'}`, '',`Időszak: ${start}–${end}`,`Területi fókusz: ${str(area)||'nincs megadva'}`,`Szolgáltató: ${str(operator)||'nincs megadva'}`,`Járat/helyszín: ${str(route)||'nincs megadva'}`,'', '## Kutatási feladat','',`Hol keressünk: ${str(where)||'nincs megadva'}`,`Mit ellenőrizzünk: ${str(what)||'nincs megadva'}`,`Megjegyzés: ${str(notes)||'nincs megadva'}`, '', '## Témakörök',...topics.map(k=>`- ${TOPICS[k]||k}`),'', '## Célzott internetes keresések',''];
 for(const r of rows)intro.push(`- ${r.topic}: [${r.query}](${r.url})`);
 intro.push('', '## Forráskritika', '- Egy link vagy fénykép önmagában nem bizonyítja a jármű típusarányát.', '- Külön ellenőrizd az üzemeltetés éveit, helyét, festését és a pontos járműszámot.', '- Az eredeti referencialistából származó OMSI elérési utaknál is ellenőrizd, hogy az adott mod telepítve van-e.', '- A „feltételezett” és „igazolt” járművek elkülönülnek; automatikus történeti állományadat nincs.', '');
 return {markdown:intro.join('\n'),searches:rows};
}
export function buildReport(project,records,result){
 const out=[`# OMSI összeállítás – ${project.place||'ismeretlen terület'}`,`Időszak: ${project.start}–${project.end}`,`Kiegészítő helyszín: ${project.area||'–'}`,`Üzemeltető: ${project.operator||'–'}`,`Járat: ${project.route||'–'}`,'',`Kiválasztott járművek: ${result.selected.length}`,''];
 for(const r of result.selected){out.push(`- ${r.name} | ${r.mode} | ${r.from||'?'}–${r.to||'?'} | ${r.status==='verified'?'Igazolt':'Feltételezett'} | forrás: ${r.source||'nincs megadva'}`);}
 out.push('','FIGYELMEZTETÉSEK:');for(const w of result.warnings)out.push('- '+w);
 out.push('', 'A fájlok csak a megadott járműútvonalakat használják, a meglévő OMSI fájlokat nem írják felül.', 'A parklist_p.txt nem támogat időszakfüggő feltételeket: külön időszakokra külön verzió szükséges.', 'Ha a pályán külön ai-csoportokra hivatkozó útvonalak vannak, a csoportnevek módosítása miatt a map editorban is szükség lehet beállításra.', '');
 return out.join('\r\n');
}
