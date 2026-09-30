"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const source=read("index.html"),controller=read("collection-pages.js");
const core=new Function("globalThis",read("collection-page-core.js")+"return globalThis.RBTOOLS_PAGE_CORE")({});
const presets=new Function("globalThis",read("archive-presets.js")+"return globalThis.RBTOOLS_ARCHIVE_PRESETS")({});
const starters=new Function("globalThis",read("page-starters.js")+"return globalThis.RBTOOLS_PAGE_STARTERS")({});
for(const [kind,slug] of [
 ["impresszum","impresszum.html"],["braking","vasuti-fekezes.html"],
 ["zusi","magyar-zusi-letoltesek.html"]]){
 assert.equal(starters.catalog[kind].slug,slug);
 assert.equal(presets.detect("","https://regionalbahn.hu/p/"+slug),kind);
 assert.ok(source.includes('<option value="'+kind+'">'));
}
for(const kind of ["braking","zusi","plain"]){
 const original=starters[kind](),parsed=core.parse(original);
 assert.equal(presets.detect(original),kind);
 assert.equal(parsed.safe,true);
 assert.equal(core.serialize(parsed),original);
 assert.ok(core.leaves(parsed).length>0);
}
assert.ok(starters.braking().includes("Rhätische Bahn"));
assert.ok(starters.zusi().includes("Telepítés"));
assert.ok(controller.includes("async function loadCurrentTemplate("));
assert.ok(controller.includes("getPage(found.id,blogId)"));
assert.ok(controller.includes("loadHtml(page.content"),"Must load actual returned live HTML");
assert.ok(controller.includes("csak kapcsolat nélkül"),"Must not silently label old Impresszum current");
for(const id of ["pageUseLiveTemplate","boxVariant","boxEditorMode","boxVisual","boxRichHtml","adminNewBoxVariant","helpTOC","helpTOCLinks"]){
 assert.equal((source.match(new RegExp('id="rbtools-'+id+'"',"g"))||[]).length,1,id+" missing or duplicated");
}
for(const id of ["rbtools-help-gyujtooldalak","rbtools-help-keretes","rbtools-help-cikkadmin"])
 assert.ok(source.includes('id="'+id+'"'));
assert.ok(source.includes("rbBuildHelpContents();"));
function fn(name){
 const a=source.indexOf("function "+name+"("),b=source.indexOf("\nfunction ",a+10);
 assert.ok(a>=0&&b>a,name+" missing");
 return source.slice(a,b);
}
const code=["rbBoxAccentWrap","rbBoxHtml","adminBoxHtml"].map(fn).join("\n");
const api=new Function("esc","rbBoxParagraphsHtml","adminValidAlign","adminNormalizeInlineHtml",
 "adminBoxBodyParts","adminFindImage","adminCaptionParts","rbImageAltText","adminCaptionHtml",
 "inlineMd","plainInline",code+"return {rbBoxHtml,adminBoxHtml}")(s=>s,t=>t?'<div style="background-color: #c3c3c3;">'+t+"</div>":"",v=>v||"center",s=>s,
 s=>[s],()=>null,()=>({caption:"",photoName:""}),()=>"",()=>"",s=>s,s=>s);
const classic=api.rbBoxHtml("Próba","Szöveg"),accent=api.rbBoxHtml("Próba","Szöveg",null,"markdown","accent");
assert.ok(!classic.includes("rb-box-accent"));
assert.ok(accent.startsWith('<aside class="rb-box-accent"'));
assert.ok(accent.includes(classic));
assert.ok(!api.adminBoxHtml({title:"A",html:"B",variant:"classic"}).includes("<aside"));
assert.ok(api.adminBoxHtml({title:"A",html:"B",variant:"accent"}).includes("<aside"));
assert.ok(source.includes('a.style==="accent"||a.variant==="accent"'));
assert.ok(source.includes("boxShowEditorMode()"));
console.log("Archive catalog, editable local starters, live imports, help TOC and both box variants: PASS");
