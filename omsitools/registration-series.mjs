/* Source-aware first issue prefixes for Hungarian civilian plates.
 * Date edges are mostly secondary sources; hard-coded prefixes are not claims about every local office.
 */
export const SERIES_SOURCES={
 old:'https://www.rendszam.guru/data/h/years.html',
 new:'https://telex.hu/techtud/2026/11/11/megszunik-egy-logikatlannak-tartott-rendszamszabaly',
 pre90:'https://magyarjarmu.hu/tortenet/rendszamok/rendszamok-1958-1990/'
};
const HU_OLD_START=[
 ['1990-08-06','A'],['1992-03-19','B'],['1993-09-05','C'],['1995-01-18','D'],
 ['1996-08-25','E'],['1997-12-02','F'],['1999-05-04','G'],['2000-12-17','H'],
 ['2002-01-21','I'],['2003-12-23','J'],['2005-11-12','K'],['2007-10-26','L'],
 ['2011-11-22','M'],['2015-03-12','N'],['2016-12-01','P'],['2018-07-01','R'],
 ['2020-01-01','S'],['2021-09-01','T']
];
const HU_NEW_START=[
 ['2022-07-01','AA'],['2023-03-01','AE'],['2024-03-01','AI'],
 ['2025-02-01','AO'],['2026-04-01','AU']
];
export const HU_OLD_LETTERS=Object.freeze(HU_OLD_START);
export const HU_NEW_PAIRS=Object.freeze(HU_NEW_START);
const ABC='ABCDEFGHJKLMNPRSTUVWXYZ';
function pick(r,chars){return chars[Math.floor(r()*chars.length)];}
function formatDate(year,month){return String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-15';}
function currentPrefix(rows,year,month){
 const at=formatDate(year,month);
 const matched=rows.filter(x=>at>=x[0]);
 return matched.at(-1)?.[1]||'';
}
export function hungarianOldCivil(year,month,random,separator='-'){
 const first=currentPrefix(HU_OLD_START,year,month);
 if(!first)throw Error('Az 1990–2022-es magyar rendszámrendszer ekkor még nem adott ki sorozatot.');
 let second=pick(random,ABC),third=pick(random,ABC);
 if(first==='E')second='E'; // EEA–EZZ civilian, the other E series taxis.
 if(first==='F')second=pick(random,'ABCDEFGH'); // FAA–FHZ, later F series commercial
 const number=String(1+Math.floor(random()*999)).padStart(3,'0');
 return first+second+third+separator+number;
}
export function hungarianNewCivil(year,month,random,separator='-'){
 const first=currentPrefix(HU_NEW_START,year,month);
 if(!first)throw Error('A négybetűs magyar rendszámokat csak 2022 júliusától adják ki.');
 if(year>2026)throw Error('A 2026 utáni első magyar betűpárok kiadási sorrendje még nem állapítható meg megbízhatóan. Adj meg egyéni sablont, és jelöld a kimenetet fiktívként.');
 const second=pick(random,ABC)+pick(random,ABC);
 const number=String(1+Math.floor(random()*999)).padStart(3,'0');
 return first+separator+second+' '+number;
}
