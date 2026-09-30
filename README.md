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
5. A további szerkesztés, képaláírás, sorrend, keretesek és formázás az RBToolsban történik.
6. A **Mentés Blogger-piszkozatba** ugyanazt a draftot frissíti.

### Meglévő Blogger-piszkozat szerkesztése

1. **Kapcsolódás a Bloggerhez**.
2. Válaszd ki a megfelelő blogot.
3. Frissítsd a piszkozatlistát, keress rá a címre, majd válaszd a **Piszkozat megnyitása** gombot.
4. Az RBTools betölti a címet, HTML-t, címkéket és a cikkben szereplő képeket.
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
- képaláírás és kredit;
- egérrel vagy billentyűzettel szabad szövegkijelölés és kiválasztott rész formázása;
- hivatkozások beszúrása/szerkesztése külön, nem modális URL-szerkesztővel (Ctrl+K / ⌘K);
- blokkok drag-and-drop rendezése kizárólag a jobb oldali ⠿ fogantyúnál, hogy a szöveg kijelölhető maradjon;
- meglévő RegionalBahn Blogger HTML visszatöltése szerkesztésre;
- haladó forráskonverzió a Cikkadminon belül: Markdown/plain text/DOCX/ODT/RTF/Google Dokumentum, profilok, presetek, RB-jelölések, közvetlen HTML-kimenet és előnézet;
- a haladó konverter kimenetének visszatöltése a WYSIWYG Cikkadminba;
- folyamatosan generált végleges Blogger HTML;
- széles, színkódolt állapotsáv a betöltési, mentési, siker-, figyelmeztetési és hibaállapotokhoz.

## Dokumentumimport

A Cikkadmin és a haladó forráskonverter közvetlenül fogad **.md, .txt, .docx, .odt és .rtf** fájlokat. A **Keretes** eszköz ugyanígy támogatja ezeket a formátumokat.

### ODT és RTF import

- **ODT:** a böngésző helyben bontja ki az OpenDocument csomagot; a bekezdések, címsorok, alapvető karakterformázás, linkek, listák és táblázatok Markdownná alakulnak. A beágyazott képek helyén helyőrző marad.
- **RTF:** a szöveg, bekezdések, sortörések, félkövér, dőlt, aláhúzott, áthúzott, felső és alsó index alapformázása kerül át. Régi vagy gyártóspecifikus RTF-kiterjesztéseknél az eredményt ellenőrizni kell.
- Az import teljesen kliensoldali, a dokumentumot az RBTools nem tölti fel saját szerverre.

## Kézi tartalék munkamenet

Ha a Blogger API-kapcsolat éppen nem használható, a régi kézi módszer továbbra is működik:

1. Bloggerben töltsd fel a képeket.
2. HTML-nézetből másold ki a képkódot az RBToolsba.
3. Szerkeszd össze a cikket.
4. Másold vissza a címet és a végleges HTML-t a Bloggerbe.

## További eszközök

A korábbi külön **Szöveg → Blogger konverter** fül megszűnt: teljes funkcionalitása a **Cikkadmin** lenyitható **Haladó forráskonverzió, Google Docs és RB-jelölések** részébe került. Így minden cikkes munkafolyamat egyetlen fülön érhető el.

A **Keretes**, **Gyűjtőoldalak**, **Táblázatok**, **Képkódok**, **HTML ellenőrző**, **Unicode stílusok** és **Súgó** külön eszközfülként továbbra is megmaradt.

## Technikai háttér

- Publikálás: GitHub Pages
- Branch: `main`
- Egyedi domain: `tools.regionalbahn.hu`
- Az oldal `noindex` meta utasításokat tartalmaz, de a közvetlen URL nyilvánosan elérhető.
