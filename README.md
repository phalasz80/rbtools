# RegionalBahn Tools

A RegionalBahn belső szerkesztői eszköze: **https://tools.regionalbahn.hu**

## Gyorstalpaló

### Új cikk közvetlenül az RBToolsban

1. Nyisd meg a **Cikkadmin** fület, és kattints az **Új cikk** gombra.
2. A **Cikk címe** külön, Blogger-szerű mező, itt add meg a címet. A **Főkép + valódi lead** bekeretezett WYSIWYG-blokkban válaszd a borítóképet és írd mellé a felvezetőt. A `<!--more-->` mindig ez után kerül. A törzs H2–H5 alcímeket használhat.
3. Használd a formázógombokat, alcímeket, kereteseket, képeket és drag-and-drop rendezést.
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

Az új blokkos szerkesztőben formázás, linkelés (alapértelmezett új lap, kikapcsolható), bekezdés/alcím/elválasztó beszúrás, előnézet, teljes HTML másolása/letöltése és az **eredeti HTML kötelező biztonsági másolata** érhető el. A régi Markdown-konverter HTML-jét külön gombbal átveheted, de ilyenkor **helyi, nem hozzárendelt** oldal nyílik: a konverter nem írhatja észrevétlenül felül a meglévő oldalt, és nem találhatja ki, hogyan illeszkedjen annak egyedi gombjaihoz.

**Éles meglévő oldal mentése** csak az eredeti HTML letöltése, explicit megerősítés és közvetlenül a mentés előtti újabb szerverolvasás után engedélyezett. Ha az oldalt egy másik szerkesztő közben módosította, a mentés leáll. A program kizárólag az eredeti **Page ID** `PATCH` műveletével, a cím és a HTML megadásával ment, majd ismét lekéri a Blogger-oldalt, és összeveti az eredményt az elküldött HTML-lel és az eredeti védett forrásrészekkel. Az eredeti `/p/` URL megváltozását külön jelzi. Következő mentéshez friss biztonsági másolat kell. Nem jön létre új oldal, és nincs külön Publish gomb; **már nyilvános oldalnál a PATCH viszont azonnal módosítja az élő tartalmat**.

Az eredeti script- és gombkódokat az RBTools saját WYSIWYG-je nem alakítja át, de a Blogger esetleges szerveroldali szűrését kizárólag a **mentés utáni API-ellenőrzés** tudja kimutatni. Emiatt az első éles mentés előtt különösen ajánlott az új munkafolyamatot egy tesztoldalon kipróbálni. Ha a forrás HTML szabálytalan szerkezete nem értelmezhető veszteségmentesen, a teljes forrás zárolva jelenik meg: ilyenkor előbb mentsd le, és kézi javítás nélkül ne írd felül a Blogger-oldalt. A beépített előnézet sandboxos, az oldalon lévő szkripteket biztonsági okból **nem futtatja**.

A forráskódmegtartást a `collection-page-core.js`, az OAuth/Blogger-integrációt és a WYSIWYG-felületet a `collection-pages.js` kezeli. Regressziós tesztek: `tests/collection-page-core.test.cjs`, `tests/collection-page-save.test.cjs`.

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

Az RBTools saját, 32 × 32 képpontos, PNG-alapú böngészőikont használ: `favicon-32.png`. A RegionalBahn rövidített **RB** jelölését vasúti vonalakat idéző csíkokkal és a szerszámokra utaló villáskulccsal kombináló, külön tervezett grafika. Az `index.html` két explicit favicon-hivatkozással és verziószámozott URL-lel tölti be, hogy a böngésző gyorsítótárát frissítéskor egyszerűen meg lehessen kerülni.

## Technikai háttér

- Publikálás: GitHub Pages
- Branch: `main`
- Egyedi domain: `tools.regionalbahn.hu`
- Az oldal `noindex` meta utasításokat tartalmaz, de a közvetlen URL nyilvánosan elérhető.
