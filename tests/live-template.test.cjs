"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","collection-pages.js"),"utf8");
const start=src.indexOf("async function loadCurrentTemplate(");
const end=src.indexOf("\nasync function startLocalTemplate(",start);
assert.ok(start>=0&&end>start);
const body=src.slice(start,end),catalog={
 impresszum:{slug:"impresszum.html",title:"Impresszum"},
 braking:{slug:"vasuti-fekezes.html",title:"Vasúti fékezés"},
 zusi:{slug:"magyar-zusi-letoltesek.html",title:"Magyar Zusi kiegészítők"}
};
function scenario(type,url,listed=true){
 const list=listed?[{id:"original-page",url,title:"Éles módosított oldal"}]:[];
 const state={list,profile:""},ui={pageTemplateMode:{value:type},
 pageTemplateOrigin:{textContent:""}};
 const view={blog:{value:"regionalbahn-blog"},info:{textContent:""}};
 let loaded=null,calls=[],notices=[];
 const bridge={isConnected:()=>true,async request(args){
   calls.push(args);
   if(args.method==="PATCH")throw Error("Template creation must never PATCH");
   return {items:[{id:"original-page",url,title:"Éles módosított oldal"}]};
 }};
 const get=id=>ui[id],getPage=async(id,blogId)=>{
   assert.equal(id,"original-page");assert.equal(blogId,"regionalbahn-blog");
   return {id,url,title:"Frissen szerkesztett élő változat",content:"<section><p>AKTUÁLIS SZÖVEG</p></section>",updated:"2026-09-30T09:00:00Z"};
 };
 const loadHtml=(html,opt)=>{loaded={html,opt};},message=(...x)=>notices.push(x),update=()=>{};
 const f=new Function("state","get","starters","bridge","view","message",
  "abandonCheck","getPage","loadHtml","update",body+"return loadCurrentTemplate;");
 const load=f(state,get,{catalog},bridge,view,message,()=>true,getPage,loadHtml,update);
 return {load,ui,view,state,calls,get loaded(){return loaded}};
}
(async()=>{
 const live=scenario("impresszum","https://www.regionalbahn.hu/p/impresszum.html");
 assert.equal(await live.load(),true);
 assert.equal(live.loaded.html,"<section><p>AKTUÁLIS SZÖVEG</p></section>");
 assert.deepEqual(live.loaded.opt,{title:"Frissen szerkesztett élő változat"});
 assert.match(live.ui.pageTemplateOrigin.textContent,/helyi másolatban/);
 assert.equal(live.state.profile,"impresszum");
 assert.equal(live.calls.length,0,"Known page should not trigger a full page search");
 console.log("Modified live Impresszum: current Blogger content, detached local copy, no PATCH: PASS");
 const braking=scenario("braking","https://www.regionalbahn.hu/p/vasuti-fekezes.html",false);
 assert.equal(await braking.load(),true);
 assert.equal(braking.calls.length,2,"When page list is empty, search live and draft");
 assert.ok(braking.calls.every(x=>x.method===undefined||x.method==="GET"));
 assert.equal(braking.loaded.html,"<section><p>AKTUÁLIS SZÖVEG</p></section>");
 console.log("Braking page: exact URL lookup and full HTML import: PASS");
 const wrong=scenario("zusi","https://www.regionalbahn.hu/p/other.html");
 await assert.rejects(wrong.load(),/nem található|másik oldal/);
 assert.equal(wrong.loaded,null);
 console.log("Wrong page URL: no silent substitution or Blogger changes: PASS");
})().catch(e=>{console.error(e);process.exitCode=1;});
