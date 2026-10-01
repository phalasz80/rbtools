"use strict";
/* RBTools kép-ALT regressziós tesztek. Futtatás: node tests/image-alt.test.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function sourceFunction(name){
  const start=source.indexOf("function "+name+"(");
  assert.ok(start>=0,"Hiányzó függvény: "+name);
  const end=source.indexOf("\nfunction ",start+10);
  assert.ok(end>start,"Függvényhatár hiányzik: "+name);
  return source.slice(start,end)+"\n";
}
const names=[
  "esc","compact","inlineMd","adminCleanCaptionText","adminCaptionParts",
  "rbImageAltText","rbCaptionFromAlt","adminCaptionHtml","rbImageHtml",
  "rbBoxParagraphsHtml","rbBoxHtml","adminImageBodyHtml","adminMainImageHtml",
  "adminBoxHtml","imageItemHtml"
];
const setup=`
  const adminFindImage=id=>id==="box-image"?{
    full:"https://example.test/nagy.jpg",display:"https://example.test/kis.jpg",
    caption:"Csarnok<br>Éjszaka",credit:"fotó: © Halász Péter • RegionalBahn.hu",
    photoName:"Halász Péter"
  }:null;
  const adminNormalizeInlineHtml=x=>x;
  const adminValidAlign=(x,f)=>x||f;
  const adminBoxBodyParts=x=>[x];
`;
const api=new Function(setup+names.map(sourceFunction).join("\n")+
  ";return {rbImageAltText,rbCaptionFromAlt,rbImageHtml,rbBoxHtml,adminImageBodyHtml,adminMainImageHtml,adminBoxHtml,imageItemHtml};")();

assert.equal(api.rbImageAltText("Első<br />Második","fotó: © Halász Péter • RegionalBahn.hu"),
  "Első; Második +++ fotó: Halász Péter");
assert.equal(api.rbImageAltText("Első\nMásodik","forrás: DB AG"),"Első; Második +++ forrás: DB AG");
assert.equal(api.rbImageAltText("Leírás","","Éva"),"Leírás +++ fotó: Éva");
assert.equal(api.rbImageAltText("KÉPaláírás","",""),"");
assert.deepEqual(api.rbCaptionFromAlt("Első; Második +++ fotó: Éva"),
  {caption:"Első\nMásodik",credit:"fotó: Éva"});
assert.deepEqual(api.rbCaptionFromAlt("fotó: Éva"),{caption:"",credit:"fotó: Éva"});

const img={
  full:"https://example.test/nagy.jpg",display:"https://example.test/kis.jpg",
  caption:"Csarnok<br>Éjszakai fények",
  credit:"fotó: © Halász Péter • RegionalBahn.hu",
  photoName:"Halász Péter",captionPhoto:true,
  attrs:[{name:"alt",value:"RÉGI ALT"},{name:"width",value:"600"}]
};
const results={
  "Cikkadmin kép":api.adminImageBodyHtml(img),
  "Cikkadmin főkép":api.adminMainImageHtml(img),
  "Cikkadmin keretes kép":api.adminBoxHtml({title:"Cím",html:"Szöveg",imageId:"box-image"}),
  "haladó RB:IMAGE":api.rbImageHtml(img),
  "haladó keretes":api.rbBoxHtml("Cím","Szöveg",img),
  "képkód-eszköz":api.imageItemHtml(img)
};
for(const [kind,html] of Object.entries(results)){
  const alt=html.match(/<img[^>]*\balt="([^"]*)"/)?.[1];
  assert.ok(alt,kind+": hiányzó alt");
  assert.ok(alt.includes(" +++ fotó: Halász Péter"),kind+": hiányzó fotós");
  assert.ok(alt.includes(kind==="Cikkadmin keretes kép"?
    "Csarnok; Éjszaka":"Csarnok; Éjszakai fények"),kind+": hibás sortörés");
  assert.ok(!alt.includes("<br"),kind+": HTML-tag került az altba");
  if(kind==="Cikkadmin főkép"){
    assert.ok(!html.includes("text-align: center;"),"A főkép alá látható képaláírás került.");
  }else{
    assert.ok(html.includes(kind==="Cikkadmin keretes kép"?"Éjszaka":"Éjszakai fények"),
      kind+": hiányzó látható képaláírás");
    assert.ok(!html.includes('class="rbtools-caption"'),kind+": régi képaláírás-osztály maradt");
    assert.ok(!/font-size\s*:\s*(?:90%|\.9em)/i.test(html),kind+": 90%-os képaláírás maradt");
    assert.ok(!/color\s*:\s*#0b5394/i.test(html),kind+": kék képaláírás maradt");
  }
}
for(const kind of ["Cikkadmin kép","haladó RB:IMAGE","képkód-eszköz"]){
  assert.ok(results[kind].includes('<div style="text-align: center;">'),
    kind+": nem a RegionalBahn középre zárt normál caption-kódját használja");
  assert.ok(results[kind].includes('</div>\n<br />'),
    kind+": a képaláírás után hiányzik a külön <br />");
}
const escaping=api.adminMainImageHtml({...img,caption:'A "vasút" & a város'});
assert.ok(escaping.includes("A &quot;vasút&quot; &amp; a város"),"Nem biztonságos alt attribútum.");
assert.ok(!escaping.includes("RÉGI ALT"),"Régi, elavult alt maradt a kimenetben.");
console.log("RBTools: 6 segédfüggvény- és 6 képgenerálási ALT-ellenőrzés sikeres.");
