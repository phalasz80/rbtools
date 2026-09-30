/* RBTools: structured, Blogger-compatible "percről percre" timeline; no automatic publishing. */
(function(root){"use strict";
const kinds=Object.freeze({report:"",important:"FONTOS",correction:"HELYESBÍTÉS",closing:"KÖZVETÍTÉS VÉGE"});
const h=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const validTime=s=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(s||"").trim());
function validDate(s){
 s=String(s||"").trim();if(!/^\d{4}-\d\d-\d\d$/.test(s))return false;
 const [y,m,d]=s.split("-").map(Number),x=new Date(Date.UTC(y,m-1,d));
 return x.getUTCFullYear()===y&&x.getUTCMonth()+1===m&&x.getUTCDate()===d;
}
function safeAnchor(s){
 return /^rb-live-[a-z0-9_-]{1,72}$/i.test(String(s||""))?s:"";
}
function make(uid,defaultDate="",defaultTime="",author=""){
 const n=String(uid||"").replace(/[^a-z0-9_-]/gi,"").slice(0,66)||"new";
 return {id:uid,type:"live",anchor:"rb-live-"+n,date:validDate(defaultDate)?defaultDate:"",
  time:validTime(defaultTime)?defaultTime:"",location:"",reporter:String(author||""),
  kind:"report",showDate:false,html:"Írd ide az új frissítés szövegét.",imageId:null};
}
function render(entry,{normalize=x=>h(x),imageHtml=()=>""}={}){
 const kind=Object.hasOwn(kinds,entry.kind)?entry.kind:"report",label=kinds[kind];
 const anchor=safeAnchor(entry.anchor)||safeAnchor("rb-live-"+entry.id)||"rb-live-item";
 const t=validTime(entry.time)?String(entry.time).trim():"",d=validDate(entry.date)?String(entry.date):"";
 const iso=t?(d?d+"T"+t:t):"";
 const displayed=(entry.showDate&&d?d.replace(/-/g,".")+". ":"")+(t||"IDŐPONT PÓTLANDÓ");
 const timeEl=t?'<time class="rb-live-time" datetime="'+h(iso)+'">'+h(displayed)+'</time>':
  '<span class="rb-live-time rb-live-time-missing">'+h(displayed)+'</span>';
 const badge=label?'<strong class="rb-live-kind" style="display:inline-block;margin-right:10px;font-weight:800;color:'+
  (kind==="correction"?"#9a3030":"#0b5394")+'">'+h(label)+'</strong>':"";
 const location=String(entry.location||"").trim(),reporter=String(entry.reporter||"").trim();
 const place=location?'<strong class="rb-live-location" style="font-weight:700;color:#263746">'+h(location)+'</strong>':"";
 const name=reporter?'<span class="rb-live-reporter" style="font-size:.9em;color:#475569">('+h(reporter)+')</span>':"";
 const line=[place,name].filter(Boolean).join(" ");
 const media=entry.imageId?imageHtml(entry.imageId):"";
 const showMedia=media?'<div class="rb-live-media" style="margin-top:12px">'+media+'</div>':"";
 const extra=kind==="important"?"border-left:4px solid #0b5394;padding-left:12px;":
  kind==="correction"?"border-left:4px solid #994746;padding-left:12px;":"";
 const header='<header class="rb-live-entry-head" style="display:flex;gap:6px 12px;flex-wrap:wrap;align-items:baseline;line-height:1.55;margin:0 0 9px">'+
  badge+'<strong style="color:#0b5394;font-size:1.1em">'+timeEl+'</strong>'+
  (line?'<span class="rb-live-place-credit" style="color:#263746">'+line+'</span>':"")+'</header>';
 const align=["left","center","right","justify"].includes(entry.align)?entry.align:"justify";
 const body='<div class="rb-live-copy" style="line-height:1.65;text-align:'+align+'">'+normalize(String(entry.html||""))+'</div>';
 const permalink='<div class="rb-live-permalink" style="font-size:.8em;text-align:right;margin-top:8px">'+
  '<a href="#'+h(anchor)+'" style="color:#52687b;text-decoration:none" aria-label="Közvetlen hivatkozás a(z) '+
  h(displayed)+' időpontú frissítésre">Hivatkozás erre a frissítésre #</a></div>';
 return '<article class="rb-live-entry rb-live-'+kind+'" data-rb-live="1" data-rb-live-kind="'+kind+
  '" data-rb-live-date="'+h(d)+'" data-rb-live-show-date="'+(entry.showDate?"1":"0")+
  '" id="'+h(anchor)+'" style="margin:0 0 23px;padding:16px 0 13px;border-top:1px solid #c5d0d8;'+extra+'">'+
  header+body+showMedia+permalink+'</article>';
}
function latest(blocks){
 const dated=(blocks||[]).filter(x=>x?.type==="live"&&validTime(x.time)).map(x=>({
  block:x,key:(validDate(x.date)?x.date:"0000-00-00")+"T"+x.time
 }));
 dated.sort((a,b)=>a.key.localeCompare(b.key));return dated.at(-1)?.block||null;
}
function parse(el,{uid=()=>"",imageFromElement=()=>null,captionFromNodes=()=>""}={}){
 if(!el?.matches?.(".rb-live-entry")||!el.querySelector(".rb-live-copy")||
    !el.querySelector(".rb-live-time"))return null;
 const timeEl=el.querySelector(".rb-live-time");
 const value=(timeEl?.textContent||"").match(/((?:[01]\d|2[0-3]):[0-5]\d)\s*$/)?.[1]||"";
 const stamp=timeEl?.getAttribute("datetime")||"";
 const dated=el.getAttribute("data-rb-live-date")||stamp.split("T")[0];
 const id=uid();
 const media=el.querySelector(".rb-live-media"),sep=media?.querySelector(".separator");
 const caption=sep?captionFromNodes(Array.from(media.childNodes),sep):"";
 const image=sep?imageFromElement(sep,caption):null;
 const fallbackKind=Object.keys(kinds).find(k=>el.classList?.contains?.("rb-live-"+k))||"report";
 const kind=el.getAttribute("data-rb-live-kind")||fallbackKind;
 const visualDate=/^\d{4}\.\d{2}\.\d{2}\./.test((timeEl?.textContent||"").trim());
 return {
  id,type:"live",anchor:safeAnchor(el.id)||safeAnchor("rb-live-"+id)||"rb-live-new",
  date:validDate(dated)?dated:"",time:validTime(value)?value:"",
  location:(el.querySelector(".rb-live-location")?.textContent||"").trim(),
  reporter:(el.querySelector(".rb-live-reporter")?.textContent||"").replace(/^\(|\)$/g,"").trim(),
  kind:Object.hasOwn(kinds,kind)?kind:"report",
  showDate:el.getAttribute("data-rb-live-show-date")==="1"||
     (el.getAttribute("data-rb-live-show-date")==null&&visualDate),
  html:el.querySelector(".rb-live-copy")?.innerHTML||"",imageId:image?.id||null,
  align:(el.querySelector(".rb-live-copy")?.style?.textAlign||"justify")
 };
}
root.RBTOOLS_LIVE_TIMELINE=Object.freeze({kinds,validTime,validDate,safeAnchor,make,render,latest,parse});
})(typeof window!=="undefined"?window:globalThis);