/* RegionalBahn Tools: protected Blogger static-page WYSIWYG workspace. */
(function(){
"use strict";
const core=window.RBTOOLS_PAGE_CORE,bridge=window.RBTOOLS_PAGE_BRIDGE;
const root=document.getElementById("rbtools-app");
if(!core||!bridge||!root){console.error("RBTools static page editor dependencies not loaded.");return;}
const get=id=>root.querySelector("#rbtools-"+id);
const view={
  blog:get("pageBlogSelect"),page:get("pageSelect"),canvas:get("pageCanvas"),
  title:get("pageTitle"),raw:get("pageRawOutput"),state:get("pageState"),
  stateTitle:get("pageStateTitle"),stateDetail:get("pageStateDetail"),
  info:get("pageInfo"),save:get("pageSave"),backup:get("pageBackup")
};
const state={list:[],loaded:null,tree:null,baseline:null,backup:false,saving:false,error:"",
  active:null,savedRange:null,linkAnchor:null,lastState:""};
function message(title,detail="",kind="idle"){
  const key=kind+"|"+title+"|"+detail;
  if(key===state.lastState)return;
  state.lastState=key;view.state.className="collection-page-state "+kind;
  view.stateTitle.textContent=title;view.stateDetail.textContent=detail;
}
function safeName(x){return String(x||"oldal").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"oldal";}
function currentHtml(){return state.tree?core.serialize(state.tree):"";}
function dirty(){
  if(!state.tree)return false;
  if(!state.baseline)return true;
  return view.title.value!==state.baseline.title||currentHtml()!==state.baseline.html;
}
function selection(){
  const sel=window.getSelection();if(!sel?.rangeCount)return false;
  const range=sel.getRangeAt(0);
  const base=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;
  const editor=base?.closest?.(".collection-page-editable");
  if(!editor||!view.canvas.contains(editor))return false;
  state.active=editor;state.savedRange=range.cloneRange();return true;
}
function restore(){
  if(!state.active?.isConnected||!state.savedRange)return false;
  state.active.focus({preventScroll:true});
  const sel=window.getSelection();sel.removeAllRanges();sel.addRange(state.savedRange.cloneRange());
  return true;
}
function sanitizeEditable(markup){
  const t=document.createElement("template");t.innerHTML=String(markup||"");
  t.content.querySelectorAll("script,style,iframe,object,embed,form,input,textarea,select,button,svg,canvas,link,meta").forEach(el=>el.remove());
  t.content.querySelectorAll("*").forEach(el=>{
    for(const a of Array.from(el.attributes)){
      if(/^on/i.test(a.name))el.removeAttribute(a.name);
      if(["href","src","xlink:href"].includes(a.name.toLowerCase())
        &&/^\s*(?:javascript|data|vbscript):/i.test(a.value))el.removeAttribute(a.name);
    }
  });
  return t.innerHTML;
}
function edited(node,el){
  node.value=node.kind==="text"?el.textContent:sanitizeEditable(el.innerHTML);
  node.edited=true;
  const audit=core.audit(state.tree);
  if(!audit.ok){state.error="Egy védett HTML-/JavaScript-blokk sérült. A mentés leállítva.";}
  update();
}
function create(tag,markup){
  const start=tag==="h3"?'<h3 style="text-align: center;">':'<div style="text-align: justify;">';
  const end=tag==="h3"?"</h3>":"</div>";
  return {kind:"leaf",tag,original:"",prefix:start,suffix:end,inner:markup,value:markup,edited:true};
}
function rawBadge(node){
  const raw=node.original,significant=raw.trim();
  if(!significant)return document.createDocumentFragment();
  const item=document.createElement("details");item.className="collection-page-locked";
  const label=document.createElement("summary");
  if(/^\s*<script\b/i.test(raw))label.textContent="🔒 Eredeti JavaScript (változatlanul megőrizve)";
  else if(/^\s*<style\b/i.test(raw))label.textContent="🔒 Eredeti CSS (változatlanul megőrizve)";
  else if(/(?:<button\b|switcher|page-nav|year-selector)/i.test(raw))label.textContent="🔒 Egyedi évválasztó / navigáció (megőrizve)";
  else if(/<img\b/i.test(raw))label.textContent="🔒 Eredeti képkód, URL és képattribútumok (megőrizve)";
  else label.textContent="🔒 Védett HTML vagy speciális elem (megőrizve)";
  const pre=document.createElement("pre");pre.textContent=raw.slice(0,16000);
  const hint=document.createElement("small");hint.textContent="Ez a rész nem kerül WYSIWYG-átalakításra, a mentett HTML-ben az eredeti karaktereket tartja meg.";
  item.append(label,hint,pre);return item;
}
function renderNode(node,siblings){
  if(node.kind==="raw"){
    if(!node.original.trim())return document.createDocumentFragment();
    if(!node.protected&&/^<hr\b/i.test(node.original.trim()))return document.createElement("hr");
    return rawBadge(node);
  }
  if(node.kind==="container"){
    const outer=document.createElement("div");outer.className="collection-page-shell";
    const lbl=document.createElement("div");lbl.className="collection-page-block-label";
    const yr=node.prefix.match(/data-rb-(?:static-)?section\s*=\s*["']?([^"'\s>]+)/i);
    lbl.textContent=yr?"Eredeti év-/tartalmi blokk: "+yr[1]+" (a keret és attribútumai változatlanok)":
      "Eredeti HTML-keret: <"+node.tag+"> (a keret változatlan)";
    outer.appendChild(lbl);
    node.children.forEach(child=>outer.appendChild(renderNode(child,node.children)));
    return outer;
  }
  const block=document.createElement("div");block.className="collection-page-shell";
  const lbl=document.createElement("div");lbl.className="collection-page-block-label";
  lbl.textContent=node.kind==="text"?"Szövegrész":node.tag==="h3"?"Alcím":node.tag==="p"||node.tag==="div"?"Bekezdés / ajánló":"Szerkeszthető <"+node.tag+">";
  const input=document.createElement("div");input.className="collection-page-editable";
  input.contentEditable="true";input.spellcheck=true;
  if(node.kind==="text")input.textContent=node.value;
  else input.innerHTML=sanitizeEditable(node.value);
  if(node.tag==="h3"||node.tag==="h2"||node.tag==="h4")input.style.cssText="text-align:center;font-weight:700;font-size:1.15em";
  input.addEventListener("focus",()=>{state.active=input;selection();});
  input.addEventListener("mouseup",selection);input.addEventListener("keyup",selection);
  input.addEventListener("touchend",()=>requestAnimationFrame(selection));
  input.addEventListener("input",()=>{edited(node,input);selection();});
  input.addEventListener("blur",()=>edited(node,input));
  input.addEventListener("click",e=>{if(e.target.closest("a"))e.preventDefault();});
  input.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();selection();showLink();}
  });
  block.append(lbl,input);input.dataset.pageEditable="true";
  input.__rbPageNode=node;input.__rbPageSiblings=siblings;
  return block;
}
function render(){
  view.canvas.replaceChildren();
  if(!state.tree){const h=document.createElement("div");h.className="admin-empty";h.textContent="Nyiss meg egy meglévő Blogger-oldalt, vagy add át a Markdown-konverter HTML-kimenetét.";view.canvas.append(h);return;}
  state.tree.nodes.forEach(node=>view.canvas.appendChild(renderNode(node,state.tree.nodes)));
  state.active=null;state.savedRange=null;
}
function update(){
  const has=!!state.tree,hasPage=!!state.loaded?.id;
  const code=currentHtml(),audit=has?core.audit(state.tree,code):null;
  view.raw.value=code;
  ["pageCopy","pageDownload","pagePreview","pageAddParagraph","pageAddHeading","pageAddRule","pageLink"].forEach(id=>get(id).disabled=!has||!state.tree.safe);
  view.title.disabled=!has;view.backup.disabled=!hasPage||state.saving;
  get("pageProtection").textContent=has
    ?(audit.ok?"✓ A védett forráskódrészek sértetlenek: "+audit.count+
       " blokk, "+audit.scripts+" JavaScript, "+audit.buttons+" navigációs elem.":"⚠ Védett forráskód sérült: mentés tiltva.")
    :"Még nincs betöltött HTML.";
  const changed=dirty();
  view.save.disabled=!hasPage||!changed||!bridge.isConnected()||!audit?.ok||!state.tree.safe||state.saving||!!state.error;
  if(state.error){message("A SZERKESZTÉS / MENTÉS HIBÁJA",state.error,"error");return;}
  if(state.saving){message("BLOGGER-MENTÉS FOLYAMATBAN","Mentés közben továbbra is változhatnak a helyi adatok. A Blogger visszaigazolását külön ellenőrizzük.","working");return;}
  if(!has){message("Nincs megnyitott Blogger-oldal","A statikus oldalak lekérésével kezdhetsz.","idle");return;}
  if(!hasPage){message("HELYI GYŰJTŐOLDAL • MÉG NINCS BLOGGER-OLDALHOZ RENDELVE",
    "A konverter HTML-je WYSIWYG-ben szerkeszthető és letölthető. A meglévő oldal biztonságos módosításához előbb nyisd meg azt a Blogger API-ból.","working");return;}
  if(!bridge.isConnected()){message("A BLOGGER-KAPCSOLAT MEGSZAKADT",
    "A helyi szerkesztés megmarad ezen a lapon; újrakapcsolódás és mentés szükséges.","working");return;}
  if(changed){message("NEM MENTETT HELYI MÓDOSÍTÁSOK",
    (state.backup?"✓ Az eredeti HTML-ről készült biztonsági mentés. ":"Előbb töltsd le az EREDETI HTML biztonsági mentését. ")+
    "A(z) "+state.loaded.title+" oldal tartalma a Bloggeren még nem módosult.","dirty");return;}
  const when=state.baseline?.updated?new Date(state.baseline.updated).toLocaleString("hu-HU"):"";
  message(state.baseline?.origin==="saved"?"MENTVE, A BLOGGEREN ELLENŐRIZVE":"BLOGGER-OLDAL BETÖLTVE",
    (state.loaded.url||"Blogger Page ID: "+state.loaded.id)+(when?" • "+when:""),state.baseline?.origin==="saved"?"saved":"idle");
}
function refreshConnection(){
  const old=view.blog.value,blogs=bridge.blogs();
  if(bridge.isConnected()&&blogs.length){
    const known=new Set(blogs.map(x=>x.id));
    const wanted=known.has(old)?old:known.has(state.loaded?.blogId)?state.loaded.blogId:blogs[0].id;
    view.blog.replaceChildren();
    for(const b of blogs){const op=document.createElement("option");op.value=b.id;op.textContent=b.name+" • "+b.url;view.blog.append(op);}
    view.blog.value=wanted;
  }else if(!bridge.isConnected()){
    view.blog.replaceChildren(new Option("Kapcsolódás után választható",""));
  }
  get("pageFetch").disabled=!bridge.isConnected()||!view.blog.value||state.saving;
  get("pageConnect").textContent=bridge.isConnected()?"✓ Blogger csatlakoztatva":"🔐 Blogger-kapcsolat";
  update();
}
function listPages(){
  view.page.replaceChildren(new Option("Válassz statikus oldalt…",""));
  for(const p of state.list){
    const option=document.createElement("option");option.value=String(p.id);
    option.textContent=(p.title||"(cím nélküli)")+" • "+(p.status||"")+(p.url?" • "+p.url.replace(/^https?:\/\/[^/]+/,""):"");
    view.page.append(option);
  }
  view.page.disabled=!state.list.length;get("pageOpen").disabled=!state.list.length;
}
async function fetchPages(){
  if(!bridge.isConnected()||!view.blog.value){message("Kapcsolódj a Bloggerhez","A Cikkadmin és a Gyűjtőoldalak ugyanazt a Google-hozzáférést használják.","working");return;}
  const blogId=view.blog.value;
  get("pageFetch").disabled=true;message("STATIKUS OLDALAK LEKÉRÉSE…","A Blogger API-val olvassuk ki a kiválasztott blog oldalait.","working");
  try{
    const path="view=ADMIN&fetchBodies=false";
    // Admin lists usually include live and draft; explicit statuses also catch APIs with filtering defaults.
    const results=await Promise.allSettled(["live","draft"].map(status=>
      bridge.request({blogId,query:path+"&status="+status})));
    const pages=new Map(),errors=[];
    for(const v of results){
      if(v.status==="fulfilled")for(const p of v.value.items||[])pages.set(String(p.id),p);
      else errors.push(v.reason.message||String(v.reason));
    }
    if(!pages.size&&errors.length)throw Error(errors.join(" | "));
    state.list=Array.from(pages.values()).sort((a,b)=>String(a.title||"").localeCompare(String(b.title||""),"hu"));
    listPages();view.info.textContent=state.list.length+" statikus oldal a kiválasztott blogon."+
      (errors.length?" Néhány oldal lekérése korlátozott: "+errors.join(" | "):"");
    message("OLDALLISTA BETÖLTVE",state.list.length+" oldal, válassz egyet a WYSIWYG-szerkesztéshez.","idle");
  }catch(e){message("AZ OLDALLISTA NEM ELÉRHETŐ",e.message,"error");}
  finally{refreshConnection();}
}
function pagePath(id){return "/blogs/"+encodeURIComponent(view.blog.value)+"/pages/"+encodeURIComponent(id);}
async function getPage(id){
  let result;
  try{result=await bridge.request({blogId:view.blog.value,pageId:id,query:"view=ADMIN"});}
  catch(e){if(![403,404].includes(e.status))throw e;result=await bridge.request({blogId:view.blog.value,pageId:id,query:"view=AUTHOR"});}
  if(result.kind&&result.kind!=="blogger#page")throw Error("Nem statikus Blogger-oldal érkezett.");
  if(!result.id||typeof result.content!=="string")throw Error("A Blogger nem küldte vissza a teljes HTML-forrást.");
  return result;
}
function abandonCheck(){
  return !dirty()||window.confirm("A jelenlegi szerkesztésben mentetlen változtatások vannak. Biztosan eldobod őket és másik oldalt nyitsz meg?");
}
function loadHtml(html,{page=null,title="",origin="loaded"}={}){
  state.error="";state.saving=false;state.tree=core.parse(html);
  state.loaded=page?{...page,blogId:view.blog.value}:null;
  state.backup=false;view.title.value=title;
  state.baseline=page?{title,html,updated:page.updated||"",origin}:null;
  render();update();
  if(!state.tree.safe){
    state.error="Az eredeti HTML szerkezete nem értelmezhető veszteségmentesen. A teljes forrás zárolva maradt; mentsd el a biztonsági másolatot, és ne módosítsd WYSIWYG-ben.";
    update();
  }
}
async function openPage(){
  if(!abandonCheck())return;
  const id=view.page.value;if(!id)return;
  get("pageOpen").disabled=true;message("OLDAL LETÖLTÉSE…","Az eredeti Blogger HTML-t érintetlenül tároljuk.","working");
  try{
    const page=await getPage(id);
    if(page.url&&String(page.status||"").toUpperCase()==="LIVE"&&!/\/p\/[^/?#]+\.html(?:[?#]|$)/i.test(page.url))
      throw Error("Az oldal URL-je nem /p/ kezdetű, ezért biztonsági okból nem nyitjuk meg ebben a szerkesztőben.");
    loadHtml(page.content,{page,title:page.title||""});
    view.info.textContent="Blogger Page ID: "+page.id+" • "+(page.status||"")+(page.url?" • "+page.url:"");
  }catch(e){state.error=e.message;update();}
  finally{get("pageOpen").disabled=false;}
}
function backup(){
  if(!state.loaded)return;
  bridge.download("RBTools_EREDETI_"+safeName(state.loaded.title)+"_"+state.loaded.id+".html",state.baseline?.origin==="loaded"?state.baseline.html:state.loaded.originalHtml||state.baseline.html);
  state.backup=true;update();
}
function exportHtml(){
  if(!state.tree)return;
  bridge.download(safeName(view.title.value)+"_szerkesztett.html",currentHtml());
}
function showPreview(){
  const f=get("pagePreviewFrame");
  f.srcdoc="<!doctype html><html lang='hu'><head><meta charset='utf-8'><style>body{max-width:1100px;margin:24px auto;font:16px/1.6 Arial,sans-serif;padding:15px}img{max-width:100%;height:auto}</style></head><body>"+
    currentHtml()+"</body></html>";
  f.closest("details").open=true;f.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function useConverted(){
  const html=get("collectionOutput").value.trim();
  if(!html){message("NINCS KONVERTERKIMENET","Konvertálj előbb a Markdown-gyűjtőoldal-konverterrel.","working");return;}
  if(!abandonCheck())return;
  if(state.loaded&&!window.confirm("A konverterkimenet önálló HELYI oldalként nyílik meg. Nem írja felül a Blogger-oldalt és nem fogja automatikusan egyesíteni annak speciális gombjaival. Folytatod?"))return;
  loadHtml(html,{title:get("collectionTitle").value||""});
  get("pageInfo").textContent="A konverter eredménye helyileg megnyitva. Mentéshez külön nyisd meg a módosítandó meglévő oldalt.";
  view.canvas.scrollIntoView({behavior:"smooth",block:"start"});
}
function insertBlock(tag,value){
  if(!state.tree?.safe)return;
  const newNode=tag==="hr"?{kind:"raw",original:"\n<hr />\n",protected:false}:create(tag,value);
  const editor=state.active,arr=editor?.__rbPageSiblings||state.tree.nodes;
  const current=arr.indexOf(editor?.__rbPageNode);
  arr.splice(current<0?arr.length:current+1,0,newNode);
  render();update();
  const matching=Array.from(view.canvas.querySelectorAll(".collection-page-editable")).find(el=>el.__rbPageNode===newNode);
  matching?.focus();
}
function format(command){
  if(!restore()){message("JELÖLD KI A SZÖVEGET","Kattints a WYSIWYG-be, jelölj ki egy szövegrészt, és válaszd a formázást.","working");return;}
  document.execCommand(command,false,null);
  const entry=state.active;entry.__rbPageNode&&edited(entry.__rbPageNode,entry);
  selection();
}
function showLink(){
  if(!restore())return;
  const editor=state.active,range=state.savedRange;
  if(range.collapsed&&!range.startContainer.parentElement?.closest("a")){
    message("NINCS KIJELÖLT LINKSZÖVEG","Jelöld ki a szöveget, vagy állj egy meglévő hivatkozásba.","working");return;
  }
  const parent=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
  const old=parent?.closest("a");state.linkAnchor=old&&editor.contains(old)?old:null;
  const panel=get("pageLinkPanel");panel.hidden=false;
  get("pageLinkUrl").value=state.linkAnchor?.getAttribute("href")||"https://";
  get("pageLinkNewTab").checked=state.linkAnchor?state.linkAnchor.getAttribute("target")==="_blank":true;
  get("pageLinkUrl").focus();
}
function linkTarget(anchor,newTab){
  if(!anchor)return;
  if(newTab){anchor.target="_blank";const rel=new Set((anchor.getAttribute("rel")||"").split(/\s+/).filter(Boolean));rel.add("noopener");anchor.setAttribute("rel",[...rel].join(" "));}
  else{anchor.removeAttribute("target");const rel=(anchor.getAttribute("rel")||"").split(/\s+/).filter(x=>x&&x!=="noopener");if(rel.length)anchor.setAttribute("rel",rel.join(" "));else anchor.removeAttribute("rel");}
}
function applyLink(){
  let url=get("pageLinkUrl").value.trim();
  if(!/^(https?:|mailto:)/i.test(url))url="https://"+url.replace(/^\/+/,"");
  try{const p=new URL(url);if(!["https:","http:","mailto:"].includes(p.protocol))throw Error();}catch{message("ÉRVÉNYTELEN LINK","Adj meg http(s) vagy mailto hivatkozást.","error");return;}
  if(!restore())return;
  const old=state.linkAnchor,known=new Set(state.active.querySelectorAll("a"));
  if(old?.isConnected){old.setAttribute("href",url);linkTarget(old,get("pageLinkNewTab").checked);}
  else{
    const ok=document.execCommand("createLink",false,url);
    if(!ok){message("LINKELÉSI HIBA","A böngésző nem engedte a link beszúrását. Jelöld ki ismét a szöveget.","error");return;}
    let candidates=Array.from(state.active.querySelectorAll("a")).filter(a=>!known.has(a));
    if(!candidates.length)candidates=Array.from(state.active.querySelectorAll("a")).filter(a=>a.getAttribute("href")===url&&state.savedRange?.intersectsNode?.(a));
    candidates.forEach(a=>linkTarget(a,get("pageLinkNewTab").checked));
  }
  edited(state.active.__rbPageNode,state.active);get("pageLinkPanel").hidden=true;state.linkAnchor=null;
}
function originalBackUpRaw(){
  return state.loaded?.originalHtml||state.baseline?.html||"";
}
async function savePage(){
  if(!state.loaded||!dirty()||state.saving)return;
  const html=currentHtml(),title=view.title.value.trim(),audit=core.audit(state.tree,html),page=state.loaded;
  if(!title){state.error="Az oldal címét nem lehet üresen menteni.";update();return;}
  if(!state.tree.safe||!audit.ok){state.error="Az eredeti speciális HTML-kód nem maradt hiánytalanul meg.";update();return;}
  if(!state.backup){message("ELŐBB AZ EREDETI HTML BIZTONSÁGI MENTÉSE KÖVETKEZIK","Kattints az EREDETI HTML biztonsági mentése gombra. A fájl a későbbi visszaállításhoz szükséges.","dirty");return;}
  if(!bridge.isConnected()){state.error="Nincs aktív Google Blogger-kapcsolat.";update();return;}
  const live=String(page.status||"").toUpperCase()==="LIVE";
  const prompt="Blogger-statikus oldal frissítése:\n"+(page.url||page.title)+"\n\n"+
    (live?"AZ OLDAL NYILVÁNOS, A MENTÉS AZONNAL MÓDOSÍTJA AZ ÉLES /p/ OLDALT.\n\n":"")+
    "Az eredeti HTML-fájl mentése megtörtént. Az egyedi évválasztó és JavaScript-kódot megőriztük.\n\nBiztosan mentesz?";
  if(!window.confirm(prompt))return;
  state.saving=true;state.error="";update();
  const sent={html,title};
  try{
    const remote=await getPage(page.id);
    if(remote.content!==state.baseline.html||String(remote.title||"")!==state.baseline.title){
      throw Error("AZ OLDALT KÖZBEN MÁS SZERKESZTŐ MÓDOSÍTOTTA. A mentés leállt, hogy ne írd felül a munkáját. Töltsd le a saját szerkesztett HTML-t, majd nyisd meg újra az oldalt, és egyeztesd a különbségeket.");
    }
    const result=await bridge.request({blogId:page.blogId,pageId:page.id,method:"PATCH",body:{title:sent.title,content:sent.html}});
    if(String(result.id||"")!==String(page.id))throw Error("Az API nem a várt Page ID-t igazolta vissza.");
    const verified=await getPage(page.id);
    const expected=core.protectedParts(state.tree);
    const intact=expected.every(original=>verified.content.includes(original));
    if(!intact){
      state.error="A BLOGGER AZ EREDETI GOMB- VAGY JAVASCRIPT-KÓD EGY RÉSZÉT MÓDOSÍTOTTA / ELTÁVOLÍTOTTA. Azonnal ellenőrizd az élő oldalt! Az eredeti biztonsági mentés megmaradt.";
      state.baseline={title:verified.title||"",html:verified.content,updated:verified.updated||"",origin:"saved"};
      state.loaded={...page,...verified,blogId:page.blogId,originalHtml:originalBackUpRaw()};
      return;
    }
    if(verified.content!==sent.html||String(verified.title||"")!==sent.title){
      state.error="A Blogger az eredeti speciális kódot megőrizte, de a teljes HTML-t vagy címet átalakította. Ellenőrizd a szerkesztett és az élő oldalt, mielőtt újra mentesz.";
      state.baseline={title:verified.title||"",html:verified.content,updated:verified.updated||"",origin:"saved"};
      state.loaded={...page,...verified,blogId:page.blogId,originalHtml:originalBackUpRaw()};
      return;
    }
    if(page.url&&verified.url&&page.url!==verified.url){
      state.error="A mentés után megváltozott az oldal URL-je. Ellenőrizd a régi /p/ hivatkozásokat.";
    }
    state.baseline={title:verified.title||sent.title,html:verified.content,updated:verified.updated||"",origin:"saved"};
    state.loaded={...page,...verified,blogId:page.blogId,originalHtml:originalBackUpRaw()};
    view.info.textContent="Blogger Page ID: "+verified.id+" • "+verified.status+" • "+(verified.url||"");
  }catch(e){state.error=e.message||String(e);}
  finally{state.saving=false;update();}
}
get("pageConnect").addEventListener("click",()=>{
  if(!bridge.isConnected())bridge.connect();
  else refreshConnection();
  setTimeout(refreshConnection,900);
});
get("pageFetch").addEventListener("click",fetchPages);
get("pageOpen").addEventListener("click",openPage);
view.blog.addEventListener("change",()=>{state.list=[];listPages();refreshConnection();});
view.page.addEventListener("change",()=>{get("pageOpen").disabled=!view.page.value;});
get("pageUseConverted").addEventListener("click",useConverted);
get("pageBackup").addEventListener("click",backup);
get("pageDownload").addEventListener("click",exportHtml);
get("pageCopy").addEventListener("click",()=>{
  const text=currentHtml();if(!text)return;
  navigator.clipboard.writeText(text).then(()=>message("HTML A VÁGÓLAPON","A teljes oldalkód másolva, a speciális blokkokkal együtt.","idle"))
    .catch(()=>{view.raw.closest("details").open=true;view.raw.focus();view.raw.select();message("HTML KIMÁSOLÁSA","A böngésző blokkolta a vágólapot; használd a nyitott HTML-forrásmezőt.","working");});
});
get("pagePreview").addEventListener("click",showPreview);
get("pageSave").addEventListener("click",savePage);
view.title.addEventListener("input",update);
view.canvas.addEventListener("click",e=>{if(e.target.closest("a"))e.preventDefault();});
document.addEventListener("selectionchange",()=>{if(document.activeElement?.closest?.("#rbtools-pageCanvas"))selection();});
for(const btn of root.querySelectorAll("[data-page-format]")){
 btn.addEventListener("mousedown",e=>e.preventDefault());
 btn.addEventListener("click",()=>format(btn.dataset.pageFormat));
}
get("pageLink").addEventListener("mousedown",e=>e.preventDefault());
get("pageLink").addEventListener("click",showLink);
get("pageLinkApply").addEventListener("click",applyLink);
get("pageLinkCancel").addEventListener("click",()=>{get("pageLinkPanel").hidden=true;restore();});
get("pageLinkUrl").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyLink();}else if(e.key==="Escape"){e.preventDefault();get("pageLinkPanel").hidden=true;restore();}});
get("pageAddParagraph").addEventListener("click",()=>insertBlock("div","Új bekezdés."));
get("pageAddHeading").addEventListener("click",()=>insertBlock("h3","Új alcím"));
get("pageAddRule").addEventListener("click",()=>insertBlock("hr",""));
const badge=root.querySelector("#rbtools-bloggerConnectionBadge");
if(badge)new MutationObserver(refreshConnection).observe(badge,{childList:true,subtree:true});
window.addEventListener("focus",refreshConnection);
refreshConnection();render();update();
// Test-only accessor is read-only to avoid allowing external modification of original pages.
window.RBTOOLS_PAGE_EDITOR_STATUS=()=>({loadedId:state.loaded?.id||null,
  changed:dirty(),protected:state.tree?core.audit(state.tree):null,saving:state.saving});
})();
