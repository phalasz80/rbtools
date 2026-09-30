"use strict";
/* Firefox collapses a selection on mousedown before contextmenu; preserve it. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const code=fs.readFileSync(path.join(__dirname,"..","collection-pages.js"),"utf8");
function method(name){
 const start=code.indexOf("function "+name+"("),end=code.indexOf("\nfunction ",start+10);
 assert.ok(start>=0&&end>start,"missing "+name);
 return code.slice(start,end);
}
const editable={
 contains:r=>r===editable,
 classList:{contains:()=>true}
};
const saved={
 collapsed:false,commonAncestorContainer:editable,toString:()=>"Új könyvtár",
 cloneRange(){return this;},getClientRects:()=>[{left:20,top:30,right:190,bottom:50}]
};
const collapsed={collapsed:true,commonAncestorContainer:editable};
let actual=saved,menuFocused=false;
const menu={hidden:true,style:{},getBoundingClientRect:()=>({width:245,height:190}),
 querySelector:()=>({focus:()=>{menuFocused=true;}})};
const canvas={contains:x=>x===editable};
const state={active:null,savedRange:null,rightSnapshot:null};
const view={canvas};
const windowMock={innerWidth:1200,innerHeight:900,getSelection:()=>({rangeCount:1,getRangeAt:()=>actual})};
const handlers=new Function("state","view","get","window",
 method("pageCaptureRightClick")+"\n"+method("pageContextAt")+
 ";return {capture:pageCaptureRightClick,open:pageContextAt};"
)(state,view,()=>menu,windowMock);
const event=(shift=false)=>({button:2,shiftKey:shift,clientX:70,clientY:40,
 target:{closest:()=>editable},prevented:false,stopped:false,
 preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}});
let e=event();handlers.capture(e);
assert.ok(state.rightSnapshot?.range);
actual=collapsed;handlers.open(e);
assert.equal(e.prevented,true);
assert.equal(e.stopped,true);
assert.equal(menu.hidden,false);
assert.equal(menuFocused,true);
assert.equal(state.savedRange.toString(),"Új könyvtár");
console.log("Firefox pre-contextmenu collapse preserved for collection-page formatting: PASS");
menu.hidden=true;e=event(true);handlers.open(e);
assert.equal(e.prevented,false);
assert.equal(menu.hidden,true);
console.log("Firefox Shift+right-click native menu remains untouched: PASS");
