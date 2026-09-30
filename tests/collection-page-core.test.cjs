"use strict";
/* node tests/collection-page-core.test.cjs */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const code=fs.readFileSync(path.join(__dirname,"..","collection-page-core.js"),"utf8");
const host={};
const parser=new Function("globalThis",code+"return globalThis.RBTOOLS_PAGE_CORE;")(host);
const fixtures=[
["Old-style year switcher",
  '<!-- RB year chooser -->\n<div id="rb-static-page-nav"><button data-rb-target="2026">2026</button><button data-rb-target="all">Összes</button></div>'+
  '<script>(function(){const a="<div>inside script"; if(a){return "<span>ok</span>";}})();</script>\n'+
  '<div data-rb-static-section="2026"><h3>2026</h3><div>London <strong>archívum</strong> és <a href="https://www.regionalbahn.hu/">Tovább »</a></div><hr /></div>',
 "London"],
["Single nested wrapper and protected CSS/JS",
  '<section data-rb-static-section="2025" data-stable="x"><div>Év <em>bekezdés</em></div><style>.a::after{content:"<div>";}</style>'+
  '<nav><button onclick="show(2025)">2025</button></nav><div><div>Áttekintés 2025</div></div>'+
  '<script type="text/javascript">window.show=function(){return "</div>"}</script></section>',
  "Áttekintés"],
["Quotes in HTML attributes",
  "<div data-json='{\"q\":\">\"}' style=\"text-align:center;\"><div>Magyar vasút</div><br /><div>Tovább</div></div>",
  "Magyar vasút"],
["Mixed top-level prose and comments",
  'Bevezetés<!-- RB: original -->\n<h3 style="text-align:center;">Archívum</h3><div>Első epizód</div>\n',
  "Első"]
];
for(const [label,raw,needle] of fixtures){
 const tree=parser.parse(raw);
 assert.equal(tree.safe,true,label+" rejected");
 assert.equal(parser.serialize(tree),raw,label+" lost bytes without editing");
 const before=parser.protectedParts(tree);
 const leaf=parser.leaves(tree).find(n=>n.value.includes(needle));
 assert.ok(leaf,label+" has no editable caption or article text");
 leaf.value=leaf.value.replace(needle,"FRISSÍTETT");leaf.edited=true;
 const output=parser.serialize(tree);
 assert.ok(output.includes("FRISSÍTETT"),label+" not edited");
 assert.ok(before.every(fragment=>output.includes(fragment)),label+" changed protected code");
 assert.equal(parser.audit(tree,output).ok,true,label+" failed code audit");
 assert.ok(output.length>0);
 console.log(label+": PASS ("+before.length+" védett HTML/JS/CSS-rész).");
}
const malformed="<div><h3>Eredeti, hibás</div><script>alert(1)</script>";
const locked=parser.parse(malformed);
assert.equal(locked.safe,false);
assert.equal(parser.serialize(locked),malformed);
assert.equal(parser.leaves(locked).length,0);
assert.equal(parser.audit(locked).ok,true);
console.log("Malformed HTML locked without loss: PASS");
