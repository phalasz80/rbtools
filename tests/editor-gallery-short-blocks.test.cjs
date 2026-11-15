"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const fn=name=>{
 const a=src.indexOf("function "+name+"("),b=src.indexOf("\nfunction ",a+10);
 assert.ok(a>=0&&b>a,name+" missing");return src.slice(a,b);
};
const integrated=fn("rbIntegrateEditorTools");
assert.match(integrated,/galleryPanel\.hidden=true/);
assert.match(integrated,/stage\.append\(canvas,galleryPanel\)/);
assert.match(integrated,/aria-expanded/);
assert.match(integrated,/galleryToggle\.addEventListener\("click"/);
assert.doesNotMatch(integrated,/galleryDetails\.open=true/);
assert.match(src,/#rbtools-app \.rb-editor-gallery\[hidden\]\{display:none!important\}/);
assert.match(src,/#rbtools-app \.rb-editor-stage\.gallery-open/);
assert.match(src,/@media\(max-width:930px\)/);
const library=fn("adminRenderImageLibrary");
assert.match(library,/galleryToggle\.textContent="▣ Képtár \("/);
assert.match(library,/adminInsertImageAt\(img\.id,at>=0\?at\+1:adminBlocks\.length\)/);
assert.match(library,/document\.createElement\("details"\)/);
assert.match(library,/tile\.append\(thumb,caption,quick,metadata\)/);
const render=fn("adminRenderCanvas");
assert.match(render,/previousScrollTop=host\.scrollTop/);
assert.match(render,/host\.scrollTop=previousScrollTop/);
const control=fn("adminBlockControls");
assert.match(control,/aria-label/);
assert.match(control,/mk\("×","Blokk törlése"/);
assert.match(src,/\.admin-block-controls button:last-child/);
const keyHandler=fn("adminTrackEditable");
assert.match(keyHandler,/adminRemoveOrMergeBlockAtCaret\(el,e\.key\)/);
assert.match(keyHandler,/e\.key==="Enter"/);
const remove=fn("adminRemoveOrMergeBlockAtCaret");
function editor(blocks,options={}){
 const dom={dataset:{adminBlockId:options.id||"b"},contains:()=>true};
 const state={render:0,generated:0,focus:null,
  selection:{rangeCount:1,getRangeAt:()=>({
    collapsed:options.collapsed!==false,commonAncestorContainer:dom})}};
 const prelude=[
 'let adminBlocks=blocks;',
 'const window={getSelection:()=>state.selection};',
 'const adminTextBlockIsEmpty=html=>!(String(html||"").trim());',
 'const adminRangeContentAtEdge=(el,r,which)=>which==="before"?!!options.before:!!options.after;',
 'const adminRenderCanvas=()=>{state.render++};',
 'const adminGenerateHtml=()=>{state.generated++};',
 'const adminFocusBlockEnd=id=>{state.focus=["end",id]};',
 'const adminFocusBlockStart=id=>{state.focus=["start",id]};'
 ].join("\n");
 const handle=new Function("blocks","dom","state","options",prelude+remove+
 '\nreturn key=>adminRemoveOrMergeBlockAtCaret(dom,key);')(blocks,dom,state,options);
 return {handle,state,dom};
}
let blocks=[{id:"a",type:"p",html:"Első",breakAfter:true},{id:"b",type:"p",html:"",breakAfter:true}];
let case1=editor(blocks);
assert.equal(case1.handle("Backspace"),true);assert.equal(blocks.length,1);
assert.deepEqual(case1.state.focus,["end","a"]);
assert.equal(case1.state.render,1);
blocks=[{id:"a",type:"p",html:"Első",breakAfter:true},{id:"b",type:"p",html:"Rövid",breakAfter:false}];
let case2=editor(blocks,{before:false,after:true});
assert.equal(case2.handle("Backspace"),true);
assert.equal(blocks.length,1);assert.equal(blocks[0].html,"ElsőRövid");
assert.equal(blocks[0].breakAfter,false);
blocks=[{id:"b",type:"p",html:"Rövid",breakAfter:true},{id:"c",type:"p",html:" folytatás",breakAfter:false}];
let case3=editor(blocks,{before:true,after:false});
assert.equal(case3.handle("Delete"),true);
assert.equal(blocks.length,1);assert.equal(blocks[0].html,"Rövid folytatás");
assert.equal(blocks[0].breakAfter,false);
blocks=[{id:"a",type:"h3",html:"Alcím"},{id:"b",type:"p",html:"Rövid",breakAfter:true}];
let case4=editor(blocks,{before:false,after:true});
assert.equal(case4.handle("Backspace"),false,"A hírcím ne olvadjon bele a törzsszövegbe.");
assert.equal(blocks.length,2);
blocks=[{id:"a",type:"p",html:"Első"},{id:"b",type:"p",html:"Rövid"}];
assert.equal(editor(blocks,{collapsed:false}).handle("Backspace"),false);
console.log("v72 editor gallery and empty/short text block keyboard regressions: PASS");