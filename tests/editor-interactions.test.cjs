"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function fn(name){
 const start=html.indexOf("function "+name+"("),end=html.indexOf("\nfunction ",start+10);
 assert.ok(start>=0&&end>start,"Function not found: "+name);
 return html.slice(start,end)+"\n";
}
const newAnchor=(props={})=>{
 const a=new Map(Object.entries(props));
 return {isConnected:true,getAttribute:k=>a.get(k)||null,
 setAttribute:(k,v)=>a.set(k,v),removeAttribute:k=>a.delete(k)};
};
const target=new Function(fn("adminSetLinkTarget")+"return adminSetLinkTarget;")();
const old=newAnchor({rel:"nofollow"});target(old,true);
assert.equal(old.getAttribute("target"),"_blank");
assert.equal(old.getAttribute("rel"),"nofollow noopener");
target(old,false);assert.equal(old.getAttribute("target"),null);
assert.equal(old.getAttribute("rel"),"nofollow");
const at=x=>html.indexOf(x);
assert.ok(at('class="admin-formatbar"')<at('id="rbtools-adminCanvas"'));
assert.ok(at('id="rbtools-adminCanvas"')<at('id="rbtools-adminFind"'));
assert.ok(at('id="rbtools-adminCanvas"')<at('id="rbtools-adminIframeInput"'));
assert.ok(html.includes(".admin-format-shell{position:sticky"));
assert.ok(html.includes('id="rbtools-adminLinkNewWindow" type="checkbox" checked'));
// Firefox collapses the live range after mousedown. Capture selection before that.
const editor={classList:{contains:()=>false}};
const range={collapsed:false,toString:()=>"szöveg",cloneRange(){return this;},
 getClientRects:()=>[{left:40,right:150,top:40,bottom:60}]};
const menu={hidden:true,style:{},getBoundingClientRect:()=>({width:200,height:250}),
 querySelector:()=>({focus(){menu.focused=true;}})};
let live=range;
const canvas={contains:node=>node===editor};
const windowMock={getSelection:()=>({rangeCount:1,getRangeAt:()=>live}),
 innerWidth:900,innerHeight:700};
const controller=new Function("editor","range","menu","canvas","windowMock",`
 const rbGet=id=>id==="adminCanvas"?canvas:menu;
 const window=windowMock,adminEditableForRange=r=>r===range?editor:null;
 let adminActiveEditable=null,adminSavedRange=null,adminRightClickSnapshot=null;
 `+fn("adminCaptureRightClick")+fn("adminContextMenuAt")+
 "return {capture:adminCaptureRightClick,open:adminContextMenuAt};"
)(editor,range,menu,canvas,windowMock);
function event(x,y,shiftKey=false){
 return {target:{closest:()=>editor},button:2,clientX:x,clientY:y,shiftKey,prevented:false,
 stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
}
let e=event(70,50);controller.capture(e);
live={collapsed:true,toString:()=>"",getClientRects:()=>[]}; // Firefox
controller.open(e);
assert.equal(e.prevented,true);assert.equal(menu.hidden,false);
assert.equal(menu.focused,true);
menu.hidden=true;e=event(70,50,true);controller.open(e);
assert.equal(e.prevented,false);assert.equal(menu.hidden,true);
live={collapsed:true,toString:()=>"",getClientRects:()=>[]};
const withoutCapture=new Function("editor","menu","canvas","windowMock",`
 const rbGet=id=>id==="adminCanvas"?canvas:menu;
 const window=windowMock,adminEditableForRange=()=>null;
 let adminActiveEditable=null,adminSavedRange=null,adminRightClickSnapshot=null;
 `+fn("adminContextMenuAt")+"return adminContextMenuAt;"
)(editor,menu,canvas,windowMock);
e=event(300,300);withoutCapture(e);
assert.equal(e.prevented,false);assert.equal(menu.hidden,true);
for(const newWindow of [true,false]){
 const a=newAnchor(),root={anchors:[],querySelectorAll:()=>root.anchors};
 const ui={adminLinkUrl:{value:"https://regionalbahn.hu",focus(){}},
 adminLinkNewWindow:{checked:newWindow},adminStatus:{textContent:""}};
 let sync=0,close=0;
 const apply=new Function("root","a","ui","target","hooks",`
 const URL=globalThis.URL||class{constructor(value){this.protocol=value.split(":")[0]+":";}};
 const rbGet=id=>ui[id],adminSetLinkTarget=target;
 let adminLinkEditAnchor=null,adminSavedRange=null,adminActiveEditable=root;
 const adminRestoreRange=()=>true,adminSyncActiveEditable=hooks.sync,
 adminCloseLinkPanel=hooks.close;
 const document={execCommand:()=>{root.anchors.push(a);return true;}};
 const window={getSelection:()=>({rangeCount:1,getRangeAt:()=>({intersectsNode:()=>true})})};
 `+fn("adminApplyLink")+"return adminApplyLink;"
 )(root,a,ui,target,{sync:()=>sync++,close:()=>close++});
 apply();
 assert.equal(a.getAttribute("target"),newWindow?"_blank":null);
 assert.equal(a.getAttribute("rel"),newWindow?"noopener":null);
 assert.equal(sync,1);assert.equal(close,1);
}
console.log("RBTools editor regressions passed: toolbar, context menu, link targets.");
