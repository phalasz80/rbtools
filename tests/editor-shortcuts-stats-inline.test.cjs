"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process");
const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const fn=name=>{const a=src.indexOf("function "+name+"("),b=src.indexOf("\nfunction ",a+10);assert.ok(a>=0&&b>a,name);return src.slice(a,b)};
assert.match(fn("adminGenerateHtml"),/adminUpdateArticleStats\(\)/);
assert.match(src,/id="rbtools-adminArticleStats"/);
assert.ok(src.indexOf('id="rbtools-adminCanvas"')<src.indexOf('id="rbtools-adminArticleStats"'));
assert.match(fn("adminImportBoxGroup"),/recovered.map\(part=>"<div>"\+part\+"<\/div>"\)/);
const candidates=["google-chrome","chromium","chromium-browser","google-chrome-stable"];
const browser=candidates.find(bin=>cp.spawnSync(bin,["--version"],{encoding:"utf8"}).status===0);
assert.ok(browser,"Chromium-family browser needed");
const funcs=["esc","inlineMd","rbCleanGeneratedHtml","adminEntityToken","adminNormalizeInlineHtml","adminBoxBodyParts","adminBoxHtml","adminStatsParagraphs","adminArticleStats","adminUpdateArticleStats","adminTrackEditable","adminExec","adminAlignFromNode","adminIsGrayNode","adminBoxTitleNode","adminRecoverBoxFragments","adminImportBoxGroup"].map(fn).join("\n");
const cases=[
'const check=(condition,message)=>{if(!condition)throw Error(message);};',
'const link="<a href=\\"https://example.test/a?x=1&amp;y=2\\" target=\\"_blank\\" rel=\\"noopener\\">Mobilitási Témacsoport</a>";',
'const first="A BKK által működtetett "+link+" vagy a <strong>különféle</strong> <em>beruházások</em>."; ',
'const parts=adminBoxBodyParts(first+"<div>Második bekezdés<br>új sor.</div><p>Harmadik.</p>");',
'check(parts.length===3&&parts[0]===first,"inline content split: "+JSON.stringify(parts));',
'check(parts[1].includes("<br>"),"real line break lost");',
'check(adminBoxBodyParts("A "+link+" B<div></div>C").length===2,"legacy paragraph separator");',
'const markup=adminBoxHtml({title:"",html:first,bodyAlign:"justify"});',
'const box=document.createElement("template");box.innerHTML=markup;',
'check(box.content.children.length===1&&box.content.firstElementChild.textContent==="A BKK által működtetett Mobilitási Témacsoport vagy a különféle beruházások.","actual published box paragraph");',
'check(box.content.querySelector("a").rel==="noopener"&&box.content.querySelector("a").target==="_blank","link attributes");',
"const gray=(html,align=\"justify\",padding=\"0px 15px 5px\")=>\"<div style=\\\"background-color:#c3c3c3; padding:\"+padding+\"; text-align:\"+align+\"\\\">\"+html+\"</div>\";",
"const legacy=document.createElement(\"template\");legacy.innerHTML=gray(\"<b>Mi is az a Fahrgastsprechtag?</b>\",\"center\",\"15px\")+gray(\"A civil szervezet kezdeményezte a\")+gray(\"<i>Schienenverkehrswochen</i>\")+gray(\", azaz a vasúti közlekedési heteket.\")+gray(\"\")+gray(\"A találkozók különlegessége.\")+gray(\"\")+gray(\"A több évtizedes rendezvények.\");",
"const imported=[];adminImportBoxGroup(Array.from(legacy.content.childNodes),0,imported);",
"check(imported.length===1&&imported[0].title===\"Mi is az a Fahrgastsprechtag?\"&&imported[0].titleAlign===\"center\"&&imported[0].bodyAlign===\"justify\",\"legacy title and alignment: \"+JSON.stringify(imported));",
"const fixed=adminBoxBodyParts(imported[0].html);check(fixed.length===3&&fixed[0]===\"A civil szervezet kezdeményezte a <em>Schienenverkehrswochen</em>, azaz a vasúti közlekedési heteket.\",\"legacy inline repair: \"+JSON.stringify(fixed));",
"const round=document.createElement(\"template\");round.innerHTML=adminBoxHtml(imported[0]);const restored=[];adminImportBoxGroup(Array.from(round.content.childNodes),0,restored);",
"check(restored[0].title===imported[0].title&&restored[0].bodyAlign===\"justify\"&&adminBoxBodyParts(restored[0].html).join(\"|\")===fixed.join(\"|\"),\"box round trip\");",
"const untitled=document.createElement(\"template\");untitled.innerHTML=gray(\"Első bekezdés.\")+gray(\"<strong>Fontos külön bekezdés</strong>\")+gray(\"Második bekezdés.\");const untitledBlocks=[];adminImportBoxGroup(Array.from(untitled.content.childNodes),0,untitledBlocks);",
"check(untitledBlocks[0].title===\"\"&&adminBoxBodyParts(untitledBlocks[0].html).length===3,\"untitled box and intentional separation\");",
'const stat=adminArticleStats("Cím","<b>Ez az</b> első.",[{type:"p",html:"<a href=\\"https://example.test\\">Két szó</a>."},{type:"box",title:"Alcím",html:"<div>Egy.</div><div>Másik.</div>"},{type:"image",imageId:"i"},{type:"p",html:"<br>"},{type:"raw",html:"<script>not text</script><img src=\\"x\\" alt=\\"not counted\\">"}],"",id=>({caption:"Kép alatt"}));',
'check(stat.paragraphs===6&&stat.words===11&&stat.characters===46&&stat.nonspace===42,"statistics: "+JSON.stringify(stat));',
'const statsEl=document.createElement("div");nodes.adminArticleStats=statsEl;nodes.adminTitle={value:"Cím"};nodes.adminContentType={value:"article"};',
'adminLeadHtml="Egy szó.";adminBlocks=[];adminUpdateArticleStats();check(statsEl.textContent.includes("3 szó")&&statsEl.textContent.includes("1 bekezdés"),"counter update");',
'const el=document.createElement("div");el.contentEditable="true";document.body.appendChild(el);',
'adminTrackEditable(el,()=>{});',
'for(const [key,selector] of [["b","b,strong"],["i","i,em"],["u","u"]]){',
' el.innerHTML="Próba";el.focus();adminActiveEditable=el;document.execCommand("styleWithCSS",false,false);const range=document.createRange();range.selectNodeContents(el);window.getSelection().removeAllRanges();window.getSelection().addRange(range);',
' const event=new KeyboardEvent("keydown",{key,ctrlKey:true,bubbles:true,cancelable:true});el.dispatchEvent(event);',
' check(event.defaultPrevented&&el.querySelector(selector)?.textContent==="Próba","shortcut "+key+": "+el.innerHTML);',
'}',
'const other=new KeyboardEvent("keydown",{key:"b",ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true});el.dispatchEvent(other);check(!other.defaultPrevented,"unrelated shortcut captured");',
'document.body.textContent="EDITOR_DOM_PASS";'
].join("\n");
const prelude=[
'const nodes={adminStatus:{textContent:""}};const rbGet=id=>nodes[id];',
'const adminValidAlign=(value,fallback)=>value||fallback;const adminUid=()=>"test-id";const adminFindImage=()=>null;const adminCaptionHtml=img=>img.caption;',
'let adminLeadHtml="",adminBlocks=[],adminSourcesHtml="",adminActiveEditable=null,adminSavedRange=null;const adminSearchFallbackMarks=[];',
'const adminRememberRange=()=>{const sel=window.getSelection();if(sel.rangeCount)adminSavedRange=sel.getRangeAt(0).cloneRange();};',
'const adminRestoreRange=()=>{if(!adminSavedRange)return false;const sel=window.getSelection();sel.removeAllRanges();sel.addRange(adminSavedRange.cloneRange());return true;};',
'const adminGenerateHtml=()=>{};const adminSyncActiveEditable=()=>adminActiveEditable.dispatchEvent(new Event("input",{bubbles:true}));'
].join("\n");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"rbtools-editor-"));
try{
 const file=path.join(dir,"editor.html");
 const script=(prelude+"\n"+funcs+"\nwindow.addEventListener('load',()=>{try{\n"+cases+"\n}catch(e){document.body.textContent='EDITOR_DOM_FAIL: '+e.stack;}});").replace(/<\/script/gi,"<\\/script");
 fs.writeFileSync(file,"<!doctype html><meta charset=utf-8><body>EDITOR_DOM_PENDING<script>"+script+"</"+"script>");
 const result=cp.spawnSync(browser,["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--dump-dom","file://"+file],{encoding:"utf8",timeout:25000,maxBuffer:2e6});
 assert.equal(result.status,0,String(result.error||result.stderr));assert.match(result.stdout,/<body>EDITOR_DOM_PASS<\/body>/,result.stdout.slice(-6000));
 console.log("Editor DOM: keyboard formatting, live text statistics, inline link paragraph preservation: PASS");
}finally{fs.rmSync(dir,{recursive:true,force:true});}
