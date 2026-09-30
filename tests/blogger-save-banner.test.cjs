"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function fn(name){
 const a=source.indexOf("function "+name+"("),b=source.indexOf("\nfunction ",a+10);
 assert.ok(a>=0&&b>a,"function missing "+name);
 return source.slice(a,b)+"\n";
}
let connected=true;
const nodes={
 bloggerSaveIndicator:{dataset:{state:""}},
 bloggerSaveIcon:{textContent:""},bloggerSaveHeadline:{textContent:""},
 bloggerSaveDetail:{textContent:""},bloggerBlogSelect:{value:"blog1"},
 adminTitle:{value:"Cikk címe"},adminOutput:{value:"<div>Cikkszöveg</div>"},
 bloggerLabels:{value:"vasút, Berlin"},adminContentType:{value:"article"}
};
const api=new Function("nodes","isConnected",`
 let bloggerCurrentPost={id:"post1"};
 let bloggerKnownSnapshot=null,bloggerSavePending=false,bloggerSaveError="";
 let bloggerLastBannerState="",bloggerLastBannerText="";
 const rbGet=id=>nodes[id],bloggerConnected=isConnected;
 const bloggerParseLabels=()=>nodes.bloggerLabels.value.split(",").map(x=>x.trim()).filter(Boolean);
 `+fn("bloggerLocalSnapshot")+fn("bloggerSnapshotEquals")+fn("bloggerUpdateSaveBanner")+
 `return {current:bloggerLocalSnapshot,update:bloggerUpdateSaveBanner,
    known:value=>bloggerKnownSnapshot=value,pending:value=>bloggerSavePending=value,
    error:value=>bloggerSaveError=value};`
)(nodes,()=>connected);
api.update();assert.equal(nodes.bloggerSaveIndicator.dataset.state,"local");
api.known({...api.current(),origin:"loaded",when:"2026-09-30T10:00:00Z"});
api.update();assert.equal(nodes.bloggerSaveIndicator.dataset.state,"loaded");
nodes.adminOutput.value+=" változás";api.update();
assert.equal(nodes.bloggerSaveIndicator.dataset.state,"dirty");
api.pending(true);api.update();assert.equal(nodes.bloggerSaveIndicator.dataset.state,"working");
api.pending(false);api.error("Blogger API hiba");api.update();
assert.equal(nodes.bloggerSaveIndicator.dataset.state,"error");
api.error("");api.known({...api.current(),origin:"saved",when:"2026-09-30T10:05:00Z"});
api.update();assert.equal(nodes.bloggerSaveIndicator.dataset.state,"saved");
nodes.bloggerLabels.value="vasút, Berlin, MÁV";api.update();
assert.equal(nodes.bloggerSaveIndicator.dataset.state,"dirty");
connected=false;api.update();assert.equal(nodes.bloggerSaveIndicator.dataset.state,"offline");
nodes.adminContentType.value="static";api.update();
assert.equal(nodes.bloggerSaveIndicator.dataset.state,"static");
console.log("Blogger save banner: 8 state transitions and label-change detection passed.");
