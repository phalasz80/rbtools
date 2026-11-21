/* Source-differentiated fleet evidence. Historical car stock != new registrations != moving traffic. */
export const FLEET_PROFILES=[
 {id:'munich81',title:'München, 1981 · tényleges nyilvántartott Pkw-állomány',place:'München',year:1981,kind:'stock',grade:'official_city',total:471998,source:'https://mstatistik.muenchen.de/archivierung_historische_berichte/MuenchenerStatistik/1981/ms810303.pdf',note:'Városi járműállomány 1981. 04. 25-én. A felsorolt márkák részösszeget adnak; az egyéb márkák nincsenek modellezve.',counts:{Volkswagen:106134,Opel:67867,BMW:57332,Mercedes:50158,Ford:49870,Audi:31572,Renault:19292,Fiat:18379,Peugeot:8236,Citroen:7790,Toyota:4375,Honda:4339,Nissan:2433,Porsche:2517,Volvo:1157,Lada:1115,Skoda:473}},
 {id:'frg85',title:'NSZK és Nyugat-Berlin, 1985 · kiválasztott modellek új regisztrációi',place:'NSZK és Nyugat-Berlin',year:1985,kind:'selected_new_registrations',grade:'secondary_national_proxy',total:null,source:'https://www.verkehrsmodelle.de/2022/02/06/top-50-pkw-neuzulassungen-1976-1985/',note:'Kiválasztott újautó-modellek országos regisztrációinak részösszegei. Nem Berlin 1986-os járműállományi adatai.',counts:{Volkswagen:522116,Opel:359622,Mercedes:244966,Ford:233401,BMW:140884,Audi:127224,Renault:26546,Toyota:24227,Lada:8306,Porsche:11394}},
 {id:'berlin87',title:'Nyugat-Berlin, 1987 · csak összesített Pkw-darabszám',place:'Nyugat-Berlin',year:1987,kind:'total_only',grade:'historical_context',total:612309,source:'https://berlingeschichte.de/bms/bmstxt01/0106proi.htm',note:'612 309 nyilvántartott személyautó, de márkánkénti részletezés nélkül. Nem alkalmas márkák súlyozására.',counts:{}}
];
export const BRANDS=['Volkswagen','Opel','BMW','Mercedes','Ford','Audi','Renault','Fiat','Peugeot','Citroen','Toyota','Honda','Nissan','Porsche','Volvo','Lada','Skoda'];
const RX=[
 ['Volkswagen',/volkswagen|\bvw[_ -]|golf|polo|jetta|passat|scirocco|kaefer/],
 ['Opel',/opel|corsa|ascona|kadett|vectra|zafira|omega|astra/],
 ['BMW',/bmw[_ -]|bmw\b/],
 ['Mercedes',/mercedes|daimler|\bmb[_ -]|eclass|w123|w124|w212|w203|w213|s_klasse/],
 ['Ford',/ford|focus|fiesta|escort|sierra|transit/],
 ['Audi',/audi|quattro/],
 ['Renault',/renault|clio|megane|laguna|kangoo|espace|captur/],
 ['Fiat',/fiat|punto|ducato/],
 ['Peugeot',/peugeot/],
 ['Citroen',/citroen|citro[eë]n/],
 ['Toyota',/toyota|prius|corolla|yaris|hiace/],
 ['Honda',/honda/],
 ['Nissan',/nissan|datsun/],
 ['Porsche',/porsche/],
 ['Volvo',/volvo/],
 ['Lada',/lada|vaz[_ -]?[0-9]/],
 ['Skoda',/skoda|škoda/]
];
export function brandOf(record){
 const s=[record.aiPath,record.parkPath,record.name].filter(Boolean).join(' ').toLowerCase();
 return RX.find(([,pattern])=>pattern.test(s))?.[0]||'';
}
export const fleetProfile=id=>FLEET_PROFILES.find(x=>x.id===id);
export function fleetShares(profile){
 const rows=Object.entries(profile?.counts||{}).filter(([,v])=>v>0),sum=rows.reduce((a,[,v])=>a+v,0);
 return rows.map(([brand,count])=>({brand,count,percent:Math.round(10000*count/(profile.total||sum))/100})).sort((a,b)=>b.count-a.count);
}
export function fleetCSVTemplate(){return 'marka;darab\r\nVolkswagen;106134\r\nOpel;67867\r\nFord;49870\r\nMercedes;50158\r\nBMW;57332\r\nAudi;31572\r\n';}
export function parseFleetCSV(text,context={}){
 const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith('#'));
 if(lines.length<2)throw Error('A CSV-hez fejléc és legalább egy márkasor szükséges.');
 const fields=lines.shift().toLowerCase().split(';').map(x=>x.trim()),brandCol=fields.indexOf('marka'),countCol=fields.indexOf('darab');
 if(brandCol<0||countCol<0)throw Error('CSV fejléc: marka;darab');
 const counts={};
 for(const [i,line] of lines.entries()){
  const v=line.split(';').map(x=>x.trim()),brand=v[brandCol],n=Number(v[countCol]);
  if(!BRANDS.includes(brand)||!Number.isInteger(n)||n<0)throw Error((i+2)+'. sor: hibás márka vagy darabszám: '+brand);
  counts[brand]=(counts[brand]||0)+n;
 }
 if(!Object.values(counts).some(x=>x>0))throw Error('Nincs pozitív darabszám.');
 return {id:'uploaded',title:context.title||'Felhasználói járműállomány',place:context.place||'egyedi',year:Number(context.year||0),kind:'user_supplied',grade:'unverified',total:Number(context.total)||null,source:context.source||'',note:'A megadott terület, év és forrás adatait a felhasználónak kell igazolnia.',counts};
}
export function applyFleetProfile(records,profile,{unknownPolicy='keep',unit=1000}={}){
 if(!Array.isArray(records))throw Error('Hiányzik a járműlista.');
 if(!profile||!Object.values(profile.counts||{}).some(x=>x>0))throw Error('Ehhez a profilhoz nincs alkalmazható márkánkénti darabszám.');
 const eligible=records.filter(r=>r.mode==='random'&&profile.counts[brandOf(r)]>0),groups=new Map();
 for(const r of eligible){const b=brandOf(r);if(!groups.has(b))groups.set(b,[]);groups.get(b).push(r);}
 if(!groups.size)throw Error('Az AI-katalógusban nem találtam egyetlen, e profilból súlyozható járműmárkát sem.');
 const represented=[...groups.keys()],sum=represented.reduce((s,b)=>s+profile.counts[b],0);
 let changed=0,dropped=0;
 const result=records.filter(r=>{if(unknownPolicy==='drop'&&r.mode==='random'&&!groups.has(brandOf(r))){dropped++;return false;}return true;}).map(r=>{
  if(r.mode!=='random'||!groups.has(brandOf(r)))return {...r};
  const brand=brandOf(r),weight=Math.max(1,Math.min(1000,Math.round(unit*profile.counts[brand]/sum/groups.get(brand).length)));changed++;
  return {...r,weight,evidence:[r.evidence||'','Márkasúly az alábbi forrásból: '+profile.title+'. Adatfajta: '+profile.kind+'. Az adott márka típusai között egyenlő közelítő megosztás.'].filter(Boolean).join(' ')};
 });
 const unrepresented=Object.keys(profile.counts).filter(b=>profile.counts[b]>0&&!groups.has(b));
 return {records:result,changed,dropped,unrepresented,matchedBrands:represented,profile,notes:[
  'A nyilvántartott állomány vagy újautó-forgalombahelyezés nem azonos a közúti járművek megjelenési gyakoriságával.',
  profile.kind==='selected_new_registrations'?'Ez országos újautó-modellminta, nem Berlin márkánkénti járműállománya.':'Márkán belül nincs modellenkénti igazolt arány.',
  unrepresented.length?'A listában nem szereplő márkák: '+unrepresented.join(', ')+'. A jelenlévő márkákat újranormalizáltuk.':''
 ].filter(Boolean)};
}
