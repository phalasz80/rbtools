"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,".."),index=fs.readFileSync(path.join(root,"index.html"),"utf8"),notes=fs.readFileSync(path.join(root,"release-notes.html"),"utf8");
const pos=t=>{const i=index.indexOf(t);assert.ok(i>=0,"Missing "+t);return i};
assert.ok(pos('id="rbtools-help-cikkadmin"')<pos('id="rbtools-help-gyujtooldalak"'));
assert.ok(pos('id="rbtools-help-gyujtooldalak"')<pos("<h2>Markdown formázási szabályok</h2>"));
assert.ok(index.includes('href="/release-notes.html"'));
assert.ok(index.includes('const RBTOOLS_VERSION="pages-v47"'));
assert.ok(index.includes('id="rbtools-helpChapterLinks"'));
assert.ok(index.includes('button("Összes",()=>choose(null))'));
assert.ok(index.includes('e.panel.hidden=!!entry&&e!==entry'));
assert.ok(index.includes('aria-pressed'));
assert.ok(index.includes('window.addEventListener("hashchange"'));
assert.ok(index.includes('prefers-reduced-motion'));
assert.match(notes,/<title>RBTools – Változásnapló<\/title>/);
for(const version of ["pages-v47","pages-v46","pages-v45","pages-v44","pages-v43","pages-v42","pages-v41","pages-v40","pages-v39","pages-v38","pages-v37","pages-v29"]){
 assert.match(notes,new RegExp('id="'+version+'"'));
}
assert.ok(notes.includes("2026-09-30T15:41:07+02:00"));
assert.match(notes,/href="https:\/\/github.com\/phalasz80\/rbtools\/commit\//);
assert.match(notes,/aria-label="Kiadások"/);
console.log("Help panel order, button navigation, version badge and historical release notes: PASS");