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
 // A közzétett forrássablon: templates/impresszum-regionalbahn.html.
 // Ez helyi szerkesztői JAVASLAT, nem automatikusan publikált jogi szöveg.
 return "<!-- RBTools: RegionalBahn Impresszum, átdolgozott JAVASLAT. Közzététel előtt ellenőrizd a neveket és a jogi részt. -->\n<style>\n#rb-impresszum{max-width:900px;margin:0 auto;color:inherit;font:inherit;line-height:1.65}\n#rb-impresszum *,#rb-impresszum *::before,#rb-impresszum *::after{box-sizing:border-box}\n#rb-impresszum .rb-imp-head{text-align:center;margin:0 0 1.6rem}\n#rb-impresszum .rb-imp-head h1{font-size:1.9em;font-weight:700;font-style:italic;margin:0 0 .1em;line-height:1.3}\n#rb-impresszum .rb-imp-founded{font-size:.85em;color:#777;margin:0}\n#rb-impresszum section{margin:1.5em 0;clear:both}\n#rb-impresszum h2{font-size:1.2em;font-weight:700;line-height:1.4;margin:1.5em 0 .65em}\n#rb-impresszum h3{font-size:1.05em;font-weight:700;line-height:1.4;margin:1.15em 0 .45em}\n#rb-impresszum p{margin:.5em 0 1em}\n#rb-impresszum .rb-imp-people{text-align:center}\n#rb-impresszum .rb-imp-people h2,#rb-impresszum .rb-imp-people h3{margin:.9em 0 .25em}\n#rb-impresszum .rb-imp-people p{margin:0 0 .9em}\n#rb-impresszum hr{border:0;border-top:1px solid #b9b9b9;height:0;margin:1.6em auto}\n#rb-impresszum .rb-imp-protection{border-left:4px solid #990000;padding:.4em .8em;color:inherit;background:rgba(153,0,0,.055)}\n#rb-impresszum .rb-imp-protection h2{color:#990000;margin-top:.2em}\n#rb-impresszum .rb-imp-language{font-size:.85em;letter-spacing:.05em;text-transform:uppercase;color:#666;margin:.4em 0}\n#rb-impresszum .rb-imp-text{text-align:justify;hyphens:auto}\n#rb-impresszum a{overflow-wrap:anywhere}\n@media(max-width:620px){#rb-impresszum .rb-imp-text{text-align:left;hyphens:none}#rb-impresszum .rb-imp-head h1{font-size:1.6em}}\n</style>\n\n<article id=\"rb-impresszum\" class=\"rb-impresszum\" data-rb-template=\"impresszum\">\n  <header class=\"rb-imp-head\">\n    <h1>RegionalBahn</h1>\n    <p class=\"rb-imp-founded\">Alapítva: 2011</p>\n  </header>\n  <hr>\n  <section lang=\"hu\" aria-label=\"Magyar nyelvű impresszum\">\n    <div class=\"rb-imp-people\">\n      <h2>Szerkesztőség</h2>\n      <p><strong>Adorján Péter, Berky Dénes, Halász Péter, Harmati Marcell, Dr. Magyarics Zoltán, Mellár Marcell, Óvári Péter</strong></p>\n      <h3>Közvetlen Kocsi (Podcast)</h3>\n      <p><strong>Adorján Péter, Berky Dénes, Halász Péter, Dr. Magyarics Zoltán, Mellár Marcell, Szundi Szabolcs, Pongrácz Dániel</strong></p>\n      <h3>Kapcsolat</h3>\n      <p><a href=\"mailto:info@regionalbahn.hu\">info@regionalbahn.hu</a></p>\n    </div>\n    <hr>\n    <div class=\"rb-imp-text\">\n      <h2>Rólunk</h2>\n      <p>A RegionalBahn független közlekedési tartalomszolgáltató oldal. Célunk, hogy pártatlanul, tényszerűen, de kritikusan számoljunk be a magyar közösségi közlekedésről, valamint az európai és esetenként a tengerentúli közlekedési eseményekről.</p>\n      <p>Fontosnak tartjuk a vasúti és a közösségi közlekedési szakmai ismeretek megosztását. Megmutatjuk olvasóinknak a vasútüzem kulisszái mögött zajló folyamatokat, és elemző írásokban mutatjuk be a közösségi közlekedés működését, műszaki megoldásait és szabályait.</p>\n      <p>Számítunk olvasóink véleményére és tapasztalataira. Lehetőségeinkhez mérten igyekszünk gyorsan reagálni a megkeresésekre és az eseményekre; ugyanezt a nyitottságot várjuk partnereinktől is.</p>\n      <p>Az oldalon megjelenő írások elsősorban a szerzőik álláspontját tükrözik. A szerkesztőség közös véleményét, illetve a véleménycikkeket külön jelöljük. A szerzőket a cikkek végén tüntetjük fel; több szerző esetén nevüket jellemzően magyar ábécérendben közöljük, nem fontossági sorrendben.</p>\n    </div>\n    <div class=\"rb-imp-protection\">\n      <h2>Szerzői jogi tájékoztatás</h2>\n      <p>Az oldalon megjelenő, szerzői jogi védelem alatt álló szövegek, fényképek, hang- és mozgóképes anyagok felhasználására a vonatkozó szerzői jogi szabályok, az egyes anyagok licencei és a jogosultaktól kapott engedélyek irányadók. Az engedélyköteles felhasználáshoz a megfelelő jogosult előzetes engedélye szükséges. A puszta forrásmegjelölés önmagában nem helyettesíti az engedélyt.</p>\n      <p>A szerzők és más jogosultak fenntartják jogaikat. Ez a tájékoztatás nem korlátozza a törvényben biztosított szabad felhasználás eseteit, így különösen a jogszerű idézést vagy az egyedi licencek alapján megengedett felhasználást.</p>\n      <p>A szerzői jogról szóló <a href=\"https://njt.hu/jogszabaly/1999-76-00-00\" target=\"_blank\" rel=\"noopener\">1999. évi LXXVI. törvény</a> 36. § (2) bekezdése szerinti körben, a napi eseményekhez kapcsolódó, időszerű gazdasági vagy politikai témájú cikkeink engedély nélküli sajtóbeli átvételével szemben ezúton tiltakozunk, amennyiben az adott cikkre e rendelkezés egyébként alkalmazható.</p>\n    </div>\n    <hr>\n    <div class=\"rb-imp-text\">\n      <h2>Moderálási irányelvek</h2>\n      <p>A hozzászólásokat a rendelkezésünkre álló felületeken előzetesen, illetve a megjelenésük után is moderálhatjuk. Eltávolíthatjuk vagy elrejthetjük különösen a jogsértő, személyeskedő, az adott témához nem kapcsolódó, zaklató vagy kéretlen reklámot tartalmazó hozzászólásokat.</p>\n      <p>A szerkesztőség fenntartja a jogot arra, hogy a hozzászólási lehetőséget egyes tartalmaknál vagy az egész oldalon korlátozza vagy megszüntesse, a szolgáltató által biztosított technikai lehetőségek keretében.</p>\n      <p>Az olvasói hozzászólások nem feltétlenül tükrözik a szerkesztőség álláspontját. A szerkesztőség nevében kizárólag a kifejezetten így megjelölt közlések tekinthetők hivatalos állásfoglalásnak.</p>\n      <p>Kérjük olvasóinkat, hogy hozzászólásaikban tartsák tiszteletben a többi résztvevőt és a fenti irányelveket.</p>\n    </div>\n  </section>\n  <hr>\n  <section lang=\"de\" aria-label=\"Deutsches Impressum\">\n    <p class=\"rb-imp-language\">Deutsch</p>\n    <div class=\"rb-imp-text\">\n      <h2>Über RegionalBahn</h2>\n      <p>RegionalBahn ist ein unabhängiges Portal für Verkehrsthemen. Wir berichten sachlich, unparteiisch und kritisch über den öffentlichen Verkehr in Ungarn sowie über Entwicklungen in Europa und gelegentlich auch außerhalb Europas.</p>\n      <p>Wir möchten Fachwissen über Eisenbahnen und den öffentlichen Verkehr vermitteln, Einblicke in den Bahnbetrieb ermöglichen und technische Lösungen sowie betriebliche Regelwerke verständlich erklären.</p>\n    </div>\n    <div class=\"rb-imp-people\">\n      <h3>Redaktion</h3>\n      <p><strong>Péter Adorján, Dénes Berky, Péter Halász, Marcell Harmati, Dr. Zoltán Magyarics, Marcell Mellár, Péter Óvári</strong></p>\n      <h3>Közvetlen Kocsi (unser Podcast)</h3>\n      <p><strong>Péter Adorján, Dénes Berky, Péter Halász, Dr. Zoltán Magyarics, Marcell Mellár, Szabolcs Szundi, Dániel Pongrácz</strong></p>\n      <h3>Kontakt</h3>\n      <p><a href=\"mailto:info@regionalbahn.hu\">info@regionalbahn.hu</a></p>\n    </div>\n    <div class=\"rb-imp-text\">\n      <h3>Urheberrecht und Kommentare</h3>\n      <p>Für die Nutzung urheberrechtlich geschützter Inhalte gelten das anwendbare Recht, die jeweiligen Lizenzen und die Genehmigungen der Rechteinhaber. Gesetzliche Ausnahmen bleiben unberührt. Leserkommentare können nach den oben genannten, auf Ungarisch veröffentlichten Moderationsgrundsätzen moderiert werden.</p>\n    </div>\n  </section>\n  <hr>\n  <section lang=\"en\" aria-label=\"English imprint\">\n    <p class=\"rb-imp-language\">English</p>\n    <div class=\"rb-imp-text\">\n      <h2>About RegionalBahn</h2>\n      <p>RegionalBahn is an independent transport news and analysis website. We aim to report impartially, accurately and critically on public transport in Hungary, as well as on developments elsewhere in Europe and occasionally beyond.</p>\n      <p>We share professional knowledge about railways and public transport, offer readers insights into railway operations, and explain technical solutions and operating rules.</p>\n    </div>\n    <div class=\"rb-imp-people\">\n      <h3>Editorial team</h3>\n      <p><strong>Péter Adorján, Dénes Berky, Péter Halász, Marcell Harmati, Dr. Zoltán Magyarics, Marcell Mellár, Péter Óvári</strong></p>\n      <h3>Közvetlen Kocsi (our podcast)</h3>\n      <p><strong>Péter Adorján, Dénes Berky, Péter Halász, Dr. Zoltán Magyarics, Marcell Mellár, Szabolcs Szundi, Dániel Pongrácz</strong></p>\n      <h3>Contact</h3>\n      <p><a href=\"mailto:info@regionalbahn.hu\">info@regionalbahn.hu</a></p>\n    </div>\n    <div class=\"rb-imp-text\">\n      <h3>Copyright and comments</h3>\n      <p>Use of copyright-protected material is governed by applicable law, the relevant licences and permissions from rights holders. Statutory exceptions remain unaffected. Comments may be moderated in accordance with the Hungarian-language guidelines above.</p>\n    </div>\n  </section>\n</article>";
}


const catalog=Object.freeze({
 impresszum:{slug:"impresszum.html",title:"Impresszum"},
 braking:{slug:"vasuti-fekezes.html",title:"Vasúti fékezés"},
 zusi:{slug:"magyar-zusi-letoltesek.html",title:"Magyar Zusi kiegészítők"},
 plain:{slug:"",title:"Üres szöveges oldal"}
});
function braking(){
 return `<article class="rb-text-page" data-rb-template="braking" lang="hu">
 <header><h1>Vasúti fékezés</h1><p>Új, üres vázlat: a már megjelent részek hiteles címét és hivatkozását az eredeti Blogger-gyűjtőoldalból kell beolvasni.</p></header>
 <nav aria-label="Sorozat tartalomjegyzéke"><a href="#rb-fek-kulon">Különkiadások</a> · <a href="#rb-fek-sorozat">Sorozatunk darabjai</a> · <a href="#rb-fek-rhb">Így fékez a Rhätische Bahn</a></nav>
 <section id="rb-fek-kulon"><h2>Különkiadások</h2><ul><li>[Az ellenőrzött különkiadás címe és cikk-URL-je]</li></ul></section>
 <section id="rb-fek-sorozat"><h2>Sorozatunk darabjai</h2><ol><li>[Az ellenőrzött fejezet címe és cikk-URL-je]</li></ol></section>
 <section id="rb-fek-rhb"><h2>Így fékez a Rhätische Bahn</h2><ol><li>[Ellenőrzött külön sorozatrész és cikk-URL]</li></ol></section>
 </article>`;
}
function zusi(){
 return `<article class="rb-text-page" data-rb-template="zusi" lang="hu">
 <header><h1>Magyar Zusi kiegészítők</h1><p>Üres letöltési vázlat. Az aktuális állománynevek, URL-ek és licencek kizárólag az eredeti oldalból vehetők át.</p></header>
 <nav aria-label="Letöltések tartalma"><a href="#rb-zusi-downloads">Letöltések</a> · <a href="#rb-zusi-help">Telepítés és tudnivalók</a></nav>
 <section id="rb-zusi-downloads"><h2>Letöltések</h2><p>[Ellenőrzött csomagnév, aktuális letöltési URL és változat]</p></section>
 <section id="rb-zusi-help"><h2>Telepítés és tudnivalók</h2><p>[Verzió, függőségek, licencek, telepítési információk]</p></section>
 </article>`;
}
function plain(){
 return `<article class="rb-text-page" data-rb-template="plain" lang="hu"><h1>Új szöveges oldal</h1><section><h2>Bevezetés</h2><p>Ide írhatod a szöveget.</p></section></article>`;
}
root.RBTOOLS_PAGE_STARTERS=Object.freeze({archive,impresszum,braking,zusi,plain,catalog});
})(typeof window!=="undefined"?window:globalThis);