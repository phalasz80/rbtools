/* RBTools: lossless static page structure. Protected JS/CSS/nav is never DOM-rewritten. */
(function(global){"use strict";
const VOID=new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
const LOCK=new Set("script style iframe svg object embed canvas template noscript button form input select textarea video audio picture img link meta".split(" "));
const WRAP=new Set("div section article main aside header footer ul ol li table tbody thead tr td blockquote".split(" "));
function endTag(s,i){let q="";for(let p=i+1;p<s.length;p++){let c=s[p];if(q){if(c===q)q="";}else if(c==="'"||c==='"')q=c;else if(c===">")return p+1;}return -1;}
function token(s,i){
 if(s.startsWith("<!--",i)){let n=s.indexOf("-->",i+4);return n<0?null:{name:"!comment",end:n+3,self:true};}
 if(s.startsWith("<![CDATA[",i)){let n=s.indexOf("]]>",i+9);return n<0?null:{name:"!cdata",end:n+3,self:true};}
 if(s.startsWith("<!",i)||s.startsWith("<?",i)){let n=endTag(s,i);return n<0?null:{name:"!meta",end:n,self:true};}
 const m=s.slice(i).match(/^<(\/?)\s*([A-Za-z][\w:-]*)\b/);if(!m)return null;
 const end=endTag(s,i),name=m[2].toLowerCase();if(end<0)return null;
 let closing=!!m[1];return {end,name,closing,self:closing||VOID.has(name)||/\/\s*>$/.test(s.slice(i,end))};
}
function rawTagEnd(s,t){
 const tail=s.slice(t.end);
 const m=tail.match(t.name==="script"?/<\/\s*script\s*>/i:/<\/\s*style\s*>/i);
 return m?t.end+m.index+m[0].length:-1;
}
function consume(s,i){
 const t=token(s,i);if(!t||t.closing)return null;
 if(t.self)return {end:t.end,closeStart:t.end,openEnd:t.end,tag:t.name,void:true};
 if(t.name==="script"||t.name==="style"){
  const end=rawTagEnd(s,t);
  return end<0?null:{end,closeStart:end-(t.name.length+3),openEnd:t.end,tag:t.name,void:false};
 }
 const stack=[t.name];let p=t.end;
 while(p<s.length){
  let lt=s.indexOf("<",p);if(lt<0)return null;
  const x=token(s,lt);if(!x){p=lt+1;continue;}
  if(x.name.startsWith("!")){p=x.end;continue;}
  if(!x.closing&&(x.name==="script"||x.name==="style")&&!x.self){
   p=rawTagEnd(s,x);if(p<0)return null;continue;
  }
  if(x.closing){if(stack.at(-1)!==x.name)return null;stack.pop();if(!stack.length)return {end:x.end,closeStart:lt,openEnd:t.end,tag:t.name,void:false};}
  else if(!x.self)stack.push(x.name);
  p=x.end;
 }
 return null;
}
function split(s){
 s=String(s||"");const out=[];let i=0;
 while(i<s.length){
  const lt=s.indexOf("<",i);
  if(lt<0){out.push({raw:s.slice(i),tag:"#text"});break;}
  if(lt>i){out.push({raw:s.slice(i,lt),tag:"#text"});i=lt;continue;}
  const t=token(s,i);
  if(!t){out.push({raw:"<",tag:"#text"});i++;continue;}
  if(t.name.startsWith("!")){out.push({raw:s.slice(i,t.end),tag:t.name});i=t.end;continue;}
  if(t.closing)return null;
  const z=consume(s,i);if(!z)return null;
  out.push({raw:s.slice(i,z.end),tag:z.tag,openEnd:z.openEnd-i,closeStart:z.closeStart-i,void:z.void});i=z.end;
 }
 return out;
}
function locked(p){
 const h=p.raw.slice(0,p.openEnd);
 return LOCK.has(p.tag)||/\bon(?:click|load|error|submit|mouse|change)\s*=/i.test(h)||
 /\bid\s*=\s*["']?[^"'\s>]*(?:switcher|year-nav|page-nav|static-page-nav|year-select)[^"'\s>]*/i.test(h)||
 /\bclass\s*=\s*["'][^"']*(?:year-switcher|year-selector|year-buttons|collection-navigation)[^"']*/i.test(h);
}
function make(p,d=0){
 const raw=p.raw;
 if(p.tag==="#text")return raw.trim()?{kind:"text",original:raw,value:raw,edited:false}:{kind:"raw",original:raw,protected:false};
 if(p.tag.startsWith("!")||p.void)return {kind:"raw",original:raw,protected:p.tag==="!comment"&&/rb-|year-|script/i.test(raw)};
 if(locked(p)||d>18)return {kind:"raw",original:raw,protected:true};
 const prefix=raw.slice(0,p.openEnd),inner=raw.slice(p.openEnd,p.closeStart),suffix=raw.slice(p.closeStart);
 const children=split(inner);if(!children)return {kind:"raw",original:raw,protected:true};
 if(WRAP.has(p.tag)&&children.some(x=>WRAP.has(x.tag)||LOCK.has(x.tag)||/\n\s*\n/.test(x.raw)))
  return {kind:"container",tag:p.tag,original:raw,prefix,suffix,children:children.map(x=>make(x,d+1))};
 if(children.some(x=>LOCK.has(x.tag))||/<(?:script|style|button|iframe|img|svg|form|input|select|textarea)\b/i.test(inner))
  return {kind:"raw",original:raw,protected:true};
 return {kind:"leaf",tag:p.tag,original:raw,prefix,suffix,inner,value:inner,edited:false};
}
function parse(html){const raw=String(html||""),bits=split(raw);return bits?{original:raw,nodes:bits.map(p=>make(p)),safe:true}:{original:raw,nodes:[{kind:"raw",original:raw,protected:true}],safe:false};}
function pack(n){
 if(n.kind==="container"){const x=n.children.map(pack);return n.children.some((c,i)=>x[i]!==c.original)?n.prefix+x.join("")+n.suffix:n.original;}
 if(n.kind==="leaf"&&n.edited)return n.prefix+n.value+n.suffix;
 if(n.kind==="text"&&n.edited)return n.value;
 return n.original;
}
function serialize(t){return t.nodes.map(pack).join("");}
function walk(t,f){const out=[];function go(n){if(f(n))out.push(n);if(n.children)n.children.forEach(go);}t.nodes.forEach(go);return out;}
function leaves(t){return walk(t,n=>n.kind==="leaf"||n.kind==="text");}
function protectedParts(t){return walk(t,n=>n.kind==="raw"&&n.protected).map(n=>n.original);}
function audit(t,html=serialize(t)){const raw=protectedParts(t);return {ok:raw.every(x=>html.includes(x)),count:raw.length,
 scripts:raw.filter(x=>/^\s*<script\b/i.test(x)).length,
 buttons:raw.filter(x=>/(?:<button\b|year-selector|page-nav|static-page-nav)/i.test(x)).length};}
global.RBTOOLS_PAGE_CORE=Object.freeze({split,parse,serialize,leaves,protectedParts,audit});
})(typeof window!=="undefined"?window:globalThis);
