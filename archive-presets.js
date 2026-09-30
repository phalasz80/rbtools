/* RBTools archive presets: modify only known CSS-only archives, retain old content verbatim. */
(function(root){"use strict";
const spec={kk:{wrap:"kk-sections",block:"kk-year",id:"kozvetlen-",entry:"kk-episode"},it:{wrap:"innotrans-sections",block:"innotrans-year-section",id:"innotrans-choice-",entry:"it-entry"}};
const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ye=x=>{x=String(x);if(!/^(19|20)\d{2}$/.test(x))throw Error("Négyjegyű évszám kell.");return x;};
function detect(s,label=""){
 s=String(s||"");const name=String(label||"").toLowerCase();
 if(/id=["']kk-archive["']/.test(s))return "kk";
 if(/id=["']innotrans-archive["']/.test(s))return "it";
 const tagged=s.match(/data-rb-template=["'](impresszum|braking|zusi|plain)["']/i);
 if(tagged)return tagged[1].toLowerCase();
 if(/impresszum\.html|impresszum/i.test(name))return "impresszum";
 if(/vasuti-fekezes\.html/i.test(name))return "braking";
 if(/magyar-zusi-letoltesek\.html/i.test(name))return "zusi";
 return "";
}
function years(s){return [...new Set([...s.matchAll(/\bdata-rb-static-section=["'](\d{4})["']/g)].map(m=>m[1]))].sort((a,b)=>b-a);}
function check(s,k){if(detect(s)!==k||!spec[k]||/<table\b/i.test(s)||!s.includes('id="rb-static-page-nav"')||!s.includes('class="'+spec[k].wrap+'"'))throw Error("Nyisd meg a két jóváhagyott, táblázatmentes archívumsablon egyikét.");return years(s);}
function section(k,y,o={}){
 if(k==="kk")return '<section class="kk-year kk-year-'+y+'" data-kk-year="'+y+'" data-rb-static-section="'+y+'" aria-label="Közvetlen Kocsi '+y+'">\n<h3 style="text-align:center">'+y+'</h3>\n'+(o.summary?'<div style="text-align:justify">'+esc(o.summary)+'</div>\n':"")+'<hr class="kk-year-divider" />\n</section>';
 return '<section class="innotrans-year-section" id="innotrans-'+y+'" data-innotrans-year="'+y+'" data-rb-static-section="'+y+'" aria-label="InnoTrans '+y+'">\n<h2>InnoTrans '+y+'</h2>\n<br />'+(o.banner?'<div class="separator" style="text-align:center"><img src="'+esc(o.banner)+'" width="600" alt="InnoTrans '+y+' fejléc" /></div>':"")+'<div style="text-align:justify">'+esc(o.summary||"Az InnoTrans "+y+" kiállításával kapcsolatos írásaink és tudósításaink.")+'</div>\n<hr align="center" /><br />\n<hr class="it-year-divider" />\n</section>';
}
function rules(k,ys){
 const c=spec[k],y=ys[0],block="."+c.block,wrap="."+c.wrap,all=k==="kk"?"kozvetlen-osszes":"innotrans-osszes";
 const sel=v=>k==="kk"?".kk-year-"+v:"#innotrans-"+v,nav=k==="kk"?"#rb-static-page-nav":"#rb-static-page-nav #innotrans-top";
 const normal="border-color:#c9c9c9!important;background:#fff!important;color:#333!important;",active="border-color:#444!important;background:#444!important;color:#fff!important;";
 let a=["/* RBTOOLS-YEAR-RULES-START */",wrap+" "+block+"{display:none!important}",wrap+" "+sel(y)+"{display:block!important}"];
 for(const n of ys){a.push("#"+c.id+n+":target ~ "+wrap+" "+block+"{display:none!important}","#"+c.id+n+":target ~ "+wrap+" "+sel(n)+"{display:block!important}");}
 a.push("#"+all+":target ~ "+wrap+" "+block+"{display:block!important}");
 if(k==="it")a.push("#innotrans-archive:has("+block+":target) "+wrap+" "+block+"{display:none!important}","#innotrans-archive:has("+block+":target) "+wrap+" "+block+":target{display:block!important}");
 a.push(nav+' a[href="#'+c.id+y+'"]{'+active+'}');
 for(const n of ys)a.push("#"+c.id+n+":target ~ "+nav+' a[href="#'+c.id+y+'"]{'+normal+'}',"#"+c.id+n+":target ~ "+nav+' a[href="#'+c.id+n+'"]{'+active+'}');
 a.push("#"+all+":target ~ "+nav+' a[href="#'+c.id+y+'"]{'+normal+'}',"#"+all+":target ~ "+nav+' a[href="#'+all+'"]{'+active+'}');
 if(k==="it")for(const n of ys)a.push('#innotrans-archive:has(#innotrans-'+n+':target) '+nav+' a[href="#'+c.id+y+'"]{'+normal+'}','#innotrans-archive:has(#innotrans-'+n+':target) '+nav+' a[href="#'+c.id+n+'"]{'+active+'}');
 return a.join("\n")+"\n/* RBTOOLS-YEAR-RULES-END */";
}
function style(s,k,ys){
 const rule=rules(k,ys),start="/* RBTOOLS-YEAR-RULES-START */",end="/* RBTOOLS-YEAR-RULES-END */",a=s.indexOf(start),b=s.indexOf(end);
 if(a>=0||b>=0){if(a<0||b<a)throw Error("A kezelt évválasztó CSS sérült.");return s.slice(0,a)+rule+s.slice(b+end.length);}
 const p=s.indexOf("</style>");if(p<0)throw Error("Az évválasztó stílusa hiányzik.");
 return s.slice(0,p)+rule+"\n"+s.slice(p);
}
function addYear(s,k,y,o={}){
 y=ye(y);let old=check(s,k);if(old.includes(y))throw Error("Ez az év már szerepel az oldalon.");
 const c=spec[k],secs=[...s.matchAll(/<section\b[^>]*\bdata-rb-static-section=["'](\d{4})["'][^>]*>/g)];
 const targets=[...s.matchAll(new RegExp('<span\\b[^>]*\\bid=["\\x27]'+c.id+'\\d{4}["\\x27][^>]*>',"g"))];
 const links=[...s.matchAll(new RegExp('<a\\s+href=["\\x27]#'+c.id+'\\d{4}["\\x27][^>]*>\\d{4}</a>',"g"))];
 if(!secs.length||!targets.length||!links.length)throw Error("Hiányos a jóváhagyott évnavigáció.");
 const place=(arr,value,fallback)=>{const smaller=arr.find(x=>value(x)<Number(y));return smaller?smaller.index:fallback;};
 const navEnd=s.indexOf("</div>",links[0].index),secEnd=s.indexOf("</section>",secs.at(-1).index);
 if(navEnd<0||secEnd<0)throw Error("Hibás a sablon szerkezete.");
 const positions=[
  {p:place(secs,x=>Number(x[1]),secEnd+10),v:section(k,y,o)+"\n"},
  {p:place(targets,x=>Number(x[0].match(/\d{4}/)[0]),targets.at(-1).index+targets.at(-1)[0].length),v:'\n  <span id="'+c.id+y+'" class="'+(k==="kk"?"kk-filter-target kk-year-selector":"it-filter-target")+'" aria-hidden="true"></span>'},
  {p:place(links,x=>Number(x[0].match(/\d{4}/)[0]),navEnd),v:'<a href="#'+c.id+y+'">'+y+'</a>\n'}].sort((a,b)=>b.p-a.p);
 for(const ch of positions)s=s.slice(0,ch.p)+ch.v+s.slice(ch.p);
 s=style(s,k,[...old,y].sort((a,b)=>b-a));
 if(years(s).length!==old.length+1)throw Error("Az új év ellenőrzése sikertelen.");
 return s;
}
function article(k,d){
 if(!spec[k])throw Error("Ismeretlen sablon.");
 const title=String(d.title||"").trim(),date=String(d.date||"").trim(),url=String(d.url||"").trim(),summary=String(d.summary||"").trim();
 if(!title||!date||!url||!summary)throw Error("A cím, dátum, URL és leírás kötelező.");
 if(!/^\d{4}\.\d{2}\.\d{2}\.$/.test(date))throw Error("A dátum alakja: ÉÉÉÉ.HH.NN.");
 const [yy,mm,dd]=date.slice(0,-1).split(".").map(Number),day=new Date(Date.UTC(yy,mm-1,dd));
 if(day.getUTCFullYear()!==yy||day.getUTCMonth()!==mm-1||day.getUTCDate()!==dd)throw Error("Nem létező dátum.");
 for(const link of [url,d.thumbImage,d.fullImage])if(link){try{if(!["http:","https:"].includes(new URL(link).protocol))throw Error();}catch{throw Error("Csak teljes HTTP/HTTPS URL fogadható el.");}}
 const cl=spec[k].entry,iso=date.slice(0,-1).replaceAll(".","-"),target=d.newTab===false?"":' target="_blank" rel="noopener"';
 const img=d.thumbImage?'<a class="'+cl+'-image" href="'+esc(d.fullImage||d.thumbImage)+'"'+(d.credit?' title="'+esc(d.credit)+'"':"")+'><img src="'+esc(d.thumbImage)+'" width="200" loading="lazy" alt="'+esc(title)+(d.credit?" +++ "+esc(d.credit):"")+'" /></a>\n':"";
 return '<article class="'+cl+'">\n<header class="'+cl+'-header"><div class="'+cl+'-title"><h3>'+esc(title)+'</h3></div><time class="'+cl+'-date" datetime="'+iso+'">'+esc(date)+'</time></header>\n'+img+'<div class="'+cl+'-description">'+esc(summary).replace(/\r?\n/g,"<br />")+' <a href="'+esc(url)+'"'+target+'>Tovább »</a></div>\n</article>\n';
}
function addEntry(s,k,y,d){
 y=ye(y);if(!check(s,k).includes(y))throw Error("Előbb készíts évblokkot.");
 const ss=[...s.matchAll(/<section\b[^>]*\bdata-rb-static-section=["'](\d{4})["'][^>]*>/g)],selected=ss.find(x=>x[1]===y);if(!selected)throw Error("A megadott évblokk hiányzik.");
 const next=ss.find(x=>x.index>selected.index),end=next?next.index:s.length,part=s.slice(selected.index,end),re=new RegExp('<article\\s+class=["\\x27]'+spec[k].entry+'\\b','i');
 let offset=part.search(re);if(offset<0)offset=part.search(/<hr\b[^>]*class=["'](?:kk-year-divider|it-year-divider)["']/i);
 const at=offset>=0?selected.index+offset:s.indexOf("</section>",selected.index);
 if(at<selected.index||at>=end)throw Error("Nem lehet azonosítani az évblokk beszúrási helyét.");
 return s.slice(0,at)+article(k,d)+s.slice(at);
}
root.RBTOOLS_ARCHIVE_PRESETS=Object.freeze({detect,years,addYear,addEntry,article,section,style});
})(typeof window!=="undefined"?window:globalThis);