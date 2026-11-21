/* German historical calendars 1970-2019. The differentiated state baseline is intentionally marked partial.
 * All dates remain sourced/reviewable, particularly the 1990 transition.
 */
export const GERMAN_HISTORY_SOURCES=Object.freeze([
 'https://www.bundestag.de/dokumente/textarchiv/1954-06-17-einheit-283168',
 'https://www.gesetze-im-internet.de/feiertev/DDNR002480990.html',
 'https://www.datumsrechner.de/DATR.PDF',
 'https://www.kmk.org/service/ferienregelung.html',
 'https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/01_GRA_SGB/06_SGB_VI/pp_0051_75/p_0058/gra_sgb006_p_0058_abs1_s1_nr4_a03.html'
]);
const EAST=new Set(['DE-BB','DE-MV','DE-SN','DE-ST','DE-TH']);
const WEST=new Set(['DE-BW','DE-BY','DE-HB','DE-HH','DE-HE','DE-NI','DE-NW','DE-RP','DE-SL','DE-SH']);
const DAY=86400000;
function easter(year) {
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4;
 const l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451);
 const n=h+l-7*m+114;
 return Date.UTC(year,Math.floor(n/31)-1,(n%31)+1);
}
function ymd(ms){return new Date(ms).toISOString().slice(0,10).replace(/-/g,'');}
function fixed(y,mmdd,name){const date=String(y)+mmdd;return {kind:'public',start:date,end:date,name};}
function relative(y,ms,days,name){const date=ymd(ms+days*DAY);return {kind:'public',start:date,end:date,name};}
export function germanHistoricRegime(place,setting='auto',year=1985){
 if(place.country!=='DE')throw new Error('A történeti NDK/NSZK államválasztó csak Németországhoz alkalmazható.');
 if(!['auto','FRG','GDR'].includes(setting))throw new Error('Ismeretlen történeti állam.');
 const region=place.subdivision;
 if(setting==='auto'){
  if(EAST.has(region))return 'GDR';
  if(WEST.has(region))return 'FRG';
  throw new Error('A történeti német naptárhoz válassz egykori nyugati/keleti tartományt, vagy külön NSZK/NDK államot. Berlin 1990 előtt nem választható automatikusan.');
 }
 if(year<1991&&region&&region!=='DE-BE'){
  if(setting==='GDR'&&WEST.has(region))throw new Error('A kijelölt nyugatnémet tartományhoz nem használható NDK-naptár.');
  if(setting==='FRG'&&EAST.has(region))throw new Error('A kijelölt keletnémet térséghez nem használható NSZK-naptár.');
 }
 return setting;
}
function bussUndBettag(year){
 // Wednesday between 16 and 22 November (Wednesday preceding Totensonntag).
 const d=new Date(Date.UTC(year,10,22));
 const days=(d.getUTCDay()-3+7)%7;
 return ymd(Date.UTC(year,10,22-days));
}
const THREE_KINGS=new Set(['DE-BW','DE-BY']);
const CORPUS=new Set(['DE-BW','DE-BY','DE-HE','DE-NW','DE-RP','DE-SL']);
const ALL_SAINTS=new Set(['DE-BW','DE-BY','DE-NW','DE-RP','DE-SL']);
export function germanHistoricalPublic(year,regime,region=''){
 if(!Number.isInteger(year)||year<1970||year>2019)throw new Error('Történeti német évhatár: 1970–2019.');
 if(!['FRG','GDR','REUNIFIED'].includes(regime))throw new Error('Ismeretlen német állam-/korszakválasztás.');
 const e=easter(year),out=[];
 const push=(event)=>out.push(event);
 push(fixed(year,'0101','Neujahr'));
 push(relative(year,e,-2,'Karfreitag'));
 push(fixed(year,'0501',regime==='GDR'&&year<1990?'Internationaler Kampf- und Feiertag der Werktätigen':'Tag der Arbeit'));
 push(relative(year,e,50,'Pfingstmontag'));
 push(fixed(year,'1225','1. Weihnachtsfeiertag'));
 push(fixed(year,'1226','2. Weihnachtsfeiertag'));
 if(regime==='GDR'&&year<1990){
  push(relative(year,e,0,'Ostersonntag'));
  push(relative(year,e,49,'Pfingstsonntag'));
  push(fixed(year,'1007','Tag der Republik'));
  if(year===1975)push(fixed(year,'0509','Tag des Sieges (einmalig 1975)'));
  if(year===1985)push(fixed(year,'0508','Tag der Befreiung (einmalig 1985)'));
 }else{
  push(relative(year,e,1,'Ostermontag'));
  push(relative(year,e,39,'Christi Himmelfahrt'));
  if(regime==='GDR'&&year===1990){push(relative(year,e,0,'Ostersonntag'));push(relative(year,e,49,'Pfingstsonntag'));}
  if(year<1991&&regime==='FRG')push(fixed(year,'0617','Tag der deutschen Einheit (17. Juni)'));
  if(year>=1990)push(fixed(year,'1003','Tag der Deutschen Einheit (3. Oktober)'));
  if(year<1991&&regime==='FRG'){
   if(THREE_KINGS.has(region))push(fixed(year,'0106','Heilige Drei Könige'));
   if(CORPUS.has(region))push(relative(year,e,60,'Fronleichnam'));
   if(ALL_SAINTS.has(region))push(fixed(year,'1101','Allerheiligen'));
   if(region==='DE-SL')push(fixed(year,'0815','Mariä Himmelfahrt'));
  }
 }
 const sanitized=out;
 if(regime==='FRG'&&year<=1990&&region&&region!=='DE-BY')
  sanitized.push({kind:'public',start:bussUndBettag(year),end:bussUndBettag(year),name:'Buß- und Bettag'});
 return sanitized.sort((a,b)=>a.start.localeCompare(b.start));
}
// School holidays in the GDR were national; explicit 1970 records from archived calendars.
// A complete archive import is needed for other historical school years.
const DDR_SCHOOLS_1970=[
 ['19691220','19700104','Ferien zum Jahreswechsel'],
 ['19700207','19700301','Winterferien'],
 ['19700501','19700510','Frühjahrsferien'],
 ['19700704','19700831','Sommerferien'],
 ['19701010','19701018','Herbstferien'],
 ['19701219','19710103','Ferien zum Jahreswechsel']
];
export const DDR_SCHOOL_1970_SOURCE='https://www.schulferien.org/ddr/ferien/1969_1970/';
export const DDR_SCHOOL_1970_NEXT_SOURCE='https://www.schulferien.org/ddr/ferien/1970_1971/';
export function germanHistoricalSchool(year,regime){
 return regime==='GDR'&&year===1970?DDR_SCHOOLS_1970.map(([start,end,name])=>({kind:'school',start,end,name})):[];
}
export function germanHistoricalYear(place,year,setting='auto'){
 const regime=year>1990?'REUNIFIED':germanHistoricRegime(place,setting,year);
 const events=germanHistoricalPublic(year,regime,place.subdivision);
 const school=germanHistoricalSchool(year,regime);
 const transition=year===1990;
 const publicStatus=regime==='GDR'&&year<1990?'TÖRTÉNETI SZABÁLY':'RÉSZLEGES';
 const notes=[
  transition?'1990 átmeneti év: a 3. októberi újraegyesítés és a májusi NDK-ünneprendelet miatt helyi szabályok ellenőrzendők.':
  regime==='REUNIFIED'?'1991–2019: csak a német országos ünnepnapi alap. A tartományi és helyi eltéréseket külön archív forrásból kell pótolni.':
  regime==='FRG'?'Az NSZK tartományi, felekezeti és városi ünnepnapjai nem mindenütt igazoltak teljeskörűen; a naptár részleges.':
  'Az NDK 1967 utáni általános munkaszüneti napjainak történeti rekonstrukciója.',
  year===1970&&regime==='GDR'?'Az 1970-es NDK-iskolaszünetek történeti naptárból átvett dátumai másodlagos források, további levéltári ellenőrzés ajánlott.':
  'Történeti iskolaszünetekhez teljes, hiteles évenkénti szünidei jegyzék szükséges.'
 ];
 return {events:[...events,...school],
   coverage:[
    {year,kind:'public',status:publicStatus,count:events.length,reason:publicStatus==='RÉSZLEGES'?'A regionális történeti szabályok és az átmenet ellenőrzendő.':''},
    {year,kind:'school',status:school.length?'RÉSZLEGES':'HIÁNYZIK',count:school.length,
     reason:school.length?'Másodlagos forrás; archív ellenőrzés szükséges.':'Nincs teljes igazolt iskolaszüneti adatkészlet.'}
   ],
   notes,sources:[...GERMAN_HISTORY_SOURCES,...(school.length?[DDR_SCHOOL_1970_SOURCE,DDR_SCHOOL_1970_NEXT_SOURCE]:[])]};
}
