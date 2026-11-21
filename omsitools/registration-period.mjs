/* Historical, multi-period, multi-class OMSI registrations.
 * Issuance and on-road appearance are separate modes.
 * Rows are synthetic and individually unique; metadata never put into registrations.txt.
 */
import {PLATE_SYSTEMS,AREA_OPTIONS,FICTIONAL_AREAS,historicalPlateRng,historicalPlateVariant,historicalPlateAreas} from './registrations.mjs';
import {plateDateRange,activeOn,legallyVisibleOn} from './registration-history.mjs';
import {VEHICLE_CATEGORIES,specialRulesFor,generateCategoryPlate} from './registration-special.mjs';

const allCategories=new Set(VEHICLE_CATEGORIES.map(x=>x[0]));
const date=(y,m)=>String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-15';
const startDay=(y,m)=>String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-01';
const endDay=(y,m)=>String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+new Date(Date.UTC(y,m,0)).getUTCDate();
function monthsBetween(fromYear,fromMonth,toYear,toMonth){
 const r=[];
 for(let idx=fromYear*12+fromMonth-1;idx<=toYear*12+toMonth-1;idx++){
  r.push({year:Math.floor(idx/12),month:idx%12+1,idx});
 }
 return r;
}
function pickWeighted(r,items){
 const sum=items.reduce((n,x)=>n+x.weight,0);
 let value=r()*sum;
 for(const item of items){value-=item.weight;if(value<0)return item;}
 return items.at(-1);
}
function validateCategoryInput(raw){
 const incoming=raw&&typeof raw==='object'?raw:{civil:{enabled:true,weight:100}};
 const entries=[];
 for(const [kind,field] of Object.entries(incoming)){
  if(!allCategories.has(kind))throw Error('Ismeretlen járműkategória: '+kind);
  if(!field||field.enabled===false)continue;
  const weight=Number(field.weight??1);
  if(!Number.isInteger(weight)||weight<1||weight>1000)throw Error('A(z) '+kind+' kategória súlya 1–1000 közötti egész lehet.');
  const template=String(field.template||'').trim();
  if(template.length>110)throw Error('A(z) '+kind+' sablon túl hosszú.');
  const areaOverride=String(field.areas||'').trim();
  if(areaOverride.length>500)throw Error('A(z) '+kind+' területkód-listája túl hosszú.');
  entries.push({kind,weight,template,areaOverride});
 }
 if(!entries.length)throw Error('Engedélyezz legalább egy járműkategóriát.');
 return entries;
}
function schemeEligibleForCountry(s,country,areas){
 if(s.country!==country)return false;
 if(country==='DE'&&s.id==='DE_WB'&&!areas.some(x=>x.code==='B'))return false;
 if(country==='DE'&&s.id==='DE_FRG'&&areas.length&&areas.every(x=>x.code==='B'))return false;
 return true;
}
function normalizedDateInputs(opts){
 const yearFrom=Number(opts.fromYear??opts.year??1986),yearTo=Number(opts.toYear??opts.year??yearFrom);
 const monthFrom=Number(opts.fromMonth??1),monthTo=Number(opts.toMonth??12);
 if(!Number.isInteger(yearFrom)||!Number.isInteger(yearTo)||yearFrom<1950||yearTo>2099||yearFrom>yearTo)throw Error('A rendszám-időszak 1950 és 2099 közé essen, növekvő évhatárokkal.');
 if(!Number.isInteger(monthFrom)||!Number.isInteger(monthTo)||monthFrom<1||monthFrom>12||monthTo<1||monthTo>12)throw Error('A hónapok 1 és 12 közötti egész számok lehetnek.');
 const fromIdx=yearFrom*12+monthFrom-1,toIdx=yearTo*12+monthTo-1;
 if(fromIdx>toIdx)throw Error('Az időszak kezdete későbbi, mint a vége.');
 if(toIdx-fromIdx>1200)throw Error('Legfeljebb 100 évnyi időszakot válassz egyszerre.');
 return {yearFrom,yearTo,monthFrom,monthTo,fromIdx,toIdx,from:startDay(yearFrom,monthFrom),to:endDay(yearTo,monthTo)};
}
export function availablePeriodSystems(country){
 return PLATE_SYSTEMS.filter(s=>s.country===country).map(s=>({...s,history:plateDateRange(s.id)}));
}
function checkSchemeAreaForPeriod(id,raw){
 try{
  const normalized=historicalPlateAreas(raw,id);
  // Distinct regional schemes must never borrow a different country's recognised prefixes.
  // Unregistered codes are allowed only as explicitly user-supplied fictional OMSI areas.
  if(id==='UK_NI')return normalized.filter(x=>(AREA_OPTIONS.UK_NI||[]).some(a=>a[0]===x.code));
  if(id==='DE_WB')return normalized.filter(x=>x.code==='B');
  return normalized;
 }
 catch{return null;}
}
function poolForScheme(s,mode,interval,ageYears){
 const h=plateDateRange(s.id);
 if(mode==='issue'){
  const minimum=Math.max(interval.fromIdx,Number(h.from.slice(0,4))*12+Number(h.from.slice(5,7))-1);
  const maximum=Math.min(interval.toIdx,h.to?Number(h.to.slice(0,4))*12+Number(h.to.slice(5,7))-1:interval.toIdx);
  if(maximum<minimum)return [];
  return monthsBetween(Math.floor(minimum/12),minimum%12+1,Math.floor(maximum/12),maximum%12+1)
    .filter(m=>activeOn(s.id,date(m.year,m.month))).map(m=>({...m,scheme:s.id,weight:1}));
 }
 const sceneIdx=mode==='street_all'?interval.fromIdx:interval.toIdx;
 const endOfStreet=mode==='street_all'?interval.to:date(Math.floor(sceneIdx/12),sceneIdx%12+1);
 const minimum=Math.max(Number(h.from.slice(0,4))*12+Number(h.from.slice(5,7))-1,sceneIdx-ageYears*12);
 const maximum=Math.min(sceneIdx,h.to?Number(h.to.slice(0,4))*12+Number(h.to.slice(5,7))-1:sceneIdx);
 if(maximum<minimum)return [];
 return monthsBetween(Math.floor(minimum/12),minimum%12+1,Math.floor(maximum/12),maximum%12+1)
  .filter(m=>activeOn(s.id,date(m.year,m.month))&&legallyVisibleOn(s.id,date(m.year,m.month),endOfStreet))
  .map(m=>({...m,scheme:s.id,weight:Math.max(0.04,Math.exp(-(sceneIdx-m.idx)/(12*13)))}));
}
function categoryEntries(categories,schemes,interval,mode,ageYears,options){
 const out=[],notes=[];
 for(const c of categories){
  let pool=[],customAreaCount=0;
  for(const s of schemes){
   const overrides=c.areaOverride?c.areaOverride:options.areas;
   const arr=checkSchemeAreaForPeriod(s.id,overrides);
   if(!arr||!arr.length)continue;
   const periods=poolForScheme(s,mode,interval,ageYears);
   for(const m of periods){
    let supported=!!c.template||c.kind==='civil';
    if(!supported)supported=arr.some(x=>specialRulesFor(s.id,c.kind,m.year,x.code,{allowOrdinary:!!options.allowOrdinary,month:m.month,scheme:s.id})?.kind==='documented');
    if(!supported&&options.allowOrdinary){
     supported=arr.some(x=>specialRulesFor(s.id,c.kind,m.year,x.code,{allowOrdinary:true,month:m.month,scheme:s.id})!==null);
    }
    if(!supported)continue;
    // Certain historical service plates were mandatorily replaced and cannot appear indefinitely.
    if(mode!=='issue'&&!c.template){
      const sceneTo=mode==='street_all'?interval.to:date(Math.floor(interval.toIdx/12),interval.toIdx%12+1);
      const usable=arr.some(a=>{
        const rule=specialRulesFor(s.id,c.kind,m.year,a.code,{month:m.month,scheme:s.id,allowOrdinary:!!options.allowOrdinary});
        return rule&&(!rule.visibleTo||sceneTo<=rule.visibleTo);
      });
      if(!usable)continue;
    }
    pool.push({...m,areas:arr,weight:m.weight});
   }
   customAreaCount+=arr.length;
  }
  if(pool.length)out.push({...c,pool,weight:c.weight,areasCount:customAreaCount});
  else notes.push('A(z) '+c.kind+' kategóriához a megadott országban és időszakban nincs forrásolt rendszámszabály'+(c.template?' vagy érvényes területi kód':'')+'. Nem generálok kitalált sorozatot.');
 }
 return {entries:out,notes};
}
export function generateHistoricalRegistrations(opts={}){
 const country=String(opts.country||'DE').toUpperCase(),period=normalizedDateInputs(opts);
 const count=Number(opts.count??1000),mode=String(opts.mode||'issue'),sep=opts.separator===' '? ' ':'-';
 if(!['issue','street_any','street_all'].includes(mode))throw Error('Az összeállítás módja legyen: új kiadás, időszakban előforduló vagy végig jelen lévő.');
 if(!['-',' '].includes(opts.separator||'-'))throw Error('Az elválasztójel csak kötőjel vagy szóköz lehet.');
 if(!Number.isInteger(count)||count<1||count>100000)throw Error('A kért sorok száma 1–100 000 közötti egész lehet.');
 const ageYears=Number(opts.maxAge??30);
 if(!Number.isInteger(ageYears)||ageYears<1||ageYears>80)throw Error('A közúti továbbhasználat becsült felső korhatára 1–80 év lehet.');
 const all=PLATE_SYSTEMS.filter(x=>x.country===country);
 if(!all.length)throw Error('Ehhez az országhoz még nincs rendszámsablon.');
 const scheme=String(opts.scheme||'AUTO');
 const permitted=scheme==='AUTO'?all:all.filter(x=>x.id===scheme);
 if(!permitted.length)throw Error('A kiválasztott rendszámrendszer nem ehhez az országhoz tartozik.');
 const rawAreas=opts.areas||[];
 const hasArea=permitted.some(x=>x.area);
 const arealist=Array.isArray(rawAreas)?rawAreas.map(x=>typeof x==='string'?{code:x.split(':')[0].toUpperCase()}:x):[];
 const schemes=permitted.filter(x=>scheme!=='AUTO'||schemeEligibleForCountry(x,country,arealist));
 const cats=validateCategoryInput(opts.categories),{entries,notes:categoryNotes}=categoryEntries(cats,schemes,period,mode,ageYears,opts);
 if(!entries.length)throw Error('Nincs az adott időszakban, területen és kategóriákban érvényes generálható rendszám. Válassz másik korszakot vagy engedélyezd a normál rendszámú járműveket.');
 const rng=historicalPlateRng([opts.seed||'regionalbahn',country,scheme,period.from,period.to,mode,JSON.stringify(cats),JSON.stringify(rawAreas)].join('|'));
 const unique=new Set(),rows=[],details=[],usedCategory=new Map(),usedScheme=new Map(),usedArea=new Map(),seenSources=new Set(),warnings=[...categoryNotes],cap=Math.max(10000,count*180);
 for(let attempt=0;rows.length<count&&attempt<cap;attempt++){
  const category=pickWeighted(rng,entries);
  const item=pickWeighted(rng,category.pool);
  const area=pickWeighted(rng,item.areas.map(x=>({code:x.code,weight:x.weight}))).code;
  const manual=category.template;
  const plateFn=()=>historicalPlateVariant({scheme:item.scheme,area,year:item.year,month:item.month,separator:sep},rng);
  const result=generateCategoryPlate({scheme:item.scheme,category:category.kind,area,year:item.year,month:item.month,separator:sep,random:rng,defaultPlate:plateFn,customPattern:manual,allowOrdinary:!!opts.allowOrdinary});
  if(!result||unique.has(result.plate))continue;
  if(result.plate.length>35)continue;
  unique.add(result.plate);
  rows.push(result.plate);
  const info={plate:result.plate,category:category.kind,scheme:item.scheme,area,issueYear:item.year,issueMonth:item.month,
   rule:result.rule.title,quality:result.rule.confidence,source:result.rule.source||''};
  details.push(info);
  usedCategory.set(category.kind,(usedCategory.get(category.kind)||0)+1);
  usedScheme.set(item.scheme,(usedScheme.get(item.scheme)||0)+1);
  usedArea.set(area,(usedArea.get(area)||0)+1);
  if(info.source)seenSources.add(info.source);
  if(result.rule.note&&!warnings.includes(result.rule.note))warnings.push(result.rule.note);
 }
 if(rows.length<count)throw Error('A kívánt '+count+' egyedi kombinációból csak '+rows.length+' állítható elő. Csökkentsd a darabszámot, bővítsd a területeket, vagy adj hozzá új kategóriát.');
 const years=[...new Set(details.map(x=>x.issueYear))].sort((a,b)=>a-b);
 for(const id of [...usedScheme.keys()]){
  const s=plateDateRange(id);
  if(s.warning&&!warnings.includes(s.warning))warnings.push(s.warning);
  if(!['official','published'].includes(s.confidence))warnings.push('A(z) '+id+' történeti kezdő- és végdátuma nem minden részletében bizonyított ('+s.confidence+').');
  if(s.source)seenSources.add(s.source);
 }
 if(mode!=='issue')warnings.push('Utcakép mód: korábban kiadott, tovább használható rendszámok becsült jelenléte. A kor szerinti gyakoriság nem nyilvántartási statisztika.');
 warnings.push('A kategóriák súlyai saját OMSI-forgalmi beállítások, nem valós járműösszetételi statisztikák.');
 if(hasArea&&arealist.length&&arealist.some(x=>['AH','TH','HER','WIN'].includes(x.code)))warnings.push('A fiktív körzetkódok az OMSI-pályákhoz valók, nem hatósági kiosztások.');
 if([...usedCategory.keys()].some(x=>x!=='civil'))warnings.push('Különleges járművek: a rendszám színét, címereit, alakját és matricáit a .txt fájl nem kódolja; a járműmod kinézete külön ellenőrzendő.');
 return {text:rows.join('\r\n')+'\r\n',rows,details,mode,period,count,usedYears:years,
  categories:[...usedCategory].map(([category,count])=>({category,count})),
  schemes:[...usedScheme].map(([id,count])=>({id,count})),
  territories:[...usedArea].map(([code,count])=>({code,count})),
  sources:[...seenSources],warnings,quality:details.reduce((acc,x)=>(acc[x.quality]=(acc[x.quality]||0)+1,acc),{})};
}
export function historicalReport(result,opts={}){
 const lines=['OMSI Tools – registrations.txt történeti ellenőrzési jegyzőkönyv','',
 'Kiválasztott ország: '+String(opts.country||'DE'),
 'Időszak: '+result.period.from+' – '+result.period.to,
 'Üzemmód: '+result.mode,
 'Egyedi rendszámok: '+result.count,
 'Az állomány egy szintetikus OMSI-összeállítás, nem ténylegesen kiadott rendszámjegyzék.','',
 'Kategóriák:'];
 for(const x of result.categories)lines.push(' - '+x.category+': '+x.count);
 lines.push('','Történeti sorozatok:');
 for(const x of result.schemes)lines.push(' - '+x.id+': '+x.count);
 lines.push('','Területek:');
 for(const x of result.territories)lines.push(' - '+(x.code||'országos')+': '+x.count);
 lines.push('','Forráskritikai figyelmeztetések:');
 for(const w of result.warnings)lines.push(' - '+w);
 lines.push('','Források:');
 for(const url of result.sources)lines.push(' - '+url);
 lines.push('','Tételes adatok a külön metaadat-CSV fájlban érhetők el, nem az OMSI registrations.txt állományban.');
 return lines.join('\r\n')+'\r\n';
}
export function historicalCSV(result){
 const val=x=>'"'+String(x??'').replaceAll('"','""')+'"';
 const lines=['rendszam;kategoria;rendszer;terulet;kiadas_eve;kiadas_honapja;szabaly;minoseg;forras'];
 for(const x of result.details){
  lines.push([x.plate,x.category,x.scheme,x.area,x.issueYear,x.issueMonth,x.rule,x.quality,x.source].map(val).join(';'));
 }
 return '\uFEFF'+lines.join('\r\n')+'\r\n';
}
