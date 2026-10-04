"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const index=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function extract(name){
 const start=index.indexOf("function "+name+"("),end=index.indexOf("\nfunction ",start+10);
 assert.ok(start>=0&&end>start,name+" must exist");
 return index.slice(start,end);
}
const style=new Function(extract("rbThemePostCss")+"\nreturn rbThemePostCss;")();
assert.equal(style(),"","Blogger post HTML must not contain a style element");
for(const name of ["adminGenerateHtml","convertArticleMarkdown","convertArticlePlainText"]){
 const source=extract(name);
 assert.ok(!source.includes("rbThemePostCss()"),name+" must not inject post-level CSS");
}
assert.match(extract("adminLoadExistingHtml"),/tag==="style"&&n\.hasAttribute\("data-rbtools-theme"\)/,
 "Legacy posts containing the old RBTools style block must still import cleanly");
assert.match(extract("adminHtmlToBlocks"),/tag==="style"&&node\.hasAttribute\("data-rbtools-theme"\)/);
const blocks=extract("adminBlockHtml");
assert.doesNotMatch(blocks,/class="rbtools-heading"/);
assert.doesNotMatch(blocks,/class="rbtools-embed"/);
assert.match(blocks,/style="text-align: /);
assert.doesNotMatch(blocks,/font-family: inherit/);
assert.doesNotMatch(blocks,/line-height:1\.35/);
assert.doesNotMatch(blocks,/text-transform:none/);
assert.doesNotMatch(blocks,/color:inherit/);
const cleanup=extract("rbCleanGeneratedHtml");
assert.match(cleanup,/querySelectorAll\("h1,h2,h3,h4,h5,h6"\)/);
assert.match(cleanup,/el\.setAttribute\("style","text-align: "\+align\+";"\)/);
assert.match(extract("adminMainImageHtml"),/max-width:100%/);
assert.doesNotMatch(extract("adminMainImageHtml"),/class="rbtools-main-image"/);
assert.match(extract("adminImageBodyHtml"),/class="separator"/);
assert.doesNotMatch(extract("adminImageBodyHtml"),/rbtools-image/);
assert.match(extract("adminImageBodyHtml"),/<div style="text-align: center;">/);
assert.ok(!index.includes('<style data-rbtools-theme="regionalbahn-inter-2026">'));
assert.match(index,/Témakompatibilitás:/);
assert.match(index,/nem ír külön <code>&lt;style&gt;<\/code> elemet/);
console.log("Blogger-safe theme compatibility: minimal heading alignment inline, no post-level style element: PASS");