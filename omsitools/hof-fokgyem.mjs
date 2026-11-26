// FOK-GYEM 1.1 HOF conversion; no network or game scripts required.
const suffix = ' - FOK-GYEM 1.1';
const tag = s => s.trim().split(/\s+<=/)[0].trim().toLowerCase();
const clean = s => s.split(/\s+<=/)[0].trim();
const isSep = s => /^\s*(?:\.{3,}|={3,}|#{3,}|-{3,})/.test(s);
const isTag = s => /^\s*\[[^\]]+\]/.test(s);
const filename = s => s.replace(/(?:_FOKGYEM_1\.1)?\.hof$/i,'')+'_FOKGYEM_1.1.hof';
function fromUnits(a){let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.slice(i,i+8192));return s;}
export function decodeHof(bytes){
 const b=new Uint8Array(bytes);
 if(b[0]===255&&b[1]===254||b[0]===254&&b[1]===255){
  if(b.length%2)throw Error('Páratlan hosszúságú UTF-16 fájl.');
  const le=b[0]===255,v=new DataView(b.buffer,b.byteOffset,b.byteLength),u=new Uint16Array((b.length-2)/2);
  for(let i=0;i<u.length;i++)u[i]=v.getUint16(2+i*2,le);
  return {text:fromUnits(u),encoding:le?'UTF-16LE':'UTF-16BE',encode:s=>{const out=new Uint8Array(2+s.length*2),d=new DataView(out.buffer);out.set(b.slice(0,2));for(let i=0;i<s.length;i++)d.setUint16(2+i*2,s.charCodeAt(i),le);return out;}};
 }
 // Treat legacy bytes as opaque code units: no lossy guessing of ANSI codepages.
 const bom=b[0]===239&&b[1]===187&&b[2]===191;
 if(bom){return {text:new TextDecoder('utf-8',{fatal:true}).decode(b),encoding:'UTF-8 BOM',encode:s=>{const x=new TextEncoder().encode(s),o=new Uint8Array(x.length+3);o.set([239,187,191]);o.set(x,3);return o;}};}
 try{const t=new TextDecoder('utf-8',{fatal:true}).decode(b);return {text:t,encoding:'UTF-8 / ASCII',encode:s=>new TextEncoder().encode(s)};}catch{}
 return {text:fromUnits(b),encoding:'ANSI (byte-preserving)',encode:s=>Uint8Array.from(s,c=>{const n=c.charCodeAt(0);if(n>255)throw Error('Nem reprezentálható ANSI karakter.');return n;})};
}
export function convertHof(text,{repair=true}={}){
 const nl=text.includes('\r\n')?'\r\n':text.includes('\r')?'\r':'\n';
 const a=text.split(/\r\n|\n|\r/), warnings=[], out=[], stops=new Set(), codes=new Set(), refs=new Set(), trips=[];
 const count=(key,min)=>{const hits=[];for(let i=0;i<a.length;i++)if(tag(a[i])===key){const n=Number(clean(a[i+1]||''));if(!Number.isInteger(n)||n<0||n>512||!clean(a[i+1]||''))throw Error('Hibás mezőszám: '+key);hits.push([i+1,n]);}
  if(!hits.length)throw Error('Hiányzó fejléc: '+key);
  if(hits.some(x=>x[1]!==hits[0][1]))throw Error('Eltérő ismételt mezőszám: '+key);
  const old=hits[0][1],next=Math.max(old,min);for(const [i] of hits)a[i]=String(next);return [old,next];};
 const [tc,T]=count('stringcount_terminus',41),[bc,B]=count('stringcount_busstop',30);
 const ni=a.findIndex(s=>tag(s)==='[name]');if(ni<0||!clean(a[ni+1]||''))throw Error('Hiányzó [name].');
 a[ni+1]=clean(a[ni+1]).replace(/\s*-\s*FOK[- ]?GYEM(?:\s+1\.1)?$/i,'')+suffix;
 let termini=0,busStops=0,routes=0,added=0;
 function fields(v,isTerm){
  const off=isTerm?2:1,n=isTerm?T:B;
  if(v.length>off+n){if(v.slice(off+n).some(x=>x.trim()))throw Error('A deklaráltnál több adatmező.');v=v.slice(0,off+n);}
  while(v.length<off+n)v.push('');
  const f=v.slice(off),name=clean(v[off-1]||'');
  const fill=(i,x)=>{if(!f[i].trim())f[i]=x;};
  if(isTerm){termini++;const code=clean(v[0]);if(codes.has(code))warnings.push('Ismételt célkód: '+code);codes.add(code);
   if(!/^(?:leerfeld|empty|blanko?|üres)$/i.test(name)&&code!=='0'){
    const dest=clean(f[0]||'')||name;
    // Retain existing destination pairs; do not overwrite a custom second line.
    if(!f[34].trim()&&!f[35].trim())fill(34,dest);
    if(!f[36].trim()&&!f[37].trim()){fill(36,f[34]);fill(37,f[35]);}
    fill(40,[f[34],f[35]].map(x=>x.trim()).filter(Boolean).join(' ')||dest);
   }
  }else{busStops++;stops.add(name);fill(26,name);}
  return [...v.slice(0,off),...f];
 }
 let insertAt=-1;
 for(let i=0;i<a.length;){
  const t=tag(a[i]);
  const term=['[addterminus]','[addterminus_allexit]','[addterminus_{allexit}]'].includes(t),stop=t==='[addbusstop]';
  if(term||stop){
   const off=term?2:1,old=term?tc:bc;
   let end=i+1;while(end<a.length&&!isTag(a[end])&&!isSep(a[end])&&end<i+1+off+old)end++;
   let v=a.slice(i+1,end);
   if(v.length<off||!clean(v[off-1]))throw Error('Hiányos definíció a(z) '+(i+1)+'. sorban.');
   if(term&&!/^\d+$/.test(clean(v[0])))throw Error('Hibás célkód a(z) '+(i+1)+'. sorban.');
   // Remove explanatory inline comments from data lines, not actual data.
   v=v.map(x=>x.includes('<=')?clean(x):x);
   out.push(term&&t==='[addterminus_{allexit}]'?'[addterminus_allexit]':a[i],...fields(v,term));i=end;continue;
  }
  if(t==='[addterminus_list]'||t==='[addbusstop_list]'){
   const term=t==='[addterminus_list]',off=term?2:1;out.push(a[i++]);let ended=false;
   while(i<a.length){const l=a[i++];if(tag(l)==='[end]'){out.push(l);ended=true;break;}
    if(isTag(l))throw Error('Lezáratlan lista: '+t);
    if(!l.trim()||isSep(l)){out.push(l);continue;}
    let v=l.split('\t'),prefix='';
    if(term){if(v[0]===''||/^\{ALLEX\}$/i.test(v[0]))prefix=v.shift()+'\t';if(!/^\d+$/.test(clean(v[0]||'')))throw Error('Ismeretlen célállomási listasor: '+l.slice(0,70));}
    if(v.length<off||!clean(v[off-1]))throw Error('Hiányos listasor: '+l.slice(0,70));
    out.push(prefix+fields(v,term).join('\t'));
   }
   if(!ended)throw Error('Hiányzó [end]: '+t);continue;
  }
  if(t==='[infosystem_trip]'){if(insertAt<0)insertAt=out.length;routes++;trips.push({route:clean(a[i+1]||''),code:clean(a[i+3]||'')});}
  if(t==='[infosystem_busstop_list]'){
   const n=Number(clean(a[i+1]||''));
   if(!Number.isInteger(n)||n<0||n>10000||i+2+n>a.length)warnings.push('Hibás megállószám a(z) '+(i+1)+'. sorban.');
   else for(let j=i+2;j<i+2+n;j++){if(isTag(a[j])||isSep(a[j])||!clean(a[j])){warnings.push('Hiányos megállólista a(z) '+(i+1)+'. sorban.');break;}refs.add(clean(a[j]));}
  }
  out.push(a[i++]);
 }
 if(!termini)throw Error('Nem található célállomás-definíció.');
 if(!routes)warnings.push('Nincs [infosystem_trip] útvonal.');
 for(const r of trips)if(!codes.has(r.code))warnings.push('Hiányzó célkód: '+r.code+' (útvonal: '+r.route+')');
 const missing=[...refs].filter(x=>!stops.has(x));
 if(missing.length){warnings.push(missing.length+' hiányzó megállóazonosító'+(repair?' – szintetikus definíció pótolva.':' – nem módosítva.'));
  if(repair){const block=[];for(const name of missing){const v=Array(B+1).fill('');v[0]=name;v[1]=name;block.push('[addbusstop]',...fields(v,false),'................','');added++;}out.splice(insertAt<0?out.length:insertAt,0,...block);}
 }
 return {text:out.join(nl),name:a[ni+1],termini,busStops,routes,added,warnings,oldCounts:[tc,bc],counts:[T,B]};
}
export function convertHofBytes(name,bytes,options){const d=decodeHof(bytes),r=convertHof(d.text,options);return {...r,encoding:d.encoding,filename:filename(name),bytes:d.encode(r.text)};}

// Read ZIP central directory; only stored and DEFLATE entries, bounded extraction.
export async function readHofZip(input){
 const b=new Uint8Array(input),v=new DataView(b.buffer,b.byteOffset,b.byteLength),u16=i=>v.getUint16(i,true),u32=i=>v.getUint32(i,true);
 if(b.length>100*1024*1024)throw Error('ZIP legfeljebb 100 MB lehet.');
 let e=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(u32(i)===0x06054b50&&i+22+u16(i+20)===b.length){e=i;break;}
 if(e<0||u16(e+4)||u16(e+6))throw Error('Érvénytelen vagy több részes ZIP.');
 const count=u16(e+10);if(count>2000||count===65535)throw Error('Legfeljebb 2000 ZIP-bejegyzés támogatott; ZIP64 nem.');
 let p=u32(e+16),total=0;const result=[];
 for(let j=0;j<count;j++){
  if(p+46>e||u32(p)!==0x02014b50)throw Error('Hibás ZIP-katalógus.');
  const flags=u16(p+8),method=u16(p+10),cs=u32(p+20),size=u32(p+24),n=u16(p+28),x=u16(p+30),c=u16(p+32),off=u32(p+42);
  if(p+46+n+x+c>e)throw Error('Csonka ZIP-katalógus.');
  const name=new TextDecoder(flags&2048?'utf-8':'windows-1252').decode(b.slice(p+46,p+46+n));p+=46+n+x+c;
  if(!/\.hof$/i.test(name))continue;
  if(flags&1||![0,8].includes(method)||size>20*1024*1024||(total+=size)>200*1024*1024)throw Error('Nem támogatott vagy túl nagy ZIP-bejegyzés: '+name);
  if(off+30>b.length||u32(off)!==0x04034b50)throw Error('Hibás ZIP-fejléc.');
  const start=off+30+u16(off+26)+u16(off+28);if(start+cs>b.length)throw Error('Csonka ZIP-adat.');
  let bytes=b.slice(start,start+cs);
  if(method===8){
   if(typeof DecompressionStream==='undefined')throw Error('A böngésző nem támogatja a ZIP kibontását. Töltsd fel a kibontott HOF-fájlokat.');
   const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(),chunks=[];let len=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;len+=value.length;if(len>size)throw Error('A ZIP kibontott mérete eltér a fejlécétől.');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
   bytes=new Uint8Array(len);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
  }
  if(bytes.length!==size)throw Error('Eltérő ZIP-méret: '+name);
  result.push({name:name.replace(/\\/g,'/').split('/').pop(),bytes});
 }
 return result;
}
