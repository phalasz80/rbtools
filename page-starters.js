/* RBTools local starters. Never overwrite or invent the content of a real Blogger page. */
(function(root){"use strict";
const esc=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const css=[
"<style>",
"/* RBTools archive starter: same CSS class structure as the approved RegionalBahn archives. */",
".rb-nav{margin:0 0 1.6em;padding:14px 16px 13px;border:1px solid #d7d7d7;border-top:4px solid #4a4a4a;border-radius:8px;background:#f7f7f7;box-shadow:0 1px 3px #0001;font-family:inherit}",
".rb-nav .rb-nav-title{margin:0 0 8px;font-size:.88em;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#555}",
".rb-nav .rb-nav-years{display:flex;flex-wrap:wrap;gap:7px}",
".rb-nav a{display:inline-block;box-sizing:border-box;min-width:58px;padding:7px 12px;border:1px solid #c9c9c9;border-radius:999px;background:white;color:#333;font-weight:700;line-height:1.2;text-align:center;text-decoration:none}",
".rb-nav a:hover,.rb-nav a:focus-visible{border-color:#444;background:#444;color:white;text-decoration:none}",
".rb-nav .rb-nav-note{margin-top:9px;font-size:.84em;line-height:1.45;color:#666}",
".kk-filter-target,.it-filter-target{display:block;width:0;height:0;overflow:hidden;scroll-margin-top:24px}",
".kk-year,.innotrans-year-section{display:none}",
".kk-episode,.it-entry{display:flow-root;margin:0}",
".kk-episode-header,.it-entry-header{display:flex;justify-content:space-between;align-items:baseline;gap:1em;margin:0 3px;padding-bottom:3px}",
".kk-episode-title,.kk-episode-date,.it-entry-title,.it-entry-date{font-size:1.17em;font-weight:bold;margin:.21em 0 1em;line-height:1.4}",
".kk-episode-title,.it-entry-title{min-width:0;text-align:left}",
".kk-episode-title h3,.it-entry-title h3{font:inherit;margin:0;text-align:inherit}",
".kk-episode-date,.it-entry-date{flex-shrink:0;text-align:right;white-space:nowrap}",
".kk-episode-image,.it-entry-image{display:block;float:left;clear:left;margin:0 1em 1em 3px}",
".kk-episode-image img,.it-entry-image img{display:block;width:200px;height:auto;max-width:100%;border:0}",
".kk-episode-description,.it-entry-description{text-align:justify;margin:0 3px}",
".kk-year-divider{height:1px;margin:1.6em 0 0;border:0;background:#cfcfcf}",
".it-year-divider{height:10px;border:0;margin:0;background:gray;color:gray}",
"@media(max-width:600px){.rb-nav{padding:12px}.rb-nav .rb-nav-years{gap:6px}.rb-nav .rb-nav-years a{min-width:72px;flex:1 1 calc(33.333% - 6px)}.rb-nav .rb-nav-years a.rb-all{flex-basis:100%}}",
"</style>"
].join("\n");
function archive(kind,year){
 const core=root.RBTOOLS_ARCHIVE_PRESETS;if(!core)throw Error("Az archívumsablon-modul nem töltődött be.");
 const y=String(year);if(!/^(19|20)\d{2}$/.test(y))throw Error("Érvényes évszámot adj meg.");
 if(kind!=="kk"&&kind!=="it")throw Error("Ismeretlen archívumsablon.");
 const kk=kind==="kk",prefix=kk?"kozvetlen-":"innotrans-choice-",all=kk?"kozvetlen-osszes":"innotrans-osszes",
 rootId=kk?"kk-archive":"innotrans-archive",wrap=kk?"kk-sections":"innotrans-sections";
 let s=(kk?'<div style="text-align:justify">A <i>Közvetlen Kocsi</i> a RegionalBahn podcastja. Itt gyűjtjük az eddigi adásokat.</div>\n<hr align="center" />\n':"")+css+
 '<div id="'+rootId+'">\n  <span id="'+prefix+y+'" class="'+(kk?"kk-filter-target kk-year-selector":"it-filter-target")+'" aria-hidden="true"></span>\n'+
 '  <span id="'+all+'" class="'+(kk?"kk-filter-target kk-year-selector":"it-filter-target")+'" aria-hidden="true"></span>\n';
 s+=kk?'<nav id="rb-static-page-nav" class="kk-year-menu rb-nav" aria-label="Közvetlen Kocsi évválasztó">\n':
   '<div id="rb-static-page-nav"><nav id="innotrans-top" class="rb-nav" aria-label="InnoTrans évválasztó">\n';
 s+='<div class="rb-nav-title">'+(kk?"Közvetlen Kocsi":"InnoTrans")+'-archívum</div>\n'+
 '<div class="'+(kk?"kk-nav-years":"innotrans-nav-years")+' rb-nav-years">\n'+
 '<a href="#'+prefix+y+'">'+y+'</a>\n<a href="#'+all+'" class="rb-all">'+(kk?"Összes adás":"Összes év")+'</a>\n</div>\n'+
 '<div class="rb-nav-note">Válassz évet, vagy jelenítsd meg egyszerre a teljes archívumot.</div>\n</nav>'+(kk?"":"</div>")+'\n';
 s+='<div class="'+wrap+'">\n'+core.section(kind,y)+'\n</div>\n</div>';
 return core.style(s,kind,[y]);
}
function impresszum(){
 return '<!-- Helyi, üres IMPRESSZUM-SABLON. A tényleges szerkesztőségi és jogi szöveghez mindig a Bloggerben meglévő eredeti oldalt nyisd meg. -->\n'+
 '<div class="rb-impresszum" data-rb-template="impresszum">\n'+
 '<h2>Impresszum</h2><h3>RegionalBahn</h3><p>Alapítva: 2011</p><hr align="center" />\n'+
 '<div data-rb-impresszum="szerkesztoseg"><h3>Szerkesztőség</h3><p>[Ellenőrzött, aktuális névsor]</p><h3>Közvetlen Kocsi (Podcast)</h3><p>[Aktuális közreműködők]</p><h3>Elérhetőség</h3><p>[Aktuális kapcsolattartási adatok]</p></div>\n'+
 '<hr align="center" />\n<div data-rb-impresszum="bemutatkozas"><h3>Bemutatkozás</h3><p>[Jóváhagyott magyar bemutatkozó szöveg]</p><h3>Szerzői jogok</h3><p>[Jóváhagyott, ellenőrzött szerzői jogi tájékoztató]</p><h3>Moderálási irányelvek</h3><p>[Jóváhagyott moderálási szabályzat]</p></div>\n'+
 '<hr align="center" />\n<div data-rb-impresszum="de"><h3>Deutsch: Impressum</h3><h4>Redaktion</h4><p>[Geprüfte aktuelle Angaben]</p><h4>Kontakt</h4><p>[Aktuelle Kontaktdaten]</p><p>[Aktuelle freigegebene Vorstellung]</p></div>\n'+
 '<hr align="center" />\n<div data-rb-impresszum="en"><h3>English: Imprint</h3><h4>Editorial Team</h4><p>[Current verified team members]</p><h4>Contact</h4><p>[Current contact details]</p><p>[Current approved introduction]</p></div>\n</div>';
}
root.RBTOOLS_PAGE_STARTERS=Object.freeze({archive,impresszum});
})(typeof window!=="undefined"?window:globalThis);