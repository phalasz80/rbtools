/* RegionalBahn Tools – published Blogger posts, protected live editing. */
(function(root){
"use strict";
const normalizeLabels=x=>(Array.isArray(x)?x:String(x||"").split(/[,;\n]/))
  .map(v=>String(v).trim()).filter(Boolean).sort((a,b)=>a.localeCompare(b,"hu"));
const equalLabels=(a,b)=>JSON.stringify(normalizeLabels(a))===JSON.stringify(normalizeLabels(b));
function postPath(input,blogUrl){
  const raw=String(input||"").trim();
  if(!raw)throw Error("Add meg a publikált cikk teljes URL-jét.");
  let url, blog;
  try{url=new URL(raw);blog=new URL(blogUrl);}catch{throw Error("Érvényes teljes cikk-URL szükséges (https://…).");}
  const host=s=>s.toLowerCase().replace(/^www\./,"");
  if(!["https:","http:"].includes(url.protocol)||host(url.hostname)!==host(blog.hostname))
    throw Error("A cikk URL-je nem a kiválasztott Blogger-bloghoz tartozik.");
  if(!/^\/\d{4}\/\d{2}\/[^/?#]+\.html$/.test(url.pathname))
    throw Error("Blogger-bejegyzés URL-jét add meg, például /2026/10/cikk.html.");
  return url.pathname;
}
function listParams(f={},pageToken=""){
  const start=String(f.start||""),end=String(f.end||"");
  if(start&&!/^\d{4}-\d{2}-\d{2}$/.test(start)||end&&!/^\d{4}-\d{2}-\d{2}$/.test(end))
    throw Error("Hibás dátumformátum.");
  if(start&&end&&start>end)throw Error("A kezdődátum nem lehet későbbi a záródátumnál.");
  const dateTime=(d,finish)=>{
    const dt=new Date(d+(finish?"T23:59:59.999":"T00:00:00"));
    if(Number.isNaN(dt.getTime())||dt.getFullYear()!==Number(d.slice(0,4))||
      dt.getMonth()+1!==Number(d.slice(5,7))||dt.getDate()!==Number(d.slice(8,10)))
      throw Error("Érvénytelen dátum.");
    return dt.toISOString();
  };
  const p=new URLSearchParams({status:"live",orderBy:f.order==="updated"?"updated":"published",
    fetchBodies:"false",fetchImages:"false",maxResults:"50",view:"ADMIN"});
  if(start)p.set("startDate",dateTime(start,false));
  if(end)p.set("endDate",dateTime(end,true));
  if(String(f.labels||"").trim())p.set("labels",String(f.labels).trim());
  if(pageToken)p.set("pageToken",pageToken);
  return p.toString();
}
function searchParams(text,order){
  const q=String(text||"").trim();
  if(!q)throw Error("Írj be keresőkifejezést.");
  return new URLSearchParams({q,fetchBodies:"false",orderBy:order==="updated"?"updated":"published"}).toString();
}
function searchLocalFilter(items,f){
  const labels=normalizeLabels(f.labels),start=f.start||"",end=f.end||"";
  return (items||[]).filter(p=>{
    if(p.status&&String(p.status).toLowerCase()!=="live")return false;
    const published=String(p.published||"").slice(0,10);
    if(start&&published<start||end&&published>end)return false;
    return !labels.length||labels.every(l=>normalizeLabels(p.labels).includes(l));
  });
}
function sameRemote(a,b){
  return !!a&&!!b&&String(a.id)===String(b.id)&&
    String(a.status||"").toLowerCase()==="live"&&
    String(a.content||"")===String(b.content||"")&&
    String(a.title||"")===String(b.title||"")&&
    equalLabels(a.labels,b.labels)&&
    String(a.updated||"")===String(b.updated||"")&&
    String(a.published||"")===String(b.published||"")&&
    String(a.url||"")===String(b.url||"");
}
function auditHtml(original,edited,compareText=false){
  const issues=[];
  if(typeof DOMParser==="undefined")return ["A HTML-szerkezet böngészős ellenőrzése nem elérhető."];
  const parse=s=>new DOMParser().parseFromString("<main id='rb-audit-root'>"+String(s||"")+"</main>","text/html")
    .getElementById("rb-audit-root");
  const a=parse(original),b=parse(edited);
  if(!a||!b)return ["Nem értelmezhető a teljes HTML."];
  const normalized=root=>String(root.textContent||"").replace(/\s+/g," ").trim();
  if(compareText&&normalized(a)!==normalized(b))
    issues.push("A WYSIWYG betöltésekor megváltozott a cikk szövege.");
  const checks=[
    ["img[src]",el=>el.getAttribute("src"),"Képforrás hiányzik"],
    ["a[href]",el=>el.getAttribute("href"),"Hivatkozás hiányzik"],
    ["script,style,table,pre,code,iframe,object,embed,svg,form,video,audio,canvas,[data-rb-live-date]",el=>el.outerHTML,"Speciális HTML-blokk megváltozott vagy hiányzik"]
  ];
  for(const [selector,value,message] of checks){
    const wanted=Array.from(a.querySelectorAll(selector),value);
    const actual=Array.from(b.querySelectorAll(selector),value);
    // Count duplicates: a repeated image or link must not silently disappear.
    const counts=new Map();
    for(const item of actual)counts.set(item,(counts.get(item)||0)+1);
    for(const item of wanted){
      const count=counts.get(item)||0;
      if(count>0)counts.set(item,count-1);else{issues.push(message+": "+String(item).slice(0,110));break;}
    }
  }
  const more=s=>(String(s||"").match(/<!--\s*more\s*-->/gi)||[]).length;
  if(more(original)>more(edited))issues.push("Eltűnt az eredeti <!--more--> jelölő.");
  return issues;
}
function backupChoiceSatisfied(downloaded,acknowledged){return !!downloaded||!!acknowledged;}
const core={postPath,listParams,searchParams,searchLocalFilter,sameRemote,equalLabels,auditHtml,backupChoiceSatisfied};
if(typeof module==="object"&&module.exports)module.exports=core;
root.RBTOOLS_PUBLISHED_CORE=core;
if(!root.document||!root.RBTOOLS_PUBLISHED_BRIDGE)return;
const bridge=root.RBTOOLS_PUBLISHED_BRIDGE,doc=root.document;
const el=id=>doc.getElementById("rbtools-"+id);
function setupPublishedUi(){
  const panel=doc.querySelector("#rbtools-tab-admin .blogger-published");
  if(!panel)throw Error("Hiányzik a publikált cikkek Cikkadmin-panelje.");
  panel.querySelector(".admin-section-head").insertAdjacentHTML("afterend",`
    <div class="published-recent" style="border:1px solid #a7bad0;border-radius:9px;padding:12px;display:flex;flex-direction:column;gap:8px">
      <strong>Legutóbb publikált 20 cikk</strong>
      <p class="small" style="margin:0">A Blogger-kapcsolódás után automatikusan frissül. A lista a megjelenés időpontja szerint csökkenő sorrendben rendezett, és nem igényli a teljes archívum beolvasását.</p>
      <div class="field">
        <label for="rbtools-publishedRecent">Válaszd ki az éles cikket</label>
        <select id="rbtools-publishedRecent" disabled>
          <option value="">Kapcsolódás után betöltődik…</option>
        </select>
      </div>
      <div class="toolbar">
        <button id="rbtools-publishedOpenRecent" class="primary" type="button" disabled>▤ Kiválasztott friss cikk megnyitása</button>
        <button id="rbtools-publishedRefreshRecent" type="button" disabled>↻ Legutóbbi 20 frissítése</button>
      </div>
      <p class="small" id="rbtools-publishedRecentStatus" role="status" aria-live="polite">Nincs Blogger-kapcsolat.</p>
    </div>
  `);
  const saveSection=el("publishedSave").closest(".published-save-section");
  saveSection.insertAdjacentHTML("afterbegin",`
    <div class="published-editor-warning" role="note" style="border:2px solid #b42332;border-radius:8px;padding:12px;background:#fff0f1;color:#7e1624;line-height:1.55">
      <strong>FONTOS SZERKESZTŐSÉGI FIGYELMEZTETÉS</strong>
      <div>Mielőtt bármelyik szerkesztő hozzányúlna egy már publikált RegionalBahn-cikkhez,
        <strong>egyeztessen Adorján Péterrel és/vagy Halász Péterrel!</strong>
        Az éles mentés azonnal megváltoztatja az olvasók által látott tartalmat.</div>
    </div>
  `);
  el("publishedSave").closest(".toolbar").insertAdjacentHTML("afterend",`
    <label class="published-risk-choice" for="rbtools-publishedRiskAck"
      style="display:flex;align-items:flex-start;gap:9px;padding:10px;border:1px solid #c28b47;border-radius:8px;cursor:pointer;line-height:1.5">
      <input id="rbtools-publishedRiskAck" type="checkbox" disabled style="margin-top:4px;flex-shrink:0">
      <span><strong>Igen, megértettem, hogy ez kockázatos.</strong>
        Tudomásul veszem, hogy az eredeti HTML biztonsági másolatának letöltését mellőzöm,
        és ezzel az eredeti állapot kézi visszaállítása nehezebbé válhat.
        A jelölés az adott éles mentésre érvényes, és nem helyettesíti az előzetes szerkesztői egyeztetést.</span>
    </label>
  `);
}
setupPublishedUi();
const state={items:[],pageTokens:[""],next:"",live:null,backup:false,saving:false,uncertain:false,
  busy:false,seq:0,mode:"list",filters:null,error:"",recent:[],recentBlog:"",recentBusy:false,recentSequence:0};
const fmt=s=>s?new Date(s).toLocaleString("hu-HU"):"";
const metadata=p=>String(p.title||"(cím nélküli)")+" · "+fmt(p.published)+" · "+String(p.id||"");
function report(msg,kind="info"){
  const node=el("publishedStatus");
  if(node){node.textContent=msg;node.dataset.state=kind;}
}
function inputs(){
  return {q:el("publishedQuery").value.trim(),start:el("publishedStart").value,
    end:el("publishedEnd").value,labels:el("publishedLabels").value.trim(),
    order:el("publishedOrder").value};
}
function reset(){
  state.seq++;state.items=[];state.pageTokens=[""];state.next="";state.live=null;
  state.backup=false;state.uncertain=false;state.saving=false;state.busy=false;state.error="";
  el("publishedRiskAck").checked=false;
  el("publishedSource").value="";el("publishedEdited").value="";
  el("publishedUrl").value="";el("publishedBackupInfo").textContent="";
  renderItems();sync();report("Csatlakozás után szűrj a megjelent cikkek között.");
}
function renderItems(){
  const select=el("publishedResults");select.textContent="";
  const blank=doc.createElement("option");blank.value="";blank.textContent=state.items.length?"Válassz cikket a találatok közül…":"Nincs találat";select.appendChild(blank);
  for(const p of state.items){
    const opt=doc.createElement("option");opt.value=String(p.id);opt.textContent=metadata(p);
    select.appendChild(opt);
  }
  el("publishedCount").textContent=state.items.length+" találat ezen az oldalon"+
    (state.mode==="list"?" · "+state.pageTokens.length+". oldal":"");
  sync();
}
function renderRecent(){
  const select=el("publishedRecent"),previous=select.value;select.textContent="";
  const option=doc.createElement("option");
  option.value="";
  option.textContent=state.recent.length?"Válassz a 20 legfrissebb cikk közül…":"Nincsenek betöltött publikált cikkek";
  select.appendChild(option);
  for(const p of state.recent){
    const item=doc.createElement("option");
    item.value=String(p.id);item.textContent=metadata(p);
    select.appendChild(item);
  }
  if(state.recent.some(p=>String(p.id)===previous))select.value=previous;
}
async function loadRecent(blogId){
  if(!blogId||!bridge.connected()||state.recentBusy)return;
  const run=++state.recentSequence;
  state.recentBusy=true;
  el("publishedRecentStatus").textContent="A 20 legutóbbi publikált cikk lekérése…";
  sync();
  try{
    const query=new URLSearchParams(listParams({order:"published"}));
    query.set("maxResults","20");
    let data;
    try{data=await bridge.request({blogId,route:"list",query:query.toString()});}
    catch(e){
      if(e.status!==403)throw e;
      query.set("view","AUTHOR");
      data=await bridge.request({blogId,route:"list",query:query.toString()});
    }
    if(run!==state.recentSequence||blogId!==bridge.blogId())return;
    state.recent=(data.items||[]).filter(p=>!p.status||String(p.status).toLowerCase()==="live").slice(0,20);
    renderRecent();
    el("publishedRecentStatus").textContent=state.recent.length+
      " legutóbb publikált cikk betöltve. Válassz ki egyet a legördülő listából.";
  }catch(e){
    if(run===state.recentSequence)
      el("publishedRecentStatus").textContent="Nem sikerült a friss cikkek lekérése: "+e.message;
  }finally{
    if(run===state.recentSequence){state.recentBusy=false;sync();}
  }
}
function refreshRecent(){
  if(!bridge.connected()||!bridge.blogId()||state.recentBusy)return;
  return loadRecent(bridge.blogId());
}
function sync(){
  const connected=bridge.connected()&&!!bridge.blogId();
  const blog=connected?String(bridge.blogId()):"";
  if(blog!==state.recentBlog){
    state.recentBlog=blog;state.recent=[];state.recentSequence++;
    renderRecent();
    el("publishedRecentStatus").textContent=blog?"Legfrissebb cikkek betöltése…":"Nincs Blogger-kapcsolat.";
    if(blog)Promise.resolve().then(()=>{if(state.recentBlog===blog)loadRecent(blog);});
  }
  el("publishedRecent").disabled=!connected||state.recentBusy||!state.recent.length||state.saving||state.busy;
  el("publishedOpenRecent").disabled=!connected||state.recentBusy||state.saving||state.busy||!el("publishedRecent").value;
  el("publishedRefreshRecent").disabled=!connected||state.recentBusy||state.saving||state.busy;
  for(const id of ["publishedSearch","publishedUrlOpen","publishedResults","publishedOpen","publishedPrev","publishedNext"]){
    const n=el(id);if(n)n.disabled=!connected||state.busy||state.saving;
  }
  el("publishedOpen").disabled=!connected||state.busy||state.saving||!el("publishedResults").value;
  el("publishedPrev").disabled=!connected||state.busy||state.saving||state.mode!=="list"||state.pageTokens.length<=1;
  el("publishedNext").disabled=!connected||state.busy||state.saving||state.mode!=="list"||!state.next;
  const isCurrent=state.live&&String(bridge.currentPostId())===String(state.live.source.id)&&
    String(bridge.blogId())===String(state.live.blogId);
  const dirty=isCurrent&&!bridge.sameEditor(state.live.editor,bridge.snapshot());
  const revert=el("bloggerRevertPost");if(revert&&isCurrent)revert.disabled=true;
  el("publishedBackup").disabled=!isCurrent||state.saving;
  el("publishedRiskAck").disabled=!isCurrent||state.saving||state.uncertain;
  el("publishedCompare").disabled=!isCurrent||state.saving;
  el("publishedSave").disabled=!isCurrent||!dirty||!backupChoiceSatisfied(state.backup,el("publishedRiskAck").checked)||state.saving||state.uncertain||
    state.live.issues.length>0||!connected;
  const badge=el("publishedLiveState");
  if(!isCurrent){badge.textContent="Nincs éles cikk megnyitva";badge.dataset.state="idle";}
  else if(state.uncertain){badge.textContent="ELLENŐRZÉST IGÉNYEL";badge.dataset.state="danger";}
  else if(state.live.issues.length){badge.textContent="VÉDETT: csak olvasás/HTML-export";badge.dataset.state="danger";}
  else if(dirty){badge.textContent=backupChoiceSatisfied(state.backup,el("publishedRiskAck").checked)?"ÉLES MÓDOSÍTÁS · menthető":"ÉLES MÓDOSÍTÁS · mentés előtt válassz mentést vagy kockázatvállalást";badge.dataset.state="warn";}
  else{badge.textContent="PUBLIKÁLT CIKK · nincs új változás";badge.dataset.state="ok";}
}
async function requestList(token=""){
  const f=token&&state.filters?state.filters:inputs(),blogId=bridge.blogId(),seq=++state.seq;
  if(!bridge.connected()||!blogId)throw Error("Előbb kapcsolódj a Bloggerhez.");
  state.busy=true;sync();report("Publikált cikkek keresése…");
  try{
    const isSearch=!!f.q,route=isSearch?"search":"list";
    const query=isSearch?searchParams(f.q,f.order):listParams(f,token);
    const resp=await bridge.request({blogId,route,query});
    if(seq!==state.seq||blogId!==bridge.blogId())return;
    state.items=isSearch?searchLocalFilter(resp.items||[],f):(resp.items||[]).filter(p=>!p.status||String(p.status).toLowerCase()==="live");
    state.mode=isSearch?"search":"list";state.filters=f;state.next=isSearch?"":(resp.nextPageToken||"");
    renderItems();
    const warning=isSearch&&(f.start||f.end||f.labels)?
      " Szöveges keresésnél a dátum- és címkeszűrés csak a Blogger által visszaadott találatokra érvényes.":"";
    report(state.items.length+" publikált találat betöltve."+(state.next?" Van következő oldal.":"")+warning,"ok");
  }catch(e){
    if(seq===state.seq)report("Keresési hiba: "+e.message,"error");
    throw e;
  }finally{if(seq===state.seq){state.busy=false;sync();}}
}
async function search(){
  state.pageTokens=[""];state.next="";
  try{await requestList("");}catch(e){/* report already displayed */}
}
async function pageNext(){
  if(!state.next)return;
  const token=state.next;state.pageTokens.push(token);
  try{await requestList(token);}catch{state.pageTokens.pop();}
}
async function pagePrev(){
  if(state.pageTokens.length<=1)return;
  state.pageTokens.pop();
  try{await requestList(state.pageTokens.at(-1));}catch{}
}
async function getPost(blogId,postId){
  try{return await bridge.request({blogId,route:"post",postId,query:"view=ADMIN&fetchBody=true&fetchImages=true"});}
  catch(e){if(e.status!==403&&e.status!==404)throw e;
    return bridge.request({blogId,route:"post",postId,query:"view=AUTHOR&fetchBody=true&fetchImages=true"});}
}
async function openPost(postId,fromPath=false){
  if(!bridge.connected()||!bridge.blogId())throw Error("Nincs aktív Blogger-kapcsolat.");
  if(!root.confirm("SZERKESZTŐSÉGI FIGYELMEZTETÉS\n\nMielőtt bárki egy már publikált cikket módosít, egyeztessen Adorján Péterrel és/vagy Halász Péterrel!\n\nA cikk megnyitása önmagában nem módosítja a publikált tartalmat. Megnyitod?"))return;
  if(!bridge.confirmDiscard())return;
  const blogId=bridge.blogId();
  state.live=null;state.backup=false;
  el("publishedRiskAck").checked=false;
  state.busy=true;sync();report("Éles cikk letöltése és HTML-vizsgálata…");
  try{
    const post=await getPost(blogId,postId);
    if(String(post.id||"")!==String(postId))throw Error("Eltérő Blogger-bejegyzésazonosító.");
    if(String(post.status||"").toLowerCase()!=="live")throw Error("A kiválasztott bejegyzés nem publikált. A piszkozatot a Piszkozatkezelésben nyisd meg.");
    if(blogId!==bridge.blogId())throw Error("Közben másik blogot választottál.");
    bridge.loadPost(post);
    const editor=bridge.snapshot();
    const issues=auditHtml(post.content||"",editor.content||"",true);
    state.live={blogId,source:post,editor,issues};
    state.backup=false;state.uncertain=false;
    el("publishedRiskAck").checked=false;
    el("publishedBackupInfo").textContent="Éles mentés előtt töltsd le az eredeti HTML-t, VAGY jelöld be a kockázat tudatos vállalását.";
    updateComparison();sync();
    report("Megnyitva: "+post.title+(issues.length?" FIGYELEM: a HTML-import eltérést okozott, az éles mentés zárolva.":" Az eredeti cikk online marad."),issues.length?"error":"ok");
  }finally{state.busy=false;sync();}
}
async function openRecent(){
  const id=el("publishedRecent").value;if(!id)return;
  try{await openPost(id);}catch(e){report("Friss cikk megnyitási hiba: "+e.message,"error");}
}
async function openSelected(){
  const id=el("publishedResults").value;if(!id)return;
  try{await openPost(id);}catch(e){report("Megnyitási hiba: "+e.message,"error");}
}
async function openUrl(){
  try{
    const blogId=bridge.blogId(),blogUrl=bridge.blogUrl();
    if(!blogId||!bridge.connected())throw Error("Előbb kapcsolódj a Bloggerhez.");
    const path=postPath(el("publishedUrl").value,blogUrl);
    state.busy=true;sync();report("Cikk keresése a pontos URL alapján…");
    const p=await bridge.request({blogId,route:"bypath",query:new URLSearchParams({path,view:"ADMIN"}).toString()});
    state.busy=false;sync();
    if(!p.id)throw Error("A Blogger nem találta ezt a cikk-URL-t.");
    await openPost(String(p.id),true);
  }catch(e){report("URL-megnyitási hiba: "+e.message,"error");state.busy=false;sync();}
}
function updateComparison(){
  if(!state.live)return;
  const now=bridge.snapshot(),original=state.live.source;
  el("publishedSource").value=String(original.content||"");
  el("publishedEdited").value=String(now.content||"");
  const structural=auditHtml(original.content||"",now.content||"",false);
  const isDifferent=!bridge.sameEditor(now,state.live.editor);
  const note=el("publishedDiffInfo");
  note.textContent=(isDifferent?"Szerkesztett változat":"Még nincs szerkesztés")+
    " · HTML: "+String(original.content||"").length+" → "+String(now.content||"").length+" karakter"+
    (structural.length?" · FIGYELEM: "+structural.join("; "):"");
  return structural;
}
function downloadBackup(){
  if(!state.live)return;
  const original=state.live.source;
  const file="regionalbahn-live-original-"+original.id+"-"+new Date().toISOString().replace(/[:.]/g,"-")+".html";
  bridge.download(file,String(original.content||""));
  state.backup=true;
  el("publishedBackupInfo").textContent="Az eredeti HTML letöltése kezdeményezve. Mentéshez őrizd meg a fájlt.";
  sync();
}
async function saveLive(){
  const live=state.live;
  if(!live||state.saving||state.uncertain)return;
  if(!bridge.connected()||live.blogId!==bridge.blogId()||String(live.source.id)!==String(bridge.currentPostId()))
    return report("A megnyitott publikált cikk nem egyezik az aktuális Blogger-kapcsolattal.","error");
  if(live.issues.length)return report("Ez a HTML nem volt veszteségmentesen visszaolvasható: az éles mentés zárolva.","error");
  const acknowledged=!!el("publishedRiskAck").checked;
  if(!backupChoiceSatisfied(state.backup,acknowledged))return report("Éles mentés előtt töltsd le az eredeti HTML-t, VAGY jelöld be a kockázat tudatos vállalását.","error");
  const waived=!state.backup&&acknowledged;
  bridge.prepareOutput();const sent=bridge.snapshot();
  if(bridge.sameEditor(sent,live.editor))return report("Nincs új változtatás.","info");
  const problems=updateComparison();
  if(problems.length)return report("Az eredeti kép, hivatkozás vagy speciális HTML megsérült: "+problems.join("; "),"error");
  if(!sent.title.trim()||!sent.content.trim())return report("A cím és a cikk HTML-je nem lehet üres.","error");
  if(!root.confirm("ÉLES REGIONALBAHN-CIKK FRISSÍTÉSE\n\n"+
    live.source.title+"\n"+live.source.url+"\n\n"+
    "A mentés AZONNAL módosítja a nyilvános cikket.\n"+
    (waived?"KIFEJEZETTEN MELLŐZÖD az eredeti HTML biztonsági másolatának letöltését. Ez kockázatos.\n":"Az eredeti HTML letöltését választottad. Őrizd meg a fájlt.\n")+
    "A szerkesztést előzetesen egyeztetni kell Adorján Péterrel és/vagy Halász Péterrel.\n\n"+
    "Csak a cím, HTML és címkék módosulnak. Biztosan folytatod?"))return;
  state.saving=true;sync();report("Mentés előtti ütközésellenőrzés…");
  let patchAttempted=false;
  try{
    const remote=await getPost(live.blogId,live.source.id);
    if(!sameRemote(remote,live.source))throw Error("AZ ÉLES CIKK KÖZBEN MEGVÁLTOZOTT. A mentés leállt. Mentsd le a helyi HTML-t és töltsd be újra a cikket.");
    if(bridge.blogId()!==live.blogId||String(bridge.currentPostId())!==String(live.source.id))
      throw Error("Közben másik cikkre vagy blogra váltottál. A mentés leállt.");
    const payload={title:sent.title,content:sent.content,labels:normalizeLabels(sent.labels)};
    patchAttempted=true;
    const result=await bridge.request({blogId:live.blogId,route:"post",postId:live.source.id,method:"PATCH",body:payload});
    if(String(result.id||"")!==String(live.source.id))throw Error("A Blogger nem a megfelelő bejegyzésazonosítót igazolta vissza.");
    report("Blogger elfogadta a módosítást. Éles visszaolvasás és ellenőrzés…");
    const verified=await getPost(live.blogId,live.source.id);
    if(String(verified.id)!==String(live.source.id)||String(verified.status).toLowerCase()!=="live"||
      String(verified.published||"")!==String(live.source.published||"")||
      String(verified.url||"")!==String(live.source.url||"")||
      String(verified.content||"")!==String(payload.content)||
      String(verified.title||"")!==String(payload.title)||
      !equalLabels(verified.labels,payload.labels)){
      throw Error("A Blogger módosította a címet, HTML-t, címkéket, URL-t, dátumot vagy állapotot. Az éles eredményt kézzel ellenőrizni kell.");
    }
    live.source=verified;live.editor=sent;live.issues=[];
    state.backup=false;
    el("publishedRiskAck").checked=false;
    bridge.markVerified(verified,sent);
    el("publishedBackupInfo").textContent="Sikeresen frissítve. Újabb éles mentéshez ismét töltsd le az eredeti HTML-t, vagy vállald külön a kockázatot.";
    updateComparison();report("ÉLES CIKK SIKERESEN FRISSÍTVE. Eredeti URL és publikálási dátum megőrizve.","ok");
  }catch(e){
    if(patchAttempted){state.uncertain=true;report("FIGYELEM: a Blogger-frissítés megtörténhetett! "+e.message+" Nyisd meg újra a cikket, mielőtt tovább dolgozol.","error");}
    else report("A mentés elmaradt: "+e.message,"error");
  }finally{state.saving=false;sync();}
}
for(const [id,handler] of [
  ["publishedSearch",search],["publishedPrev",pagePrev],["publishedNext",pageNext],
  ["publishedOpen",openSelected],["publishedUrlOpen",openUrl],
  ["publishedBackup",downloadBackup],["publishedCompare",updateComparison],["publishedSave",saveLive],
  ["publishedOpenRecent",openRecent],["publishedRefreshRecent",refreshRecent]
]){
  const button=el(id);if(button)button.addEventListener("click",handler);
}
el("publishedResults").addEventListener("change",sync);
el("publishedRecent").addEventListener("change",sync);
el("publishedRiskAck").addEventListener("change",sync);
el("publishedUrl").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();openUrl();}});
el("publishedQuery").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();search();}});
root.RBTOOLS_PUBLISHED=Object.freeze({sync,reset,hasLive:()=>!!state.live,refreshRecent});
renderItems();sync();
})(typeof window!=="undefined"?window:globalThis);
