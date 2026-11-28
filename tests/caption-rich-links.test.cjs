"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process");
const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const fn=name=>{const a=src.indexOf("function "+name+"("),b=src.indexOf("\nfunction ",a+10);assert.ok(a>=0&&b>a,name);return src.slice(a,b)};
assert.match(fn("adminCaptionEditor"),/adminCaptionRichParts\(cap.innerHTML\)/);
assert.match(fn("adminCaptionEditor"),/img.captionRich=data.captionRich/);
assert.match(fn("adminCaptionHtml"),/typeof img\?\.captionRich==="string"\?img.captionRich/);
assert.match(fn("adminRenderImageLibrary"),/captionBox.value=rich\?img.captionRich/);
assert.match(fn("adminAddImageFromElement"),/captionRich:imported.captionRich/);
assert.match(fn("adminLiveFromNode"),/return position<0\?"":adminConsumeImageCaption\(nodes,position\);/);
assert.match(fn("adminImportBoxGroup"),/adminAddImageFromElement\(n,caption\)/);
const candidates=["google-chrome","chromium","chromium-browser","google-chrome-stable"];
const browser=candidates.find(bin=>cp.spawnSync(bin,["--version"],{encoding:"utf8"}).status===0);
assert.ok(browser,"A Chromium-family browser is needed for caption DOM regression");
const funcs=["esc","inlineMd","rbCleanGeneratedHtml","adminEntityToken","adminNormalizeInlineHtml","adminCleanCaptionText","adminCaptionParts","adminCaptionHtml","adminCaptionRichParts","adminCaptionNodeData","adminCaptionNodeText","adminConsumeImageCaption","rbImageAltText","rbCaptionFromAlt","adminSetLinkTarget","adminAddImageFromElement"].map(fn).join("\n");
const cases=[
'const check=(condition,message)=>{if(!condition)throw Error(message);};',
'const href="https://www.regionalbahn.hu/2026/07/BVG-J-Option.html";',
'const rich="<strong>Villamos</strong> <a href=\\""+href+"\\" target=\\"_blank\\" rel=\\"nofollow noopener\\">korábbi cikkünkben</a><br>Második sor";',
'const edited=adminCaptionRichParts(rich);',
'check(edited.caption==="Villamos korábbi cikkünkben\\nMásodik sor","plain edit");',
'check(edited.captionRich.includes("target=\\"_blank\\"")&&edited.captionRich.includes("rel=\\"nofollow noopener\\""),"link target/rel");',
'const image={caption:edited.caption,captionRich:edited.captionRich,photoName:"Teszt Fotós",captionPhoto:true,credit:"fotó: Teszt Fotós"};',
'const rendered=adminCaptionHtml(image);',
'check(rendered.includes(href)&&rendered.includes("<strong>Villamos</strong>"),"rendered formatting");',
'check(rbImageAltText(image.caption,image.credit,image.photoName)==="Villamos korábbi cikkünkben; Második sor +++ fotó: Teszt Fotós","ALT plain text");',
'const t=document.createElement("template");t.innerHTML="<div class=\\"separator\\"><a href=\\"https://example.test/full.jpg\\"><img src=\\"https://example.test/small.jpg\\"></a></div><div style=\\"text-align:center\\">"+rendered+"</div><br>";',
'const nodes=Array.from(t.content.childNodes);const imported=adminConsumeImageCaption(nodes,0);',
'const reloaded=adminAddImageFromElement(nodes[0],imported);',
'check(reloaded.caption===edited.caption&&reloaded.captionPhoto&&reloaded.photoName==="Teszt Fotós","photo round trip");',
'check(adminCaptionHtml(reloaded)===rendered,"rich caption round trip");',
'const one=adminCaptionRichParts("<a href=\\"https://example.test\\">azonos lap</a>");',
'check(one.captionRich.includes("href=")&&!one.captionRich.includes("target="),"same-tab link");',
'const unsafe=adminCaptionRichParts("<a href=\\"javascript:alert(1)\\" onclick=\\"alert(2)\\">szöveg</a><script>alert(3)</script>");',
'check(unsafe.caption==="szöveg"&&!unsafe.captionRich.includes("javascript:")&&!unsafe.captionRich.includes("script"),"unsafe markup");',
'const multiline=adminCaptionRichParts("Első<div><a href=\\"https://example.test\\">Második</a></div>");',
'check(multiline.caption==="Első\\nMásodik"&&multiline.captionRich.includes("<a "),"browser Enter markup");',
'const removed=adminCaptionRichParts("Villamos korábbi cikkünkben");',
'check(!adminCaptionHtml({caption:removed.caption,captionRich:removed.captionRich}).includes("<a"),"unlink");',
'document.body.textContent="CAPTION_DOM_PASS";'
].join("\n");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"rbtools-caption-"));
try{
 const file=path.join(dir,"caption.html");
 const script=("const adminImages=[];let id=0;const adminUid=()=>String(++id),adminImageAttrs=()=>[];\n"+funcs+"\ntry{\n"+cases+"\n}catch(e){document.body.textContent='CAPTION_DOM_FAIL: '+e.stack;}").replace(/<\/script/gi,"<\\/script");
 fs.writeFileSync(file,"<!doctype html><meta charset=utf-8><body>CAPTION_DOM_PENDING<script>"+script+"</"+"script>");
 const result=cp.spawnSync(browser,["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--dump-dom","file://"+file],{encoding:"utf8",timeout:25000,maxBuffer:2e6});
 assert.equal(result.status,0,String(result.error||result.stderr));
 assert.match(result.stdout,/<body>CAPTION_DOM_PASS<\/body>/,result.stdout.slice(-6000));
 console.log("Caption DOM: WYSIWYG rich markup, target/rel, ALT, photo credit, Blogger import, unlink and safe URL: PASS");
}finally{fs.rmSync(dir,{recursive:true,force:true});}
