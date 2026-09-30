"use strict";
/* node tests/collection-page-save.test.cjs : no Google credentials or network needed */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const coreSrc=fs.readFileSync(path.join(__dirname,"..","collection-page-core.js"),"utf8");
const uiSrc=fs.readFileSync(path.join(__dirname,"..","collection-pages.js"),"utf8");
const parser=new Function("globalThis",coreSrc+";return globalThis.RBTOOLS_PAGE_CORE;")({});
const start=uiSrc.indexOf("async function savePage(){"),end=uiSrc.indexOf('\nget("pageConnect")',start);
assert.ok(start>=0&&end>start,"savePage not found");
const fn=uiSrc.slice(start,end)+"\nreturn savePage;";
const original='<div id="rb-static-page-nav"><button data-rb-target="2026">2026</button></div>'+
  '<script>const preserved = "<div>";</script><div data-rb-static-section="2026"><div>Régi szöveg</div></div>';
function fixture({conflict=false,scriptLoss=false,changeDuringSave=false,emptyTitle=false,backup=true}={}){
 const tree=parser.parse(original);
 assert.equal(tree.safe,true);
 const l=parser.leaves(tree).find(x=>x.value==="Régi szöveg");
 assert.ok(l);l.edited=true;l.value="Új szöveg";
 const title=emptyTitle?"":"Teszt oldal";
 const state={tree,loaded:{id:"pg1",blogId:"b1",title:"Teszt oldal",url:"https://example.test/p/teszt.html",
   status:"LIVE",originalHtml:original},backup,saving:false,error:"",critical:false,
   baseline:{html:original,title:"Teszt oldal",origin:"loaded",updated:"2026-01-01T00:00:00Z"}};
 const view={blog:{value:"b1"},title:{value:title},info:{textContent:""}};
 let verified=null,patches=0,confirmation=0;
 const currentHtml=()=>parser.serialize(state.tree);
 const dirty=()=>state.baseline.title!==view.title.value||state.baseline.html!==currentHtml();
 const remoteSource=()=>({
   id:"pg1",title:conflict?"Más szerkesztő címe":"Teszt oldal",
   content:conflict?"<p>OTHER EDITOR</p>":original,
   url:"https://example.test/p/teszt.html",status:"LIVE"
 });
 const getPage=async()=>{
   if(!patches)return remoteSource();
   return {id:"pg1",title:view.title.value,content:verified,
     updated:"2026-01-01T00:02:00Z",status:"LIVE",url:"https://example.test/p/teszt.html"};
 };
 const bridge={isConnected:()=>true,async request({method,pageId,body,blogId}){
    assert.equal(method,"PATCH");assert.equal(pageId,"pg1");assert.equal(blogId,"b1");patches++;
    assert.deepEqual(Object.keys(body).sort(),["content","title"]);
    verified=scriptLoss?body.content.replace(/<script>[\s\S]*?<\/script>/,""):body.content;
    if(changeDuringSave){l.value="Még újabb szöveg";l.edited=true;}
    return {id:"pg1"};
 }};
 const window={confirm:()=>{confirmation++;return true;}};
 const update=()=>{},message=()=>{},originalBackUpRaw=()=>state.loaded.originalHtml;
 const save=new Function("state","view","core","bridge","get","dirty","currentHtml","update","message",
   "getPage","window","originalBackUpRaw",fn)
   (state,view,parser,bridge,()=>null,dirty,currentHtml,update,message,getPage,window,originalBackUpRaw);
 return {state,save,dirty,get patches(){return patches},get confirmation(){return confirmation}};
}
(async()=>{
 const ok=fixture();await ok.save();
 assert.equal(ok.patches,1);assert.equal(ok.confirmation,1);
 assert.equal(ok.state.error,"");assert.equal(ok.state.critical,false);
 assert.equal(ok.state.backup,false);assert.equal(ok.dirty(),false);
 assert.equal(ok.state.baseline.origin,"saved");
 console.log("Live page save: PATCH + post-GET verification, new backup required: PASS");
 const conflicting=fixture({conflict:true});await conflicting.save();
 assert.equal(conflicting.patches,0);
 assert.equal(conflicting.state.critical,true);
 assert.match(conflicting.state.error,/MÁS SZERKESZTŐ/);
 console.log("Concurrent human editor: PATCH blocked: PASS");
 const lost=fixture({scriptLoss:true});await lost.save();
 assert.equal(lost.patches,1);
 assert.equal(lost.state.critical,true);
 assert.match(lost.state.error,/JAVASCRIPT/);
 assert.ok(lost.state.loaded.originalHtml.includes("<script>"));
 console.log("Unexpected Blogger script stripping: critical warning with untouched backup: PASS");
 const changed=fixture({changeDuringSave:true});await changed.save();
 assert.equal(changed.patches,1);assert.equal(changed.dirty(),true);
 console.log("Text edited during network save: remains unsaved: PASS");
 const noBackup=fixture({backup:false});await noBackup.save();
 assert.equal(noBackup.patches,0);assert.equal(noBackup.state.saving,false);
 console.log("Missing original backup blocks write: PASS");
 const noTitle=fixture({emptyTitle:true});await noTitle.save();
 assert.equal(noTitle.patches,0);assert.match(noTitle.state.error,/címét/);
 console.log("Missing page title blocks write: PASS");
})().catch(e=>{console.error(e);process.exitCode=1;});
