# RegionalBahn Tools

A RegionalBahn belső szerkesztői eszköze: **https://tools.regionalbahn.hu**

## Gyorstalpaló

### Új cikk közvetlenül az RBToolsban

1. Nyisd meg a **Cikkadmin** fület, és kattints az **Új cikk** gombra.
2. A **Cikk címe** külön, Blogger-szerű mező, itt add meg a címet. A **Főkép + valódi lead** bekeretezett WYSIWYG-blokkban válaszd a borítóképet és írd mellé a felvezetőt. A `<!--more-->` mindig ez után kerül. A törzs H2–H5 alcímeket használhat.
3. Használd a formázógombokat, alcímeket, képeket és drag-and-drop rendezést. Keretes beszúrásakor a gomb melletti választóval dönthetsz a klasszikus vagy a bal oldali hangsúlyos sávval ellátott szürke változatról.
4. Blogger-kapcsolat esetén a **Mentés Blogger-piszkozatba** gomb új draftot hoz létre.
5. Kép nélküli cikkhez a Blogger felületét egyáltalán nem kell megnyitni a szerkesztés alatt.

### Új cikk képekkel

Mivel a Blogger API-nak nincs dokumentált önálló képfeltöltési művelete:

1. Bloggerben készíts egy új piszkozatot.
2. Töltsd fel az összes szükséges képet a Blogger saját képfeltöltőjével.
3. RBToolsban kapcsolódj a Bloggerhez, frissítsd a piszkozatlistát, és nyisd meg a draftot.
4. Az RBTools a draft HTML-jéből automatikusan beolvassa a már feltöltött képeket a képtárba.
5. A további szerkesztés, többsoros képaláírás, opcionális fotósor, sorrend, keretesek és formázás az RBToolsban történik. A képtár kártyáján Enterrel, a WYSIWYG-ben Enterrel vagy a **↵ Sortörés** gombbal hozható létre új sor.
6. A **Mentés Blogger-piszkozatba** ugyanazt a draftot frissíti.

### Meglévő Blogger-piszkozat szerkesztése

1. **Kapcsolódás a Bloggerhez**.
2. Válaszd ki a megfelelő blogot.
3. Frissítsd a piszkozatlistát, keress rá a címre, majd válaszd a **Piszkozat megnyitása** gombot.
4. Az RBTools betölti a címet, HTML-t, címkéket és a cikkben szereplő képeket. Minden Blogger-cikkművelet a **Piszkozatkezelés** egyetlen, színkódolt gombcsoportjában található.
5. Szerkesztés után a **Mentés Blogger-piszkozatba** az eredeti post ID-t frissíti, nem készít másolatot.

## Percről percre: 2020-as RegionalBahn-minta modernizálva

A **Cikkadmin → Tartalomtípus → Percről percre / élő tudósítás → Sablon betöltése** művelet a [2020-as RegioJet-premier](https://www.regionalbahn.hu/2020/07/regiojet-premier.html) szerkesztési logikájára épülő, újratölthető mintát készít. A 2018-as Budapest–Berlin útibeszámoló helyszínről helyszínre épülő történetvezetése, a 2016-os Westbahn InterCity-búcsú személyes élő beszámolója és a 2013-as forradalmi havazás legújabbat felül megjelenítő sorrendje is ihlette.

**Használat:** először írd meg a címet, a valódi leadet és az opcionális főképet. A sablon egy kezdeti WYSIWYG-bejegyzést és szerkeszthető nyitó-, illetve záróbekezdést hoz létre. Az **Időbélyeges frissítés** gombnál alapdátum és beszúrási mód választható: normál, növekvő időrend (új frissítés alul), illetve a 2013-as változat szerinti fordított sorrend (új frissítés felül). Ez kizárólag a **következő új bejegyzés helyét** érinti, a már felvitt eseményeket soha nem rendezi át automatikusan. A blokkok kézzel, a szokásos ↑/↓/⠿ vezérlőkkel is mozgathatók.

Minden egyes frissítéshez külön **dátum, 24 órás időpont, helyszín/vonalszakasz, tudósító, eseménytípus (normál, fontos, helyesbítés vagy lezárás), rich-text szöveg és opcionális képtári kép** adható meg. Többnapos közvetítésnél a dátum megjelenítése blokkonként bekapcsolható. A normál Blogger-képsablon őrzi a képaláírást, a fotóst és az ALT-adatokat. A frissítések saját **változatlan mélyhivatkozást** kapnak, a címadó bevezető alatt pedig megjelenik egy ugrólink az időadatok alapján legfrissebb bejegyzéshez. Nincs külön JavaScript az olvasói oldalon, nincs fix szélességű betű, az egyes frissítések inline stílusai önmagukban működnek.

**Mentési szabályok:** az időbélyeg nélküli mintabejegyzést a rendszer feltűnően jelzi, de a piszkozatmentést nem tiltja. Ez nem automatikus élő közvetítési szolgáltatás: az RBTools továbbra is csak Blogger-piszkozatot ment, a publikálást és az éles oldal további frissítéseit a jogosult szerkesztő intézi a Bloggerben. A saját `rb-live-entry` HTML-jelöléssel tárolt bejegyzések a későbbi visszaolvasáskor ismét külön szerkeszthető, állandó hivatkozású blokkokra bomlanak. A régiek, eltérő HTML-szerkezetű közvetítések nem alakulnak át automatikusan.

A sablon működését a `live-timeline.js` önálló modul tartja karban. Regressziós tesztje: `tests/live-timeline.test.cjs`. A vizuális és a Blogger API-végponttal végzett próbamentés ettől függetlenül szükséges az első éles használat előtt.

## Blogger-integráció

Az RBTools a Blogger API v3-at és a Google Identity Services böngészős OAuth tokenmodelljét használja.

Egyszeri Google Cloud-beállítás szükséges:

1. Hozz létre vagy válassz ki egy Google Cloud projektet.
2. Engedélyezd a **Blogger API v3** szolgáltatást.
3. Állítsd be az OAuth consent screen / Google Auth Platform beállításait.
4. Hozz létre **Web application** típusú OAuth Client ID-t.
5. Authorized JavaScript originként add meg:
   `https://tools.regionalbahn.hu`
6. A kapott `*.apps.googleusercontent.com` Client ID-t add meg az RBTools Blogger-kapcsolat paneljén. A böngésző helyben meg tudja jegyezni.

**Client secretet soha ne írj az RBToolsba.** A böngészős integrációhoz nincs rá szükség.

Az access token csak az aktuális böngészőmunkamenetben marad meg, oldalfrissítés után újra kell kapcsolódni.

## Mit tud biztosan a Blogger API-val?

- új bejegyzés létrehozása piszkozatként;
- meglévő piszkozatok listázása és keresése;
- piszkozat megnyitása;
- cím, HTML-tartalom és címkék módosítása;
- meglévő draft frissítése ugyanazon post ID-val;
- időzített publikálás megadott időpontra;
- időzített vagy élő bejegyzés visszaállítása piszkozatba.

Az RBTools **nem kínál azonnali Publish gombot**. A közvetlen publikálás szándékosan a Blogger felületén marad.

Az **egyéni permalink** nincs dokumentáltan írható Blogger API-mezőként, ezért azt továbbra is a Blogger bejegyzésbeállításainál kell megadni.

## WYSIWYG szerkesztő

A Cikkadminban külön tartalomtípus választható: **Cikk**, **#nyúz / Hétvégi gyors**, **Podcast shownotes**, **InnoTrans cikk** és **Statikus oldal**. Mindegyikhez szerkeszthető induló sablon tartozik. A statikus oldalhoz évválasztó gombsoros (opcionális „Összes” gombbal) és egyszerű, ömlesztett sablon is választható.

- közvetlen új cikkírás;
- félkövér, dőlt, aláhúzott, áthúzott és link formázás;
- bekezdések és alcímek;
- RegionalBahn keretes blokkok;
- bekezdés-, alcím-, keretes- és iframe-blokkok balra, középre, jobbra vagy sorkizártra igazítása;
- iframe embedek beszúrása, meglévő iframe-ek visszaolvasása, élő előnézete és több soros kódszerkesztése;
- rendezetlen és számozott listák, valamint lista-behúzás és -kihúzás;
- Unicode- és emoji-beszúró, HTML-entitás paletta (kiemelt `&nbsp;` jelöléssel), HTML `<sup>`/`<sub>` formázás és Unicode felső/alsó index számok;
- WYSIWYG szövegkereső sárga találatkiemeléssel;
- Blogger-szerű, különálló címmező, amely nem kerül automatikusan a törzsszövegbe vagy a leadbe;
- közös, jól elkülönített főkép + valódi lead blokk, amely mögé az egyetlen `<!--more-->` kerül;
- régi hibás főkép/lead duplázások felismerése és javítása meglévő draft beolvasásakor;
- H2–H5 szintű alcímek közvetlen választása a WYSIWYG eszköztárán;
- képtár és főkép;
- képek húzása konkrét bekezdések közé;
- kép húzása keretes blokkba;
- többsoros képaláírás és külön kezelhető kép-<code>title</code>-kredit;
- opcionális, képaláírás utáni **(fotó: Név)** külön sor, a HTML-ben `<br />` elválasztással;
- **akadálymentes kép-alt:** a képaláírás szövege a fotós vagy a forrás nevével együtt automatikusan bekerül az `img alt` attribútumába, a kettő között pontosan ` +++ ` szerepel;
- a látható, többsoros képaláírásban valódi `<br />` jelöli a sortöréseket, az `alt` viszont tisztán szöveges: a képernyőolvasók számára az új sorokat `; ` választja el, nem HTML-tag;
- **a főkép alatt nem jelenik meg képaláírás**: a szerkesztő képaláírás-mezőjének tartalma és a kredit csak az `alt` attribútumban szerepel; a haladó konverter főképéhez külön, csak `alt`-ba kerülő leírásmező is tartozik, amely `RB:MAIN_IMAGE caption="..."` jelöléssel is feltölthető;
- ha nincs ismert fotós vagy forrás, az RBTools nem talál ki nevet az `alt` számára. A képtári és főkép-szerkesztőben ezért ténylegesen leíró képaláírást érdemes adni minden tartalmi képhez;
- a képtári kártya szövegmezői kijelölhetők, mert a képek már kizárólag a miniatűrnél fogva húzhatók;
- egérrel vagy billentyűzettel szabad szövegkijelölés és kiválasztott rész formázása;
- hivatkozások beszúrása/szerkesztése külön, nem modális URL-szerkesztővel (Ctrl+K / ⌘K);
- a WYSIWYG szövegformázó eszköztár **közvetlenül a szerkeszthető cikkfelület fölött**, görgetéskor is elérhető; a keresés, karakterpaletta és iframe-eszközök a cikkszöveg alatt kaptak helyet;
- kijelölt szövegen jobb kattintással **helyi menü** nyílik (félkövér, dőlt, aláhúzott, áthúzott, link, másolás); a **Shift + jobb kattintás** meghagyja a böngésző saját menüjét;
- új hivatkozásoknál alapértelmezett az **új ablakban/lapon megnyitás** (`target="_blank" rel="noopener"`), de az URL-panel jelölőnégyzetével azonos lap is választható; korábban létrehozott link szerkesztésekor a meglévő célbeállításból indulunk;
- blokkok drag-and-drop rendezése kizárólag a jobb oldali ⠿ fogantyúnál, hogy a szöveg kijelölhető maradjon;
- meglévő RegionalBahn Blogger HTML visszatöltése szerkesztésre;
- haladó forráskonverzió a Cikkadminon belül: Markdown/plain text/DOCX/ODT/RTF/Google Dokumentum, profilok, presetek, RB-jelölések, közvetlen HTML-kimenet és előnézet;
- a haladó konverter kimenetének visszatöltése a WYSIWYG Cikkadminba;
- folyamatosan generált végleges Blogger HTML;
- széles, színkódolt állapotsáv a betöltési, mentési, siker-, figyelmeztetési és hibaállapotokhoz.

## Gyűjtőoldalak és meglévő statikus `/p/` oldalak

A **Gyűjtőoldalak** fül önálló, blokkos **WYSIWYG-szerkesztőt** kapott a régi Markdown-konverter megtartásával (utóbbi lenyitható). A Cikkadmin meglévő OAuth-kapcsolatát használva az **oldallista lekérése → oldal megnyitása** művelet a Blogger **Pages API** list/get végpontjait hívja meg. A szerkesztő elkülönítve mutatja a vizuálisan szerkeszthető bekezdéseket, címsorokat és képaláírásokat az **érinthetetlenül megőrzött** navigációs gomboktól, JavaScripttől, CSS-től és speciális HTML-től. Évblokk-keretek eredeti attribútumai is megmaradnak. Szerkesztés nélkül az eredeti HTML **bájtról bájtra ugyanaz** marad a helyi exportban.

Az új blokkos szerkesztőben formázás, linkelés (alapértelmezett új lap, kikapcsolható), **Firefoxban is kezelt jobb kattintásos helyi menü** (Shift + jobb kattintás: böngészőmenü), bekezdés/alcím/elválasztó beszúrás, előnézet, teljes HTML másolása/letöltése és az **eredeti HTML ajánlott, de opcionális biztonsági másolata** érhető el. A Közvetlen Kocsi és az InnoTrans két **jóváhagyott, táblázatmentes HTML-sablonja** automatikusan felismerhető; a felső gyorsgombsoron közvetlenül készíthető **új év**, **új podcast-adás**, illetve **új InnoTrans-cikk**. Az új év művelet egyszerre készíti el a navigációs gombot, az évblokkot és a hozzá szükséges CSS-only évválasztó szabályokat, beleértve az „Összes adás / Összes év” lehetőség megőrzését. Az új bejegyzés adatlapja a régi kétoszlopos vizuális elrendezésnek megfelelő **bal oldali cím–jobb oldali dátum sort**, a választható 200 pixeles bélyegképet, teljes képet, ALT/kredit szöveget, ismertetőt és „Tovább »” hivatkozást állítja össze; az adatokat az adott év elejére illeszti. Az eredeti cikkek változatlanul megmaradnak. A régi Markdown-konverter HTML-jét külön gombbal átveheted, de ilyenkor **helyi, nem hozzárendelt** oldal nyílik: a konverter nem írhatja észrevétlenül felül a meglévő oldalt, és nem találhatja ki, hogyan illeszkedjen annak egyedi gombjaihoz.

A **Sablon** választóban a Közvetlen Kocsi- és InnoTrans-archívum mellett külön **Impresszum**, **Vasúti fékezés**, **Magyar Zusi** és **üres szöveges oldal** is elérhető. Az Impresszumnál, a Vasúti fékezésnél és a Zusi-oldalnál a „Friss sablon az eredeti Blogger-oldalból” művelet az aktuális `/p/` oldal teljes HTML-jét a Blogger API-ból olvassa be egy **leválasztott helyi másolatba**. Ez a kézzel módosított Impresszumnál fontos: a program nem állítja egy korábbi beépített példáról, hogy az a jelenlegi éles változat. Kapcsolat nélkül csak kifejezetten offline vázlat készül. Az Impresszumhoz külön „Új rovat” gyorsgomb tartozik. Az új minta a 2026. szeptember 30-án átadott impresszumszövegen alapul, és a `templates/impresszum-regionalbahn.html` fájllal egyezik. Az eredeti névsorok a felhasználótól származnak, ezért **közzététel előtt külön ellenőrizendők**, ahogyan a kiadói azonosító adatok és a javasolt szerzői jogi szöveg is. A jogszabályi kivételeket a figyelmeztető szöveg nem írhatja felül. A három nyelvi változatot most szemantikusan tagolt HTML és mobilon is olvasható CSS rendezi. A teljes, aktuális impresszum megtartásához a Blogger API-ból nyisd meg a meglévő /p/impresszum.html oldalt; az új rovat hozzáadása nem írja át a korábbi magyar, német vagy angol szövegeket. A két korábban elkészített, **104 adásos Közvetlen Kocsi-** és **55 cikkes InnoTrans-HTML** helyi fájlként közvetlenül importálható. Az új helyi sablon, illetve fájlimport **nem lesz automatikusan hozzárendelve az éles oldalhoz**, és soha nem ment oda saját kérés és külön megnyitás nélkül.

**Éles meglévő oldal mentése** előtt a program két utat kínál: az eredeti HTML ajánlott letöltését, **vagy** annak egyértelmű, külön jelölőnégyzettel vállalt mellőzését („NEM kérem az eredeti HTML mentését”). Alapértelmezésben nincs bejelölve a lemondás, és a program nem lép tovább addig, amíg a szerkesztő valamelyiket nem választja. Minden sikeres frissítés után újból dönteni kell. A mentéshez ettől függetlenül minden alkalommal külön megerősítés és közvetlenül az elküldés előtti szerverolvasás szükséges. Ha az oldalt egy másik szerkesztő közben módosította, a mentés leáll. A program kizárólag az eredeti **Page ID** `PATCH` műveletével, a cím és a HTML megadásával ment, majd ismét lekéri a Blogger-oldalt, és összeveti az eredményt az elküldött HTML-lel és az eredeti védett forrásrészekkel. Az eredeti `/p/` URL megváltozását külön jelzi. Következő mentéshez friss biztonsági másolat **vagy újabb kifejezett lemondás** szükséges. Nem jön létre új oldal, és nincs külön Publish gomb; **már nyilvános oldalnál a PATCH viszont azonnal módosítja az élő tartalmat**.

A régi Markdown-konverter az új WYSIWYG-felület alatt lenyitható, eredeti funkciói megmaradnak. A `tests/collection-entry.test.cjs` és a `tests/collection-context-menu.test.cjs` az évblokkon belüli beszúrást és a Firefox-szelekció megőrzését ellenőrzi.

Az eredeti script- és gombkódokat az RBTools saját WYSIWYG-je nem alakítja át, de a Blogger esetleges szerveroldali szűrését kizárólag a **mentés utáni API-ellenőrzés** tudja kimutatni. Emiatt az első éles mentés előtt különösen ajánlott az új munkafolyamatot egy tesztoldalon kipróbálni. Ha a forrás HTML szabálytalan szerkezete nem értelmezhető veszteségmentesen, a teljes forrás zárolva jelenik meg: ilyenkor előbb mentsd le, és kézi javítás nélkül ne írd felül a Blogger-oldalt. A beépített előnézet sandboxos, az oldalon lévő szkripteket biztonsági okból **nem futtatja**.

A forráskód megőrzését a `collection-page-core.js`, a két jóváhagyott archívum célzott év-/cikkműveleteit az `archive-presets.js`, az archív-, Impresszum-, fékezés-, Zusi- és üresoldal-indulókat a `page-starters.js`, a Blogger API-t és a szerkesztő felületét a `collection-pages.js` kezeli. Regressziós tesztek: `tests/archive-presets.test.cjs`, `tests/collection-page-core.test.cjs`, `tests/collection-page-save.test.cjs`.

## Keretes: két párhuzamos megjelenés és három szerkesztési mód

A régi **klasszikus szürke keretes** változatlanul támogatott és alapértelmezett. Mellette használható a **szürke, bal oldali hangsúlyos sávval** ellátott változat, amely az Impresszum kiemelt blokkjának szerkezeti elvét követi, de megtartja a RegionalBahn eddigi szürke keretes színvilágát. A két forma nem konvertálódik automatikusan egymásba.

A külön **Keretes** fül három módot kínál: **WYSIWYG**, **közvetlen HTML**, valamint a korábbi **Markdown/plain text** konverter. A WYSIWYG és a HTML ugyanazt a gazdag szöveget szerkeszti; Markdownból külön, explicit gomb készít vizuális változatot, ezért egy módváltás nem írja felül észrevétlenül a másik forrást. A Cikkadminban új doboznál választható a stílus, meglévő keretesnél pedig a doboz saját stílusválasztójával módosítható. A haladó `RB:BOX` jelölésnél az új változat `style="accent"` attribútummal kérhető, a régi jelölés változatlanul klasszikus marad.

## Szerkesztői mentésállapot és Firefox-helyi menü

A **Piszkozatkezelés** műveletgombjai és az időzítési figyelmeztetés közé külön, élénk színezésű **Blogger-mentésállapot** panel került. Vörös: helyi módosítás / még nincs mentés vagy mentési hiba. Zöld: a Blogger sikeres API-válasszal igazolta a jelenlegi cím, HTML és címkék mentését. Kék: Bloggerből megnyitott, azóta változatlan piszkozat, amelynek újragenerált HTML-jét még nem mentettük vissza. Sárga: mentés folyamatban, kapcsolat nélkül vagy statikus oldal. A program minden WYSIWYG-kimenetfrissítés és címke-/címváltozás után összeveti a helyi állapotot a legutóbbi igazolt mentéssel/betöltéssel; a mentés közben történt újabb változtatások nem kapnak tévesen zöld visszajelzést.

Firefoxban a kijelölés a jobb kattintás előtt összeomolhat. A helyi formázómenü ezért az egérgomb lenyomásakor elmenti a kijelölést, az `contextmenu` eseményt pedig elkapja, és a kijelölt tartalomra használja. **Shift + jobb egérgomb** a Firefox saját helyi menüjét kéri; más esetben kijelölt WYSIWYG-szövegnél az RBTools menüje jelenik meg. A funkció böngészőfüggetlen szimulált regressziós tesztjeit a `tests/editor-interactions.test.cjs` fájl tartalmazza; a valós Firefox + Blogger végpont-ellenőrzés továbbra is szükséges.

## Dokumentumimport

A Cikkadmin és a haladó forráskonverter közvetlenül fogad **.md, .txt, .docx, .odt és .rtf** fájlokat. A **Keretes** eszköz ugyanígy támogatja ezeket a formátumokat.

### ODT és RTF import

- **ODT:** a böngésző helyben bontja ki az OpenDocument csomagot; a bekezdések, címsorok, alapvető karakterformázás, linkek, listák és táblázatok Markdownná alakulnak. A beágyazott képek helyén helyőrző marad.
- **RTF:** a szöveg, bekezdések, sortörések, félkövér, dőlt, aláhúzott, áthúzott, felső és alsó index alapformázása kerül át. Régi vagy gyártóspecifikus RTF-kiterjesztéseknél az eredményt ellenőrizni kell.
- Az import teljesen kliensoldali, a dokumentumot az RBTools nem tölti fel saját szerverre.

## Szerzői footer és időzítés

A Cikkadmin WYSIWYG és a haladó szövegkonverter szerzői footere ugyanazt a RegionalBahn-formátumot használja: a szöveg után új sorban `<hr align="center" />`, majd jobbra zárva, 85 százalékos méretű dőlt szövegként a szerző vagy szerzők neve.

A Blogger-piszkozatokhoz tartozó hat művelet egyetlen, jól elkülönített **Piszkozatkezelés** panelen található. A zöld mentés gomb csak piszkozatot ment. **Az időzítést az illetékes szerkesztő a Blogger saját felületén állítja be**, nem az RBToolsban. Normál piszkozatmentés után az RBTools időzítési mezője 2049. december 31. 23:59 értékre áll vissza.

## Kézi tartalék munkamenet

Ha a Blogger API-kapcsolat éppen nem használható, a régi kézi módszer továbbra is működik:

1. Bloggerben töltsd fel a képeket.
2. HTML-nézetből másold ki a képkódot az RBToolsba.
3. Szerkeszd össze a cikket.
4. Másold vissza a címet és a végleges HTML-t a Bloggerbe.

## További eszközök

A korábbi külön **Szöveg → Blogger konverter** fül megszűnt: teljes funkcionalitása a **Cikkadmin** lenyitható **Haladó forráskonverzió, Google Docs és RB-jelölések** részébe került. Így minden cikkes munkafolyamat egyetlen fülön érhető el.

A **Keretes**, **Gyűjtőoldalak**, **Táblázatok**, **Képkódok**, **HTML ellenőrző**, **Unicode stílusok** és **Súgó** külön eszközfülként továbbra is megmaradt.

## RBTools favicon

Az RBTools faviconja a korábban biztosított, kék keretes **RegionalBahn RB-jelképet** tartja meg, amelynek jobb alsó részét a **🛠️ kalapács és villáskulcs emoji** egészíti ki. A pontos, eredeti kék RB-grafika és az emoji egyesítéséből 32 × 32 képpontos `favicon-32.png` készül. Az ikon hivatkozásai verziózott URL-lel kerülik meg a régi favicon böngészős gyorsítótárazását.

## Technikai háttér

- Publikálás: GitHub Pages
- Branch: `main`
- Egyedi domain: `tools.regionalbahn.hu`
- Az oldal `noindex` meta utasításokat tartalmaz, de a közvetlen URL nyilvánosan elérhető.


## Illesztés az optimalizált RegionalBahn Blogger-témához (2026.09.30)

Az RBTools kimenete a felhasználó által átadott `RegionalBahn_Blogger_CSS_optimalizalt(1).xml` stílusaihoz igazodik. A téma a `body` részen Inter betűcsaládot, a `.post-body` területen 110%-os, 1.4 sortávolságú törzsszöveget, a képekhez saját keretet és a globális `h2` szabályon widgetcímes, nagybetűs megjelenést alkalmaz. Ezt a kompatibilitási réteg nem írja felül általánosan. A generált cikkek saját osztályokat és mobilhoz alkalmazkodó, az első `<!--more-->` után bekerülő helyi CSS-t kapnak. Nem töltünk be második Inter-fontot, és nem duplázzuk a Blogger képkereteit.

A változás érinti a Cikkadmin, a haladó Markdown/sima szöveges konverter, a képek, címsorok, podcast-beágyazások és az élő tudósítás HTML-kimenetét. A meglévő bejegyzések változatlanok maradnak. A visszaimportáló figyelmen kívül hagyja a `data-rbtools-theme` jelű stíluselemet, ezért nem lesz véletlen szerkeszthető szövegblokk. A statikus oldalak szerkesztése továbbra is külön, saját CSS-sel történik. A stílus csak akkor igazodik automatikusan, ha új HTML-t generálsz; a korábban publikált HTML visszamenőleges átalakítását nem végezzük.

Visszaellenőrzés: `node tests/theme-compat.test.cjs`, majd az összes `tests/*.test.cjs`. A téma megváltoztatásakor a főszínt (`#0b5394`), a globális `h2` stílust, az Inter betűcsaládot és a Blogger saját képkeretezését újra össze kell vetni.


## Cikkadmin: abbr és szerzői zárás (2026-09-30)

A WYSIWYG formázósorában és a kijelölt szöveg helyi menüjében egyaránt elérhető az **ABBR** funkció. A kijelölt rövidítéshez külön panelen add meg a teljes feloldást: a kimenet `<abbr title="…">rövidítés</abbr>`. Meglévő abbr-re kattintva a title módosítható; a jelölés eltávolításakor a benne lévő szöveg megmarad. A helyi menü a Firefox jobb kattintásával összeomló kijelölését ugyanúgy menti, mint a linkeknél.

A **Szerzők és cikkzárás** mezőcsoport közvetlenül a WYSIWYG alatt található. Itt sablontól függetlenül adhatók meg a nevek és a megjelenés: szerzők, **Összeállította:** vagy nincs szerzői footer. A normál és az összeállítói változat a korábbi RegionalBahn-szintaxist követi: középre helyezett `<hr>`, jobbra zárt, dőlt, 85%-os sor. Megnyitott cikk esetén kizárólag a szabványos, tényleges utolsó szerzői blokkot olvassuk vissza; hiánya esetén üres névvel, kikapcsolt footerrel indul, nem a korábban szerkesztett cikk adataival. A gyorstalpaló és a Súgó frissült; a Súgó fő fejezetei 0-tól 28-ig folyamatos számozást kaptak.


## Változásnapló és gombos Súgó (pages-v43)

A fejlécben található `JS: aktív • pages-v43 ↗` verziójelzés kattintható: új lapon megnyitja a `/release-notes.html` önálló változásnaplót. A dátumozott kiadási napló a GitHub által egyértelműen azonosítható v29, v37–v43 kiadásokat fedi le; az ennél régebbi és köztes fejlesztések nem kapnak bizonytalanul visszavetített verziószámot. A következő kiadásoknál a fájlt és a `RBTOOLS_VERSION` azonosítót együtt kell frissíteni.

A Súgó tartalomjegyzéke az archívumokhoz hasonló, billentyűzettel is használható témagombokat és **Összes** lehetőséget kínál. Alapértelmezésben a Cikkadmin látható, azon belül külön fejezetgombokkal. Mélyhivatkozás vagy hashváltozás esetén a keresett fejezet szülőtémáját automatikusan megnyitja. A Gyűjtőoldalak útmutatója a részletes Cikkadmin-szakasz után következik.


## Képaláírás-szabvány (pages-v44)

A normál cikkképek látható képaláírása **nem kap külön Blogger-jellegű színt vagy 90%-os méretet**. A szabványos kimenet egyszerű, középre zárt, normál méretű szöveg:

`<div style="text-align: center;">KÉPaláírás</div>`
`<br />`

A szöveg a cikk normál szövegszínét örökli. Ez a Cikkadmin normál képblokkjára, a haladó `RB:IMAGE` kimenetre és a Képkódok eszközre egyaránt érvényes. A főkép továbbra sem kap látható képaláírást. A keretes blokkok képaláírása a keretes saját szürke hátterét örökölheti, de ott sincs külön kék vagy csökkentett betűméret.


## Cikkadmin-szerkesztő és #nyúz regressziójavítás (pages-v45)

A WYSIWYG vászon szerkesztői tipográfiája visszatért a v39–v40 körüli viselkedéshez: fehér vászon, fekete szöveg, Arial-alapú 16 px/1,55 törzsszöveg. Ez **csak a szerkesztő felületre** vonatkozik; a Bloggerhez generált HTML továbbra is megtartja a később bevezetett, optimalizált RegionalBahn-témához illeszkedő Inter-kompatibilitást, reszponzív képeket, élő tudósítási elemeket és a többi új funkciót.

A `#nyúz` munkamenetben a sablon és a közvetlen forrásbetöltés egyaránt külön H3 hírcím + sorkizárt hírtörzs szerkezetet használ. Régi HTML visszaolvasásakor a középre zárt, kizárólag félkövér címet tartalmazó legacy div H3 hírcímmé alakul; a normál hírtörzs bekezdéseit a program sorkizártra normalizálja. Már elmentett HTML-ből fizikailag hiányzó hírcímet a program nem talál ki.


## Blogger-kompatibilis HTML (pages-v48)

A generált cikk-HTML többé nem tartalmaz külön `<style>` elemet. A címsorok, reszponzív képek és beágyazások szükséges formázását az RBTools érvényes inline stílusokkal állítja elő, így a Blogger bejegyzésszerkesztőjében nem jelenik meg a korábbi segéd-CSS mint hibás/tiltott kód. A már korábban elmentett `data-rbtools-theme` stílusblokkokat a visszaimportálás továbbra is felismeri és figyelmen kívül hagyja.

Az Interre egységesített előnézeti HTML-ben a több szóból álló fallback betűcsaládok idézőjelezése is javítva lett: nem törhetik meg a `style="..."` attribútumot. A v47 #nyúz blokk-helyreállítása változatlanul megmarad.


## #nyúz mentő parser (pages-v49)

A Cikkadmin most már a korábban hibásan mentett #nyúz HTML-t is helyre tudja állítani, amikor egy teljes hírtörzs, kép, iframe vagy elválasztó egy H2–H5 elem belsejébe csúszott. A parser a címsor első valódi inline részét leválasztja, a blokk-elemeket külön szerkeszthető egységekké bontja, és a `Város | Ország – …` mintájú szöveget hírtörzsnek ismeri fel. A hiányzó hírcímhez szerkeszthető, de üresen nem mentett `Hír cím` helyőrző készül.

A #nyúz cím/lead visszaolvasása is javult: ha a cím és a valódi lead a `<!--more-->` mögé csúszott, a program a címet nem teszi a törzsbe, a következő megfelelő blokkot pedig visszaemeli leadnek. A meglévő helyes címsorokat és a későbbi v47–v48 javításokat változatlanul megőrzi.


## #nyúz hírcím-párosítás (pages-v50)

A Cikkadmin a forrásból visszaépített #nyúz híreknél most már külön védi a valódi hírcímet: ha a `Város | Ország – …` törzs előtt H2–H5 cím található, azt megtartja, és ugyanahhoz a hírhez párosítja még akkor is, ha közéjük kép, iframe vagy technikai HTML-blokk került. `<hr>` elemen nem lép át, így egy előző hír címét nem társítja tévesen a következő törzshöz. Az üres `Hír cím` helyőrző kizárólag akkor jelenik meg, ha a jelenlegi forrásban ténylegesen nincs visszanyerhető cím.


## Bekezdésblokkok és egyedi <br />-köz (pages-v51)

A Cikkadmin normál kenyérszövegében az **Enter** új önálló `<div style="text-align: justify;">…</div>` blokkot nyit a kurzornál. A **Shift+Enter** továbbra is csak sortörést hoz létre ugyanazon a blokkon belül. A felső bekezdésgomb neve ezért **＋ Új bekezdésblokk** lett, és aktív blokk esetén közvetlenül utána szúr be.

Minden kenyérszövegblokk saját **BR ✓ / BR ×** kapcsolót kap. A **BR ✓** azt jelenti, hogy az adott `</div>` után külön `<br />` kerül a Blogger HTML-be; a **BR ×** közvetlenül egymás mellé engedi a következő blokkot. Ez nem globális beállítás, hanem blokkonként külön állítható. Meglévő HTML visszaolvasásakor az RBTools megőrzi a ténylegesen meglévő vagy hiányzó `<br />` mintát.


## #nyúz cím, lead és „Még kell” blokk (pages-v52)

A #nyúz / Hétvégi gyors sablonban a Blogger címe kizárólag a külön címmezőben szerepel. A cikk HTML-jének elején a valódi lead és a **„Még kell:”** lista ugyanabba az első, közös `<strong>...</strong>` leadblokkba kerül a `<!--more-->` elé. A „Még kell” ezért nem külön kenyérszövegblokk többé.

Meglévő, korábban hibásan mentett #nyúz HTML visszaolvasásakor az RBTools felismeri a törzsbe csúszott, a Blogger-címmezővel azonos címet és eltávolítja onnan. A következő leadet és a „Még kell” listát visszaemeli és egyesíti a leadbe. Ha a címmező üres, de a törzs elején felismerhető `Hétvégi gyors …` cím található, azt a program visszaállítja a külön címmezőbe.


## Egyetlen hiteles szerzői footer (pages-v53)

A Cikkadmin WYSIWYG alatti **Szerzők és cikkzárás** panelje az egyetlen hiteles forrás a cikk végi szerzői/összeállítói sorhoz. Ide csak a neveket kell beírni; az **Összeállította:** előtagot a cikkzárás típusa adja hozzá. A generátor a mező elejéről az esetleg kézzel beírt `Összeállította:` előtagot is levágja, ezért nem keletkezhet `Összeállította: Összeállította: …`.

Meglévő cikk vagy #nyúz visszaolvasásakor az RBTools a végén maradt régi, 85%-os dőlt footereket ismételten eltávolítja. A klasszikus jobbra zárt változat mellett a régi, balra/sorkizártra maradt `Összeállította:` blokkot is felismeri, ha előtte szabványos elválasztó áll. Ha több ilyen footer rakódott egymásra, mind eltűnik a törzsből; a legutolsó felismerhető footer adatai töltődnek vissza a mezőbe, és mentéskor egyetlen szabványos footer készül.


## HTML-takarítás és kompaktabb WYSIWYG (pages-v54)

Az RBTools fő HTML-kimenetei egységes, konzervatív tisztítást kapnak: a Cikkadmin, a haladó cikkkonverter, a keretesek, a táblázat- és gyűjtőoldal-konverter, valamint a képkód-eszköz ugyanazokat a szabályokat használja. A tisztító eltávolítja a ProseMirror/Tiptap (`data-pm-*`), TinyMCE (`data-mce-*`), Slate, Grammarly, CKEditor és hasonló szerkesztői metaadatokat, a már használaton kívüli RBTools-segédosztályokat és az attribútum nélküli, pusztán technikai `span` burkokat. Egy már blokk-szintű RegionalBahn-`div` egyetlen, attribútum nélküli belső `p` eleme szintén kibomlik. A valódi vizuális és szemantikai elemek – linkek, `strong`, `em`, `abbr`, `sup`, `sub`, képek, iframe-ek, táblázatok és érdemi inline style-ok – változatlanul megmaradnak.

A WYSIWYG szerkesztőben a blokkok közötti vizuális hézag kisebb lett. Ez kizárólag szerkesztőfelületi változás: a Blogger-oldalon a kenyérszövegblokkok közötti tényleges `<br />` továbbra is a v51-ben bevezetett blokkonkénti **BR ✓ / BR ×** kapcsolóval szabályozható.

Példa: `<div style="text-align: justify;"><p data-pm-slice="1 1 []"><span>Szöveg</span></p></div>` → `<div style="text-align: justify;">Szöveg</div>`. A tisztító nem módosít érdemi vizuális formázást.

## Címsorok minimális HTML-kimenete (pages-v55)

A Cikkadmin és a közös HTML-tisztító a H1–H6 címsorokat alapértelmezés szerint középre zártan kezeli. A Bloggerhez készülő címsor HTML-je csak az igazítást tartja meg inline stílusként, például: `<h3 style="text-align: center;">Cím</h3>`. A korábbi `font-family`, `font-weight`, `line-height`, `text-transform`, `color`, `margin` és hasonló, a Blogger témájára tartozó tipográfiai deklarációk kikerülnek.

A szándékos eltérés megmarad: balra, jobbra vagy sorkizártra állított címsor esetén a megfelelő `text-align` kerül a kimenetbe. A Blogger CSS-t ez a változás nem módosítja.

## Formázás nélküli beillesztés (pages-v56)

A Cikkadmin WYSIWYG kijelölt szöveges helyi menüjében két új művelet érhető el. A **Beillesztés formázás nélkül** a jelenlegi vágólap szövegét tiszta szövegként illeszti a kijelölt rész helyére. A **Vágólap-előzményekből formázás nélkül** egy egyszeri tiszta beillesztést készít elő: ezután a Windows **Win+V** paneljén kiválasztott szöveg formázás nélkül kerül be.

A böngészők biztonsági modellje nem engedi, hogy egy weboldal programból megnyissa a Windows vágólap-előzményeit, ezért a Win+V panelt továbbra is a felhasználó nyitja meg. A tisztítás csak a következő beillesztési eseményre vonatkozik, nem módosítja tartósan a normál Ctrl+V működését.

## Google OAuth production-előkészítés (pages-v57)

A Google Auth Platform production/verifikációs követelményeihez az RBTools főoldala állandóan és könnyen elérhetően linkeli a `/privacy.html` adatkezelési tájékoztatót és a `/terms.html` használati feltételeket. A Blogger-kapcsolat panel külön, látható adatvédelmi értesítést tartalmaz arról, hogy az OAuth-jogosultság kizárólag a felhasználó által elérhető Blogger-tartalmak szerkesztésére szolgál, az access token pedig csak az aktuális böngészőmunkamenet memóriájában marad.

Az adatkezelési tájékoztató külön rögzíti a Google API Services User Data Policy és Limited Use elveinek megfelelő felhasználást. A Google Auth Platform Branding oldalhoz használt URL-ek: homepage `https://tools.regionalbahn.hu/`, privacy policy `https://tools.regionalbahn.hu/privacy.html`, terms `https://tools.regionalbahn.hu/terms.html`.

## Automatikus képkód-normalizálás (pages-v58)

Meglévő Blogger-piszkozat vagy cikksablon megnyitásakor a Cikkadmin nem viszi tovább változatlanul a régi vagy vegyes Blogger-képkódot. A normál cikkkép ugyanazt a közös attribútumgyűjtőt és `<img>`-generátort használja, mint a **Képkódok** eszköz. Így a régi `style`, `border` és eseményattribútumok kiesnek, a reszponzív `max-width:100%;height:auto;` forma, az aktuális ALT/kredit és a képaláírás újragenerálódik. A forrásban ténylegesen meglévő, hasznos képmetaadatok, például `data-original-height`, `data-original-width`, `srcset`, `sizes` és `loading`, megmaradnak.

A főkép és a keretes kép saját szerkezete nem változik: a főkép továbbra is 200 pixeles, balra úsztatott leadkép, a keretes pedig megtartja a szürke hátterét. Ezekben is ugyanaz a közös kép-tag normalizálja az `img` elemet. Emiatt a vegyes, különböző Blogger-generációkból származó képkódok a WYSIWYG megnyitásakor automatikusan egységes, RegionalBahn-kompatibilis kimenetté állnak össze; külön kézi Képkódok-konvertálásra nincs szükség.
