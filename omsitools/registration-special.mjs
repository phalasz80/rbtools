/* Historical special categories for OMSI registration lists.
 * Only documented formats are marked "documented"; fallback ordinary patterns are clearly flagged.
 */
export const VEHICLE_CATEGORIES=Object.freeze([
 ['civil','Polgári személyautó'],
 ['taxi','Taxi'],
 ['police','Rendőrség / csendőrség'],
 ['military','Katonaság'],
 ['nva','NDK Nemzeti Néphadsereg (NVA)'],
 ['border','Határőrség / határrendészet'],
 ['ambulance','Mentőautó'],
 ['fire','Tűzoltóság'],
 ['rescue','Katasztrófavédelem / műszaki mentés'],
 ['thw','THW (német műszaki segélyszervezet)'],
 ['post','Posta / postaigazgatás'],
 ['rail','Vasúttársasági szolgálati jármű'],
 ['trailer','Pótkocsi / utánfutó'],
 ['motorcycle','Motorkerékpár'],
 ['bus','Autóbusz'],
 ['truck','Tehergépkocsi'],
 ['agricultural','Mezőgazdasági jármű'],
 ['government','Állami / hatósági jármű'],
 ['diplomatic','Diplomáciai'],
 ['historic','Veterán / történeti jármű'],
 ['temporary','Ideiglenes / próba'],
 ['electric','Elektromos jármű']
]);
export const CATEGORIES_DEFAULT=Object.freeze({civil:100});
export const SPECIAL_SOURCES=Object.freeze({
 de:'https://de.wikipedia.org/wiki/Kfz-Kennzeichen_(Deutschland)',
 de_codes:'https://de.wikipedia.org/wiki/Liste_aller_Kfz-Kennzeichen_der_Bundesrepublik_Deutschland',
 dd:'https://de.wikipedia.org/wiki/Liste_der_Kfz-Kennzeichen_der_DDR_(1953%E2%80%931990)',
 ch:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Switzerland',
 at:'https://de.wikipedia.org/wiki/Historische_Kfz-Kennzeichen_(%C3%96sterreich)',
 hu:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Hungary',
 hu_historical:'https://magyarjarmu.hu/tortenet/rendszamok/rendszamok-1958-1990/',
 hu_modern:'https://klevi.hu/rendszam',
 hr:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Croatia',
 rs:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Serbia',
 gb:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_the_United_Kingdom',
 fr:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_France',
 cz:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_the_Czech_Republic',
 sk:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Slovakia',
 de_official:'https://www.bmv.de/SharedDocs/DE/Artikel/StV/Strassenverkehr/ueberblick-ueber-die-kraftfahrzeugkennzeichen'
});
const A='ABCDEFGHJKLMNPRSTUVWXYZ';
const F=(r,n,alphabet=A)=>Array.from({length:n},()=>alphabet[Math.floor(r()*alphabet.length)]).join('');
const N=(r,min,max)=>String(min+Math.floor(r()*(max-min+1)));
const P=(r,n)=>N(r,0,10**n-1).padStart(n,'0');
const NUM=(r,n)=>N(r,10**(n-1),10**n-1);
export function customPlate(pattern,{area='',separator='-',year=2020},random){
 const fmt=String(pattern||'').toUpperCase();
 if(!fmt||fmt.length>110)throw Error('Az egyéni rendszámminta 1–110 karakter hosszú lehet.');
 let out=fmt.replace(/\{(AREA|SEP|YEAR|YY|[LN]{1,6})\}/g,(_,token)=>{
  if(token==='AREA')return area;
  if(token==='SEP')return separator;
  if(token==='YEAR')return String(year);
  if(token==='YY')return String(year%100).padStart(2,'0');
  if(/^L+$/.test(token))return F(random,token.length);
  if(/^N+$/.test(token))return NUM(random,token.length);
  throw Error('Ismeretlen sablonelem: '+token);
 });
 if(/[{}]/.test(out)||!/^[A-Z0-9 -]{1,32}$/.test(out))throw Error('A sablon csak {AREA}, {SEP}, {L}, {LL}, {NNN}, {YEAR}, {YY} mezőket, szóközt, kötőjelet és betűket tartalmazhat.');
 return out;
}
const SPECIAL=[
 // Germany: regionless military or service prefix, official code dates
 {country:'DE',kind:'military',from:1956,to:2099,title:'Bundeswehr Y',source:'de',format:(q)=>'Y'+q.sep+NUM(q.r,6)},
 {country:'DE',kind:'thw',from:1996,fromMonth:11,to:2099,title:'THW',source:'de',format:(q)=>'THW'+q.sep+N(q.r,8000,89999)},
 {country:'DE',kind:'post',from:1956,to:1994,title:'Deutsche Bundespost BP (1995 előtt)',source:'de_codes',format:q=>'BP'+q.sep+NUM(q.r,4)},
 {country:'DE',kind:'rail',from:1956,to:1993,title:'Deutsche Bundesbahn DB',source:'de_codes',format:q=>'DB'+q.sep+NUM(q.r,4)},
 {country:'DE',kind:'police',from:1956,to:2007,title:'Korábbi német hatósági rendszám (2007-ig)',source:'de',format:q=>q.area+q.sep+N(q.r,3000,7999),note:'Az egyes helyi hatósági számtartományok eltérhetnek, a rendőrséghez rendelt sorok nem mindenhol egységesek.'},
 {country:'DE',kind:'rescue',from:1956,to:2007,title:'Korábbi német katasztrófavédelmi hatósági számkör',source:'de',format:q=>q.area+q.sep+N(q.r,8000,8999)},
 {country:'DE',kind:'border',from:1956,to:2006,title:'Bundesgrenzschutz BG',source:'de_codes',format:q=>'BG'+q.sep+NUM(q.r,4)},
 // DDR specialty independent from civilian district markers
 {country:'DD',kind:'nva',from:1956,to:1975,title:'NVA VA korai számsor',source:'dd',format:q=>'VA '+N(q.r,1,9)+q.sep+P(q.r,4)},
 {country:'DD',kind:'nva',from:1976,to:1990,title:'NVA VA késői számsor (1976-tól)',source:'dd',format:q=>'VA '+N(q.r,10,99)+q.sep+P(q.r,4)},
 {country:'DD',kind:'military',from:1956,to:1975,title:'NVA VA korai számsor',source:'dd',format:q=>'VA '+N(q.r,1,9)+q.sep+P(q.r,4)},
 {country:'DD',kind:'military',from:1976,to:1990,title:'NVA VA késői számsor',source:'dd',format:q=>'VA '+N(q.r,10,99)+q.sep+P(q.r,4)},
 {country:'DD',kind:'police',from:1953,to:1990,title:'Volkspolizei VP körzeti sorozat',source:'dd',format:q=>'VP '+({I:'00',R:'12',S:'13',T:'14',D:'04',E:'05',Z:'06',H:'07',K:'08',L:'09',N:'10',O:'11',C:'03'}[q.area]||'00')+q.sep+P(q.r,4),note:'A területi kódok körzetenként változtak; egyes körzetekhez a történeti táblázat ellenőrzendő.'},
 {country:'DD',kind:'border',from:1961,to:1990,title:'Grenztruppen GT',source:'dd',format:q=>(q.year===1990&&q.month>=3?'GS':'GT')+' '+NUM(q.r,2)+q.sep+P(q.r,4),note:'A GT–GS átállás 1990-ben nem január 1-jén történt; a pontos hónapot is vizsgálni kell.'},
 // Austrian state fleet codes
 {country:'AT',kind:'military',from:1967,to:2099,title:'Bundesheer BH',source:'at',format:q=>'BH'+q.sep+N(q.r,100,99999)},
 {country:'AT',kind:'police',from:1967,to:2005,toMonth:6,title:'Bundesgendarmerie BG',source:'at',format:q=>'BG'+q.sep+N(q.r,100,99999)},
 {country:'AT',kind:'police',from:2005,fromMonth:7,to:2099,title:'Bundespolizei BP',source:'at',format:q=>'BP'+q.sep+N(q.r,100,99999)},
 {country:'AT',kind:'post',from:1967,to:1990,title:'Post- und Telegraphenverwaltung PT',source:'at',format:q=>'PT'+q.sep+N(q.r,100,99999),note:'A postai különkód megszűnésének pontos napja régiónként ellenőrzendő.'},
 // Swiss old federal/post and military
 {country:'CH',kind:'military',from:1950,to:2099,title:'Schweizer Armee M',source:'ch',format:q=>'M '+N(q.r,1,999999)},
 {country:'CH',kind:'post',from:1950,to:2004,visibleTo:'2004-12-31',title:'Schweizer PTT P',source:'ch',format:q=>'P '+N(q.r,10000,79999)},
 {country:'CH',kind:'rail',from:1950,to:2004,visibleTo:'2004-12-31',title:'SBB P',source:'ch',format:q=>'P '+N(q.r,80000,99999)},
 {country:'CH',kind:'government',from:1950,to:2004,visibleTo:'2004-12-31',title:'Bundesverwaltung A',source:'ch',format:q=>'A '+N(q.r,10000,79999)},
 // 1958–1990 Hungary: the first two letters encode the actual vehicle/service category.
 {country:'HU',kind:'taxi',from:1958,to:1988,schemes:['HU_PRE90'],title:'Magyar szocialista taxi JA',source:'hu_historical',format:q=>'JA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'police',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar rendőrség RA',source:'hu_historical',format:q=>'RA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'military',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar honvédség HA',source:'hu_historical',format:q=>'HA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'border',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar határőrség HR',source:'hu_historical',format:q=>'HR'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'ambulance',from:1958,to:1990,schemes:['HU_PRE90'],title:'Országos Mentőszolgálat MA',source:'hu_historical',format:q=>'MA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'fire',from:1958,to:1990,schemes:['HU_PRE90'],title:'Tűzoltóság TU',source:'hu_historical',format:q=>'TU'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'post',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar Posta PA',source:'hu_historical',format:q=>'PA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'trailer',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar utánfutók XS',source:'hu_historical',format:q=>'XS'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'motorcycle',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar motorkerékpárok E/KA',source:'hu_historical',format:q=>(q.year<1976?'EA':'KA')+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'bus',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar közforgalmú buszok GA',source:'hu_historical',format:q=>'GA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'truck',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar közületi teherautók FA',source:'hu_historical',format:q=>'FA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'government',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar állami szolgálati AB',source:'hu_historical',format:q=>'AB'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'diplomatic',from:1958,to:1990,schemes:['HU_PRE90'],title:'Magyar diplomáciai DT',source:'hu_historical',format:q=>'DT'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 // Hungarian identifiable service series
 {country:'HU',kind:'police',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar rendőrségi RB',source:'hu',format:q=>'RB'+q.sep+P(q.r,4),note:'Valódi tartományok ennél szűkebbek; nem minden RB-szám bizonyítottan kiadott.'},
 {country:'HU',kind:'ambulance',from:2006,to:2022,schemes:['HU_OLD'],title:'Magyar mentők MA',source:'hu',format:q=>'MA'+q.sep+P(q.r,4)},
 // 1990–2022 Hungarian specialised series: separated from ordinary first-letter chronology.
 {country:'HU',kind:'taxi',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar taxi (EAA–EDZ)',source:'hu_modern',format:q=>'EA'+F(q.r,1)+q.sep+NUM(q.r,3),note:'EAA–EDZ: a rendszám színe sárga, amit a TXT nem ír elő.'},
 {country:'HU',kind:'military',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar Honvédség HA',source:'hu_modern',format:q=>'HA'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'motorcycle',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar motorkerékpár U',source:'hu_modern',format:q=>'U'+F(q.r,2)+q.sep+NUM(q.r,3)},
 {country:'HU',kind:'trailer',from:1990,to:2014,schemes:['HU_OLD'],title:'Magyar pótkocsi X',source:'hu_modern',format:q=>'X'+F(q.r,2)+q.sep+NUM(q.r,3)},
 {country:'HU',kind:'trailer',from:2015,to:2022,schemes:['HU_OLD'],title:'Magyar pótkocsi W',source:'hu_modern',format:q=>'W'+F(q.r,2)+q.sep+NUM(q.r,3)},
 {country:'HU',kind:'historic',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar OT veterán',source:'hu_modern',format:q=>'OT'+q.sep+P(q.r,2)+' '+P(q.r,2)},
 {country:'HU',kind:'truck',from:1990,to:2022,schemes:['HU_OLD'],title:'Magyar sárga teherfuvarozói F',source:'hu_modern',format:q=>'F'+F(q.r,2)+q.sep+NUM(q.r,3),note:'A jármű típusát a rendszám színe és a F kezdőbetű is jelezhette, de nem minden teherautónak volt ilyen.'},
 // 2022+ Hungary: distinct official organisations. These are ASCII approximations of the plate, not colours, seals or the coat of arms.
 {country:'HU',kind:'police',from:2022,fromMonth:7,to:2099,schemes:['HU_NEW'],title:'Magyar rendvédelmi RA',source:'hu_modern',format:q=>'RA'+q.sep+P(q.r,2)+' '+P(q.r,3)},
 {country:'HU',kind:'military',from:2022,fromMonth:7,to:2099,schemes:['HU_NEW'],title:'Magyar Honvédség HA',source:'hu_modern',format:q=>'HA'+q.sep+P(q.r,2)+' '+P(q.r,3)},
 {country:'HU',kind:'ambulance',from:2022,fromMonth:7,to:2099,schemes:['HU_NEW'],title:'Magyar mentők MA',source:'hu_modern',format:q=>'MA'+q.sep+P(q.r,2)+' '+P(q.r,3)},
 {country:'HU',kind:'taxi',from:2022,fromMonth:7,to:2099,schemes:['HU_NEW'],title:'Magyar taxi TX',source:'hu_modern',format:q=>'TX'+q.sep+F(q.r,2)+' '+NUM(q.r,3)},
 {country:'HU',kind:'historic',from:2022,fromMonth:7,to:2099,schemes:['HU_NEW'],title:'Magyar OT veterán',source:'hu_modern',format:q=>'OT'+q.sep+F(q.r,2)+' '+NUM(q.r,3)},
 // Croatian police blue letters, military HV
 {country:'HR',kind:'police',from:1992,to:2099,title:'Hrvatska policija (kék számok)',source:'hr',format:q=>P(q.r,3)+' '+P(q.r,3),note:'A rendszám színét az OMSI szövegállomány nem képes visszaadni.'},
 {country:'HR',kind:'military',from:1992,to:2099,title:'Hrvatska vojska HV',source:'hr',format:q=>'HV '+NUM(q.r,4)+q.sep+F(q.r,2)},
 // Serbia: specialised taxi, trailer, military, police (ASCII only)
 {country:'RS',kind:'taxi',from:2011,to:2099,title:'Szerb TX taxi',source:'rs',format:q=>q.area+' '+NUM(q.r,5)+q.sep+'TX'},
 {country:'RS',kind:'trailer',from:2011,to:2099,title:'Szerb fordított pótkocsi',source:'rs',format:q=>F(q.r,2)+q.sep+NUM(q.r,4)+' '+q.area},
 {country:'RS',kind:'military',from:2011,to:2099,title:'Szerb hadsereg',source:'rs',format:q=>F(q.r,1)+' '+NUM(q.r,4)},
 {country:'RS',kind:'police',from:2011,to:2099,title:'Szerb rendőrség (ASCII P helyettesítéssel)',source:'rs',format:q=>'P '+P(q.r,6),note:'A valódi táblán cirill П szerepel, amit ez az ASCII-s OMSI-kimenet P betűvel csak közelít.'},
 // France pre-2009 official police and gendarmerie service plates
 {country:'FR',kind:'police',from:1950,to:2009,title:'Police nationale FNI állami',source:'fr',format:q=>q.area+'N'+q.sep+NUM(q.r,4)+F(q.r,1)},
 {country:'FR',kind:'military',from:1950,to:2009,title:'Armée de Terre FNI katonai',source:'fr',format:q=>'6'+String(q.year%100).padStart(2,'0')+'1 '+P(q.r,4)},
 {country:'FR',kind:'fire',from:1950,to:2009,title:'Paris SPVL (párizsi tűzoltóság)',source:'fr',format:q=>'SPVL '+NUM(q.r,4),note:'Csak a párizsi tűzoltóságra jellemző sorozat; más francia városokhoz ne használd automatikusan.',onlyArea:['75']},
 // Czech, Slovak and former Czechoslovak special formats. Colour changes are not encoded as text.
 {country:'CS',kind:'military',from:1960,to:1992,title:'Csehszlovák katonai számsor (számok)',source:'cz',format:q=>NUM(q.r,3)+q.sep+NUM(q.r,3),note:'Az egykori csehszlovák katonai sorozatok országos és időbeli részletei csak részben rekonstruáltak.'},
 {country:'CZ',kind:'military',from:1993,to:2099,title:'Cseh katonai rendszám (számok)',source:'cz',format:q=>NUM(q.r,3)+q.sep+NUM(q.r,3)},
 {country:'CZ',kind:'trailer',from:1993,to:2001,title:'Cseh régi fordított pótkocsi',source:'cz',format:q=>NUM(q.r,2)+' '+q.area+q.sep+NUM(q.r,2)},
 {country:'CZ',kind:'motorcycle',from:2001,to:2099,title:'Cseh motorkerékpár régiójel',source:'cz',format:q=>'1'+q.area+' '+NUM(q.r,4),note:'A valódi motorkerékpár rendszámtábla két soros, amit a TXT nem reprezentál.'},
 {country:'CZ',kind:'historic',from:2001,to:2099,title:'Cseh V veteránjel',source:'cz',format:q=>'V'+q.area+' '+NUM(q.r,4),note:'A valódi táblán zöld színű karakterek, illetve korabeli területi alváltozatok vannak.'},
 {country:'SK',kind:'military',from:1997,to:2099,title:'Szlovák katonai számok',source:'sk',format:q=>NUM(q.r,2)+q.sep+NUM(q.r,5)},
 {country:'SK',kind:'temporary',from:1997,to:2022,title:'Szlovák korábbi V ideiglenes',source:'sk',format:q=>q.area+q.sep+'V'+NUM(q.r,3)},
 {country:'SK',kind:'diplomatic',from:1997,to:2024,title:'Szlovák korábbi EE/ZZ diplomáciai',source:'sk',format:q=>'EE'+q.sep+NUM(q.r,5),note:'Korábbi szlovák kék hátterű diplomáciai sorozat. A szín hiányzik az OMSI TXT-ből.'},
 {country:'SK',kind:'diplomatic',from:2025,to:2099,title:'Szlovák CD diplomáciai 2025-től',source:'sk',format:q=>'CD'+q.sep+NUM(q.r,5)},
 {country:'SK',kind:'electric',from:2023,to:2099,title:'Szlovák EL/EV elektromos',source:'sk',format:q=>'EL'+q.sep+NUM(q.r,3)+F(q.r,2)},
 // Austrian public service subsets normally use standard district plates with reserved ending pairs.
 {country:'AT',kind:'taxi',from:1990,to:2099,title:'Wiener Taxi TX',source:'at',onlyArea:['W'],format:q=>'W'+q.sep+NUM(q.r,4)+' TX'},
 {country:'AT',kind:'fire',from:1990,to:2099,title:'Wiener Feuerwehr FW',source:'at',onlyArea:['W'],format:q=>'W'+q.sep+NUM(q.r,4)+' FW'},
 {country:'AT',kind:'ambulance',from:1990,to:2099,title:'Wiener Rettungsdienst RD',source:'at',onlyArea:['W'],format:q=>'W'+q.sep+NUM(q.r,4)+' RD'},
 {country:'AT',kind:'bus',from:1990,to:2099,title:'Wiener Linienomnibus LO',source:'at',onlyArea:['W'],format:q=>'W'+q.sep+NUM(q.r,4)+' LO'},
 {country:'AT',kind:'rail',from:1990,to:2099,title:'ÖBB W–BB',source:'at',onlyArea:['W'],format:q=>'W'+q.sep+NUM(q.r,4)+' BB'},
 // Official German H/E suffix codes; year boundaries independently researched.
 {country:'DE',kind:'historic',from:1997,fromMonth:7,to:2099,title:'Német H veterán (1997 júliusától)',source:'de_official',format:q=>q.area+q.sep+F(q.r,2)+' '+NUM(q.r,3)+'H'},
 {country:'DE',kind:'electric',from:2015,to:2099,title:'Német E elektromos',source:'de_official',format:q=>q.area+q.sep+F(q.r,2)+' '+NUM(q.r,3)+'E'},
 // DDR motorbikes retained the two-letter format after October 1974.
 {country:'DD',kind:'motorcycle',from:1953,to:1990,title:'NDK motorkerékpár kétbetűs rendszám',source:'dd',format:q=>q.area+F(q.r,1)+' '+NUM(q.r,2)+q.sep+NUM(q.r,2),note:'Az NDK motorkerékpároknál tovább használt kétbetűs sorozat területi második betűje helyi levéltári ellenőrzést igényel.'},
 // Yugoslav formats for historic Serbia/Croatia are explicitly treated as old regional markings only;
 // do not invent distinctive emergency prefixes when those entities used civilian registration numbers.
 // British forces (not standard civilian)
 {country:'GB',kind:'military',from:1949,to:1994,title:'Brit hadsereg 00 AB 00',source:'gb',format:q=>P(q.r,2)+' '+F(q.r,2)+' '+P(q.r,2)},
 {country:'GB',kind:'military',from:1995,to:2099,title:'Brit hadsereg AB 00 CD',source:'gb',format:q=>F(q.r,2)+' '+P(q.r,2)+' '+F(q.r,2)}
];
export const SPECIAL_RULES=Object.freeze(SPECIAL);
const CATEGORY_IDS=new Set(VEHICLE_CATEGORIES.map(x=>x[0]));
const SCHEME_COUNTRY={
 HU_OLD:'HU',HU_NEW:'HU',HU_PRE90:'HU',CS_OLD:'CS',CZ_OLD:'CZ',CZ_NEW:'CZ',SK_OLD:'SK',SK_NEW:'SK',AT_NEW:'AT',AT_PRE90:'AT',CH_NEW:'CH',
 DE_NEW:'DE',DE_FRG:'DE',DE_WB:'DE',DE_GDR_OLD:'DD',DE_GDR_NEW:'DD',
 FR_FNI:'FR',FR_SIV:'FR',UK_SUFFIX:'GB',UK_PREFIX:'GB',UK_CURRENT:'GB',UK_DATELESS:'GB',
 RS_NEW:'RS',RS_YUG:'RS',HR_NEW:'HR',HR_YUG:'HR'
};
const ordinaryCategories=new Set(['taxi','ambulance','fire','rescue','motorcycle','trailer','bus','truck','agricultural','historic','temporary','electric','police','government','post']);
export function specialRulesFor(scheme,category,year,area='',options={}){
 if(!CATEGORY_IDS.has(category))throw Error('Ismeretlen járműkategória: '+category);
 if(category==='civil')return {kind:'ordinary',title:'Normál polgári rendszám',source:'',confidence:'regular'};
 const country=SCHEME_COUNTRY[scheme]||scheme.slice(0,2);
 const selected=SPECIAL.find(x=>x.country===country&&x.kind===category&&year>=x.from&&year<=x.to&&(!x.schemes||x.schemes.includes(options.scheme))&&(!x.fromMonth||year>x.from||Number(options.month||6)>=x.fromMonth)&&(!x.toMonth||year<x.to||Number(options.month||6)<=x.toMonth)&&(!x.onlyArea||x.onlyArea.includes(area)));
 if(selected)return {...selected,kind:'documented',confidence:selected.note?'partial':'documented'};
 if(ordinaryCategories.has(category)&&options.allowOrdinary){
  return {kind:'ordinary',title:'Hagyományos közúti rendszám: a '+category+' nem mindenütt külön alfanumerikus sorozat',source:'',confidence:'ordinary_unverified',
   note:'A rendszám karakterei normál személygépjármű-azonosítónak felelnek meg. A különleges jármű jellege önmagában nem következik a rendszámból.'};
 }
 return null;
}
export function generateCategoryPlate({scheme,category,area,year,month=6,separator,random,defaultPlate,customPattern,allowOrdinary=false}){
 if(customPattern){
  return {plate:customPlate(customPattern,{area,year,separator},random),rule:{kind:'custom',title:'Felhasználói minta, nem ellenőrzött történeti rendszám',confidence:'fictional',source:''}};
 }
 const rule=specialRulesFor(scheme,category,year,area,{allowOrdinary,month,scheme});
 if(!rule)return null;
 return {plate:rule.format?rule.format({r:random,year,month,area,sep:separator}):defaultPlate(),rule:{...rule,source:SPECIAL_SOURCES[rule.source]||rule.source||''}};
}
