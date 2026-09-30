"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const dir=path.join(__dirname,".."),host={};
const P=new Function("globalThis",fs.readFileSync(path.join(dir,"archive-presets.js"),"utf8")+";return globalThis.RBTOOLS_ARCHIVE_PRESETS")(host);
const S=new Function("globalThis",fs.readFileSync(path.join(dir,"page-starters.js"),"utf8")+";return globalThis.RBTOOLS_PAGE_STARTERS")(host);
const core=new Function("globalThis",fs.readFileSync(path.join(dir,"collection-page-core.js"),"utf8")+";return globalThis.RBTOOLS_PAGE_CORE")({});
for(const kind of ["kk","it"]){
 let s=S.archive(kind,2026);
 assert.equal(P.detect(s),kind);
 assert.deepEqual(P.years(s),["2026"]);
 assert.ok(core.parse(s).safe);
 s=P.addYear(s,kind,2028,{summary:"Új év"});
 assert.deepEqual(P.years(s),["2028","2026"]);
 s=P.addEntry(s,kind,2028,{title:'Új & "adás"',date:"2028.09.23.",
  url:"https://regionalbahn.hu/2028/09/new.html?a=1&b=2",summary:"Első\nMásodik",
  fullImage:"https://images.example/s1920/img.jpg",thumbImage:"https://images.example/s200/img.jpg",
  credit:"fotó: © Név"});
 assert.ok(s.includes("Új &amp; &quot;adás&quot;"));
 assert.ok(s.includes("Első<br />Második"));
 assert.ok(s.includes(" +++ fotó: © Név"));
 assert.ok(s.includes("width=\"200\""));
 assert.ok(core.parse(s).safe);
 const count=s.match(/<article\b/g)?.length||0;
 s=P.addYear(s,kind,2030);
 s=P.addYear(s,kind,2012);
 assert.deepEqual(P.years(s),["2030","2028","2026","2012"]);
 assert.equal((s.match(/RBTOOLS-YEAR-RULES-START/g)||[]).length,1);
 assert.equal((s.match(/RBTOOLS-YEAR-RULES-END/g)||[]).length,1);
 assert.equal((s.match(/<article\b/g)||[]).length,count);
 assert.ok(s.includes("Összes "+(kind==="kk"?"adás":"év")));
 assert.ok(core.parse(s).safe);
 assert.throws(()=>P.addYear(s,kind,2012),/már/);
 assert.throws(()=>P.addEntry(s,kind,2028,{title:"A",date:"2028.02.30.",
  url:"https://regionalbahn.hu",summary:"B"}),/Nem létező/);
 assert.throws(()=>P.addEntry(s,kind,2028,{title:"A",date:"2028.09.23.",
  url:"javascript:alert(1)",summary:"B"}),/HTTP/);
 console.log(kind+" archive: new year, entry, preservation, validation PASS");
}
const old='<style>.kk-year{display:none}</style><div id="kk-archive">'+
 '<span id="kozvetlen-2026"></span><span id="kozvetlen-osszes"></span>'+
 '<nav id="rb-static-page-nav"><div class="kk-nav-years">'+
 '<a href="#kozvetlen-2026">2026</a><a href="#kozvetlen-osszes">Összes adás</a></div></nav>'+
 '<div class="kk-sections"><section class="kk-year kk-year-2026" data-rb-static-section="2026">'+
 '<h3>2026</h3><article class="kk-episode"><h3>Régi adás</h3></article>'+
 '<hr class="kk-year-divider" /></section></div></div>';
const updated=P.addYear(old,"kk",2027);
assert.ok(updated.includes("<article class=\"kk-episode\"><h3>Régi adás</h3>"));
assert.ok(updated.includes('href="#kozvetlen-osszes"'));
assert.ok(updated.includes('id="kozvetlen-2027"'));
console.log("Existing archived HTML unchanged outside new navigational additions: PASS");
const imprint=S.impresszum();
const sourceImpresszum=fs.readFileSync(path.join(dir,"templates","impresszum-regionalbahn.html"),"utf8");
assert.equal(imprint,sourceImpresszum,"Starter must exactly match the downloadable Impresszum source");
assert.ok(imprint.includes("36. § (2)"),"Limited press republication reservation should be explicit");
assert.ok(imprint.includes("A puszta forrásmegjelölés önmagában nem helyettesíti az engedélyt"));
assert.ok(!imprint.includes("az oldal bármely részén"),"Avoid obsolete blanket ban");

for(const s of ["Moderálási irányelvek","Redaktion","Editorial team"])
 assert.ok(imprint.includes(s));
assert.ok(core.parse(imprint).safe);
console.log("Impresszum trilingual scaffold: PASS");
