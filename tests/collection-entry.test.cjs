"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const coreSrc=fs.readFileSync(path.join(__dirname,"..","collection-page-core.js"),"utf8"),
 script=fs.readFileSync(path.join(__dirname,"..","collection-pages.js"),"utf8");
const parser=new Function("globalThis",coreSrc+"return globalThis.RBTOOLS_PAGE_CORE;")({});
function extract(name){
 const start=script.indexOf("function "+name+"("),stop=script.indexOf("\nfunction ",start+10);
 assert.ok(start>=0&&stop>start,"Missing "+name);
 return script.slice(start,stop);
}
const source='<div id="rb-static-page-nav"><button data-rb-target="2026">2026</button></div>'+
 '<script>function rbYear(){return "<b>2026</b>";}</script>'+
 '<div data-rb-static-section="2026"><h3>2026</h3><div>Régi bevezető</div><h3>Első régi adás</h3><div>Régi összefoglaló</div></div>';
const tree=parser.parse(source);assert.equal(tree.safe,true);
const section=tree.nodes.find(n=>n.kind==="container"&&n.prefix.includes('data-rb-static-section'));
assert.ok(section,"Missing year section");
const fields={
 pageEntryTitle:{value:'Új adás & "utazás"'},
 pageEntryDate:{value:"2026.09.30."},
 pageEntryUrl:{value:"https://www.regionalbahn.hu/2026/09/uj.html?x=1&y=2"},
 pageEntrySummary:{value:"Első sor\nMásodik sor"},
 pageEntrySection:{value:"section-0"}
};
const map=new Map([["section-0",section.children]]),view={canvas:{querySelectorAll:()=>[]}};
let rerenders=0,updates=0;const notices=[],state={tree,active:null};
const fakeURL=globalThis.URL||class{
 constructor(raw){this.protocol=String(raw).split(":")[0]+":";if(!/^https?:\/\//.test(raw))throw Error("invalid");}
};
const run=new Function("state","view","knownYearSections","get","render","update","message","URL",
  extract("escapeEntry")+"\n"+extract("entryNode")+"\n"+extract("insertEntry")+
  "\nreturn insertEntry;");
const insert=run(state,view,map,id=>fields[id],()=>rerenders++,()=>updates++,v=>notices.push(v),fakeURL);
insert();
assert.equal(rerenders,1);assert.equal(updates,1);
const output=parser.serialize(tree);
assert.ok(output.includes("Új adás &amp; &quot;utazás&quot;"));
assert.ok(output.includes('href="https://www.regionalbahn.hu/2026/09/uj.html?x=1&amp;y=2"'));
assert.ok(output.includes("Első sor<br />Második sor"));
assert.ok(output.indexOf("Új adás")<output.indexOf("Első régi adás"));
assert.ok(parser.audit(tree,output).ok);
assert.ok(output.includes('function rbYear(){return "<b>2026</b>";}'));
assert.equal(fields.pageEntryTitle.value,"");
console.log("Safe archive entry inserted at top of existing year; original JS retained: PASS");
fields.pageEntryTitle.value="Második adás";fields.pageEntryDate.value="2026.09.30.";
fields.pageEntryUrl.value="javascript:alert(1)";fields.pageEntrySummary.value="Egy szöveg";
insert();
assert.equal(rerenders,1);assert.equal(parser.serialize(tree),output);
console.log("Unsafe archive URL correctly rejected: PASS");
