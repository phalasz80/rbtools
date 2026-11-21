/* Synthetic registrations for OMSI only. No database verification, no real plate allocation claims. */
export const PLATE_SYSTEMS=Object.freeze([
 {id:'HU_OLD',country:'HU',title:'Magyarország · ABC-123 (1990–2022)',start:1990,end:2022,example:'ABC-123'},
 {id:'HU_NEW',country:'HU',title:'Magyarország · AB-CD 123 (2022-től)',start:2022,end:2099,example:'AB-CD 123'},
 {id:'CS_OLD',country:'CS',title:'Csehszlovákia · járáskódos (1960–1992)',start:1960,end:1992,area:true,example:'AB 12-34'},
 {id:'CZ_OLD',country:'CZ',title:'Csehország · régi járáskódos (1993–2001)',start:1993,end:2001,area:true,example:'ABA 12-34'},
 {id:'CZ_NEW',country:'CZ',title:'Csehország · régiókódos (2001-től)',start:2001,end:2099,area:true,example:'1A2 3456'},
 {id:'SK_OLD',country:'SK',title:'Szlovákia · járáskódos (1997–2022)',start:1997,end:2022,area:true,example:'BA-123AB'},
 {id:'SK_NEW',country:'SK',title:'Szlovákia · országos (2023-tól)',start:2023,end:2099,example:'AA 123AB'},
 {id:'AT_NEW',country:'AT',title:'Ausztria · kerületi (1990-től)',start:1990,end:2099,area:true,example:'W-12345 A'},
 {id:'CH_NEW',country:'CH',title:'Svájc · kantonális (jelenlegi)',start:1950,end:2099,area:true,example:'ZH 123456'},
 {id:'DE_NEW',country:'DE',title:'Németország · mai területi',start:1990,end:2099,area:true,example:'B-V 1234'},
 {id:'DE_FRG',country:'DE',title:'NSZK · 1970–1990',start:1970,end:1990,area:true,example:'HH-AB 1234'},
 {id:'DE_WB',country:'DE',title:'Nyugat-Berlin · 1970–1990',start:1970,end:1990,area:true,example:'B-V 1234'},
 {id:'DE_GDR_OLD',country:'DD',title:'NDK · 1970–1974 (kétbetűs)',start:1970,end:1974,area:true,example:'IA 12-34'},
 {id:'DE_GDR_NEW',country:'DD',title:'NDK · 1974–1990 (hárombetűs)',start:1974,end:1990,area:true,example:'IAA 1-23'},
 {id:'FR_FNI',country:'FR',title:'Franciaország · régi département (2009-ig)',start:1950,end:2009,area:true,example:'1234 AB 75'},
 {id:'FR_SIV',country:'FR',title:'Franciaország · AA-123-AA (2009-től)',start:2009,end:2099,example:'AB-123-CD'},
 {id:'UK_SUFFIX',country:'GB',title:'Egyesült Királyság · suffix (1963–1983)',start:1963,end:1983,example:'ABC 123A'},
 {id:'UK_PREFIX',country:'GB',title:'Egyesült Királyság · prefix (1983–2001)',start:1983,end:2001,example:'A123 ABC'},
 {id:'UK_CURRENT',country:'GB',title:'Egyesült Királyság · AB12 CDE (2001-től)',start:2001,end:2099,area:true,example:'LA12 ABC'},
 {id:'RS_NEW',country:'RS',title:'Szerbia · területi (2011-től)',start:2011,end:2099,area:true,example:'BG 123-AB'},
 {id:'HR_NEW',country:'HR',title:'Horvátország · területi (jelenlegi)',start:1992,end:2099,area:true,example:'ZG 1234-AB'}
]);
export const AREA_OPTIONS=Object.freeze({
 CS_OLD:[['AB','Prága környéke, demonstráció'],['BA','Bratislava, korabeli kód ellenőrizendő'],['OV','Ostrava'],['KE','Košice']],
 CZ_OLD:[['AB','Praha, régi járáskód szimuláció'],['BR','Brno, szimuláció'],['OV','Ostrava, szimuláció'],['PL','Plzeň, szimuláció']],
 CZ_NEW:[['A','Praha'],['B','Dél-Morvaország'],['T','Morva-Szilézia'],['P','Plzeň'],['S','Közép-Csehország'],['L','Liberec'],['C','Dél-Csehország'],['K','Karlovy Vary'],['E','Pardubice'],['H','Hradec Králové'],['J','Vysočina'],['M','Olomouc'],['Z','Zlín'],['U','Ústí nad Labem']],
 SK_OLD:[['BA','Bratislava'],['BL','Bratislava (későbbi kód)'],['KE','Košice'],['PO','Prešov'],['ZA','Žilina'],['NR','Nitra'],['TT','Trnava'],['TN','Trenčín'],['BB','Banská Bystrica']],
 AT_NEW:[['W','Wien'],['G','Graz'],['L','Linz'],['S','Salzburg'],['I','Innsbruck'],['K','Klagenfurt'],['P','St. Pölten'],['WN','Wiener Neustadt'],['MD','Mödling'],['B','Bregenz'],['DO','Dornbirn'],['IL','Innsbruck-Land']],
 CH_NEW:[['ZH','Zürich'],['BE','Bern'],['BS','Basel-Stadt'],['BL','Basel-Landschaft'],['GE','Genève'],['VD','Vaud'],['LU','Luzern'],['AG','Aargau'],['SG','St. Gallen'],['TI','Ticino'],['GR','Graubünden'],['ZG','Zug']],
 DE_NEW:[['B','Berlin'],['HH','Hamburg'],['M','München'],['K','Köln'],['F','Frankfurt am Main'],['S','Stuttgart'],['D','Düsseldorf'],['L','Leipzig'],['DD','Dresden'],['ER','Erlangen'],['W','Wuppertal']],
 DE_FRG:[['B','Berlin (Nyugat)'],['HH','Hamburg'],['M','München'],['K','Köln'],['F','Frankfurt am Main'],['S','Stuttgart'],['D','Düsseldorf'],['E','Essen'],['DO','Dortmund'],['W','Wuppertal']],
 DE_WB:[['B','Nyugat-Berlin']],
 DE_GDR_OLD:[['I','Berlin'],['R','Dresden'],['S','Leipzig'],['T','Karl-Marx-Stadt'],['D','Potsdam'],['E','Frankfurt (Oder)'],['Z','Cottbus'],['L','Erfurt'],['N','Gera'],['O','Suhl'],['C','Neubrandenburg'],['H','Magdeburg'],['K','Halle']],
 DE_GDR_NEW:[['I','Berlin'],['R','Dresden'],['S','Leipzig'],['T','Karl-Marx-Stadt'],['D','Potsdam'],['E','Frankfurt (Oder)'],['Z','Cottbus'],['L','Erfurt'],['N','Gera'],['O','Suhl'],['C','Neubrandenburg'],['H','Magdeburg'],['K','Halle']],
 FR_FNI:[['75','Paris'],['92','Hauts-de-Seine'],['93','Seine-Saint-Denis'],['94','Val-de-Marne'],['69','Rhône'],['13','Bouches-du-Rhône'],['59','Nord'],['67','Bas-Rhin'],['33','Gironde'],['06','Alpes-Maritimes'],['2A','Corse-du-Sud'],['2B','Haute-Corse']],
 UK_CURRENT:[['LA','London'],['LB','London'],['MA','Manchester'],['BA','Birmingham'],['CA','Cardiff'],['SA','Glasgow / Scotland region, verify'],['YA','Leeds / Yorkshire region']],
 RS_NEW:[['BG','Beograd'],['NS','Novi Sad'],['NI','Niš'],['KG','Kragujevac'],['SU','Subotica'],['PA','Pančevo'],['CA','Čačak (ASCII-átírás, nem hivatalos formátum)']],
 HR_NEW:[['ZG','Zagreb'],['ST','Split'],['RI','Rijeka'],['OS','Osijek'],['PU','Pula'],['ZD','Zadar'],['DU','Dubrovnik'],['KA','Karlovac']]
});
export const FICTIONAL_AREAS=Object.freeze([['AH','Ahlheim'],['TH','Thüringer Wald'],['HER','Herrenhofen'],['WIN','Winsenburg']]);
export const REGISTRATION_SOURCES=Object.freeze([
 'https://dvlaregistrations.dvla.gov.uk/preview/?registration=EU27+CDE',
 'https://www.service-public.fr/particuliers/vosdroits/demarches-et-outils/interrogation-fourriere',
 'https://www.oesterreich.gv.at/de/themen/mobilitaet/kfz/5/1',
 'https://www.kennzeichenwelt.de/die-ehemalige-ddr',
 'https://njt.jog.gov.hu/jogszabaly/2011-326-20-22.74'
]);
const ALPHA='ABCDEFGHJKLMNPRSTUVWXYZ',VOWELS='AEIOU',CONS='BCDFGHJKLMNPRSTVWXYZ';
function seedFrom(x){let h=2166136261;for(const ch of String(x)){h=Math.imul(h^ch.charCodeAt(0),16777619);}return h>>>0;}
function rng(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function pick(r,a){return a[Math.floor(r()*a.length)];}
function letters(r,n=2,alphabet=ALPHA){let s='';for(let i=0;i<n;i++)s+=pick(r,alphabet);return s;}
function digits(r,n=3,firstZero=false){let s='';for(let i=0;i<n;i++)s+=String(Math.floor(r()*(i===0&&!firstZero?9:10))+(i===0&&!firstZero?1:0));return s;}
function number(r,max=9999,min=1){return String(Math.floor(r()*(max-min+1))+min);}
export function readAreas(text){return String(text||'').split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean).map(v=>{const m=/^(.+?)(?::([1-9][0-9]*))?$/.exec(v);if(!m)throw Error('Hibás területkód: '+v);return {code:m[1].trim().toUpperCase(),weight:Math.min(1000,Number(m[2]||1))};});}
function normalizeAreas(values,system){
 if(!system.area)return [{code:'',weight:1}];
 const arr=typeof values==='string'?readAreas(values):Array.isArray(values)?values.map(x=>typeof x==='string'?{code:x.toUpperCase(),weight:1}:{code:String(x.code||'').toUpperCase(),weight:Number(x.weight||1)}):[];
 if(!arr.length)throw Error('A rendszerhez legalább egy területkódot adj meg.');
 const valid=system.id==='FR_FNI'?/^[0-9]{2,3}$|^2[AB]$/:system.id.startsWith('DE_GDR')?/^[A-Z]$/:system.id==='CZ_NEW'?/^[A-Z]$/:system.id==='UK_CURRENT'?/^[A-Z]{2}$/:system.id==='CH_NEW'?/^[A-Z]{2}$/:/^[A-Z]{1,4}$/;
 const seen=new Map();
 for(const x of arr){if(!valid.test(x.code))throw Error('Nem megfelelő területkód ehhez a rendszerhez: '+x.code);
  if(!Number.isInteger(x.weight)||x.weight<1||x.weight>1000)throw Error('A területi súly 1–1000 közötti egész szám lehet.');
  seen.set(x.code,(seen.get(x.code)||0)+x.weight);
 }
 return [...seen].map(([code,weight])=>({code,weight}));
}
function pickArea(r,a){const total=a.reduce((s,x)=>s+x.weight,0);let t=r()*total;for(const x of a){t-=x.weight;if(t<0)return x.code;}return a.at(-1).code;}
function ageCode(year,secondHalf=false){const n=year%100;return String((n+(secondHalf?50:0))%100).padStart(2,'0');}
function registration(system,area,r,sep,year,half){
 const d=n=>digits(r,n),l=n=>letters(r,n),a=area;
 switch(system){
 case 'HU_OLD':return l(3)+sep+d(3);
 case 'HU_NEW':return letters(r,2,pick(r,[VOWELS,CONS]))+sep+l(2)+' '+d(3);
 case 'CS_OLD':return a+' '+d(2)+sep+d(2);
 case 'CZ_OLD':return a+l(1)+' '+d(2)+sep+d(2);
 case 'CZ_NEW':return digits(r,1)+a+digits(r,1,true)+' '+d(4);
 case 'SK_OLD':return a+sep+d(3)+l(2);
 case 'SK_NEW':return l(2)+sep+d(3)+l(2);
 case 'AT_NEW':return a+sep+d(a.length===1?5:4)+' '+l(1);
 case 'CH_NEW':return a+sep+number(r,999999);
 case 'DE_NEW':case 'DE_FRG':case 'DE_WB':{
  const nLetters=system==='DE_WB'?2:pick(r,[1,2]);
  const max=Math.min(4,8-a.length-nLetters);
  if(max<1)throw Error('A német kód túl hosszú a járműazonosítóhoz: '+a);
  const count=system==='DE_WB'?4:Math.min(max,Math.max(1,Math.floor(r()*max)+1));
  return a+sep+l(nLetters)+' '+digits(r,count);
 }
 case 'DE_GDR_OLD':return a+l(1)+' '+d(2)+sep+d(2);
 case 'DE_GDR_NEW':return a+l(2)+' '+d(1)+sep+d(2);
 case 'FR_FNI':return number(r,9999)+' '+l(2)+' '+a;
 case 'FR_SIV':return l(2)+sep+d(3)+sep+l(2);
 case 'UK_SUFFIX':return l(3)+' '+number(r,999)+l(1);
 case 'UK_PREFIX':return l(1)+number(r,999)+' '+l(3);
 case 'UK_CURRENT':return a+ageCode(year,half)+' '+l(3);
 case 'RS_NEW':return a+' '+d(3)+sep+l(2);
 case 'HR_NEW':return a+' '+d(4)+sep+l(2);
 default:throw Error('Nem támogatott rendszámrendszer: '+system);
 }
}
export function generateRegistrations(opts={}){
 const scheme=PLATE_SYSTEMS.find(x=>x.id===opts.scheme);
 if(!scheme)throw Error('Válassz rendszámrendszert.');
 const count=Number(opts.count||1000),year=Number(opts.year||2020),sep=opts.separator===' '? ' ':opts.separator==='-'?'-':null;
 if(!Number.isInteger(count)||count<1||count>100000)throw Error('A fájl 1–100 000 sort tartalmazhat.');
 if(!Number.isInteger(year)||year<scheme.start||year>scheme.end)throw Error('Az év nem illik a kiválasztott rendszerhez ('+scheme.start+'–'+scheme.end+').');
 if(!sep)throw Error('Válassz kötőjelet vagy szóközt elválasztónak.');
 const areas=normalizeAreas(opts.areas,scheme);
 const r=rng(seedFrom(String(opts.seed??'OMSI')+'|'+scheme.id+'|'+year+'|'+areas.map(x=>x.code+':'+x.weight).join(',')));
 const unique=new Set(),rows=[],occurrences=new Map(),notes=[];
 const permitted=system=>system.startsWith('DE_GDR')?'NDK':system==='DE_WB'?'Nyugat-Berlin':null;
 if(permitted(scheme.id))notes.push('A történeti NDK/NSZK-kombinációk regionális betűállománya egyszerűsített; nem minden sor igazolt történeti kiosztás.');
 if(scheme.id==='HU_NEW')notes.push('Az első betűpár azonos típusú magánhangzókból/mássalhangzókból áll; az egyedi sorozati kiadást nem ellenőrzi.');
 if(scheme.id==='FR_SIV'||scheme.id==='UK_CURRENT')notes.push('Az új francia/brit rendszerben a tényleges regisztrációhoz nincs kötelező département/területkód azonosítással.');
 if(sep==='-'&&['CH_NEW','FR_SIV','DE_GDR_NEW','DE_GDR_OLD','UK_CURRENT'].includes(scheme.id))
  notes.push('Az OMSI kötőjele a megjelenített matricákat is befolyásolhatja; ezeknél a történeti rendszereknél a vizuális eredmény ellenőrizendő.');
 const cap=Math.max(1000,count*30);
 for(let i=0,attempt=0;i<count;attempt++){
  if(attempt>cap)throw Error('A megadott terület és sorozat nem ad elegendő egyedi rendszámot. Csökkentsd a darabszámot vagy adj meg több területet.');
  const area=pickArea(r,areas),plate=registration(scheme.id,area,r,sep,year,Boolean(opts.secondHalf));
  if(unique.has(plate))continue;
  unique.add(plate);rows.push(plate);occurrences.set(area,(occurrences.get(area)||0)+1);i++;
 }
 return {text:rows.join('\r\n')+'\r\n',rows,scheme,year,areas,occurrences:[...occurrences].map(([code,count])=>({code,count})),
  count,notes,bytes:rows.reduce((n,p)=>n+p.length+2,0)};
}
export function summarizeReferenceBerlin(text){
 const rows=String(text||'').replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
 const good=rows.filter(s=>/^B-[A-Z]{1,2} [1-9][0-9]{0,3}$/.test(s));
 return {total:rows.length,valid:good.length,unique:new Set(rows).size,fourDigit:rows.filter(s=>/^B-[A-Z]{1,2} [1-9][0-9]{3}$/.test(s)).length,threeDigit:rows.filter(s=>/^B-[A-Z]{1,2} [1-9][0-9]{2}$/.test(s)).length};
}
