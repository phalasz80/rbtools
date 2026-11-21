import {PLACES,validatePlace,parseOmSi,normalizeApi,parseOverrides,overridesFor,mergeEvents,holidayText,timezoneText,omsiEncode,makeZip} from './engine.mjs';
import {TOPICS,GROUPS,validateVehicle,parseAilist,parseParklist,buildTrafficFiles,researchPlan,buildReport} from './traffic.mjs';
const $=id=>document.getElementById(id);
const val=id=>$(id).value.trim();
const button=id=>$(id);
const encoder=new TextEncoder();
let vehicles=[],editing=null,lastResearch=null,lastTraffic=null,lastCalendar=null;
function el(tag,attrs={},text='') { const x=document.createElement(tag);for(const [key,value] of Object.entries(attrs)){
 if(key==='class')x.className=value;else if(key==='href')x.href=value;else if(key==='target')x.target=value;else if(key==='rel')x.rel=value;else if(key==='type')x.type=value;else x.setAttribute(key,String(value));
 }if(text!==null)x.textContent=text;return x; }
function status(id,message,kind='') {const node=$(id);node.className='alert'+(kind?' '+kind:'');node.textContent=message;}
function global(message,kind='good'){const x=$('globalStatus');x.className='alert '+kind;x.textContent=message;x.scrollIntoView({behavior:'smooth',block:'nearest'});}
function err(e,id='globalStatus'){status(id,e?.message||String(e),'error');if(id==='globalStatus')$('globalStatus').classList.remove('hidden');}
function serialYears(){const a=Number(val('periodStart')),b=Number(val('periodEnd'));if(!Number.isInteger(a)||!Number.isInteger(b)||a<1900||b>2099||a>b)throw new Error('A történeti időszak legyen 1900 és 2099 között, helyes évhatárokkal.');return [a,b];}
function project(){const [start,end]=serialYears();const topics=[...document.querySelectorAll('[data-topic]:checked')].map(x=>x.dataset.topic);return {place:val('place'),country:val('country').toUpperCase(),region:val('region').toUpperCase(),start,end,area:val('area'),operator:val('operator'),route:val('route'),where:val('where'),what:val('what'),notes:val('notes'),topics};}
function updateProject(p){const fields={place:'place',country:'country',region:'region',start:'periodStart',end:'periodEnd',area:'area',operator:'operator',route:'route',where:'where',what:'what',notes:'notes'};for(const [k,id] of Object.entries(fields))if(p[k]!==undefined)$(id).value=p[k];for(const node of document.querySelectorAll('[data-topic]'))node.checked=(p.topics||[]).includes(node.dataset.topic);}
function fileDownload(filename,content,type='application/octet-stream'){const blob=content instanceof Uint8Array?new Blob([content],{type}):new Blob([content],{type});const url=URL.createObjectURL(blob);const a=el('a',{href:url});a.download=filename;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function slug(s){return String(s||'helyszin').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'helyszin';}
function cp(){return val('country').toUpperCase()==='HU'?'1250':'1252';}
function tryEncode(text){return omsiEncode(text,cp());}
function zipIt(root,list){const files=list.map(([path,text,isUtf8])=>({path:root+'/'+path,bytes:isUtf8?encoder.encode(text):tryEncode(text)}));return makeZip(files);}
async function fileText(file,codepage='1252') {const buf=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(buf);}catch{return new TextDecoder('windows-'+codepage).decode(buf);}}
function mounted(name){return button(name).files?.[0]||null;}
function tabSwitch(key){for(const tab of document.querySelectorAll('.tab')){const yes=tab.dataset.tab===key;tab.classList.toggle('active',yes);tab.setAttribute('aria-selected',yes?'true':'false');}for(const section of document.querySelectorAll('.section'))section.classList.toggle('active',section.id===key);window.scrollTo({top:80,behavior:'smooth'});}
for(const tab of document.querySelectorAll('[data-tab]'))tab.addEventListener('click',()=>tabSwitch(tab.dataset.tab));
for(const place of PLACES){$('placePreset').append(el('option',{value:place.id},place.name));$('calPlace').append(el('option',{value:place.id},place.name));}
$('placePreset').addEventListener('change',()=>{const pl=PLACES.find(p=>p.id===val('placePreset'));if(!pl)return;$('place').value=pl.name;$('country').value=pl.country;$('region').value=pl.subdivision;$('calPlace').value=pl.id;updateCalPlace();});
for(const [name,label] of GROUPS)$('vGroup').append(el('option',{value:name},label+' ('+name+')'));
for(const [key,label] of Object.entries(TOPICS)){const lab=el('label',{class:'check'});const input=el('input',{type:'checkbox'});input.dataset.topic=key;input.checked=['urbanBus','cars','parking','liveries'].includes(key);lab.append(input,document.createTextNode(label));$('topicChecks').append(lab);}
function doResearch(){const p=project();if(!p.place)throw new Error('Add meg a vizsgálandó települést.');const plan=researchPlan(p);lastResearch=plan;$('researchLinks').replaceChildren();for(const r of plan.searches){const wrap=el('div',{class:'source-row'}),body=el('div');body.append(el('strong',{},r.topic));const a=el('a',{href:r.url,target:'_blank',rel:'noopener noreferrer'},r.query);body.append(a);wrap.append(body);$('researchLinks').append(wrap);}status('researchStatus',`${p.place}, ${p.start}–${p.end}: ${plan.searches.length} célzott keresés. Ezek kutatási javaslatok, nem ellenőrzött forrásállítások.`,'good');}
$('makeResearch').addEventListener('click',()=>{try{doResearch();}catch(e){err(e,'researchStatus');}});
$('downloadResearch').addEventListener('click',()=>{try{doResearch();const p=project();fileDownload(`omsitools_kutatas_${slug(p.place)}_${p.start}_${p.end}.md`,lastResearch.markdown,'text/markdown;charset=utf-8');}catch(e){err(e,'researchStatus');}});
const vFields={name:'vName',mode:'vMode',status:'vStatus',from:'vFrom',to:'vTo',aiPath:'vAiPath',group:'vGroup',weight:'vWeight',parkPath:'vParkPath',parkWeight:'vParkWeight',depot:'vDepot',hof:'vHof',fleet:'vFleet',reg:'vReg',repaint:'vRepaint',validFrom:'vValidFrom',validTo:'vValidTo',source:'vSource',evidence:'vEvidence'};
const defaultVehicle=()=>({mode:'random',status:'proposed',group:'NormalCars',weight:1,parkWeight:1});
function readVehicle(){const r={};for(const [name,id] of Object.entries(vFields))r[name]=val(id);return r;}
function setVehicle(r){for(const [name,id] of Object.entries(vFields))$(id).value=r[name]??'';if(!r.mode)$('vMode').value='random';if(!r.group)$('vGroup').value='NormalCars';if(!r.weight)$('vWeight').value=1;if(!r.parkWeight)$('vParkWeight').value=1;}
function clearVehicle(){editing=null;$('vehicleForm').reset();setVehicle(defaultVehicle());$('vehicleFormTitle').textContent='Jármű hozzáadása';$('saveVehicle').textContent='Jármű mentése';}
$('clearVehicle').addEventListener('click',clearVehicle);
function renderVehicles(){const list=$('fleetList');list.replaceChildren();$('fleetCount').textContent=`${vehicles.length} jármű`;
 if(!vehicles.length){list.append(el('p',{class:'fine'},'Még nincs felvett jármű. Add hozzá a saját OMSI-modelljeidet és a hozzájuk tartozó forrásokat.'));return;}
 for(const v of vehicles){const box=el('div',{class:'list-card'}),title=el('div',{class:'flex-between'}),left=el('strong',{},v.name),chips=el('div',{class:'chips'});
  chips.append(el('span',{class:'chip '+(v.status==='verified'?'verified':'pending')},v.status==='verified'?'Igazolt':'Ellenőrzendő'));
  if(v.from||v.to)chips.append(el('span',{class:'chip'},`${v.from||'?'}–${v.to||'?'}`));
  title.append(left,chips);box.append(title);
  box.append(el('div',{class:'meta'},[v.mode==='random'?'AI: '+v.group:v.mode==='depot'?'Menetrendi: '+v.depot:'Parkoló',v.aiPath||v.parkPath||'',v.source?'Forrás: '+v.source:'Forrás: nem megadott'].join(' | ')));
  if(v.evidence)box.append(el('div',{class:'meta'},v.evidence));
  const actions=el('div',{class:'actionbar'}),edit=el('button',{type:'button',class:'btn-small btn-plain'},'Szerkesztés'),del=el('button',{type:'button',class:'btn-small btn-danger'},'Törlés');
  edit.onclick=()=>{editing=v._id;setVehicle(v);$('vehicleFormTitle').textContent='Jármű szerkesztése';$('saveVehicle').textContent='Módosítás mentése';window.scrollTo({top:100,behavior:'smooth'});};
  del.onclick=()=>{if(!confirm('Töröljem a kijelölt járműbejegyzést a projektből?'))return;vehicles=vehicles.filter(x=>x._id!==v._id);if(editing===v._id)clearVehicle();renderVehicles();};
  actions.append(edit,del);box.append(actions);list.append(box);
 }
}
$('vehicleForm').addEventListener('submit',e=>{e.preventDefault();try{const v=readVehicle(),errors=validateVehicle(v);if(errors.length)throw new Error(errors.join('\n'));if(editing){const index=vehicles.findIndex(x=>x._id===editing);if(index<0)throw new Error('A kijelölt rekord már nem létezik.');vehicles[index]={...v,_id:editing};}else vehicles.push({...v,_id:'vehicle-'+Date.now()+'-'+Math.random().toString(16).slice(2)});clearVehicle();renderVehicles();global('A jármű rekordját elmentettem ebben a böngészőmunkamenetben. A tartós megőrzéshez mentsd le a projektet .json formátumban.');}catch(e){global(e.message,'error');}});
$('exportProject').addEventListener('click',()=>{try{const p=project();fileDownload(`omsitools_projekt_${slug(p.place)}_${p.start}_${p.end}.json`,JSON.stringify({schema:'omsitools-project-v1',project:p,vehicles},null,2),'application/json;charset=utf-8');}catch(e){global(e.message,'error');}});
$('importProjectBtn').addEventListener('click',()=>$('importProject').click());
$('importProject').addEventListener('change',async()=>{try{const file=mounted('importProject');if(!file)return;const saved=JSON.parse(await fileText(file));if(saved.schema!=='omsitools-project-v1'||!Array.isArray(saved.vehicles)||!saved.project||saved.vehicles.length>5000)throw new Error('Nem megfelelő OMSI-projektfájl.');for(const [i,v] of saved.vehicles.entries()){const errs=validateVehicle(v);if(errs.length)throw new Error(`${i+1}. rekord: ${errs.join(', ')}`);}updateProject(saved.project);vehicles=saved.vehicles.map((v,i)=>({...v,_id:'import-'+i}));clearVehicle();renderVehicles();global(`${vehicles.length} jármű és a projekt adatai betöltve.`);}catch(e){global(e.message,'error');}finally{$('importProject').value='';}});
$('generateTraffic').addEventListener('click',()=>{try{const p=project(),res=buildTrafficFiles(vehicles,p.start,p.end,{onlyVerified:$('onlyVerified').checked});if(!res.selected.length)throw new Error('Nincs a megadott időszakban felhasználható jármű. Előbb add meg vagy engedélyezd őket.');lastTraffic={project:p,res};$('aiPreview').textContent=res.ailist;$('parkPreview').textContent=res.parklist||'(nincs parkoló modell)';$('downloadTraffic').disabled=false;status('trafficStatus',`${res.selected.length} jármű kiválasztva. ${res.warnings.length} figyelmeztetés: ${res.warnings.join(' | ')||'nincs'}`,'good');}catch(e){lastTraffic=null;$('downloadTraffic').disabled=true;err(e,'trafficStatus');}});
$('downloadTraffic').addEventListener('click',()=>{try{if(!lastTraffic)throw new Error('Előbb generáld le a fájlokat.');const {project:p,res}=lastTraffic;
 const files=[['ailists.cfg',res.ailist],['parklist_p.txt',res.parklist],['FORRASOK_ES_ELLENORZES.txt',buildReport(p,vehicles,res)],['KUTATASI_TERV.md',researchPlan(p).markdown,true]];
 const bytes=zipIt(`${slug(p.place)}_${p.start}-${p.end}`,files);fileDownload(`omsitools_jarmuvek_${slug(p.place)}_${p.start}-${p.end}.zip`,bytes,'application/zip');}catch(e){err(e,'trafficStatus');}});
$('inspectFiles').addEventListener('click',async()=>{try{const a=mounted('fileAilist'),b=mounted('fileParklist');if(!a&&!b)throw new Error('Válassz legalább egy meglévő OMSI-fájlt.');const target=$('inspectResults');target.replaceChildren();let summary=[];
  if(a){const parsed=parseAilist(await fileText(a,cp()));const box=el('div',{class:'list-card'});box.append(el('strong',{},`ailists.cfg: ${parsed.groups.length} csoport, ${parsed.counts.random} AI és ${parsed.counts.scheduled} menetrendi bejegyzés`));for(const w of parsed.warnings)box.append(el('p',{class:'fine'},'• '+w));if(!parsed.warnings.length)box.append(el('p',{class:'fine'},'A vizsgált OMSI 2 csoportokban nem találtam szerkezeti figyelmeztetést.'));target.append(box);summary.push('AI-lista ellenőrizve.');}
  if(b){const parsed=parseParklist(await fileText(b,cp()));const box=el('div',{class:'list-card'});box.append(el('strong',{},`parklist_p.txt: ${parsed.paths.length} járműobjektum, ${parsed.repeats.length} ismétlődő típus`));for(const w of parsed.warnings)box.append(el('p',{class:'fine'},'• '+w));if(!parsed.warnings.length)box.append(el('p',{class:'fine'},'Nem találtam szerkezeti figyelmeztetést.'));target.append(box);summary.push('Parkolólista ellenőrizve.');}
  global(summary.join(' ')+' Nem módosítottam a feltöltött fájlokat.');
 }catch(e){global(e.message,'error');}});
function updateCalPlace(){const pl=PLACES.find(x=>x.id===val('calPlace'));if(pl){$('calZone').value=pl.zone;$('calLat').value=pl.lat;$('calLon').value=pl.lon;return;}
 const p=PLACES.find(x=>x.name.toLowerCase()===val('place').toLowerCase());if(p){$('calZone').value=p.zone;$('calLat').value=p.lat;$('calLon').value=p.lon;}}
$('calPlace').addEventListener('change',updateCalPlace);
$('calSource').addEventListener('change',()=>{$('holidayUploadRow').hidden=val('calSource')!=='file';});
function selectedCalPlace(){const p=PLACES.find(x=>x.id===val('calPlace'));const place=p?{...p}:{id:slug(val('place')),name:val('place'),country:val('country').toUpperCase(),subdivision:val('region').toUpperCase(),language:val('country').toUpperCase()==='HU'?'HU':'DE'};
 place.zone=val('calZone');place.lat=Number(val('calLat'));place.lon=Number(val('calLon'));validatePlace(place);return place;}
function apiUrl(endpoint,place,year){const url=new URL('https://openholidaysapi.org/'+endpoint);url.searchParams.set('countryIsoCode',place.country);url.searchParams.set('subdivisionCode',place.subdivision);url.searchParams.set('validFrom',year+'-01-01');url.searchParams.set('validTo',year+'-12-31');url.searchParams.set('languageIsoCode',place.language);return url.href;}
async function fetchCalendarEvents(place,from,to){const records=[];
 for(let year=from;year<=to;year++){
  for(const [endpoint,kind] of [['PublicHolidays','public'],['SchoolHolidays','school']]){
   const response=await fetch(apiUrl(endpoint,place,year),{headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error(`OpenHolidays API: ${year} / ${endpoint} HTTP ${response.status}. A hiányos naptárat nem mentem el.`);
   const arr=await response.json();const items=normalizeApi(arr,kind,place);
   if(items.length===0)throw new Error(`${year}: nincs ${kind==='public'?'munkaszüneti nap':'iskolaszünet'} a közzétett adatokban ehhez a térséghez. Ne tekintsd teljesnek a naptárat.`);
   records.push(...items);
  }
 }
 return records;
}
$('generateCalendar').addEventListener('click',async()=>{
 $('generateCalendar').disabled=true;status('calStatus','Az időzóna kiszámítása és az adatok feldolgozása folyamatban…');
 try{const place=selectedCalPlace(),start=Number(val('calStart')),end=Number(val('calEnd'));
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<1970||end>2098||start>end||end-start>50)throw new Error('A naptár kezdő és záró éve 1970–2098 közé essen; legfeljebb 51 évet kérj egyszerre.');
  const tz=timezoneText(place,start,end),source=val('calSource');let events=[],desc='';
  if(source==='file'){const f=mounted('calHolidayFile');if(!f)throw new Error('Válaszd ki a beolvasandó Holidays.txt fájlt.');events=parseOmSi(await fileText(f,place.country==='HU'?'1250':'1252'));desc='Felhasználó által beolvasott, tartalmilag külön nem hitelesített OMSI-fájl';}
  if(source==='online'){
   if(end-start>10)throw new Error('Az API-s üzemmódban legfeljebb 11 év tölthető le egyszerre.');
   events=await fetchCalendarEvents(place,start,end);desc='OpenHolidays API, ország+tartomány szűréssel; a helyi kivételeket külön ellenőrizni kell';
  }
  let overrides=[];if(mounted('calOverrides'))overrides=parseOverrides(await fileText(mounted('calOverrides')));
  const rules=overridesFor(place,start,end,overrides);
  events=mergeEvents(events,rules.added,rules.removed,start,end);
  if(source!=='time'&&!events.length)throw new Error('A kiválasztott időszakra nem érkezett ellenőrizhető esemény; Holidays.txt nem készül.');
  const holidays=source==='time'?null:holidayText(events,start,end);
  const publicCount=events.filter(x=>x.kind==='public').length,schoolCount=events.filter(x=>x.kind==='school').length;
  $('calCountPublic').textContent=String(publicCount);$('calCountSchool').textContent=String(schoolCount);$('calCountDst').textContent=String(tz.count);
  $('timezonePreview').textContent=tz.text.slice(0,1600)+(tz.text.length>1600?'\r\n[… az előnézet rövidítve]':'');$('holidayPreview').textContent=holidays?holidays.slice(0,2000)+(holidays.length>2000?'\r\n[… az előnézet rövidítve]':''):'Csak timezone.txt';
  lastCalendar={place,start,end,tz,holidays,desc,publicCount,schoolCount};
  $('downloadCalendar').disabled=false;status('calStatus',`${place.name}, ${start}–${end}: ${publicCount} ünnepi esemény, ${schoolCount} szünetintervallum, ${tz.count} nyáriidőszámítási időszak. Forrás: ${desc||'csak időzóna'}.`,'good');
 }catch(e){lastCalendar=null;$('downloadCalendar').disabled=true;err(e,'calStatus');}finally{$('generateCalendar').disabled=false;}
});
$('downloadCalendar').addEventListener('click',()=>{try{if(!lastCalendar)throw new Error('Előbb generáld le a naptárat.');const {place,start,end,tz,holidays,desc,publicCount,schoolCount}=lastCalendar;const cpName=place.country==='HU'?'1250':'1252';
 const report=`OMSI Tools naptár\r\nHelyszín: ${place.name}\r\nOrszág: ${place.country}\r\nRégió: ${place.subdivision}\r\nÉvek: ${start}–${end}\r\nIdőzóna: ${place.zone}\r\nForrás: ${desc||'kizárólag IANA-időzóna'}\r\nHelyi eltérések: felhasználói CSV, ha megadva\r\nMunkaszüneti események: ${publicCount}\r\nIskolaszünetek: ${schoolCount}\r\nOMSI karakterkódolás: Windows-${cpName}\r\nA történeti adatok minőségét, iskolai körzetet és a városi kivételeket ellenőrizni kell.\r\n`;
 const files=[{path:`${slug(place.name)}_${start}-${end}/timezone.txt`,bytes:omsiEncode(tz.text,cpName)},{path:`${slug(place.name)}_${start}-${end}/FORRASOK_ES_ELLENORZES.txt`,bytes:omsiEncode(report,cpName)}];if(holidays)files.push({path:`${slug(place.name)}_${start}-${end}/Holidays.txt`,bytes:omsiEncode(holidays,cpName)});
 const archive=makeZip(files);fileDownload(`omsitools_naptar_${slug(place.name)}_${start}-${end}.zip`,archive,'application/zip');
 }catch(e){err(e,'calStatus');}});
clearVehicle();renderVehicles();
