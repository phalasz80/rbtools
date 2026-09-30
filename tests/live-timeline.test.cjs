"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.join(__dirname,"..");
const ctx={globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"live-timeline.js"),"utf8"),ctx);
const live=ctx.RBTOOLS_LIVE_TIMELINE;
assert.ok(live,"Live-timeline module must export to global");
assert.equal(live.validTime("00:00"),true);
assert.equal(live.validTime("23:59"),true);
for(const t of ["24:00","09:60","9:00","25:99","09:05\n<script>"])
 assert.equal(live.validTime(t),false,"Invalid time: "+t);
assert.equal(live.validDate("2028-02-29"),true);
for(const d of ["2026-02-29","2026-02-30","2026-13-10","2026-00-01","2026/09/30"])
 assert.equal(live.validDate(d),false,"Invalid date: "+d);
const base=live.make("b-101","2026-09-30","05:20","Mellár Marcell");
base.location="Praha hlavní nádraží";
base.html="Az első RegioJet-vonat indulásra kész.";
assert.equal(base.anchor,"rb-live-b-101");
const html=live.render(base,{normalize:x=>x});
assert.ok(html.startsWith('<article class="rb-live-entry'),"Semantic section for individual update");
assert.ok(html.includes('datetime="2026-09-30T05:20"'));
assert.ok(html.includes('id="rb-live-b-101"'));
assert.ok(html.includes('Praha hlavní nádraží'));
assert.ok(html.includes("(Mellár Marcell)"));
assert.ok(html.includes("font-size:1.1em"));
assert.ok(!html.includes("monospace"));
assert.ok(html.includes('href="#rb-live-b-101"'),"Each update should have an anchored deep link");
const changed={...base,kind:"correction",showDate:true,location:'Budapest & "<vizsgálat>"',
 reporter:'Dr. Magyarics Zoltán <admin>',imageId:"photo-one"};
const newer=live.render(changed,{normalize:x=>x,imageHtml:id=>'<div class="separator" id="'+id+'">Photo</div>'});
assert.ok(newer.includes('rb-live-correction'));
assert.ok(newer.includes('2026.09.30. 05:20'));
assert.ok(newer.includes('HELYESBÍTÉS'));
assert.ok(newer.includes('Budapest &amp; &quot;&lt;vizsgálat&gt;&quot;'));
assert.ok(newer.includes('&lt;admin&gt;'),"Reporter text must be attribute/text escaped");
assert.ok(newer.includes('class="rb-live-media"'));
const blank=live.make("b-12","2026-09-30");
const draft=live.render(blank,{normalize:x=>x});
assert.ok(draft.includes("IDŐPONT PÓTLANDÓ"),"Never silently claim a time for an unwritten update");
assert.ok(!draft.includes("datetime="),"No invalid timestamp attribute");
assert.equal(live.latest([blank,base]),base);
const after=live.make("b-102","2026-09-30","22:00","Halász Péter");
assert.equal(live.latest([after,base]),after,"Chronological index independent of display order");
const nextDay=live.make("b-103","2026-10-01","01:00");
assert.equal(live.latest([after,nextDay]),nextDay,"Multi-day sorting is date and time aware");
function fakeEntry(entry){
 const localHtml=live.render(entry,{normalize:x=>x});
 const stamp=entry.showDate&&entry.date?entry.date.replace(/-/g,".")+". "+entry.time:entry.time;
 const node=(value,attrs={},innerHTML="",style={})=>({textContent:value,innerHTML,style,
  getAttribute:key=>attrs[key]??null});
 const selector={
  ".rb-live-time":node(stamp,{"datetime":entry.date+"T"+entry.time}),
  ".rb-live-location":node(entry.location),
  ".rb-live-reporter":node("("+entry.reporter+")"),
  ".rb-live-copy":node(entry.html,{},entry.html,{textAlign:"justify"}),
  ".rb-live-media":null
 };
 return {id:entry.anchor,matches:q=>q===".rb-live-entry",
  classList:{contains:cls=>cls==="rb-live-entry"||cls==="rb-live-"+entry.kind},
  getAttribute:n=>({
   "data-rb-live-kind":entry.kind,
   "data-rb-live-date":entry.date,
   "data-rb-live-show-date":entry.showDate?"1":"0"
  })[n]??null,querySelector:q=>selector[q]??null,source:localHtml};
}
const restored=live.parse(fakeEntry({...changed,imageId:null}),{uid:()=> "new-id"});
assert.equal(restored.id,"new-id");
assert.equal(restored.anchor,changed.anchor);
assert.equal(restored.time,changed.time);
assert.equal(restored.date,changed.date);
assert.equal(restored.location,changed.location);
assert.equal(restored.reporter,changed.reporter);
assert.equal(restored.kind,"correction");
assert.equal(restored.showDate,true);
assert.equal(restored.html,changed.html);
const withoutData=fakeEntry({...changed,imageId:null});
withoutData.getAttribute=()=>null;
const fallback=live.parse(withoutData,{uid:()=>"reload-1"});
assert.equal(fallback.kind,"correction","Type survives when Blogger removes data-attributes");
assert.equal(fallback.showDate,true,"Date visibility survives from actual time text");
const unknown=live.parse(fakeEntry({...changed,kind:"<script>"}),{uid:()=> "new-id"});
assert.equal(unknown.kind,"report","Untrusted update kind must default to a supported one");
const ui=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const id of ["adminLiveControls","adminAddLive","adminLiveAddToolbar","adminLiveDate","adminLiveOrder","adminLiveValidation"])
 assert.equal((ui.match(new RegExp('id="rbtools-'+id+'"',"g"))||[]).length,1,id+" missing/duplicate");
for(const call of [
 "LIVE_TIMELINE.render(b","adminLiveElement(block)","function adminAddLiveUpdate()",
 "LIVE_TIMELINE.parse(element","incomingLive","rb-live-navigation",
 "adminContentTypeChanged(false)","rbGet(\"adminLiveValidation\").textContent"])
 assert.ok(ui.includes(call),"Missing export/editor/import workflow: "+call);
assert.ok(ui.includes('<option value="live">Percről percre / élő tudósítás</option>'));
assert.ok(ui.includes("14/B. Percről percre"));
assert.ok(ui.includes("Percről percre:</strong>"));
console.log("RBTools live: dates, chronology, reporter/location, correction, rich copy, deep link, parse and editor wiring PASS");
