"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const fn=n=>{const a=src.indexOf("function "+n+"("),b=src.indexOf("\nfunction ",a+10);assert.ok(a>=0&&b>a);return src.slice(a,b)};
const start=src.indexOf("<h3>0. Mielőtt nekikezdesz");
const heads=[...src.matchAll(/<h3>(\d+(?:\/[A-Z])?)\.\s/g)].filter(x=>x.index>=start);
assert.deepEqual(heads.map(x=>x[1]),Array.from({length:29},(_,i)=>String(i)));
assert.ok(src.includes("<h4>18.1."));assert.ok(!src.includes("<h3>14/B."));
for(const id of ["adminFmtAbbr","adminAbbrPanel","adminAbbrTitle","adminAbbrApply","adminAbbrRemove","adminAbbrCancel","adminAuthor","adminFooter"])
 assert.equal(src.split('id="rbtools-'+id+'"').length-1,1,id);
assert.ok(src.indexOf('id="rbtools-adminCanvas"')<src.indexOf('id="rbtools-adminAuthor"'));
assert.ok(src.indexOf('id="rbtools-adminAuthor"')<src.indexOf('id="rbtools-adminFind"'));
assert.match(src,/data-admin-context-command="abbr"/);
assert.match(src,/else if\(action==="abbr"\)adminAbbr\(true\)/);
assert.match(fn("adminApplyAbbr"),/setAttribute\("title",title\)/);
assert.match(fn("adminApplyAbbr"),/surroundContents\(item\)/);
assert.match(fn("adminRemoveAbbr"),/replaceWith/);
assert.match(fn("adminGenerateHtml"),/compiled/);
assert.match(fn("adminLoadExistingHtml"),/adminReadAuthorFooter\(nodes\)/);
assert.match(src,/rbGet\("adminAuthor"\).addEventListener\("input"/);
const parse=new Function(fn("adminReadAuthorFooter")+"return adminReadAuthorFooter;")();
function nodes(value,withHr=true,small=true){
 const span={getAttribute:()=>small?"font-size:85%":"font-size:100%"};
 const em={textContent:value,closest:()=>span};
 const tail={nodeType:1,tagName:"DIV",getAttribute:()=>"text-align:right",querySelector:()=>em};
 return [{nodeType:1,tagName:"P"},...(withHr?[{nodeType:1,tagName:"HR"}]:[]),{nodeType:3,textContent:"\n"},tail];
}
let arr=nodes("Összeállította: Adorján Péter, Halász Péter");
assert.deepEqual(parse(arr),{name:"Adorján Péter, Halász Péter",mode:"compiled"});assert.equal(arr.length,2);
arr=nodes("Halász Péter");assert.deepEqual(parse(arr),{name:"Halász Péter",mode:"author"});
assert.equal(parse(nodes("Idézet",false)),null);assert.equal(parse(nodes("Idézet",true,false)),null);
let legacy=nodes("Összeállította: Adorján Péter");legacy.at(-1).getAttribute=()=>"text-align:justify";
assert.deepEqual(parse(legacy),{name:"Adorján Péter",mode:"compiled"});
assert.match(src,/Szerzők és cikkzárás – ez az egyetlen forrás/);
assert.match(fn("adminLoadExistingHtml"),/while\(adminReadAuthorFooter\(nodes\)\)strippedFooterCount\+\+/);
assert.match(fn("adminGenerateHtml"),/replace\(\/\^Összeállította/);
console.log("abbr + author footer + help headings: PASS");