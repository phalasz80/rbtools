# OMSI Tools (RegionalBahn) · v1.0.1

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
- `timezone.txt` generálás a futtató böngésző IANA időzónaadataiból. Az óraátállítás történeti és jövőbeli érvényessége a böngésző adatcsomagjától függ; új szabályozás esetén frissítés szükséges.
- `Holidays.txt` az OpenHolidays API-ból (`PublicHolidays`, `SchoolHolidays`), illetve feltöltött OMSI `Holidays.txt` fájlból.
- Városi eltérések CSV-vel; helyszínspecifikus jogosultságot az API nem mindig tud megkülönböztetni.
- Az online API-üzemmód legfeljebb 11 évre kér adatot; évente külön ellenőrzi mindkét adatkategóriát, és hiányzó év esetén nem készít hiányos naptárat. Az API hivatalosan általában 2020-tól publikál adatot.
- Minden naptár ZIP-ben külön `Holidays.txt` és `timezone.txt` (vagy csak időzóna) + forrásjelentés.
- Magyar helyhez Windows-1250, más előre beállított helyekhez Windows-1252 kódolás; a karakterek kódolhatóságát ellenőrzi.

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
- `engine.mjs`: naptár, Windows-kódlap, saját ZIP
- `traffic.mjs`: AI-lista, parklist, diagnosztika és kutatási terv
- `example_overrides.csv`: helyi kivételek mintája
- `CHANGELOG.md`: változásnapló
- `.github/workflows`: önálló repo tesztjei és közzététele
- `tests/`: regressziós tesztek

Nincsenek dokumentált, ellenőrzött történeti járműlisták beégetve a programba. A járműrekordokat a felhasználó állítja össze ellenőrizhető forrásokból.
