"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function fn(name){
  const start=source.indexOf("function "+name+"(");
  const end=source.indexOf("\nfunction ",start+10);
  assert.ok(start>=0&&end>start,"Function not found: "+name);
  return source.slice(start,end)+"\n";
}
const api=new Function(
  fn("esc")+fn("rbCanonicalImageTag")+";return {rbCanonicalImageTag};"
)();

const legacyWithOriginal={
  display:"https://example.test/s600/image.jpg",
  attrs:[
    {name:"alt",value:"RÉGI ALT"},
    {name:"data-original-height",value:"1280"},
    {name:"data-original-width",value:"1920"},
    {name:"src",value:"https://example.test/old.jpg"},
    {name:"style",value:"height:999px;max-width:17px"},
    {name:"width",value:"600"},
    {name:"border",value:"0"},
    {name:"onerror",value:"alert(1)"}
  ]
};
const a=api.rbCanonicalImageTag(legacyWithOriginal,{display:legacyWithOriginal.display,alt:"Új ALT +++ fotó: Péter"});
assert.match(a,/alt="Új ALT \+\+\+ fotó: Péter"/);
assert.match(a,/data-original-height="1280"/);
assert.match(a,/data-original-width="1920"/);
assert.match(a,/src="https:\/\/example\.test\/s600\/image\.jpg"/);
assert.match(a,/width="600"/);
assert.match(a,/style="max-width:100%;height:auto;"/);
assert.doesNotMatch(a,/height:999px|max-width:17px|border=|onerror=/);

const legacyWithoutOriginal={
  display:"https://example.test/s600/second.jpg",
  attrs:[
    {name:"alt",value:"fotó: Régi"},
    {name:"src",value:"https://example.test/old2.jpg"},
    {name:"width",value:"600"}
  ]
};
const b=api.rbCanonicalImageTag(legacyWithoutOriginal,{display:legacyWithoutOriginal.display,alt:"Képaláírás +++ fotó: Éva"});
assert.match(b,/src="https:\/\/example\.test\/s600\/second\.jpg"/);
assert.match(b,/width="600"/);
assert.match(b,/style="max-width:100%;height:auto;"/);
assert.doesNotMatch(b,/data-original-/);

const forced=api.rbCanonicalImageTag(legacyWithOriginal,{
  display:"https://example.test/s200/main.jpg",alt:"Főkép +++ fotó: Péter",forceWidth:200,
  style:"max-width:100%; height:auto; box-sizing:border-box;"
});
assert.match(forced,/width="200"/);
assert.match(forced,/box-sizing:border-box/);

assert.match(fn("adminImageAttrs"),/return collectImageAttrs\(img\)/);
assert.match(fn("adminImageBodyHtml"),/rbCanonicalImageTag\(img/);
assert.match(fn("adminMainImageHtml"),/forceWidth:200/);
assert.match(fn("adminBoxHtml"),/forceWidth:600/);
assert.match(fn("imageItemHtml"),/rbCanonicalImageTag\(item/);
assert.match(fn("collectImageAttrs"),/\^on\/i/);
assert.match(fn("adminLoadExistingHtml"),/Képkódok eszközzel közös RegionalBahn-szabványra normalizálódtak/);
assert.ok(source.includes('const RBTOOLS_VERSION="pages-v59"'));
console.log("Cikkadmin and Képkódok shared image normalization: PASS");
