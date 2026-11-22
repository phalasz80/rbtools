/* Free German-school-holiday backends, distinct from Schulferien.org's paid licensed API.
 * Original factual source of truth remains KMK / Landeskultusministerien.
 */
export const FERIEN_API='https://ferien-api.de/api/v1/holidays';
export const SCHULFERIEN_API='https://schulferien-api.de/api/v2';
export const SCHULFERIEN_DATEN='https://schulferiendaten.de/api/v1/ferien';
export const GERMAN_SCHOOL_SOURCE_INFO=[
 {name:'ferien-api.de',url:'https://www.ferien-api.de/',kind:'free-open-source',since:2017},
 {name:'schulferien-api.de',url:'https://schulferien-api.de/',kind:'free-open-source',since:2022},
 {name:'schulferiendaten.de',url:'https://schulferiendaten.de/schulferien-api/',kind:'free-attribution',since:2025}
];
const DAY=86400000;
const names={
 sommerferien:'Sommerferien',winterferien:'Winterferien',osterferien:'Osterferien',
 pfingstferien:'Pfingstferien',herbstferien:'Herbstferien',weihnachtsferien:'Weihnachtsferien',
 fruehjahrsferien:'Frühjahrsferien',variabler_ferientag:'Beweglicher Ferientag'
};
export const germanStateCode=place=>/^DE-[A-Z]{2}$/.test(place?.subdivision||'')?place.subdivision.slice(3):'';
function ymdDate(local){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(local))throw new Error('Érvénytelen dátum a szünidő-API-tól: '+local);
 const ms=Date.parse(local+'T00:00:00Z');
 if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==local)throw new Error('Érvénytelen naptári nap: '+local);
 return local.replaceAll('-','');
}
function addDays(ymd,days){
 const y=+ymd.slice(0,4),m=+ymd.slice(4,6),d=+ymd.slice(6,8);
 return new Date(Date.UTC(y,m-1,d+days)).toISOString().slice(0,10).replaceAll('-','');
}
function berlinDate(value){
 const iso=/^\d{4}-\d\d-\d\dT\d\d:\d\d(?:\:\d\d)?(?:Z|[+-]\d\d:\d\d)?$/.test(value||'')?value:typeof value==='string'?value+'Z':'';
 const instant=new Date(iso);
 if(!Number.isFinite(instant.getTime()))throw new Error('Érvénytelen UTC dátum: '+String(value));
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(instant);
 const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 return ymdDate(map.year+'-'+map.month+'-'+map.day);
}
function schoolName(name){
 const key=String(name||'Schulferien').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s-]+/g,'_');
 return names[key]||String(name||'Schulferien');
}
export function parseFerienApi(raw,state,year){
 if(!Array.isArray(raw))throw Error('A ferien-api.de nem tömböt adott vissza.');
 const out=[];
 for(const r of raw){
  if(r.stateCode!==state||typeof r.start!=='string'||typeof r.end!=='string')continue;
  const start=berlinDate(r.start),exclusive=berlinDate(r.end),end=addDays(exclusive,-1);
  if(start>end)continue;
  if(start.slice(0,4)!==String(year))continue;
  out.push({kind:'school',name:schoolName(r.name),start,end,source:FERIEN_API+'/'+state+'/'+year,certainty:'external-open-api'});
 }
 return out;
}
export function parseSchulferienApi(raw,state,year){
 if(!Array.isArray(raw))throw Error('A schulferien-api.de nem tömböt adott vissza.');
 return raw.filter(x=>x.stateCode===state&&x.start&&x.end&&String(x.start).slice(0,4)===String(year)).map(x=>({
  kind:'school',name:schoolName(x.name_cp||x.name),start:ymdDate(x.start.slice(0,10)),end:ymdDate(x.end.slice(0,10)),
  source:SCHULFERIEN_API+'/'+year+'/'+state,certainty:'external-open-api'
 })).filter(x=>x.start<=x.end);
}
export function parseSchulferienDaten(raw,state,year){
 const rows=Array.isArray(raw)?raw:Array.isArray(raw?.ferien)?raw.ferien:(!raw?[]:[]);
 if(!Array.isArray(rows))throw Error('A schulferiendaten.de ismeretlen formátumú.');
 return rows.filter(x=>(!x.bundesland||x.bundesland.toUpperCase()===state)&&x.start&&x.ende&&String(x.start).startsWith(String(year)))
  .map(x=>({kind:'school',name:schoolName(x.name||x.ferienart),start:ymdDate(x.start),end:ymdDate(x.ende),
   source:SCHULFERIEN_DATEN+'/'+state.toLowerCase()+'/'+year+'.json',certainty:'external-open-api'}));
}
async function fetchJSON(url,fetcher){
 const response=await fetcher(url,{headers:{Accept:'application/json'}});
 if(!response?.ok)throw Error((response?.status??'hálózati hiba')+' – '+url);
 return response.json();
}
const sourceStrategies=[
 {start:2017,end:2099,url:(state,year)=>FERIEN_API+'/'+state+'/'+year,parse:parseFerienApi},
 {start:2022,end:2099,url:(state,year)=>SCHULFERIEN_API+'/'+year+'/'+state,parse:parseSchulferienApi},
 {start:2025,end:2030,url:(state,year)=>SCHULFERIEN_DATEN+'/'+state.toLowerCase()+'/'+year+'.json',parse:parseSchulferienDaten}
];
export async function extraGermanSchoolHolidays(place,year,{fetcher=fetch,progress=()=>{}}={}){
 const state=germanStateCode(place),errors=[];
 if(!state)return {events:[],sources:[],notes:['A német szünidőkhöz tartományi kód szükséges.'],checked:false};
 for(const adapter of sourceStrategies){
  if(year<adapter.start||year>adapter.end)continue;
  const url=adapter.url(state,year);
  progress('Iskolaszüneti kiegészítő forrás: '+state+'/'+year+' – '+new URL(url).hostname);
  try{
   const events=adapter.parse(await fetchJSON(url,fetcher),state,year);
   if(events.length)return {events,sources:[url],notes:['Német iskolaszüneti kiegészítés: '+new URL(url).hostname+'. Az adatok hivatalos KMK/állami forrás szerinti összevetése ajánlott.'],checked:true,provider:new URL(url).hostname};
   errors.push(url+' – üres válasz');
  }catch(e){errors.push(url+' – '+String(e?.message||e));}
 }
 return {events:[],sources:[],notes:errors.length?['A kiegészítő szünidő-API nem adott használható adatot: '+errors.join(' | ')]:[],checked:errors.length>0};
}
