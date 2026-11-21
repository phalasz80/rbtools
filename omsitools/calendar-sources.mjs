/* Network adapters and source-specific validation; dependency-free and testable with injected fetch. */
import {normalizeApi} from './engine.mjs';

export const OPENHOLIDAYS = 'https://openholidaysapi.org';
export const UK_GOV_URL = 'https://www.gov.uk/bank-holidays.json';
export const NAGER_BASE = 'https://nagerholidays.com/api/v4/Holidays';
export function openHolidayUrl(endpoint,place,year,group=''){
 const url=new URL(OPENHOLIDAYS+'/'+endpoint);
 url.searchParams.set('countryIsoCode',place.country);
 if(place.subdivision)url.searchParams.set('subdivisionCode',place.subdivision);
 if(endpoint==='SchoolHolidays'&&group)url.searchParams.set('groupCode',group);
 url.searchParams.set('validFrom',year+'-01-01');url.searchParams.set('validTo',year+'-12-31');
 if(place.language)url.searchParams.set('languageIsoCode',place.language);
 return url.href;
}
export async function jsonFrom(url,fetcher=fetch){
 let response;
 try{response=await fetcher(url,{headers:{Accept:'application/json'}});}catch(e){throw new Error('A külső adatforrás nem érhető el (hálózat/CORS): '+new URL(url).hostname+'. '+(e?.message||''));}
 if(!response.ok)throw new Error(`Külső adatforrás: HTTP ${response.status} (${new URL(url).hostname}).`);
 return response.json();
}
export async function openSubdivisionList(country,fetcher=fetch){
 return jsonFrom(OPENHOLIDAYS+'/Subdivisions?countryIsoCode='+encodeURIComponent(country),fetcher);
}
export async function openGroups(country,fetcher=fetch){
 return jsonFrom(OPENHOLIDAYS+'/Groups?countryIsoCode='+encodeURIComponent(country),fetcher);
}
export async function openHolidayEvents(place,from,to,{fetcher=fetch,progress=()=>{},group=''}={}){
 const events=[],sources=[],notes=[],coverage=[];
 for(let year=from;year<=to;year++){
  for(const [endpoint,kind] of [['PublicHolidays','public'],['SchoolHolidays','school']]){
   const url=openHolidayUrl(endpoint,place,year,group);
   let arr=[],reason='',statutory=false;
   if(year<2020){
    reason='Az OpenHolidays dokumentált időbeli lefedettsége 2020-tól kezdődik.';
   }else{
    progress(`${place.name}: ${year} / ${endpoint}`);
    try{arr=normalizeApi(await jsonFrom(url,fetcher),kind,place);}
    catch(e){reason=e?.message||String(e);}
    if(!arr.length&&!reason)reason='Az adatforrás erre az évre és területre nem adott használható eseményt.';
   }
   if(!arr.length&&kind==='public'&&place.country==='HU'&&year>=2017){
    arr=hungarianStatutoryHolidays(year);
    statutory=true;
    if(!sources.includes(HU_LAW))sources.push(HU_LAW);
    if(!sources.includes(HU_GOOD_FRIDAY))sources.push(HU_GOOD_FRIDAY);
   }
   if(arr.length){
    events.push(...arr);
    if(!statutory)sources.push(url);
    coverage.push({year,kind,status:statutory?'jogszabályi számítás':'API',count:arr.length});
    if(statutory)notes.push(`${year}: a magyar munkaszüneti napok jogszabályi szabályok alapján kiszámítva; a szabály és a későbbi jogváltozások ellenőrzendők.`);
   }else{
    coverage.push({year,kind,status:'HIÁNYZIK',count:0,reason,url});
    notes.push(`${year}: ${kind==='school'?'iskolaszünetek':'munkaszüneti napok'} HIÁNYOZNAK (${reason}).`);
   }
  }
 }
 if(!events.length)throw new Error(`${place.name}, ${from}–${to}: az adatforrás nem adott alkalmazható eseményt. A timezone.txt külön elkészíthető, a Holidays.txt-hez saját, ellenőrzött adat szükséges.`);
 return {events,sources:[...new Set(sources)],notes,coverage,incomplete:coverage.some(x=>x.status==='HIÁNYZIK')};
}

/* Hungarian nationwide statutory holidays, not school breaks. The 2017 law added Good Friday. */
const HU_LAW='https://njt.jog.gov.hu/jogszabaly/2012-1-00-00';
const HU_GOOD_FRIDAY='https://njt.jog.gov.hu/jogszabaly/2017-13-00-00';
function huEasterSunday(year){
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7;
 const m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31);
 const day=((h+l-7*m+114)%31)+1;
 return Date.UTC(year,month-1,day);
}
const huYmd=t=>new Date(t).toISOString().slice(0,10).replaceAll('-','');
export function hungarianStatutoryHolidays(year){
 if(!Number.isInteger(year)||year<2017||year>2098)return [];
 const easter=huEasterSunday(year),day=86400000;
 const fixed=[['0101','Újév'],['0315','Nemzeti ünnep'],['0501','A munka ünnepe'],['0820','Államalapítás ünnepe'],['1023','Nemzeti ünnep'],['1101','Mindenszentek'],['1225','Karácsony első napja'],['1226','Karácsony második napja']];
 const variable=[[huYmd(easter-2*day),'Nagypéntek'],[huYmd(easter+day),'Húsvéthétfő'],[huYmd(easter+50*day),'Pünkösdhétfő']];
 return [...fixed.map(([md,name])=>({kind:'public',start:String(year)+md,end:String(year)+md,name})),
         ...variable.map(([date,name])=>({kind:'public',start:date,end:date,name}))];
}

const GOV_AREA={'GB-EAW':'england-and-wales','GB-SCT':'scotland','GB-NIR':'northern-ireland'};
const NAGER_AREAS={'GB-EAW':['GB-ENG','GB-WLS','GB-EAW'],'GB-SCT':['GB-SCT'],'GB-NIR':['GB-NIR']};
export function officialUKEvents(data,area,from,to){
 const block=data?.[GOV_AREA[area]];
 if(!Array.isArray(block?.events))throw new Error('A GOV.UK válasza nem tartalmazza a kért országrész ünnepeit.');
 return block.events.filter(x=>typeof x.date==='string'&&x.date.slice(0,4)>=String(from)&&x.date.slice(0,4)<=String(to)).map(x=>({kind:'public',start:x.date.replaceAll('-',''),end:x.date.replaceAll('-',''),name:x.title||'Bank holiday'}));
}
export function nagerUKEvents(data,area,year){
 if(!Array.isArray(data))throw new Error('A Nager.Holidays válasza érvénytelen.');
 const areas=NAGER_AREAS[area];if(!areas)throw new Error('Válassz egy brit országrészt (Anglia és Wales, Skócia vagy Észak-Írország).');
 return data.filter(x=>(x.holidayTypes||[]).some(t=>['Public','Bank'].includes(t))&&(x.nationalHoliday===true||(Array.isArray(x.subdivisionCodes)&&x.subdivisionCodes.some(code=>areas.includes(code))))).filter(x=>x.date?.startsWith(String(year))).map(x=>({kind:'public',start:x.date.replaceAll('-',''),end:x.date.replaceAll('-',''),name:x.name||'Bank holiday'}));
}
export async function ukHolidayEvents(place,from,to,{fetcher=fetch,progress=()=>{}}={}){
 const area=place.subdivision;
 if(!GOV_AREA[area])throw new Error('Az Egyesült Királysághoz válassz országrészt.');
 let official=[],officialOk=false,govFailure='';
 try{progress('GOV.UK: közzétett bank holidays');official=officialUKEvents(await jsonFrom(UK_GOV_URL,fetcher),area,from,to);officialOk=true;}catch(e){govFailure=e.message;}
 const events=[],sources=[],notes=['Az Egyesült Királyságban az iskolaszünetek helyi hatáskörűek. Ezeket külön CSV-ből kell hozzáadni; a program nem talál ki iskolai szüneteket.'];
 for(let year=from;year<=to;year++){
  let subset=official.filter(e=>e.start.startsWith(String(year)));
  if(subset.length){events.push(...subset);if(!sources.includes(UK_GOV_URL))sources.push(UK_GOV_URL);continue;}
  progress(`Nager.Holidays: ${year} / ${area}`);
  const url=`${NAGER_BASE}/GB/${year}`;
  try{const data=await jsonFrom(url,fetcher);subset=nagerUKEvents(data,area,year);}
  catch(e){throw new Error(`${year}: sem a GOV.UK, sem a Nager.Holidays adat nem elegendő: ${govFailure||''} ${e.message}`);}
  if(!subset.length)throw new Error(`${year}: nincs használható bank holiday a(z) ${area} térséghez. Nem állítok elő üres, félrevezető Holidays.txt fájlt.`);
  events.push(...subset);sources.push(url);
 }
 if(sources.some(s=>s!==UK_GOV_URL))notes.push('Egyes éveknél a GOV.UK helyett a Nager.Holidays közlését használtam; ellenőrzés ajánlott.');
 if(!officialOk)notes.push('A hivatalos GOV.UK adatkészletet a böngésző nem érte el.');
 return {events,sources,notes};
}
export function builtinCityEvents(place,from,to){
 const out=[];
 // Augsburger Hohes Friedensfest is a legally recognized city holiday, not a Bavarian statewide holiday.
 if(place.country==='DE'&&place.name==='Augsburg'&&place.citySelected){
  for(let y=from;y<=to;y++)out.push({kind:'public',start:y+'0808',end:y+'0808',name:'Augsburger Hohes Friedensfest'});
 }
 return out;
}
