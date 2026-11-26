# OMSI Tools (RegionalBahn) · v1.7.0

Statikus, böngészőben futó alkalmazás OMSI 2 / openOMSI pályák járműállományának és naptárállományainak összeállításához. A cél: `https://tools.regionalbahn.hu/omsitools/`.

## Funkciók

### 1. Történeti kutatási terv
- Város, régió, városrész, közlekedési vállalat, járat és `1900–2099` közötti időszak megadása.
- Témák: buszok, személyautók, parkolás, taxik, áruszállítás, megkülönböztetett járművek, festés/rendszám, utcák.
- Szabad szöveges mezők: **hol** kutassunk, **mit** keressünk, egyéb kritériumok.
- Kattintható, célzott internetes keresések és a teljes terv letöltése `.md` formátumban.
- **Nem végez automatikus történeti tényfeltárást** és nem állítja, hogy egy típus bizonyítottan jelen volt. Forráskritikus, ellenőrizhető adatgyűjtést támogat.

### 2. Járműadatbázis
- Jármű neve, használat kezdete/vége, forrás URL-je és megjegyzés.
- AI típus: menetrenden kívüli `.bus`/`.ovh`, csoport és súly; menetrendi jármű telephely/HOF, állományszám, rendszám, repaint és opcionális `YYYYMMDD` érvényesség; parkoló `.sco` objektum és ismétlési súly.
- Rekordonkénti állapot: **feltételezett** vagy **felhasználó által igazolt**.
- Projekt importálása/exportálása `omsitools-project-v1` JSON-ban. Nincs szerveroldali mentés; exportálás nélkül az oldalon rögzített adatok elvesznek frissítéskor.

### 3. AI/parkoló lista
- `ailists.cfg` export OMSI 2 `[aigroup_2]`, `[aigroup_depot]`, `[aigroup_depot_typgroup_2]` blokkokkal.
- `parklist_p.txt` export. A parkoló járművek súlya az `.sco` sor explicit ismétlésével állítható be; duplikációt nem törlünk automatikusan.
- Tartomány szerinti rekordválasztás és figyelmeztetés, ha egy rekord csak a kiválasztott intervallum egy részében érvényes.
- `FORRASOK_ES_ELLENORZES.txt` + kutatási terv a ZIP-ben.
- Felhasználói `ailists.cfg` és `parklist_p.txt` szerkezeti figyelmeztetésekkel ellenőrizhető, **az eredeti fájlok változatlanok**.
- Nem állapítja meg automatikusan, hogy a megadott OMSI járműfájl valóban telepítve van-e, illetve hogy a pálya forgalmi útvonalai milyen AI-csoportot használnak. Az ilyen ellenőrzéshez a pályát és a Vehicles mappát külön meg kell vizsgálni.

### 4. Ünnepnapok és időzóna

**Támogatott területek (v1.1.0):** Németország mind a 16 tartománya, Ausztria, Svájc, Franciaország, Magyarország, Csehország, Szlovákia és az Egyesült Királyság. A felület több mint 200 fontosabb várost kínál előbeállításként. Ország → tartomány/kanton/régió → város; a területi szűrőket az OpenHolidays hivatalos API-listája tölti be (a helyileg eltérő kódokat nem szabad egyszerűen ISO-kóddá átírni).

**Egyesült Királyság:** az OpenHolidays nem támogatja GB-t. A hivatalos GOV.UK bank holidays JSON-ból és annak elérhetetlensége vagy időbeli hiánya esetén a Nager.Holidays szolgáltatásból töltődnek a munkaszüneti napok az Anglia és Wales, Skócia, Észak-Írország bontásban. Az iskolaszüneteket a helyi hatóságok és iskolák határozzák meg; ezek csak a felhasználó által megadott, ellenőrzött CSV-kivételekből kerülhetnek bele. A letölthető ZIP forrásjelentése külön jelzi, ha a szünetadat hiányzik.

**Területi pontosság:** a városok előbeállításai földrajzi helyszínt és területi szűrőt adnak, nem garantálnak teljes települési ünnep- és iskolaszünet-nyilvántartást. Biztos, különálló helyi ünnepként Augsburg augusztus 8-i Hohes Friedensfest napja automatikusan bekerül a város saját naptárába. Más helyi eltéréseket a hivatalos helyi források alapján CSV-vel lehet felvinni. Különösen Bajorország települési Mária mennybevétele ünnepe, Franciaország iskolai zónái és Svájc iskolai/községi szünetei szorulnak ellenőrzésre.

**Kódolás:** Magyarország, Csehország, Szlovákia Windows-1250; Németország, Ausztria, Svájc, Franciaország és Egyesült Királyság Windows-1252. A telepített OMSI kódlapját külön ellenőrizd.
- `timezone.txt` generálás a futtató böngésző IANA időzónaadataiból. Az óraátállítás történeti és jövőbeli érvényessége a böngésző adatcsomagjától függ; új szabályozás esetén frissítés szükséges.
- `Holidays.txt` az OpenHolidays API-ból (`PublicHolidays`, `SchoolHolidays`), illetve feltöltött OMSI `Holidays.txt` fájlból.
- Városi eltérések CSV-vel; helyszínspecifikus jogosultságot az API nem mindig tud megkülönböztetni.
- Az online API-üzemmód legfeljebb 11 évre kér adatot; évente külön ellenőrzi mindkét adatkategóriát, és hiányzó év esetén nem készít hiányos naptárat. Az API hivatalosan általában 2020-tól publikál adatot.
- Minden naptár ZIP-ben külön `Holidays.txt` és `timezone.txt` (vagy csak időzóna) + forrásjelentés.
- Magyar, cseh és szlovák helyszínhez Windows-1250, más országokhoz Windows-1252 kódolás; a karakterek kódolhatóságát ellenőrzi.

## Böngészős használat

Nyisd meg a kiszolgált `index.html` oldalt. **A JavaScript-modulok miatt a `file://` közvetlen megnyitás nem minden böngészőben működik**, ezért HTTP(S) szerverről (GitHub Pages vagy lokális tesztszerver) használd. Helyi teszt:

```bash
cd omsitools
python -m http.server 8080
# http://localhost:8080/
```

A felület nem használ külső JavaScript-függőséget. Nincs fiók, felhasználói követés, szerveroldali fájlfeltöltés. Naptáradatért a böngésző kér HTTP-kapcsolatot az OpenHolidays API-hoz; a keresőlinket csak kattintás után nyitja meg.

**Fontos**: a megadott évhatárok alapján előállított AI- és parkolólista statikus fájl. A véletlenszerű közúti járművek listája nem kapcsolja automatikusan ki egyes autók megjelenését egy többéves korszakon belül. Eltérő évekhez készíts külön fájlokat, és a megfelelő OMSI-pályaváltozatba telepítsd őket.

## Az önálló repo és a megadott URL egyidejű használata

A GitHub Pages nem tud egy önálló `phalasz80/omsitools` GitHub-projektet közvetlenül egy másik projekt *már meglévő egyéni domainje alatti* `/omsitools/` útvonalra csatolni. Ezért a forráskódot **az önálló `omsitools` repóban kell fejleszteni**, a webes fájlokat pedig a [`.github/workflows/deploy-to-rbtools.yml`](.github/workflows/deploy-to-rbtools.yml) workflow tükrözi kizárólag a `phalasz80/rbtools` repó `omsitools/` mappájába. A többi RBTools fájlt nem írja felül.

A közzététel egyszeri beállítása (részletesen: [TELEPITES_GITHUB.md](TELEPITES_GITHUB.md)):

1. Hozd létre a `phalasz80/omsitools` **publikus repozitóriumot** a GitHubon (ha még nincs); másold bele a ZIP tartalmát a gyökérbe.
2. A `omsitools` repozitórium `Settings → Secrets and variables → Actions` részébe vegyél fel `RBTOOLS_DEPLOY_TOKEN` nevű *fine-grained* személyes hozzáférési tokent. A token csak a **`phalasz80/rbtools` repóra** rendelkezzen `Contents: Read and write` hozzáféréssel. A tokent **soha ne írd be a forráskódba, fájlba vagy csevegésbe**.
3. Az `omsitools` repó `main` ágára való push után a workflow Node-teszteket futtat, és csak siker esetén frissíti az `rbtools/omsitools/` mappát. A meglévő `rbtools/CNAME` állomány továbbra is `tools.regionalbahn.hu`.
4. A megjelenési cím `https://tools.regionalbahn.hu/omsitools/` lesz, amennyiben az `rbtools` GitHub Pages már megfelelően közzé van téve. Az alkalmazás nem kerül a főoldal navigációjába.

Az oldalon `noindex,nofollow` meta szerepel. **Ez nem hozzáférés-korlátozás**: a közvetlen URL bárki számára elérhető, a GitHub repó nyilvános és a publikus GitHub Pages URL is technikailag hozzáférhető lehet. Ha valóban csak hitelesített felhasználóknak, egyetlen hoston, alternatív URL nélkül szabad elérhetővé tenni, akkor külön edge/hosting- és hozzáféréskezelési konfiguráció szükséges. A statikus GitHub Pages ezt önmagában nem garantálja.

## Tesztek

Node.js 22+: `node --test tests/*.test.mjs`. A GitHub Actions ugyanígy futtatja.

## Adatforrások és útmutatók

- [OpenHolidays API](https://www.openholidaysapi.org/en/) ([ODbL adatkészlet](https://github.com/openpotato/openholidaysapi.data/blob/main/LICENSE))
- [OpenHolidays OpenAPI-séma](https://openholidaysapi.org/swagger/v1/swagger.json)
- [OMSI WebDisk: AI traffic – from ailists, cars and humans](https://reboot.omsi-webdisk.de/wiki/entry/90-ai-traffic-from-ailists-cars-and-humans/)
- [OMSI AI Vehicles manual (Steam)](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/434060/manuals/OMSI-Downloadpack-Vol-1_AI-Vehicles-Manual.pdf)
- [openOMSI Formats](https://github.com/openOMSI-org/openOMSI/blob/main/docs/FORMATS.md)

## Szerkezeti fájlok

- `index.html`, `style.css`, `app.mjs`: felület és interakció
- `geography.mjs`: országok, régiók, városok és országfüggő kódlapok
- `calendar-sources.mjs`: OpenHolidays, GOV.UK és Nager.Holidays API-hívások
- `engine.mjs`: naptár, Windows-kódlap, saját ZIP
- `traffic.mjs`: AI-lista, parklist, diagnosztika és kutatási terv
- `example_overrides.csv`: helyi kivételek mintája
- `CHANGELOG.md`: változásnapló
- `.github/workflows`: önálló repo tesztjei és közzététele
- `tests/`: regressziós tesztek

Nincsenek dokumentált, ellenőrzött történeti járműlisták beégetve a programba. A járműrekordokat a felhasználó állítja össze ellenőrizhető forrásokból.

Az adatforrások dokumentációja: https://openholidaysapi.org/swagger/index.html , https://www.gov.uk/bank-holidays.json , https://nagerholidays.com/api . Az API-k feltételei és az internetkapcsolat az online generálásra hatással lehetnek.


### 1.1.1: hiányzó évek kezelése
Az OpenHolidays országonként 2020-tól közöl adatokat. A 2020 előtti iskolaszüneteket nem rekonstruáljuk automatikusan. Magyarország esetében 2017-től a 2012. évi I. törvény 102. § alapján kiszámíthatók a szokásos országos munkaszüneti napok (a nagypéntek 2017-től). Ezek forrása a ZIP jelentésében szerepel. Hiányzó évek esetén a ZIP neve `_RESZLEGES`, és a felhasználónak hivatalos vagy saját CSV-adatokkal kell pótolnia a szüneteket. Egy sikeres generálás nem jelenti a történeti iskolarend teljességét.


## Történeti Németország (1.2.0)
A német naptár 1970-től külön NSZK/NDK ünneprendszereket kezel. A `Történeti Németország` mezőben választható automatikus (mai területi besorolás alapján) vagy kézi NSZK/NDK mód. Berlin esetében a kézi választás kötelező. Az 1970–2019 időszak nem a modern OpenHolidays adataiból származik. 1970–1989 NDK alapünnepek, NSZK szövetségi napok és válogatott, régóta ismert tartományi napok kerülnek be; a felekezeti/városi kivételek és az 1990-es átmeneti jogrend részleges jelölést kapnak. 1991–2019 között az országos minimum áll rendelkezésre, nem a teljes tartományi ünnepnaptár. A hiányzó iskolaszüneteket a CSV-kivételekkel lehet pótolni; a program nem találja ki azokat. Források: Bundestag 17. Juni; Feiertev 1990; KMK Ferienarchiv; Deutsche Rentenversicherung DDR Ferienübersicht; datumsrechner.de DATR.PDF és schulferien.org történeti adatok. Más országoknál 2020 előtti ünnepek/szünetek egyelőre nem teljesek.

## Saját járműkatalógus (1.3.0)
A `catalog-data.mjs` az eredeti feltöltött `kozuti_ai.txt` 2727 AI- és `kozut_parklist.txt` 1090 álló járműhivatkozását tartalmazza. A program új `catalog-core.mjs` modulja a fájlnevek alapján javasol típusokat, megtartja az eredeti útvonalakat, nem ellenőrzi, hogy a modok ténylegesen telepítve vannak-e. Az S3D repack `Car_*` változatai rendszám-országok, nem külön járműtípusok; különleges/LOD jelölések külön kezelendők. Hely és kutatás fülön add meg a projekt földrajzi helyét és történeti időszakát; a Járműállomány fülön a katalógusajánlást ellenőrizd, majd a megjelölt sorokat add hozzá. A program forrásokkal ellenőrzött bizonyítékként nem címkézi az automatikus besorolást. Az OMSI alapvetően nem kezeli időfüggően a parklistát, évtizedenként más verziót készíts.
Történeti háttér: Trabant 601, Wartburg 353, Škoda Favorit, Volkswagen Polo II és londoni TX4 modellek gyártási korszakai az ismert forrásokból. Teljes járműállomány-/rendszámstatisztikát a fájlnevek nem bizonyítanak.

A rendszámok korszakhatáraihoz lásd a francia SIV hivatalos dokumentációját (https://www.service-public.gouv.fr/particuliers/vosdroits/F17638), a magyar 326/2011. kormányrendelet rendszámokra vonatkozó részét (https://njt.jog.gov.hu/jogszabaly/2011-326-20-22.74) és a német rendszámtörténeti összefoglalót (https://dr-herzfeld.de/kennzeichengeschichte/kennzeichen.pdf). A rendszámtípusok megjelenési ideje és a forgalomból való tényleges kikopás eltérhet, így a javaslat nem teljes történeti forgalmi statisztika.

## Rendszámgenerátor (1.4.0)
A külön Rendszámok fülön lehet országot, rendszámrendszert, korszakot, elválasztójelet, darabszámot és területi kódokat választani. 21 OMSI-szintetikus mintarendszer érhető el. Az AH (Ahlheim), TH (Thüringer Wald), HER (Herrenhofen) és WIN (Winsenburg) fiktív címkék önálló kombinációban is használhatók. A többes helyszínválasztás a kódonként beállított relatív súlyok alapján osztja szét a kimenetet. A visszaadott egyedi `registrations.txt` CRLF sorvéges. A 671 darabos nyugat-berlini mintát a `references/berlin_registrations_671.txt` őrzi. Fiktív rendszámokkal NE állíts valódi azonosítókról szóló állítást.

## Márkasúlyok (1.4.0)
Az új Járműarányok fül hiteles városi nyilvántartásból vagy dokumentált országos újautó-modellrészösszegből épülő *különböző* profilt kínál; a hiányzó márkák és gyártási korszakok nem kerülnek kitalálásra. A müncheni 1981-es márkaállomány a városi Statisztikai Hivatal tényleges regisztere (471 998 autó); az 1985-ös NSZK és Nyugat-Berlin adatsor csak meghatározott újautó-típusok országos értékesítési/rendszám szerinti részösszege, *nem* 1986-os nyugat-berlini utcakép. A berlini 1987-es összesített 612 309 személygépkocsi márkarészlet hiányában csak kontextus. Az adatok forrása az alkalmazásban kattintható.
CSV-import formátum: `marka;darab`. A projektben a súlyok alkalmazása csak a beazonosított közúti márkákat érinti; a márkán belüli modellek relatív aránya becslés, nem igazolt típusstatisztika.

## Történeti, kategóriás rendszámok (1.5.0)

A Rendszámok fülön a kezdő és záró év/hónap, valamint az adott időszakban **újonnan kiadható** táblák és a forgalomban **továbbhasználható** régi sorozatok külön választhatók. Az automatikus rendszámcsalád-választó átnyúlhat a korszakváltáson. A továbbhasználatnál megadott maximum életkor csak becsült mintavételi szabály, nem nyilvántartási statisztika.

A 22 járműkategória külön ki-be kapcsolható, hozzá súly, egyedi sablon és külön terület rendelhető. A forrásokkal nem igazolt különleges rendszám-kombináció nem lesz észrevétlenül kitalálva: az adott kategória kimarad, vagy kifejezett felhasználói jóváhagyással normál rendszámot kap. Szimulált egyéni sablonnál mindegyik sor `fictional` besorolást kap. A források az új `registration-history.mjs` és `registration-special.mjs` modulokban olvashatók.

A ZIP tartalmazza a tiszta OMSI `registrations.txt` állományt, a `TORTENETI_FORRASOK_ES_ELLENORZES.txt` forrásjelentést, a `TETELES_REGISZTRACIOS_ADATOK.csv` tételes jelentést (rendszám, járműkategória, kiadás éve/hónapja, terület, szabály) és a `GENERATOR_BEALLITASOK.json` konfigurációt. A korábbi OMSI-fájlokat nem módosítja.


## Német történeti szünidők, verzió 1.6.0

A német naptár 1970 és 2019 között a Kultusministerkonferenz (KMK) hivatalos, tartományonként közzétett **nyári szüneteit** is használja. 1970–1990 között ezek az NSZK és Nyugat-Berlin adatai. Az NDK-t nem szabad összekeverni a nyugatnémet dátumokkal; az NDK többi történeti dátuma továbbra is külön levéltári feldolgozást igényel. A KMK hivatalos nyári szünetei forrásfájlonként: https://www.kmk.org/service/ferienregelung.html. A KMK-archívumban 1976-ra Hamburgnál hibás, fordított dátumtartomány szerepel; ezt a program kifejezetten hiányként kezeli, nem találgat.

2017-től az alkalmazás egyes német iskolaszünetekhez lekérdezheti a nyílt, külön adatfelhasználási engedélyt nem igénylő ferien-api.de adatait; a 2022 utáni hiányokhoz schulferien-api.de, 2025-től schulferiendaten.de is tartalék szolgáltatás. A ferien-api.de UTC-időpontokat és **kizáró végdátumot**, a schulferien-api.de **beleértett végdátumot** használ. A program ezt konvertálja. Ha az API nem elérhető vagy egy tartomány/év hiányzik, az alap KMK-nyári szünet megmarad, de az év **RÉSZLEGES** marad.

A Schulferien.org külön adatbázisát nem másoljuk át: az oldal ingyenes webes megtekintése nem jelent szabad automatikus adatkivételt. A szolgáltató fizetős REST API licencet ajánl: https://www.schulferien.org/news/api-fur-schulferien-und-feiertage-35/; https://www.schulferien.org/shop/excel/. A felhasználó saját forrással ellenőrzött adatát továbbra is a helyi CSV-kivétel funkcióval adhatja meg, de a vásárolt Schulferien.org XLS újrafelhasználásához külön jogosultság kell.


## 7. FOK-GYEM 1.1 HOF-konverter
A hetedik fülön válassz egy vagy több `.hof` fájlt vagy ZIP-csomagot, majd az Átalakítás gombot. Az eredmények egyenként vagy ZIP-ben tölthetők le. A fájlnév `_FOKGYEM_1.1.hof`, a `[name]` mező ` - FOK-GYEM 1.1` toldalékot kap. A konverter bővíti a célállomási és megállói mezőket (legalább 41/30); az egyedi FOK-GYEM-feliratokat nem írja felül. A hiányzó megállódefiníciók pótlása kikapcsolható. A régi és táblázatos HOF-formátum, ANSI bájtmegőrzés, UTF-8 és BOM-os UTF-16 támogatott. A feldolgozás helyi; a hibák és a szintetikus megállópótlások a jelentésbe kerülnek. A generált kijelzőszövegek és a tényleges működés ellenőrzendők; ez nem hivatalos The Creators-eszköz. Hangfájlokat nem generál.
