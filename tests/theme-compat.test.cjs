"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const index=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function extract(name){
 const start=index.indexOf("function "+name+"("),end=index.indexOf("\nfunction ",start+10);
 assert.ok(start>=0&&end>start,name+" must exist");
 return index.slice(start,end);
}
const style=new Function(extract("rbThemePostCss")+"\nreturn rbThemePostCss;")();
const css=style();
assert.match(css,/<style data-rbtools-theme="regionalbahn-inter-2026">/);
assert.match(css,/\.rbtools-heading\{font-family:inherit!important/);
assert.match(css,/text-transform:none!important/);
assert.match(css,/\.rbtools-caption\{color:#0b5394/);
assert.match(css,/@media\(max-width:600px\)/);
assert.doesNotMatch(css,/@font-face|@import/i,"Do not duplicate Blogger's embedded Inter");
assert.doesNotMatch(css,/\.post-body\s*\{/,"Never overwrite the site-wide article style");
assert.doesNotMatch(css,/\.post-body\s+img\s*\{/,"Never suppress native Blogger image framing");
assert.match(extract("adminGenerateHtml"),/rbThemePostCss\(\)/);
assert.match(extract("adminLoadExistingHtml"),/tag==="style"&&n\.hasAttribute\("data-rbtools-theme"\)/);
assert.match(extract("adminHtmlToBlocks"),/tag==="style"&&node\.hasAttribute\("data-rbtools-theme"\)/);
assert.match(extract("adminBlockHtml"),/class="rbtools-heading"/);
assert.match(extract("adminBlockHtml"),/class="rbtools-embed"/);
assert.match(extract("adminMainImageHtml"),/class="rbtools-main-image"/);
assert.match(extract("adminImageBodyHtml"),/class="separator rbtools-image"/);
assert.match(extract("adminImageBodyHtml"),/class="rbtools-caption"/);
for(const name of ["convertArticleMarkdown","convertArticlePlainText"]){
 const source=extract(name);
 assert.ok(source.includes("rbThemePostCss()"),name+" must carry the portable post style");
}
assert.match(index,/Témakompatibilitás:/);
assert.match(index,/Illesztés a 2026-os optimalizált RegionalBahn CSS-hez/);
console.log("RegionalBahn optimized Inter theme: generation, responsive media, import and docs PASS");
