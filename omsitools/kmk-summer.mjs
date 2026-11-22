/* KMK official state-by-state summer school holidays, 1970–2019.
 * No reproduction of the privately licensed Schulferien.org compilation.
 */
import {KMK_SUMMER_GROUPS} from './kmk-summer-data.mjs';
export const KMK_SUMMER_SOURCES=Object.freeze([
 'https://www.kmk.org/fileadmin/Dateien/pdf/Ferienkalender/Sommerferienregelung_1955bis2003.pdf',
 'https://www.kmk.org/fileadmin/Dateien/pdf/Ferienkalender/Sommerferienregelung_2004-2012.pdf',
 'https://www.kmk.org/fileadmin/Dateien/pdf/Ferienkalender/Sommerferienregelung_2011-2017.pdf',
 'https://www.kmk.org/fileadmin/Dateien/pdf/Ferienkalender/Sommerferienregelung_2018-2024.pdf'
]);
const holidayDates=new Map();
const fmt=(y,m,d)=>String(y)+m+d;
for(const [from,to,lines] of KMK_SUMMER_GROUPS){
 for(const line of lines){
  const split=line.split('|'),state=split[0],parts=(split[1]||'').split(/\s+/);
  if(parts.length!==to-from+1)throw Error('KMK hibás darabszám: '+state+' '+from+'/'+to);
  for(let i=0;i<parts.length;i++){
   const value=parts[i],year=from+i;
   if(value==='--')continue;
   const m=/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/.exec(value);
   if(!m)throw Error('KMK hibás dátum: '+state+' '+year+' '+value);
   const start=Date.UTC(year,Number(m[2])-1,Number(m[1])),end=Date.UTC(year,Number(m[4])-1,Number(m[3]));
   const length=(end-start)/86400000+1;
   if(length<25||length>85)throw Error('KMK valószínűtlen nyári szünet: '+state+' '+year+' '+value);
   holidayDates.set(state+':'+year,{start:fmt(year,m[2],m[1]),end:fmt(year,m[4],m[3]),year,state});
  }
 }
}
export const KMK_SUMMER_COUNT=holidayDates.size;
export const KMK_SOURCE_FOR_YEAR=year=>KMK_SUMMER_SOURCES[year<=2003?0:year<=2012?1:year<=2017?2:3];
export function kmkSummerHoliday(place,year,regime='REUNIFIED'){
 if(place?.country!=='DE'||!/DE-[A-Z]{2}/.test(place.subdivision||''))return null;
 if(regime==='GDR'&&year<=1990)return null;
 const state=place.subdivision.slice(3);
 const dates=holidayDates.get(state+':'+year);
 if(!dates)return null;
 return {kind:'school',start:dates.start,end:dates.end,name:'Sommerferien (KMK)',
  source:KMK_SOURCE_FOR_YEAR(year),certainty:'official-archive',schoolKind:'summer'};
}
export function kmkArchiveYears(state){
 return [...holidayDates.values()].filter(r=>r.state===state).map(r=>r.year).sort((a,b)=>a-b);
}
export function kmkArchiveDiagnostics(){
 const byState={};
 for(const d of holidayDates.values())byState[d.state]=(byState[d.state]||0)+1;
 return {total:holidayDates.size,byState,explicitOmissions:['HH:1976 – hibás KMK-nyomtatási adat: 18.08.–31.07.']};
}
