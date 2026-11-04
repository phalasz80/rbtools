"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const fn=name=>{const a=src.indexOf("function "+name+"("),b=src.indexOf("\nfunction ",a+10);assert.ok(a>=0&&b>a,name);return src.slice(a,b)};
assert.match(src,/#rbtools-app \.admin-news-todo-panel\{[^}]*color:var\(--ink\)/);
assert.match(src,/#rbtools-app \.admin-news-todo-editor\{[^}]*color:var\(--ink\)/);
assert.match(src,/#rbtools-app \.admin-news-todo-editor\{[^}]*caret-color:var\(--ink\)/);
assert.match(src,/#rbtools-app \.admin-news-todo-editor a\{color:var\(--accent\)/);
const parse=new Function(fn("adminReadAuthorFooter")+"return adminReadAuthorFooter;")();
const hr=()=>({nodeType:1,tagName:"HR"});
function credit(value,{right=false,small=false,italic=false}={}){
 const span={getAttribute:()=>small?"font-size:85%":""};
 const emphasis=italic?{textContent:value,closest:()=>span,getAttribute:()=>""}:null;
 return {nodeType:1,tagName:"DIV",textContent:value,
  getAttribute:name=>name==="style"?(right?"text-align: right !important":""):"",
  querySelector:()=>emphasis};
}
let nodes=[hr(),credit("Összeállította: Adorján Péter",{italic:true}),hr(),
 credit("Összeállította: Adorján Péter, Halász Péter",{right:true,small:true,italic:true})];
assert.deepEqual(parse(nodes),{name:"Adorján Péter, Halász Péter",mode:"compiled"});
assert.deepEqual(parse(nodes),{name:"Adorján Péter",mode:"compiled"});
assert.equal(parse(nodes),null);
assert.equal(nodes.length,0);
assert.equal(parse([credit("Összeállította: egy interjú során hangzott el")]),null);
assert.equal(parse([hr(),credit("Nem szerzői sor",{right:true,italic:true})]),null);
const generate=fn("adminGenerateHtml");
assert.match(generate,/contentType==="news"&&rbGet\("tab-admin"\)\?\.dataset\.editorMode!=="live"/);
assert.match(generate,/while\(adminReadAuthorFooter\(bodyNodes\)\)legacyCredits\+\+/);
assert.match(generate,/adminNewsChecklistOutput\(\)\+'<!--more-->/);
console.log("#nyúz dark-mode contrast and single author footer: PASS");