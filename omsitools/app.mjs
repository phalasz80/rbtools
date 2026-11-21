import {PLACES,validatePlace,parseOmSi,normalizeApi,parseOverrides,overridesFor,mergeEvents,holidayText,timezoneText,omsiEncode,makeZip} from './engine.mjs';
import {TOPICS,GROUPS,validateVehicle,parseAilist,parseParklist,buildTrafficFiles,researchPlan,buildReport} from './traffic.mjs';
import {catalogCounts,recommendCatalog} from './catalog-core.mjs';
import {COUNTRIES,REGIONS,CITIES,countryMeta,regionName,apiSubdivisionOptions,matchRemoteRegion,codepageFor,normalizeLabel} from './geography.mjs';
import {openSubdivisionList,openGroups,openHolidayEvents,ukHolidayEvents,builtinCityEvents} from './calendar-sources.mjs';
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
function cp(){return codepageFor(val('country').toUpperCase());}
function tryEncode(text){return omsiEncode(text,cp());}
function zipIt(root,list){const files=list.map(([path,text,isUtf8])=>({path:root+'/'+path,bytes:isUtf8?encoder.encode(text):tryEncode(text)}));return makeZip(files);}
async function fileText(file,codepage='1252') {const buf=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(buf);}catch{return new TextDecoder('windows-'+codepage).decode(buf);}}
function mounted(name){return button(name).files?.[0]||null;}
function tabSwitch(key){for(const tab of document.querySelectorAll('.tab')){const yes=tab.dataset.tab===key;tab.classList.toggle('active',yes);tab.setAttribute('aria-selected',yes?'true':'false');}for(const section of document.querySelectorAll('.section'))section.classList.toggle('active',section.id===key);window.scrollTo({top:80,behavior:'smooth'});}
for(const tab of document.querySelectorAll('[data-tab]'))tab.addEventListener('click',()=>tabSwitch(tab.dataset.tab));
for(const place of PLACES){$('placePreset').append(el('option',{value:place.id},place.name));}
$('placePreset').addEventListener('change',()=>{const pl=PLACES.find(p=>p.id===val('placePreset'));if(!pl)return;$('place').value=pl.name;$('country').value=pl.country;$('region').value=pl.subdivision;chooseCalendarLocation(pl.country,pl.subdivision,pl.name);});
for(const [name,label] of GROUPS)$('vGroup').append(el('option',{value:name},label+' ('+name+')'));
for(const [key,label] of Object.entries(TOPICS)){const lab=el('label',{class:'check'});const input=el('input',{type:'checkbox'});input.dataset.topic=key;input.checked=['urbanBus','cars','parking','liveries'].includes(key);lab.append(input,document.createTextNode(label));$('topicChecks').append(lab);}
function doResearch(){const p=project();if(!p.place)throw new Error('Add meg a vizsgálandó települést.');const plan=researchPlan(p);lastResearch=plan;$('researchLinks').replaceChildren();for(const r of plan.searches){const wrap=el('div',{class:'source-row'}),body=el('div');body.append(el('strong',{},r.topic));const a=el('a',{href:r.url,target:'_blank',rel:'noopener noreferrer'},r.query);body.append(a);wrap.append(body);$('researchLinks').append(wrap);}status('researchStatus',`${p.place}, ${p.start}–${p.end}: ${plan.searches.length} célzott keresés. Ezek kutatási javaslatok, nem ellenőrzött forrásállítások.`,'good');}
$('makeResearch').addEventListener('click',()=>{try{doResearch();}catch(e){err(e,'researchStatus');}});
$('downloadResearch').addEventListener('click',()=>{try{doResearch();const p=project();fileDownload(`omsitools_kutatas_${slug(p.place)}_${p.start}_${p.end}.md`,lastResearch.markdown,'text/markdown;charset=utf-8');}catch(e){err(e,'researchStatus');}});

let catalogRecommendation=null;
const inventory=catalogCounts();
$('catalogCountAI').textContent=inventory.ai;
$('catalogCountPark').textContent=inventory.park;
function catalogOptions(){
 const p=project();
 const y=Number(val('catalogYear')||p.start);
 return {country:p.country,region:p.region,year:y,eastWest:val('catalogEastWest'),
 area:val('catalogArea'),maxAI:Number(val('catalogMaxAI')),maxPark:Number(val('catalogMaxPark')),
 search:val('catalogSearch'),special:$('catalogIncludeSpecial').checked,
 uncertain:$('catalogIncludeUncertain').checked,lod:$('catalogUseLOD').checked};
}
function catalogRecommend(){
 const options=catalogOptions();
 if(!options.country)throw new Error('Előbb add meg az országot a Hely és kutatás fülön.');
 const result=recommendCatalog(options);
 catalogRecommendation={result,options};
 $('catalogCountKnown').textContent=result.stats.knownAI;
 const container=$('catalogResults');container.replaceChildren();
 const records=result.records;
 for(let i=0;i<records.length;i++){
  const r=records[i],card=el('label',{class:'catalog-choice'});
  const check=el('input',{type:'checkbox'});check.className='catalog-check';check.dataset.i=String(i);check.checked=true;
  const body=el('span',{class:'catalog-choice-body'});
  body.append(el('strong',{},r.name+' · '+(r.mode==='park'?'parkoló':'közúti AI')));
  const path=r.aiPath||r.parkPath;
  body.append(el('span',{class:'catalog-path'},path));
  if(r.parkPath&&r.aiPath)body.append(el('span',{class:'catalog-sub'},'Parkoló pár: '+r.parkPath));
  body.append(el('span',{class:'catalog-sub'},'Típuskorszak: '+(r.from||'?')+'–'+(r.to||'?')+' · javaslat / ellenőrizendő'));
  card.append(check,body);container.append(card);
 }
 $('catalogAdd').disabled=!records.length;
 $('catalogSelectAll').disabled=!records.length;
 $('catalogSelectNone').disabled=!records.length;
 const warnings=result.warnings.join(' ');
 status('catalogStatus',records.length+' járműrekord javasolt ('+result.ai.length+' AI, '+result.park.length+' parkoló modell). '+(warnings||'')+(records.length?' A jelölőnégyzetekkel szűkítheted a válogatást.':''),records.length?'good':'warning');
 return result;
}
$('catalogSuggest').addEventListener('click',()=>{try{catalogRecommend();}catch(e){err(e,'catalogStatus');}});
$('catalogSelectAll').addEventListener('click',()=>{document.querySelectorAll('.catalog-check').forEach(c=>c.checked=true);});
$('catalogSelectNone').addEventListener('click',()=>{document.querySelectorAll('.catalog-check').forEach(c=>c.checked=false);});
$('catalogAdd').addEventListener('click',()=>{
 try{
  if(!catalogRecommendation)throw new Error('Előbb állíts össze ajánlást.');
  const picked=[...document.querySelectorAll('.catalog-check:checked')].map(c=>catalogRecommendation.result.records[Number(c.dataset.i)]).filter(Boolean);
  const present=new Set(vehicles.map(v=>v.aiPath||v.parkPath));
  let added=0,skipped=0;
  for(const record of picked){
   const key=record.aiPath||record.parkPath;
   if(present.has(key)){skipped++;continue;}
   const errors=validateVehicle(record);
   if(errors.length){skipped++;continue;}
   vehicles.push({...record,_id:'catalog-'+Date.now()+'-'+added});
   present.add(key);added++;
  }
  renderVehicles();
  status('catalogStatus',added+' jármű hozzáadva a projekt állományához; '+skipped+' már szerepelt vagy érvénytelen volt. Minden automatikus besorolás ellenőrizendő.','good');
 }catch(e){err(e,'catalogStatus');}
});

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
$('generateTraffic').addEventListener('click',()=>{try{const p=project(),baseRecords=vehicles.length?vehicles:($('onlyVerified').checked?[]:catalogRecommend().records),res=buildTrafficFiles(baseRecords,p.start,p.end,{onlyVerified:$('onlyVerified').checked});if(!res.selected.length)throw new Error('Nincs a megadott időszakban felhasználható jármű. Előbb add meg vagy engedélyezd őket.');lastTraffic={project:p,res,records:baseRecords};$('aiPreview').textContent=res.ailist;$('parkPreview').textContent=res.parklist||'(nincs parkoló modell)';$('downloadTraffic').disabled=false;status('trafficStatus',`${res.selected.length} jármű kiválasztva. ${res.warnings.length} figyelmeztetés: ${res.warnings.join(' | ')||'nincs'}`,'good');}catch(e){lastTraffic=null;$('downloadTraffic').disabled=true;err(e,'trafficStatus');}});
$('downloadTraffic').addEventListener('click',()=>{try{if(!lastTraffic)throw new Error('Előbb generáld le a fájlokat.');const {project:p,res,records}=lastTraffic;
 const files=[['ailists.cfg',res.ailist],['parklist_p.txt',res.parklist],['FORRASOK_ES_ELLENORZES.txt',buildReport(p,records,res)],['KUTATASI_TERV.md',researchPlan(p).markdown,true]];
 const bytes=zipIt(`${slug(p.place)}_${p.start}-${p.end}`,files);fileDownload(`omsitools_jarmuvek_${slug(p.place)}_${p.start}-${p.end}.zip`,bytes,'application/zip');}catch(e){err(e,'trafficStatus');}});
$('inspectFiles').addEventListener('click',async()=>{try{const a=mounted('fileAilist'),b=mounted('fileParklist');if(!a&&!b)throw new Error('Válassz legalább egy meglévő OMSI-fájlt.');const target=$('inspectResults');target.replaceChildren();let summary=[];
  if(a){const parsed=parseAilist(await fileText(a,cp()));const box=el('div',{class:'list-card'});box.append(el('strong',{},`ailists.cfg: ${parsed.groups.length} csoport, ${parsed.counts.random} AI és ${parsed.counts.scheduled} menetrendi bejegyzés`));for(const w of parsed.warnings)box.append(el('p',{class:'fine'},'• '+w));if(!parsed.warnings.length)box.append(el('p',{class:'fine'},'A vizsgált OMSI 2 csoportokban nem találtam szerkezeti figyelmeztetést.'));target.append(box);summary.push('AI-lista ellenőrizve.');}
  if(b){const parsed=parseParklist(await fileText(b,cp()));const box=el('div',{class:'list-card'});box.append(el('strong',{},`parklist_p.txt: ${parsed.paths.length} járműobjektum, ${parsed.repeats.length} ismétlődő típus`));for(const w of parsed.warnings)box.append(el('p',{class:'fine'},'• '+w));if(!parsed.warnings.length)box.append(el('p',{class:'fine'},'Nem találtam szerkezeti figyelmeztetést.'));target.append(box);summary.push('Parkolólista ellenőrizve.');}
  global(summary.join(' ')+' Nem módosítottam a feltöltött fájlokat.');
 }catch(e){global(e.message,'error');}});
// Calendar geography is intentionally independent from research geography.
let regionOptions=[],regionRequest=0,lastCalendarWarnings=[];
const geoOption=(value,label)=>el('option',{value},label);
for(const country of COUNTRIES)$('calCountry').append(geoOption(country.code,country.name));
function fillCities(preferred=''){
 const country=val('calCountry'),selected=val('calRegion'),cities=CITIES.filter(c=>c.country===country&&(!selected||matchRemoteRegion(c,regionOptions)===selected)).sort((a,b)=>a.name.localeCompare(b.name,'hu'));
 $('calCity').replaceChildren(geoOption('','A teljes kiválasztott tartomány / körzet'));
 for(const city of cities){const region=regionName(country,city.subdivision),label=city.name+' ('+region+')';$('calCity').append(geoOption(city.id,label));}
 if(preferred){const city=cities.find(c=>c.id===preferred||normalizeLabel(c.name)===normalizeLabel(preferred));if(city)$('calCity').value=city.id;}
 if(!val('calCity'))$('calCity').value='';
}
function setPlaceCoordinates(city){
 const country=countryMeta(val('calCountry'));
 if(!country)return;
 const point=city||CITIES.find(c=>c.country===country.code&&matchRemoteRegion(c,regionOptions)===val('calRegion'))||country;
 $('calZone').value=country.zone;$('calLat').value=point.lat;$('calLon').value=point.lon;
}
function selectCity(city){
 if(!city){setPlaceCoordinates();updateGeoInfo();return;}
 const match=matchRemoteRegion(city,regionOptions);
 if(match)$('calRegion').value=match;
 setPlaceCoordinates(city);
 updateGeoInfo();
}
function updateGeoInfo(extra=''){
 const c=countryMeta(val('calCountry'));if(!c)return;
 const city=CITIES.find(x=>x.id===val('calCity'));
 const r=regionOptions.find(x=>x.code===val('calRegion'));
 const uk=c.code==='GB';
 $('calHistoryRow').hidden=c.code!=='DE';
 const level=city?city.name+' (városi helyszín; a lekért szünetek területi pontossága az adatforrástól függ)':r?r.name+' (tartomány/körzet)':c.name+' (országos)';
 const hint=uk?'Az Egyesült Királyságban a munkaszüneti napok országonként eltérnek; az iskolaszünetek helyi tanácsi/iskolai adatok, ezeket CSV-vel add hozzá.':
 'A hivatalos területi egységek és iskola-szüneti körzetek az OpenHolidays adataiból frissülnek. A város kiválasztása önmagában nem bizonyít külön városi ünnepeket vagy iskolai eltéréseket.';
 const key=city?.id||c.code.toLowerCase()+'-'+(val('calRegion')||'national').toLowerCase().replace(/[^a-z0-9_-]/g,'_');
 $('calGeoNote').textContent=level+'. CSV helyazonosító: '+key+'. '+hint+(extra?' '+extra:'');
}
async function loadCalendarRegions(country,prefRegion='',prefCity=''){
 const request=++regionRequest,meta=countryMeta(country);
 let preliminary=(REGIONS[country]||[]).map(x=>({...x}));
 regionOptions=preliminary;
 const publish=(preferred)=>{
  const elRegion=$('calRegion');elRegion.replaceChildren();
  if(country!=='GB')elRegion.append(geoOption('','Országos (nincs tartományi szűrés)'));
  for(const region of regionOptions)elRegion.append(geoOption(region.code,`${region.name} [${region.code}]`));
  const direct=regionOptions.find(x=>x.code===preferred);
  elRegion.value=direct?direct.code:(country==='GB'?'GB-EAW':'');
  fillCities(prefCity);
  if(prefCity){const city=CITIES.find(c=>c.country===country&&normalizeLabel(c.name)===normalizeLabel(prefCity));
   if(city){$('calCity').value=city.id;const mapped=matchRemoteRegion(city,regionOptions);if(mapped)elRegion.value=mapped;}
  }
  setPlaceCoordinates(CITIES.find(c=>c.id===val('calCity')));
  updateGeoInfo();
 };
 publish(prefRegion);
 $('calGroup').replaceChildren(geoOption('','Általános (nincs iskolatípus-szűrés)'));
 $('calGroupRow').hidden=country==='GB';
 if(country==='GB')return;
 $('calGeoNote').textContent='Területi és iskolatípus-adatok lekérése az OpenHolidays rendszerből…';
 try{
  const [subgroups,groups]=await Promise.allSettled([openSubdivisionList(country),openGroups(country)]);
  if(request!==regionRequest)return;
  if(subgroups.status==='fulfilled'){
   const fetched=apiSubdivisionOptions(subgroups.value);
   if(fetched.length)regionOptions=fetched;
   else throw new Error('A külső API nem adott területi listát.');
  }else throw subgroups.reason;
  const desired=regionOptions.some(x=>x.code===prefRegion)?prefRegion:(()=>{
   const original=preliminary.find(x=>x.code===prefRegion);if(!original)return '';
   const normalized=normalizeLabel(original.name);return regionOptions.find(x=>normalizeLabel(x.name)===normalized)?.code||'';
  })();
  publish(desired);
  if(groups.status==='fulfilled')for(const group of groups.value||[]){if(!group.code)continue;
   const name=Array.isArray(group.name)?group.name.find(x=>x.language===meta.language)?.text||group.name.find(x=>x.language==='EN')?.text||group.name[0]?.text:group.name;
   $('calGroup').append(geoOption(group.code,String(name||group.code)+' ['+group.code+']'));
  }
  updateGeoInfo();
 }catch(e){if(request!==regionRequest)return;updateGeoInfo('A területi API most nem érhető el. A választóban statikus ISO-kódok látszanak; az online generálásnál ellenőrizd a területi kódot. '+(e?.message||''));}
}
async function chooseCalendarLocation(country,region,city=''){
 $('calCountry').value=country;
 await loadCalendarRegions(country,region,city);
}
$('calCountry').addEventListener('change',()=>loadCalendarRegions(val('calCountry'),val('calCountry')==='GB'?'GB-EAW':'',''));
$('calRegion').addEventListener('change',()=>{ $('calCity').value='';setPlaceCoordinates();updateGeoInfo();});
$('calCity').addEventListener('change',()=>selectCity(CITIES.find(x=>x.id===val('calCity'))));
$('calSource').addEventListener('change',()=>{$('holidayUploadRow').hidden=val('calSource')!=='file';});
function selectedCalPlace(){
 const country=countryMeta(val('calCountry'));if(!country)throw new Error('Válassz támogatott országot.');
 const subdivision=val('calRegion'),city=CITIES.find(c=>c.id===val('calCity'));
 if(country.code==='GB'&&!subdivision)throw new Error('A brit országrész megadása kötelező.');
 if(country.code!=='GB'&&country.code!=='HU'&&!(country.code==='DE'&&val('calHistoryMode')!=='auto')&&!subdivision&&val('calSource')==='online')throw new Error('A pontos iskolaszünetekhez válassz tartományt, kantont vagy iskolaövezetet. Országos szűrés minden régió szüneteit összekeverheti.');
 if(city&&!matchRemoteRegion(city,regionOptions)&&country.code!=='GB'&&val('calSource')==='online'&&!(country.code==='DE'&&val('calHistoryMode')!=='auto'))throw new Error('A kiválasztott városhoz nem található megfelelő, API-ban támogatott tartomány/körzet. Válassz területet a listából, vagy tölts fel saját Holidays.txt fájlt.');
 const chosenName=city?.name||regionOptions.find(x=>x.code===subdivision)?.name||country.name;
 const place={id:city?.id||country.code.toLowerCase()+'-'+(subdivision||'national').toLowerCase().replace(/[^a-z0-9_-]/g,'_'),name:chosenName,country:country.code,subdivision,language:country.language,zone:val('calZone'),lat:Number(val('calLat')),lon:Number(val('calLon')),citySelected:!!city};
 validatePlace(place);return place;
}
$('generateCalendar').addEventListener('click',async()=>{
 $('generateCalendar').disabled=true;$('downloadCalendar').disabled=true;
 status('calStatus','Az időzóna és a kiválasztott terület ünnep- és szünetadatai feldolgozás alatt…');
 try{
  const place=selectedCalPlace(),start=Number(val('calStart')),end=Number(val('calEnd'));
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<1970||end>2098||start>end||end-start>80)throw new Error('A naptár kezdő és záró éve 1970–2098 közé essen; legfeljebb 81 évet kérj egyszerre.');
  const tz=timezoneText(place,start,end),source=val('calSource');let events=[],desc='',sources=[],notes=[],coverage=[];
  if(source==='file'){
   const f=mounted('calHolidayFile');if(!f)throw new Error('Válaszd ki a beolvasandó Holidays.txt fájlt.');
   events=parseOmSi(await fileText(f,codepageFor(place.country)));
   desc='Felhasználó által beolvasott OMSI-állomány (tartalma külön nem hitelesített)';
  }
  if(source==='online'){
   if(end-Math.max(start,2020)>=11)throw new Error('Az OpenHolidays API 2020 utáni időszakából egyszerre legfeljebb 11 évet kérj. A 1970–2019 közötti német történeti szabályok e kereten kívül kezelhetők.');
   const progress=text=>status('calStatus',text+'…');
   const fetched=place.country==='GB'?await ukHolidayEvents(place,start,end,{progress}):await openHolidayEvents(place,start,end,{progress,group:val('calGroup'),germanRegime:val('calHistoryMode')});
   events=fetched.events;sources=fetched.sources;notes=fetched.notes;coverage=fetched.coverage||[];
   desc=place.country==='GB'?'GOV.UK / Nager.Holidays, területi bank holidays (iskolaszünetek külön)':place.country==='DE'?'Német történeti törvény- és archívum-alapú szabályok (1970–2019), OpenHolidays API (2020-tól)':'OpenHolidays API, kiválasztott területi és iskolatípus-szűréssel';
   events.push(...builtinCityEvents(place,start,end));
   if(place.country==='DE'&&place.subdivision==='DE-BY')notes.push('Bajorországban a Mariä Himmelfahrt települési hatályát a hivatalos önkormányzati jegyzék szerint külön ellenőrizd.');
   if(place.country==='FR')notes.push('Franciaországban az iskolai A/B/C zónák és a helyi ünnepek miatt a kiválasztott académie/területi egység helyességét ellenőrizd.');
   if(place.country==='CH')notes.push('Svájcban a szünetek egyes községekben és iskolatípusokban kantonon belül is eltérhetnek.');
  }
  const overrides=mounted('calOverrides')?parseOverrides(await fileText(mounted('calOverrides'))):[];
  const rules=overridesFor(place,start,end,overrides);
  events=mergeEvents(events,rules.added,rules.removed,start,end);
  if(source!=='time'&&!events.length)throw new Error('Nincs feldolgozható esemény. Nem készül Holidays.txt.');
  const holidays=source==='time'?null:holidayText(events,start,end);
  const incomplete=coverage.some(x=>['HIÁNYZIK','RÉSZLEGES'].includes(x.status));
  if(incomplete)notes.unshift('FIGYELEM: A kért időszak naptára RÉSZLEGES. A hiányzó éveket/forrásokat a ZIP ellenőrzési jelentése sorolja fel.');
  const publicCount=events.filter(x=>x.kind==='public').length,schoolCount=events.filter(x=>x.kind==='school').length;
  if(place.country==='GB'&&source==='online'&&schoolCount===0)notes.unshift('Figyelem: a Holidays.txt csak a munkaszüneti napokat tartalmazza. Brit iskolaszünetet nem tartalmaz, amíg nem adsz hozzá helyileg igazolt CSV-kivételt.');
  if(place.citySelected&&source==='online')notes.push('A város kiválasztása nem feltétlenül városi szintű ünnep-/szünetszűrés. Helyi szabályokat külön ellenőrizni kell.');
  lastCalendarWarnings=notes;
  $('calCountPublic').textContent=String(publicCount);$('calCountSchool').textContent=String(schoolCount);$('calCountDst').textContent=String(tz.count);
  $('timezonePreview').textContent=tz.text.slice(0,1600)+(tz.text.length>1600?'\r\n[… az előnézet rövidítve]':'');
  $('holidayPreview').textContent=holidays?holidays.slice(0,2000)+(holidays.length>2000?'\r\n[… az előnézet rövidítve]':''):'Csak timezone.txt';
  lastCalendar={place,start,end,tz,holidays,desc,publicCount,schoolCount,sources,notes,coverage,incomplete};
  $('downloadCalendar').disabled=false;
  const shortNotes=notes.slice(0,3).join(' ')+(notes.length>3?` +${notes.length-3} további megjegyzés a letölthető ZIP ellenőrzési jelentésében.`:'');
  status('calStatus',`${incomplete?'RÉSZLEGES NAPTÁR. ':''}${place.name}, ${start}–${end}: ${publicCount} munkaszüneti esemény, ${schoolCount} szünetidőszak, ${tz.count} nyáriidőszámítási időszak. ${shortNotes}`,notes.length?'warning':'good');
 }catch(e){lastCalendar=null;$('downloadCalendar').disabled=true;err(e,'calStatus');}
 finally{$('generateCalendar').disabled=false;}
});
$('downloadCalendar').addEventListener('click',()=>{
 try{
  if(!lastCalendar)throw new Error('Előbb generáld le a naptárat.');
  const {place,start,end,tz,holidays,desc,publicCount,schoolCount,sources,notes,coverage,incomplete}=lastCalendar,codepage=codepageFor(place.country);
  const report=`OMSI Tools - naptár 1.2.0\r\nTeljesség: ${incomplete?'RÉSZLEGES – HIÁNYZÓ ADATOK':'A LEKÉRT ADATFORRÁSOK SZERINT'}\r\nHelyszín: ${place.name}\r\nOrszág: ${place.country}\r\nTartomány/iskolakörzet: ${place.subdivision||'országos'}\r\nTörténeti német állam: ${place.country==='DE'?val('calHistoryMode'):'nem alkalmazható'}\r\nÉvek: ${start}–${end}\r\nIdőzóna: ${place.zone}\r\nForrás: ${desc||'kizárólag IANA-időzóna'}\r\nForráscímek:\r\n${sources.join('\r\n')}\r\nFelhasználói helyi eltérések: ${mounted('calOverrides')?'igen':'nincs'}\r\nMunkaszüneti események: ${publicCount}\r\nIskolaszünetek: ${schoolCount}\r\nOMSI kódlap: Windows-${codepage}\r\n\r\nÉVENKÉNTI FORRÁSLEFEDETTSÉG:\r\n${coverage.map(x=>x.year+' / '+(x.kind==='school'?'iskolaszünet':'munkaszünet')+': '+x.status+' ('+x.count+' bejegyzés)'+(x.reason?' – '+x.reason:'')).join('\r\n')}\r\n\r\nFIGYELMEZTETÉSEK:\r\n${notes.join('\r\n')||'Az adatok tényleges területi hatályát és a hivatalos naptárakat ellenőrizd.'}\r\n`;
  const dir=`${slug(place.name)}_${start}-${end}`;
  const files=[{path:`${dir}/timezone.txt`,bytes:omsiEncode(tz.text,codepage)},{path:`${dir}/FORRASOK_ES_ELLENORZES.txt`,bytes:omsiEncode(report,codepage)}];
  if(holidays)files.push({path:`${dir}/Holidays.txt`,bytes:omsiEncode(holidays,codepage)});
  fileDownload(`omsitools_naptar_${slug(place.name)}_${start}-${end}${incomplete?'_RESZLEGES':''}.zip`,makeZip(files),'application/zip');
 }catch(e){err(e,'calStatus');}
});
chooseCalendarLocation('DE','DE-BE','Berlin');
clearVehicle();renderVehicles();
