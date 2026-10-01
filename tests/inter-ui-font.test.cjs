"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const index=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const notes=fs.readFileSync(path.join(__dirname,"..","release-notes.html"),"utf8");
assert.match(index,/fonts\.googleapis\.com\/css2\?family=Inter/);
assert.match(notes,/fonts\.googleapis\.com\/css2\?family=Inter/);
assert.match(index,/#rbtools-app\{margin:0;background:var\(--bg\);color:var\(--ink\);font:14px\/1\.5 Inter,/);
assert.match(index,/#rbtools-app \.admin-p\{text-align:justify;font:16px\/1\.55 Inter,/);
assert.match(index,/#rbtools-app \.admin-h3\{text-align:center;font:700 20px\/1\.35 Inter,/);
assert.match(index,/#rbtools-app \.admin-caption\{margin-top:7px;text-align:center;font:14px\/1\.5 Inter,/);
assert.match(index,/Segoe UI Symbol/);
assert.match(index,/Segoe UI Emoji/);
assert.match(index,/Consolas,"Courier New",monospace/);
for(const m of index.matchAll(/font(?::|-[a-z-]+:)[^;\n}]*Arial[^;\n}]*/g)){
  assert.ok(m[0].includes("Inter,"),"Arial fallback must not precede Inter: "+m[0]);
}
assert.ok(index.includes('const RBTOOLS_VERSION="pages-v46"'));
console.log("Inter everywhere with symbol/emoji fallbacks and monospace code editors: PASS");