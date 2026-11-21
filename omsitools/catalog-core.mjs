/* OMSI Tools vehicle reference ranking: original paths only, never synthetic assets.
 * Heuristics are not registration statistics. Unknown models are excluded by default.
 */
import {REFERENCE_AI,REFERENCE_PARK} from './catalog-data.mjs';
export const CATALOG_SOURCES=Object.freeze({
 pack:'https://strefa-omsi.pl/Watek-S3D-Definitive-AI-Car-Repack-1-00-RC1--30901?pid=185205',
 docs:'https://reboot.omsi-webdisk.de/wiki/entry/90-ai-traffic-from-ailists-cars-and-humans/',
 trabant:'https://www.archiv.sachsen.de/archiv/bestand.jsp?bestandid=31076&oid=9.9&syg_id=88083',
 wartburg:'https://germanhistorydocs.org/en/two-germanies-1961-1989/production-of-the-wartburg-353-1966',
 skoda:'https://www.skoda-auto.com/world/history-1986-1995',
 polo:'https://www.volkswagen-newsroom.com/en/polo-2-19811994-19143',
 tx4:'https://www.levcbreweryroad.com/company/history/'
});
const RULES=[
 ['trabant(?:[_ -]?(?:601|universal|ddr))?',1964,1990,'Trabant 601','east','car','trabant'],
 ['wartburg[_ -]?353',1966,1988,'Wartburg 353','east','car','wartburg'],
 ['wartburg[_ -]?1[._-]?3',1988,1991,'Wartburg 1.3','east','car',''],
 ['(?:ifa[_ -]?)?w50',1965,1990,'IFA W50','east','truck',''],
 ['(?:ifa[_ -]?)?l60',1987,1990,'IFA L60','east','truck',''],
 ['skoda[_ -]?(?:120l|120|105l|105|130l)',1976,1990,'Škoda 105/120','central','car','skoda'],
 ['skoda[_ -]?favorit',1987,1994,'Škoda Favorit','central','car','skoda'],
 ['skoda[_ -]?forman',1990,1995,'Škoda Forman','central','car','skoda'],
 ['skoda[_ -]?felicia',1994,2001,'Škoda Felicia','central','car',''],
 ['skoda[_ -]?fabia',1999,2023,'Škoda Fabia','central','car',''],
 ['skoda[_ -]?octavia[_ -]?i(?:\b|[_.-])',1996,2010,'Škoda Octavia I','central','car',''],
 ['skoda[_ -]?octavia[_ -]?ii',2004,2013,'Škoda Octavia II','central','car',''],
 ['skoda[_ -]?octavia',1996,2026,'Škoda Octavia (generáció ellenőrzendő)','central','car',''],
 ['vw[_ -]?t3|volkswagen[_ -]?t3',1979,1992,'Volkswagen T3','west','van',''],
 ['vw[_ -]?t4|volkswagen[_ -]?t4',1990,2003,'Volkswagen T4','west','van',''],
 ['vw[_ -]?t5(?:[_ -]?facelift)?',2003,2015,'Volkswagen T5','west','van',''],
 ['vw[_ -]?t6',2015,2024,'Volkswagen T6','west','van',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:1|i)(?![0-9a-z])',1974,1983,'Volkswagen Golf I','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:2|ii)(?![0-9a-z])',1983,1992,'Volkswagen Golf II','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:3|iii)(?![0-9a-z])',1991,1997,'Volkswagen Golf III','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:4|iv)(?![0-9a-z])',1997,2003,'Volkswagen Golf IV','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:5|v)(?![0-9a-z])',2003,2008,'Volkswagen Golf V','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:6|vi)(?![0-9a-z])',2008,2012,'Volkswagen Golf VI','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:7|vii)(?![0-9a-z])',2012,2020,'Volkswagen Golf VII','west','car',''],
 ['(?:vw[_ -]?)?golf[_ -]?(?:8|viii)(?![0-9a-z])',2019,2026,'Volkswagen Golf VIII','west','car',''],
 ['(?:vw[_ -]?)?polo[_ -]?(?:2|ii)(?![0-9a-z])',1981,1994,'Volkswagen Polo II','west','car','polo'],
 ['(?:vw[_ -]?)?jetta[_ -]?(?:ii|2)',1984,1992,'Volkswagen Jetta II','west','car',''],
 ['(?:vw[_ -]?)?passat[_ -]?b6',2005,2010,'Volkswagen Passat B6','west','car',''],
 ['(?:vw[_ -]?)?passat[_ -]?b7',2010,2014,'Volkswagen Passat B7','west','car',''],
 ['(?:vw[_ -]?)?passat[_ -]?b8',2014,2023,'Volkswagen Passat B8','west','car',''],
 ['vw[_ -]?id[_ .-]?4|volkswagen[_ -]?id[_ .-]?4',2020,2026,'Volkswagen ID.4','west','car',''],
 ['mercedes[_ -]?(?:w123|mb[_ -]?w123)',1976,1986,'Mercedes-Benz W123','west','car',''],
 ['mercedes[_ -]?(?:w124|mb[_ -]?w124)',1984,1997,'Mercedes-Benz W124','west','car',''],
 ['(?:mercedes[_ -]?)?w212|eclass[_ -]?w212',2009,2016,'Mercedes-Benz E W212','west','car',''],
 ['(?:mercedes[_ -]?)?w213',2016,2023,'Mercedes-Benz E W213','west','car',''],
 ['(?:mercedes[_ -]?)?w168',1997,2004,'Mercedes-Benz A W168','west','car',''],
 ['(?:mercedes[_ -]?)?w203',2000,2007,'Mercedes-Benz C W203','west','car',''],
 ['(?:mercedes[_ -]?)?w220',1998,2005,'Mercedes-Benz S W220','west','luxury',''],
 ['(?:mercedes[_ -]?)?w222',2013,2020,'Mercedes-Benz S W222','west','luxury',''],
 ['mini[_ -]?f56',2014,2023,'MINI F56','west','car',''],
 ['focus[_ -]?mk1',1998,2004,'Ford Focus I','west','car',''],
 ['(?:ford[_ -]?)?focus[_ -]?(?:iii|3)',2010,2018,'Ford Focus III','west','car',''],
 ['peugeot[_ -]?205',1983,1998,'Peugeot 205','west','car',''],
 ['peugeot[_ -]?206',1998,2012,'Peugeot 206','west','car',''],
 ['peugeot[_ -]?406',1995,2004,'Peugeot 406','west','car',''],
 ['peugeot[_ -]?607',1999,2010,'Peugeot 607','west','car',''],
 ['peugeot[_ -]?(?:e?208)',2012,2026,'Peugeot 208','west','car',''],
 ['peugeot[_ -]?508',2011,2026,'Peugeot 508','west','car',''],
 ['peugeot[_ -]?rifter',2018,2026,'Peugeot Rifter','west','van',''],
 ['citroen[_ -]?(?:c15)',1984,2005,'Citroën C15','west','van',''],
 ['citroen[_ -]?bx',1982,1994,'Citroën BX','west','car',''],
 ['citroen[_ -]?c4x|citroen[_ -]?ec4x',2022,2026,'Citroën C4 X','west','car',''],
 ['citroen[_ -]?berlingo[_ -]?(?:ii|multispace)',2008,2018,'Citroën Berlingo II','west','van',''],
 ['renault[_ -]?19(?:\b|[_.-])',1988,1997,'Renault 19','west','car',''],
 ['renault[_ -]?clio[_ -]?(?:ii|2)',1998,2005,'Renault Clio II','west','car',''],
 ['renault[_ -]?clio[_ -]?(?:iv|4)',2012,2019,'Renault Clio IV','west','car',''],
 ['renault[_ -]?laguna[_ -]?i(?:\b|[_.-])',1994,2001,'Renault Laguna I','west','car',''],
 ['renault[_ -]?laguna[_ -]?ii(?:\b|[_.-])',2001,2007,'Renault Laguna II','west','car',''],
 ['renault[_ -]?fluenc',2009,2016,'Renault Fluence','west','car',''],
 ['renault[_ -]?captur',2013,2026,'Renault Captur','west','car',''],
 ['dacia[_ -]?logan[_ -]?iii',2021,2026,'Dacia Logan III','central','car',''],
 ['dacia[_ -]?logan[_ -]?ii',2012,2020,'Dacia Logan II','central','car',''],
 ['dacia[_ -]?sandero[_ -]?iii',2020,2026,'Dacia Sandero III','central','car',''],
 ['dacia[_ -]?sandero[_ -]?ii',2012,2020,'Dacia Sandero II','central','car',''],
 ['dacia[_ -]?duster',2010,2026,'Dacia Duster','central','car',''],
 ['toyota[_ -]?prius[_ -]?(?:iii|xw30|3)',2009,2015,'Toyota Prius III','international','car',''],
 ['prius[_ -]?xw30',2009,2015,'Toyota Prius III','international','car',''],
 ['toyota[_ -]?hiace[_ -]?89',1989,2004,'Toyota Hiace (1989)','international','van',''],
 ['toyota[_ -]?yaris',1999,2026,'Toyota Yaris','international','car',''],
 ['hyundai[_ -]?i20',2008,2026,'Hyundai i20','international','car',''],
 ['kia[_ -]?(?:rio|cee)',2006,2026,'Kia kis-/kompakt autó','international','car',''],
 ['(?:bmw[_ -]?)?m3[_ -]?e30',1986,1991,'BMW M3 E30','west','luxury',''],
 ['(?:bmw[_ -]?)?x5',1999,2026,'BMW X5','west','luxury',''],
 ['audi[_ -]?(?:a4[_ -]?b6)',2000,2004,'Audi A4 B6','west','car',''],
 ['audi[_ -]?(?:quattro)',1980,1991,'Audi quattro','west','luxury',''],
 ['(?:rover[_ -]?)?tx4',2007,2017,'London Taxi TX4','british','taxi','tx4'],
 ['range[_ -]?rover[_ -]?l405',2012,2022,'Range Rover L405','british','luxury',''],
 ['uaz[_ -]?452',1965,2026,'UAZ 452','east','van',''],
 ['zil[_ -]?(?:4314|130)',1964,1995,'ZIL teherautó','east','truck',''],
 ['lada[_ -]?(?:210[1-7]|vaz)',1970,2012,'Lada VAZ','east','car',''],
 ['(?:vw[_ -]?)?kaefer|(?:vw[_ -]?)?beetle',1945,2003,'Volkswagen Bogár','west','car',''],
 ['fiat[_ -]?126',1972,2000,'Fiat 126','central','car',''],
 ['opel[_ -]?kadett[_ -]?c',1973,1979,'Opel Kadett C','west','car',''],
 ['opel[_ -]?corsa[_ -]?a',1982,1993,'Opel Corsa A','west','car',''],
 ['opel[_ -]?corsa[_ -]?c',2000,2006,'Opel Corsa C','west','car',''],
 ['opel[_ -]?ascona[_ -]?c',1981,1988,'Opel Ascona C','west','car',''],
 ['opel[_ -]?vectra[_ -]?a',1988,1995,'Opel Vectra A','west','car',''],
 ['opel[_ -]?vectra[_ -]?c',2002,2008,'Opel Vectra C','west','car',''],
 ['opel[_ -]?astra[_ -]?g',1998,2004,'Opel Astra G','west','car',''],
 ['opel[_ -]?astra[_ -]?h',2004,2010,'Opel Astra H','west','car',''],
 ['opel[_ -]?zafira',1999,2019,'Opel Zafira','west','van',''],
 ['suzuki[_ -]?swift[_ -]?glx[_ -]?1996',1996,2003,'Suzuki Swift (1996)','international','car',''],
 ['saab[_ -]?9[_ -]?3',1998,2012,'Saab 9-3','international','car',''],
 ['tesla[_ -]?model[_ -]?3',2017,2026,'Tesla Model 3','international','car',''],
 ['tesla[_ -]?model[_ -]?y',2020,2026,'Tesla Model Y','international','car',''],
 ['volvo[_ -]?xc40',2017,2026,'Volvo XC40','international','car',''],
 ['volvo[_ -]?ex30',2023,2026,'Volvo EX30','international','car',''],
 ['scania[_ -]?(?:r420|r620|p250)',2004,2026,'Scania LKW','international','truck',''],
 ['daf[_ -]?xf[_ -]?105',2005,2013,'DAF XF 105','international','truck','']
].map(([pattern,start,end,label,origin,kind,source])=>({regex:new RegExp(pattern,'i'),start,end,label,origin,kind,source}));
const S3D=String.raw`Citroen_Berlingo_II|2008|2018|van
Citroen_Berlingo_Multispace_II|2008|2018|van
Citroen_Berlingo_Multispace_II_FL|2012|2018|van
Citroen_C15|1984|2005|van
Citroen_C4|2004|2026|car
Citroen_C4_Picasso|2006|2018|car
Citroen_C4x|2022|2026|car
Citroen_C5_Aircross|2018|2026|car
Citroen_C8|2002|2014|van
Citroen_C_Elysse|2012|2020|car
Citroen_Jumper|1994|2026|van
Citroen_eC4|2020|2026|car
Citroen_eC4x|2022|2026|car
Dacia_Logan_II|2012|2020|car
Dacia_Logan_III|2021|2026|car
Dacia_Logan_MCV|2006|2020|car
Dacia_Sandero_II|2012|2020|car
Dacia_Sandero_III_Stepway|2020|2026|car
Dacia_Sandero_II_Stepway|2012|2020|car
MR6_Dacia_Duster|2010|2026|car
MR6_Peugeot_2008|2013|2026|car
MR6_Peugeot_208|2012|2026|car
MR6_Peugeot_3008|2009|2026|car
MR6_Peugeot_5008|2009|2026|car
MR6_Renault_Captur|2013|2026|car
MR6_Renault_Clio_IV|2012|2019|car
MR6_Renault_Clio_IV_phase_II|2016|2019|car
MR6_Renault_Fluence|2009|2016|car
MR6_Scania_P250|2009|2026|truck
MR6_Toyota_Prius_III|2009|2015|car
Peugeot 106|1991|2003|car
Peugeot_205|1983|1998|car
Peugeot_206|1998|2012|car
Peugeot_406|1995|2004|car
Peugeot_406_Coupe|1997|2004|car
Peugeot_508|2011|2026|car
Peugeot_508_SW|2011|2026|car
Peugeot_607|1999|2010|car
Peugeot_Partner|1996|2026|van
Peugeot_Rifter|2018|2026|van
Peugeot_e208|2019|2026|car
Renault_19|1988|1997|car
Renault_Clio_II|1998|2005|car
Renault_Kangoo|1997|2026|van
Renault_Kangoo_Van|1997|2026|van
Renault_Laguna_I|1994|2001|car
Renault_Laguna_II|2001|2007|car
Renault_Megane_Coupe|1996|2016|car
Renault_Traffic|1980|2026|van`.split('\n').map(x=>x.split('|'));
const S3D_MODELS=new Map(S3D.map(([key,start,end,kind])=>[key.toLowerCase(),{start:+start,end:+end,kind,label:key.replace(/^MR6_/,'').replaceAll('_',' ').replaceAll('-',' '),origin:'international',source:'pack'}]));
const trim=s=>String(s||'').trim(),clean=s=>trim(s).replaceAll('/','\\');
function classify(path){
 const parts=clean(path).split('\\'),last=parts.at(-1)||'',root=parts[1]||'',isS3D=root.toLowerCase()==='ai_cars_s3d_pl_repack';
 const folder=isS3D?parts[2]:parts.at(-2)||root,stem=last.replace(/\.(sco|ovh|bus)$/i,'').replace(/(?:^parked_|_parked(?:_lod)?$|_lod$|^static_|^ai_)/ig,'');
 const pretty=(isS3D?folder:stem).replaceAll('_',' ').replaceAll('-',' ');
 const s3d=S3D_MODELS.get(String(folder).toLowerCase());
 const context=isS3D?folder:parts.slice(1).join('_');
 let identified=s3d||RULES.find(r=>r.regex.test(context));
 const generic=/(?:\b|_)(polizei|police|kripo|fireengine|feuerwehr|rtw|ambulanz|ambulance|rettung|omsz)(?:\b|_)/i.test(context);
 const taxi=/(?:\b|_)(taxi|taxen)(?:\b|_)/i.test(context);
 const emergency=generic;
 const truck=/(?:\b|_)(lkw|trailer|anh[aä]nger|auflieger|tanker|kipper|transporter|lieferwagen|m[uü]ll|daf|scania|volvo_kran)(?:\b|_)/i.test(context);
 const luxury=/(?:\b|_)(lamborghini|ferrari|porsche|amg|e63|r8|s_klasse|s500)(?:\b|_)/i.test(context);
 const s3dbase=isS3D&&parts.length>3&&parts[3]?.toLowerCase()==='texture'; // suspicious packaging within texture folder
 const broadKind=emergency?'emergency':taxi?'taxi':truck?'truck':luxury?'luxury':identified?.kind||'car';
 const gdr=/trabant|wartburg|ifa[_ -]?(?:w50|l60)|(?:^|_)ddr(?:_|$)/i.test(context);
 const uk=/(?:^|_)(wh_uk_ai|uk_ai|lf55|tx4)(?:_|$)/i.test(root+'_'+context);
 const regionHint=/(?:^|_)(or fk|orfk|omsz)(?:_|$)/i.test(context)?'HU':/wien|vienna/i.test(context)?'AT':uk?'GB':/muenchen|berlin|bvg|ruhr|wup_|x10|h[oö]h|ahlheim|bad_huegelsdorf/i.test(context)?'DE':'';
 const plate=isS3D?(last.match(/^(?:Car|BX)_([a-z]{1,3})(?:_([a-z0-9]+))?\.ovh$/i)||[]):[];
 const plateCountry=({H:'HU',UK:'GB',B:'BE',L:'LU'})[(plate[1]||'').toUpperCase()]||(plate[1]||'').toUpperCase();
 const plateType=(plate[2]||'').toLowerCase();
 const lod=/_lod\./i.test(last);
 const special=/(?:_active|_alert|_lights|_code3|_blitzer|_polizei|_police|_kripo|_rtw|_ambulanz|_feuerwehr|_taxi)(?:[_.]|$)/i.test(last);
 if(identified&&/wartburg[_ -]?353[_ -]?85/i.test(context))identified={...identified,start:1985,label:'Wartburg 353 (1985-ös változat)'};
 if(identified&&/eclass[_ -]?w212[_ -]?facelift/i.test(context))identified={...identified,start:2013};
 if(identified&&/focus[_ -]?mk1[_ -]?facelift/i.test(context))identified={...identified,start:2001};
 if(identified&&/vw[_ -]?t5[_ -]?facelift/i.test(context))identified={...identified,start:2009};
 const basename=(isS3D?folder:stem).replace(/^TH_|^TA_|^KI_/i,'');
 const normKey=basename.toLowerCase().replace(/[^a-z0-9]/g,'');
 const pathKey=isS3D?'s3d:'+String(folder).toLowerCase():root.toLowerCase()+':'+String(folder).toLowerCase()+':'+normKey;
 return {path:clean(path),root,folder,basename,label:identified?.label||pretty,modelStart:identified?.start||null,modelEnd:identified?.end||null,
 kind:broadKind,origin:gdr?'east':identified?.origin||'unknown',s3d:isS3D,plateCountry,plateType,lod,special,emergency,regionHint,
 known:!!identified,source:identified?.source?CATALOG_SOURCES[identified.source]||'':'',quality:identified?.source?'forrás szerinti típuskorszak':'fájlnévből becsült',
 pathKey,modelKey:normKey,suspicious:s3dbase};
}
export function catalogCounts(){return {ai:REFERENCE_AI.length,park:REFERENCE_PARK.length};}
const rawAI=REFERENCE_AI.map((line,index)=>{const m=/^(.*\.(?:ovh|bus))[\t ]+([0-9]+)\s*$/i.exec(line);return m?{...classify(m[1]),originalWeight:+m[2],index,type:'ai'}:{...classify(line),originalWeight:1,index,type:'ai',invalid:true};});
const rawPark=REFERENCE_PARK.map((line,index)=>({...classify(line),index,type:'park'}));
export function catalogItems(type='both'){return type==='ai'?rawAI:type==='park'?rawPark:[...rawAI,...rawPark];}
function baseCountry(country){return ({UK:'GB',H:'HU'})[country]||country;}
function plateScore(x,opts,year){
 if(!x.s3d||x.type==='park')return 0;
 const target=baseCountry(opts.country||'DE');
 if(!x.plateCountry||x.plateCountry!==target)return -500;
 if(['export','kurz','zabytkowe','taxi','police'].includes(x.plateType))return opts.special?4:-180;
 if(target==='DE'){
  if(x.plateType==='din')return year>=1956&&year<=2000?(year<1995?52:17):-500;
  if(year<1994)return -500; // modern DE plate cannot be mapped back into 1980s
 }
 if(target==='FR'){
  if(x.plateType==='fni')return year<2009?50:year<=2018?8:-70;
  if(year<2009)return -500; // French SIV introduced April 2009
 }
 if(target==='HU'){
  if(x.plateType==='old')return year>=1990&&year<2004?46:year<2023&&year>=2004?10:-500;
  if(x.plateType==='2022')return year>=2022?48:-500;
  if(year<2004)return -500;
 }
 if(['CZ','SK'].includes(target)&&year<1993)return -500;
 if(x.plateType==='1976')return year>=1976&&year<2000?45:-500;
 if(x.plateType==='flag')return year>=2000&&year<2006?35:-500;
 if(x.plateType==='euroband')return year>=2001?16:-500;
 return 20;
}
function contextSide(opts){
 if(opts.eastWest&&opts.eastWest!=='auto')return opts.eastWest;
 const region=(opts.region||'').toUpperCase();
 if(['DE-BB','DE-SN','DE-ST','DE-MV','DE-TH'].includes(region)&&opts.year<1991)return 'east';
 if(region==='DE-BE'&&opts.year<1991)return 'mixed';
 if((opts.country==='DE')&&opts.year<1991)return 'west';
 return 'mixed';
}
function regionScore(x,opts){
 const country=opts.country||'DE',side=contextSide(opts),year=opts.year;
 let n=0;
 if(x.regionHint){n+=x.regionHint===country?18:-40;}
 if(x.origin==='east'){
  if(side==='east')n+=55;
  else if(side==='west'&&year<1991)n-=55;
  else if(['CZ','SK','HU'].includes(country)&&year<1992)n+=18;
  else if(country==='GB'||country==='FR')n-=35;
 }else if(x.origin==='west'){
  if(side==='east'&&year<1990)n-=70;
  else if(side==='west'&&year<1991)n+=12;
  else if(['DE','AT','CH'].includes(country))n+=8;
 }else if(x.origin==='central'){
  if(['CZ','SK','HU'].includes(country))n+=33;
  else if(side==='east'&&year<1991)n+=2;
 }
 if(country==='GB'&&x.regionHint==='GB')n+=18;
 if(country==='HU'&&/(?:^|_)(orfk|omsz)(?:_|$)/i.test(x.path))n+=25;
 if(x.emergency&&!opts.special)n-=500;
 if(['truck','taxi','luxury'].includes(x.kind)&&!opts.special)n-=50;
 if(x.special&&!opts.special)n-=80;
 if(x.suspicious)n-=500; // misplaced .ovh inside texture directory, model identity conflicts
 if(opts.area==='residential'&&x.kind==='truck')n-=30;
 if(opts.area==='industrial'&&x.kind==='truck')n+=25;
 if(opts.area==='center'&&x.kind==='van')n+=8;
 return n;
}
function dateScore(x,year,uncertain){
 if(!x.known)return uncertain?-25:-500;
 if(x.modelStart>year)return -500;
 const age=year-x.modelStart, afterEnd=year-x.modelEnd;
 if(afterEnd>18)return -500;
 if(afterEnd>12)return -45;
 if(afterEnd>8)return -18;
 if(age<=3)return 8; // new car but not necessarily widespread
 if(age<=14)return 28;
 if(age<=28)return 10;
 return -22;
}
export function scoreCatalog(x,opts){
 const year=Number(opts.year);
 if(!Number.isInteger(year)||year<1950||year>2099)throw new Error('A járműkorszak éve 1950 és 2099 közé essen.');
 let points=30+dateScore(x,year,!!opts.uncertain)+plateScore(x,opts,year)+regionScore(x,opts);
 if(x.lod)points+=opts.lod?8:-300;
 else if(opts.lod)points-=6;
 if(x.invalid)points-=500;
 if(x.kind==='emergency'&&opts.special)points-=2;
 if(x.kind==='luxury')points-=opts.special?10:100;
 if(x.kind==='taxi')points-=opts.special?3:80;
 return points;
}
function parent(path){return path.slice(0,path.lastIndexOf('\\')).toLowerCase();}
function pairPark(ai,parks,opts={}){
 const same=parks.filter(p=>p.root.toLowerCase()===ai.root.toLowerCase());
 const matching=same.filter(p=>(p.s3d&&ai.s3d&&p.folder===ai.folder)||
  (!ai.s3d&&p.modelKey===ai.modelKey)||
  (!ai.s3d&&parent(p.path)===parent(ai.path)&&p.modelKey.includes(ai.modelKey.slice(0,7))));
 matching.sort((a,b)=>Math.abs(Number(a.lod)-Number(!!opts.lod))-Math.abs(Number(b.lod)-Number(!!opts.lod))||Number(a.special)-Number(b.special));
 return matching[0]||null;
}
const compare=(a,b)=>b.score-a.score||a.label.localeCompare(b.label,'hu')||a.path.localeCompare(b.path);
export function recommendCatalog(options={}){
 const opts={country:'DE',year:1990,region:'',area:'residential',eastWest:'auto',lod:false,special:false,uncertain:false,maxAI:35,maxPark:35,search:'',...options};
 const year=+opts.year,filter=String(opts.search||'').toLowerCase().trim(),maxAI=Math.min(250,Math.max(0,+opts.maxAI||0)),maxPark=Math.min(250,Math.max(0,+opts.maxPark||0));
 const eligible=x=>!filter||[x.label,x.path,x.basename].some(s=>s.toLowerCase().includes(filter));
 const ai=rawAI.filter(eligible).map(x=>({...x,score:scoreCatalog(x,{...opts,year})})).filter(x=>x.score>0).sort(compare);
 const preferred=[],seen=new Set();
 for(const r of ai){const dedup=r.label.toLowerCase()+'|'+r.kind;
  if(seen.has(dedup))continue;seen.add(dedup);preferred.push(r);if(preferred.length>=maxAI)break;}
 const p=rawPark.filter(eligible).map(x=>({...x,score:scoreCatalog(x,{...opts,year})})).filter(x=>x.score>0).sort(compare);
 const selectedPark=[],selectedParkPaths=new Set();
 for(const a of preferred){
  if(selectedPark.length>=maxPark)break;
  const paired=pairPark(a,p,opts);
  if(paired&&!selectedParkPaths.has(paired.path)){selectedPark.push(paired);selectedParkPaths.add(paired.path);}
 }
 for(const x of p){if(selectedPark.length>=maxPark)break;if(selectedParkPaths.has(x.path))continue;
  if(selectedPark.some(y=>y.label===x.label&&y.kind===x.kind))continue;
  selectedPark.push(x);selectedParkPaths.add(x.path);
 }
 const parkByKey=new Map(selectedPark.map(x=>[x.pathKey,x]));
 const records=[];
 for(const x of preferred){
  const parked=pairPark(x,selectedPark,opts)||parkByKey.get(x.pathKey);
  const group=x.kind==='truck'?'Trucks':x.kind==='van'?'Commercials':x.kind==='taxi'?'Taxi':x.kind==='emergency'?'Police':contextSide(opts)==='east'&&x.origin==='east'?'GDRCars':'NormalCars';
  const from=String(x.modelStart||''), to=String(Math.min(2099,(x.modelEnd||year)+18));
  const evidence='Saját referenciafájl: kozuti_ai.txt'+(parked?', kozut_parklist.txt':'')+'; '+x.quality+'. Az időszaki és területi gyakoriság becslés, nem igazolt forgalmi adat.';
  records.push({name:x.label,mode:'random',status:'proposed',group,aiPath:x.path,weight:x.kind==='car'?3:1,parkPath:parked?.path||'',parkWeight:1,from,to,source:x.source||'',evidence});
 }
 const parkedSelected=new Set(records.filter(r=>r.parkPath).map(r=>r.parkPath));
 for(const x of selectedPark.slice(0,maxPark)){if(parkedSelected.has(x.path))continue;
  const evidence='Saját referenciafájl: kozut_parklist.txt; '+x.quality+'. Parkoló objektum, nem automatikusan közúti AI-jármű.';
  records.push({name:x.label,mode:'park',status:'proposed',parkPath:x.path,parkWeight:1,from:String(x.modelStart||''),to:String(Math.min(2099,(x.modelEnd||year)+18)),source:x.source||'',evidence});
 }
 const warnings=[];
 if(contextSide(opts)==='mixed'&&opts.country==='DE'&&year<1991&&((opts.region||'').toUpperCase()==='DE-BE'))
  warnings.push('Berlin 1990 előtt: válaszd ki külön a nyugati vagy keleti városrészt.');
 if(year<2000)warnings.push('Történeti év: az újabb OMSI-modcsomag csak később készült. A modell és a rendszám korhűsége külön ellenőrzendő.');
 if(!opts.uncertain)warnings.push('A bizonytalan évjáratú típusok alapértelmezés szerint kimaradnak.');
 warnings.push('A relatív gyakoriságok becslések, nem statisztikai adatok; a járműmodok telepítettségét nem ellenőriztem.');
 return {ai:preferred,park:selectedPark.slice(0,maxPark),records,warnings,stats:{totalAI:rawAI.length,totalPark:rawPark.length,knownAI:rawAI.filter(x=>x.known).length,knownPark:rawPark.filter(x=>x.known).length}};
}
