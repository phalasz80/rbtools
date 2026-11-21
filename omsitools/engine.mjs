/* OMSI Tools engine. No cookies, storage, CDN, or external dependencies. */
export const PLACES = [
 {id:'essen',name:'Essen',country:'DE',subdivision:'DE-NW',language:'DE',zone:'Europe/Berlin',lat:51.4556,lon:7.0116},
 {id:'berlin',name:'Berlin',country:'DE',subdivision:'DE-BE',language:'DE',zone:'Europe/Berlin',lat:52.5200,lon:13.4050},
 {id:'hamburg',name:'Hamburg',country:'DE',subdivision:'DE-HH',language:'DE',zone:'Europe/Berlin',lat:53.5511,lon:9.9937},
 {id:'koeln',name:'Köln',country:'DE',subdivision:'DE-NW',language:'DE',zone:'Europe/Berlin',lat:50.9375,lon:6.9603},
 {id:'muenchen',name:'München',country:'DE',subdivision:'DE-BY',language:'DE',zone:'Europe/Berlin',lat:48.1374,lon:11.5755},
 {id:'augsburg',name:'Augsburg',country:'DE',subdivision:'DE-BY',language:'DE',zone:'Europe/Berlin',lat:48.3705,lon:10.8978},
 {id:'wien',name:'Wien',country:'AT',subdivision:'AT-9',language:'DE',zone:'Europe/Vienna',lat:48.2082,lon:16.3738},
 {id:'zuerich',name:'Zürich',country:'CH',subdivision:'CH-ZH',language:'DE',zone:'Europe/Zurich',lat:47.3769,lon:8.5417},
 {id:'budapest',name:'Budapest',country:'HU',subdivision:'HU-BU',language:'HU',zone:'Europe/Budapest',lat:47.4979,lon:19.0402},
 {id:'debrecen',name:'Debrecen',country:'HU',subdivision:'HU-DE',language:'HU',zone:'Europe/Budapest',lat:47.5316,lon:21.6273}
];
export const encodeYMD = date => date.toISOString().slice(0,10).replaceAll('-','');
const utcDate = (year, month, day) => new Date(Date.UTC(year,month-1,day,12));
function clean(text) { return String(text ?? '').replace(/\s+/g,' ').trim(); }
function ymd(s) {
 const m=/^(\d{4})-?(\d{2})-?(\d{2})$/.exec(String(s||'').slice(0,10).replaceAll('-',''));
 if (!m) throw new Error('Érvénytelen dátum: '+s);
 const d=utcDate(+m[1],+m[2],+m[3]);
 if (d.getUTCFullYear()!==+m[1]||d.getUTCMonth()+1!==+m[2]||d.getUTCDate()!==+m[3]) throw new Error('Nem létező dátum: '+s);
 return encodeYMD(d);
}
function addDays(date, delta) { const a=ymd(date);return encodeYMD(utcDate(+a.slice(0,4),+a.slice(4,6),+a.slice(6,8)+delta)); }
function easter(year) {
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
 const x=Math.floor((h+l-7*m+114)/31),y=(h+l-7*m+114)%31+1;
 return encodeYMD(utcDate(year,x,y));
}
function nameOf(names, lang) {
 if(typeof names==='string')return clean(names);
 if(!Array.isArray(names)||!names.length) return 'Névtelen ünnep/szünet';
 for(const key of [lang,'DE','HU','EN']){const n=names.find(n=>String(n.language).toUpperCase()===key&&n.text);if(n)return clean(n.text);}
 return clean(names[0].text) || 'Névtelen ünnep/szünet';
}
export function parseOmSi(text) {
 const lines=String(text).replace(/^\uFEFF/,'').split(/\r?\n/), events=[];
 for(let i=0;i<lines.length;i++){
  const kind=lines[i].trim().toLowerCase();if(kind!=='[holiday]'&&kind!=='[holidays]')continue;
  const span=kind==='[holidays]';if(i+(span?3:2)>=lines.length)throw new Error('Hiányos OMSI-blokk a(z) '+(i+1)+'. sorban.');
  const start=ymd(lines[i+1].trim()),end=span?ymd(lines[i+2].trim()):start,name=clean(lines[i+(span?3:2)]);
  if(end<start||!name)throw new Error('Hibás intervallum vagy üres név a(z) '+(i+1)+'. sorban.');
  events.push({kind:span?'school':'public',start,end,name});i+=span?3:2;
 }
 if(!events.length)throw new Error('A fájl nem tartalmaz [holiday] vagy [holidays] blokkokat.');
 return events;
}
export function normalizeApi(items,kind,place){
 if(!Array.isArray(items))throw new Error('A naptár API nem listával válaszolt.');
 const result=[];
 for(const x of items){
  if(String(x.type||'').toLowerCase()!==kind)continue;
  // Local-only declarations require explicit city verification.
  if(kind==='public' && String(x.regionalScope||'').toLowerCase()==='local')continue;
  const start=ymd(x.startDate),end=ymd(x.endDate);
  if(end<start)throw new Error('Hibás API-intervallum: '+JSON.stringify(x));
  result.push({kind,start,end,name:nameOf(x.name,(place.language||'DE').toUpperCase())});
 }
 return result;
}
export function parseOverrides(text){
 const rows=String(text||'').replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(x=>x.trim()&&!/^#/.test(x.trim()));
 if(!rows.length)return [];
 const headings=rows.shift().split(';').map(x=>x.trim().toLowerCase());
 for(const key of ['place_id','kind','start','end','name','action'])if(!headings.includes(key))throw new Error('Hiányzó CSV-fejléc: '+key);
 return rows.map((line,i)=>{
  const parts=line.split(';');const v=Object.fromEntries(headings.map((h,j)=>[h,(parts[j]||'').trim()]));
  if(!['school','public'].includes(v.kind)||!['add','remove'].includes(v.action)||!v.place_id||!v.name)throw new Error('Érvénytelen CSV-sor: '+(i+2));
  return v;
 });
}
function ruleDate(rule,year){
 const x=rule.trim().toUpperCase();
 if(/^\d{2}-\d{2}$/.test(x))return ymd(year+'-'+x);
 const eas=/^EASTER([+-]\d+)?$/.exec(x);
 if(eas)return addDays(easter(year),Number(eas[1]||0));
 return ymd(x);
}
export function overridesFor(place,from,to,rows){
 const added=[],removed=[];
 for(const row of rows.filter(r=>r.place_id===place.id)){
  const recurring=x=>/^(\d{2}-\d{2}|EASTER([+-]\d+)?)$/i.test(x);
  if(recurring(row.start)!==recurring(row.end))throw new Error('A kezdő- és végdátum szabálytípusa eltér: '+row.name);
  const years=recurring(row.start)?Array.from({length:to-from+3},(_,i)=>from-1+i):[from];
  for(const year of years){
   let start,end;
   try{start=ruleDate(row.start,year);end=ruleDate(row.end,year);}catch(e){if(row.start==='02-29'&&!((year%4===0&&year%100!==0)||year%400===0))continue;throw e;}
   if(recurring(row.start)&&end<start){
    // Recurring winter holiday stretching beyond New Year.
    end=ruleDate(row.end,year+1);
   }
   if(end<start)throw new Error('Fordított intervallum: '+row.name);
   (row.action==='add'?added:removed).push({kind:row.kind,start,end,name:row.name});
  }
 }
 return {added,removed};
}
export function mergeEvents(events,additions=[],removals=[],from=2020,to=2030){
 const start=from+'0101',end=to+'1231';
 const map=new Map();
 for(const e of [...events,...additions]){
  if(e.end<start||e.start>end)continue;
  if(!['public','school'].includes(e.kind))throw new Error('Ismeretlen eseménytípus.');
  const key=[e.kind,e.start,e.end,e.name].join('|');map.set(key,e);
 }
 const result=[...map.values()].filter(e=>!removals.some(r=>r.kind===e.kind&&(r.name==='*'||r.name.toLocaleLowerCase()===e.name.toLocaleLowerCase())&&r.start<=e.end&&e.start<=r.end));
 return result.sort((a,b)=>(a.start.localeCompare(b.start))||a.kind.localeCompare(b.kind)||a.name.localeCompare(b.name));
}
export function holidayText(events,from,to){
 const lines=[];
 for(let year=from;year<=to;year++){
  lines.push('#####'+year+'#####','');
  const a=events.filter(e=>(e.start.slice(0,4)<from?from:Number(e.start.slice(0,4)))===year).sort((a,b)=>(a.kind==='school'?0:1)-(b.kind==='school'?0:1)||a.start.localeCompare(b.start));
  for(const e of a){
   if(e.kind==='school'){lines.push('[holidays]',e.start,e.end,e.name,'');continue;}
   let d=e.start;while(d<=e.end){if(d>=from+'0101'&&d<=to+'1231')lines.push('[holiday]',d,e.name,'');d=addDays(d,1);}
  }
 }
 return lines.join('\r\n').trimEnd()+'\r\n';
}
export function validatePlace(place){
 if(!/^[a-z0-9_-]{2,40}$/i.test(place.id))throw new Error('A helyazonosító csak betűt, számot, - vagy _ jelet tartalmazhat.');
 if(!place.name||!/^[A-Z]{2}$/.test(place.country.toUpperCase()))throw new Error('Helynév és kétbetűs országkód szükséges.');
 if(!Number.isFinite(+place.lat)||!Number.isFinite(+place.lon)||Math.abs(+place.lat)>90||Math.abs(+place.lon)>180)throw new Error('Érvénytelen koordináták.');
 try{new Intl.DateTimeFormat('en',{timeZone:place.zone}).format(new Date());}catch{throw new Error('Ismeretlen IANA-időzóna: '+place.zone);}
}
function tzOffset(zone,time){
 const fmt=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'shortOffset'});
 const label=fmt.formatToParts(time).find(p=>p.type==='timeZoneName')?.value||'';
 const m=/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(label);
 if(!m)throw new Error('A böngésző nem ad használható időzónaeltolódást ('+zone+': '+label+').');
 return m[1]?(m[1]==='-'?-1:1)*(Number(m[2])*60+Number(m[3]||0)):0;
}
function utcTransition(zone,low,high,previous){
 while(high-low>60000){let mid=Math.floor((low+high)/120000)*60000;if(mid<=low)mid=low+60000;if(mid>=high)break;
  if(tzOffset(zone,new Date(mid))===previous)low=mid;else high=mid;
 }
 return high;
}
export function timezoneText(place,from,to){
 validatePlace(place);
 if(from<1970||to>2098||from>to)throw new Error('Támogatott évhatár: 1970–2098.');
 const offsetCache=new Map(),offset=t=>{const key=t.getTime();if(!offsetCache.has(key))offsetCache.set(key,tzOffset(place.zone,t));return offsetCache.get(key);};
 const first=Date.UTC(from-1,0,1,12),last=Date.UTC(to+1,11,31,12),oneDay=86400000;
 let prev=offset(new Date(first)),minimum=prev;
 const changes=[];
 for(let t=first+oneDay;t<=last;t+=oneDay){const current=offset(new Date(t));minimum=Math.min(minimum,current,prev);
  if(current!==prev){const ms=utcTransition(place.zone,t-oneDay,t,prev);const before=prev;
   const oldLocal=new Date(ms+before*60000);const d=oldLocal.getUTCFullYear()*10000+(oldLocal.getUTCMonth()+1)*100+oldLocal.getUTCDate();
   changes.push({date:String(d),hour:oldLocal.getUTCHours(),minute:oldLocal.getUTCMinutes(),delta:current-prev});
  }prev=current;
 }
 if(minimum%60)throw new Error('Az időzóna alapeltolódása nem egész óra; a mintafájl nem kezeli.');
 const selected=changes.filter(c=>c.date>=from+'0101'&&c.date<=to+'1231');
 const positive=selected.filter(c=>c.delta>0),negative=selected.filter(c=>c.delta<0);
 if(selected.some(c=>c.minute!==0||Math.abs(c.delta)!==60))throw new Error('Nem egyórás nyáriidő-váltás található. A formátum nem modellezhető biztonsággal.');
 const pairs=[];
 for(const on of positive){const off=negative.find(e=>e.date>on.date&&e.date.slice(0,4)===on.date.slice(0,4));if(!off)throw new Error('Éven átnyúló DST-időszak: ehhez az OMSI mintában nincs biztos szabály.');
  pairs.push({on,off});
 }
 if(negative.some(e=>!pairs.some(p=>p.off===e)))throw new Error('Pár nélküli óraátállítás található; a kezelt évhatár kiterjesztése szükséges.');
 const lines=['[timezone]',String(minimum/60),'','[location]',String(place.lat),String(place.lon),''];
 for(const p of pairs)lines.push('[DST]',p.on.date,p.off.date,String(p.on.hour),String(p.off.hour),'1','');
 return {text:lines.join('\r\n').trimEnd()+'\r\n',count:pairs.length};
}
const CP1252_SPECIAL = {
 '€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159
};
const CP1250_SPECIAL = {
 '€':128,'‚':130,'„':132,'…':133,'†':134,'‡':135,'‰':137,'Š':138,'‹':139,'Ś':140,'Ť':141,'Ž':142,'Ź':143,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'™':153,'š':154,'›':155,'ś':156,'ť':157,'ž':158,'ź':159,
 'ˇ':161,'˘':162,'Ł':163,'Ą':165,'Ş':170,'Ź':143,'Ć':198,'Ç':199,'Č':200,'É':201,'Ę':202,'Ë':203,'Ě':204,'Í':205,'Î':206,'Ď':207,'Đ':208,'Ń':209,'Ň':210,'Ó':211,'Ô':212,'Ő':213,'Ö':214,'×':215,'Ř':216,'Ů':217,'Ú':218,'Ű':219,'Ü':220,'Ý':221,'Ţ':222,'ß':223,'ŕ':224,'á':225,'â':226,'ă':227,'ä':228,'ĺ':229,'ć':230,'ç':231,'č':232,'é':233,'ę':234,'ë':235,'ě':236,'í':237,'î':238,'ď':239,'đ':240,'ń':241,'ň':242,'ó':243,'ô':244,'ő':245,'ö':246,'÷':247,'ř':248,'ů':249,'ú':250,'ű':251,'ü':252,'ý':253,'ţ':254,'˙':255,
 ' ':160,'¤':164,'¦':166,'§':167,'¨':168,'©':169,'«':171,'¬':172,'­':173,'®':174,'Ż':175,'°':176,'±':177,'˛':178,'ł':179,'´':180,'µ':181,'¶':182,'·':183,'¸':184,'ą':185,'ş':186,'»':187,'Ľ':188,'˝':189,'ľ':190,'ż':191,'Ŕ':192,'Á':193,'Â':194,'Ă':195,'Ä':196,'Ĺ':197
};
export function omsiEncode(content,cp='1252'){
 const out=[];
 for(const ch of content){const x=ch.codePointAt(0);let n;
  if(x<=127)n=x;
  else if(cp==='1252')n=CP1252_SPECIAL[ch]??((x>=160&&x<=255)?x:undefined);
  else n=CP1250_SPECIAL[ch];
  if(n===undefined)throw new Error('A(z) '+ch+' karakter nem kódolható a Windows-'+cp+' kódlappal. Válassz megfelelő nyelvet vagy javítsd a kivételt.');
  out.push(n);
 }
 return new Uint8Array(out);
}
const te=new TextEncoder();
const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?(0xEDB88320^(c>>>1)):c>>>1;table[n]=c>>>0;}
function crc32(data){let c=0xFFFFFFFF;for(const b of data)c=table[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function w16(a,v){a.push(v&255,(v>>>8)&255);}function w32(a,v){w16(a,v&65535);w16(a,Math.floor(v/65536));}
export function makeZip(files){
 const parts=[],central=[];let position=0;
 const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(Math.floor(now.getSeconds()/2)),dosDate=((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
 for(const file of files){const name=te.encode(file.path),data=file.bytes,crc=crc32(data);if(name.length>65535)throw new Error('Túl hosszú fájlnév.');
  const local=[];w32(local,0x04034b50);w16(local,20);w16(local,0x800);w16(local,0);w16(local,dosTime);w16(local,dosDate);w32(local,crc);w32(local,data.length);w32(local,data.length);w16(local,name.length);w16(local,0);
  parts.push(Uint8Array.from(local),name,data);
  const c=[];w32(c,0x02014b50);w16(c,20);w16(c,20);w16(c,0x800);w16(c,0);w16(c,dosTime);w16(c,dosDate);w32(c,crc);w32(c,data.length);w32(c,data.length);w16(c,name.length);w16(c,0);w16(c,0);w16(c,0);w16(c,0);w32(c,0);w32(c,position);central.push(Uint8Array.from(c),name);
  position+=local.length+name.length+data.length;
 }
 const centralSize=central.reduce((n,p)=>n+p.length,0),end=[];w32(end,0x06054b50);w16(end,0);w16(end,0);w16(end,files.length);w16(end,files.length);w32(end,centralSize);w32(end,position);w16(end,0);
 const all=[...parts,...central,Uint8Array.from(end)],sum=all.reduce((n,p)=>n+p.length,0),merged=new Uint8Array(sum);let pos=0;
 for(const p of all){merged.set(p,pos);pos+=p.length;}return merged;
}
