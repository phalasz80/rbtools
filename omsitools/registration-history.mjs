/* Historical date constraints for privately simulated OMSI plate issuance.
 * "Issue" means a new assignment in that period; later on-road use is separate.
 * Date uncertainty remains explicit instead of pretending all series were issued.
 */
export const PLATE_HISTORY=Object.freeze({
 HU_PRE90:{from:'1958-09-02',to:'1990-08-05',legalEnd:'1995-12-31',confidence:'published',source:'https://njt.jog.gov.hu/jogszabaly/1990-20-20-0A',continued:true,warning:'A magánrendszám sorozatainak évhez rendelése közelítő, a kiadott betűkészletek helyi és időbeli átfedései előfordulhattak.'},
 AT_PRE90:{from:'1947-01-01',to:'1990-12-31',confidence:'published',source:'https://de.wikipedia.org/wiki/Historische_Kfz-Kennzeichen_(%C3%96sterreich)',continued:true,warning:'Az 1947–1990-es osztrák tartományi rész-sorszámok alapján a belső járáskiosztás nem állítható vissza teljes bizonyossággal.'},
 RS_YUG:{from:'1960-01-01',to:'2010-12-31',confidence:'approximate',source:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Yugoslavia',continued:true,warning:'A jugoszláv, majd szerb rendszámok 1960–2010-es regionális variánsaihoz külön korszakos ellenőrzés szükséges.'},
 HR_YUG:{from:'1960-01-01',to:'1991-12-31',confidence:'approximate',source:'https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Yugoslavia',continued:true},
 UK_DATELESS:{from:'1904-01-01',to:'1963-01-31',confidence:'published',source:'https://dvlaregistrations.dvla.gov.uk/help/?id=q_prefix',continued:true},
 UK_NI:{from:'1950-01-01',to:null,confidence:'approximate',source:'https://www.pnld.co.uk/assets/D3375-The-Road-Vehicles-%28Display-of-Registration-Marks%29-Regulations-2001',continued:true,warning:'Észak-Írország saját területi betűrendszere nem a brit korjelölő sorozatokat követi.'},
 HU_OLD:{from:'1990-08-06',to:'2022-06-30',confidence:'official',source:'https://njt.jog.gov.hu/jogszabaly/2011-326-20-22.75',continued:true},
 HU_NEW:{from:'2022-07-01',to:null,confidence:'official',source:'https://njt.jog.gov.hu/jogszabaly/2021-303-K3-22',continued:true},
 CS_OLD:{from:'1960-01-01',to:'1992-12-31',confidence:'approximate',source:'',continued:true,warning:'A csehszlovák járási betűkombinációk és a korabeli kibocsátási sorozatok részleges rekonstrukciók.'},
 CZ_OLD:{from:'1993-01-01',to:'2002-12-31',confidence:'transition',source:'https://e-sbirka.gov.cz/sb/2001/496',continued:true,warning:'Az 1993–2002-es cseh régi táblák gyártott készleteit legfeljebb 2002. december 31-ig adhatták ki; az egyes járáskódok kiadási határa ellenőrzendő.'},
 CZ_NEW:{from:'2001-07-01',to:null,confidence:'transition',source:'https://e-sbirka.gov.cz/sb/2001/496',continued:true},
 SK_OLD:{from:'1997-04-01',to:'2022-12-31',confidence:'published',source:'https://plateatlas.org/countries/sk/',continued:true},
 SK_NEW:{from:'2023-01-01',to:null,confidence:'published',source:'https://plateatlas.org/countries/sk/',continued:true},
 AT_NEW:{from:'1990-01-01',to:null,confidence:'published',source:'https://plateatlas.org/countries/at/',continued:true},
 CH_NEW:{from:'1950-01-01',to:null,confidence:'approximate',source:'',continued:true,warning:'A kantonok konkrét sorozatai és a régebbi svájci rendszer 1950-es időhatára nem teljesen igazoltak.'},
 DE_NEW:{from:'1991-01-01',to:null,confidence:'published',source:'https://onlinesammlung.museumsstiftung.de/detail/collection/5be3ac8a-2287-49a8-8644-1cc53f3b5ea4',continued:true,warning:'A keleti területek nyugatnémet mintájú tábláinak 1991-es kezdete ismert; a helyi kódok történeti bevezetése ettől eltérhet.'},
 DE_FRG:{from:'1970-01-01',to:'1990-12-31',confidence:'historical_proxy',source:'',continued:true,warning:'Az NSZK megnevezése történeti helyszínkategória. A rendszámformát az újraegyesítés után is kiadták; a választó korszakhű modellje nem rendszám-megszűnés.'},
 DE_WB:{from:'1970-01-01',to:'1990-12-31',confidence:'historical_proxy',source:'',continued:true,warning:'A B területi kód a német egyesítés után is használható; Nyugat-Berlin mint önálló történeti közeg 1990 októberéig létezett.'},
 DE_GDR_OLD:{from:'1970-01-01',to:'1974-09-30',confidence:'published',source:'https://onlinesammlung.museumsstiftung.de/detail/collection/5be3ac8a-2287-49a8-8644-1cc53f3b5ea4',continued:true,legalEnd:'1993-12-31'},
 DE_GDR_NEW:{from:'1974-10-01',to:'1990-12-31',confidence:'published',source:'https://onlinesammlung.museumsstiftung.de/detail/collection/5be3ac8a-2287-49a8-8644-1cc53f3b5ea4',continued:true,legalEnd:'1993-12-31',warning:'Az NDK betűkódjának első betűje területi jelentésű; a második két betű konkrét körzeti kiosztása nem minden sorban hitelesített.'},
 FR_FNI:{from:'1950-01-01',to:'2009-04-14',confidence:'approximate',source:'https://www.service-public.gouv.fr/particuliers/vosdroits/F17638',continued:true,warning:'A 2009. áprilisi átállás új személygépkocsikra vonatkozik; használt járművek átírásánál októberig eltérő átmeneti szabályok lehettek.'},
 FR_SIV:{from:'2009-04-15',to:null,confidence:'official',source:'https://www.service-public.gouv.fr/particuliers/vosdroits/F17638',continued:true},
 UK_SUFFIX:{from:'1963-01-01',to:'1983-07-31',confidence:'published',source:'https://www.eliteregistrations.co.uk/BuyingARegistration/SuffixRegistrations',continued:true},
 UK_PREFIX:{from:'1983-08-01',to:'2001-08-31',confidence:'published',source:'https://www.rightreg.co.uk/news/prefix-number-plates-explained/',continued:true},
 UK_CURRENT:{from:'2001-09-01',to:null,confidence:'published',source:'https://help.autotrader.co.uk/hc/en-gb/articles/34591157659421-How-can-you-tell-how-old-a-vehicle-is-based-on-the-registration',continued:true,warning:'A jelenlegi brit karakterrendszert elsősorban Anglia, Skócia és Wales szabályaira modellezzük; Észak-Írország más rendszert használ.'},
 RS_NEW:{from:'2011-01-01',to:null,confidence:'approximate',source:'',continued:true},
 HR_NEW:{from:'1992-01-01',to:null,confidence:'approximate',source:'',continued:true}
});
export const PLATE_HISTORY_SOURCES=Object.entries(PLATE_HISTORY).flatMap(([scheme,v])=>v.source?[{scheme,url:v.source}]:[]);
export const YYYYMMDD=(date)=>typeof date==='string'&&/^\d{4}-\d\d-\d\d$/.test(date)?date:date instanceof Date?date.toISOString().slice(0,10):'';
export function plateDateRange(scheme){const a=PLATE_HISTORY[scheme];if(!a)throw Error('Ismeretlen történeti rendszámrendszer: '+scheme);return a;}
export function activeOn(scheme,ymd){const v=plateDateRange(scheme),date=YYYYMMDD(ymd);return !!date&&date>=v.from&&(!v.to||date<=v.to);}
export function legallyVisibleOn(scheme,issued,scene){const v=plateDateRange(scheme);return activeOn(scheme,issued)&&issued<=scene&&(!v.legalEnd||scene<=v.legalEnd)&&v.continued!==false;}
export const UK_SUFFIX_RANGES=Object.freeze([
 ['A','1963-02-01','1963-12-31'],['B','1964-01-01','1964-12-31'],['C','1965-01-01','1965-12-31'],['D','1966-01-01','1966-12-31'],['E','1967-01-01','1967-07-31'],
 ...'FGHJKLMNPRSTVWXY'.split('').map((letter,index)=>{const year=1967+index;return [letter,year+'-08-01',(year+1)+'-07-31'];})
]);
export const UK_PREFIX_RANGES=Object.freeze([
 ...'ABCDEFGHJKLMNPR'.split('').map((letter,index)=>{const y=1983+index;return [letter,y+'-08-01',(y+1)+'-07-31'];}),
 ['S','1998-08-01','1999-02-28'],['T','1999-03-01','1999-08-31'],['V','1999-09-01','2000-02-29'],
 ['W','2000-03-01','2000-08-31'],['X','2000-09-01','2001-02-28'],['Y','2001-03-01','2001-08-31']
]);
export function britishAgeLetter(kind,year,month=3){
 const date=String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-15';
 const table=kind==='suffix'?UK_SUFFIX_RANGES:kind==='prefix'?UK_PREFIX_RANGES:null;
 if(!table)throw Error('Ismeretlen brit rendszámkorszak.');
 const match=table.find(([,from,to])=>date>=from&&date<=to);
 if(!match)throw Error('A megadott hónap nem tartozik a kiválasztott brit rendszámkorszakhoz: '+date);
 return match[0];
}
export function ukNumericAge(year,month){
 const issuedYear=month<3?year-1:year;
 const secondHalf=month<3||month>=9;
 return String((issuedYear%100+(secondHalf?50:0))%100).padStart(2,'0');
}
