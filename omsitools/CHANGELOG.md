## 1.4.0 (2026-11-21)
- Önálló `registrations.txt` generáló oldal: 21 rendszer, 12 ország/történeti állam, 100 000 sorig, meghatározott seed, duplikátummentes generálás, kötőjel/szóköz.
- Valós és fiktív körzetkódok többes kiválasztása súlyokkal; AH, TH, HER, WIN külön jelölőnégyzetekkel; 671 eredeti nyugat-berlini rendszám megőrizve.
- Valós járműarányok külön oldalon: hivatalos müncheni 1981-es állomány, nyugatnémet és nyugat-berlini 1985-ös újregisztrációs modellminta, 1987-es nyugat-berlini teljes Pkw-darabszám kontextus.
- Más területről vagy évből származó adatok csak külön megerősítéssel használhatók becsléshez. Márka szerinti relatív OMSI-súlyozás, területi/éves CSV-import, forrásminősítés, hiányzó márkák jelzése. A modellrészarányok becslések.
- Új modulok: `registrations.mjs`, `fleet-evidence.mjs`, `tests/registrations-fleet.test.mjs`.

## 1.3.0 (2026-11-21)
- A felhasználó által küldött teljes `kozuti_ai.txt` (2727 sor) és `kozut_parklist.txt` (1090 sor) a webalkalmazás elsődleges járműkatalógusa.
- Rendszámváltozatok, LOD-objektumok és azonos típusok deduplikálása; típuscsoportok, modelldátumok és területi preferenciák.
- Történeti Németország: Nyugat-Berlin/Kelet-Berlin választó, 1970-es és 1980-as évek modellezése, korszakból kilógó járművek alapértelmezett kizárása.
- Új katalóguspanel kereséssel, részletes javaslatokkal, tételenkénti kijelöléssel és projektbe emeléssel. Üres projekt esetén a közúti fájlgenerálás saját katalógus-ajánlást használ.
- A besorolási jegyzet külön `CATALOG_RESEARCH.md` fájlban, a felületre linkelve; a modellváltások külön ellenőrzésével.
- Az automatikus megjelenési arányok és típusbesorolások heurisztikusak, a modellek OMSI-telepítettsége ellenőrzendő; forráskritikai figyelmeztetés megmarad.
- Német DIN/EU-, francia FNI/SIV- és magyar 1990/2004/2022-es rendszámváltások időbeli korlátozása, cseh/szlovák 1993-as időhatár. A régi táblák későbbi jelenléte egyszerűsített súlyozással modellezett.

## 1.2.0 (2026-11-21)
- Külön NDK / NSZK történeti üzemmód, Berlinnél kötelező East/West kiválasztás.
- 1970–1989 eltérő ünnepek (NSZK június 17., NDK október 7.; 1975/1985 külön NDK-ünnepek) és tartományi, helyi ünnepek részleges jelölése.
- 1990 átmeneti év és 1991–2019 országos alapnaptár, nem igazolt regionális dátumok _RESZLEGES megjelöléssel.
- Iskolaszünetek: 1970 NDK ismert dátumai másodlagos forrásból, más évek hiányként szerepelnek, nincs becslés.
- Naptár 1970–2027 egyetlen kérésben, legfeljebb 11 API-s évvel.
- Történeti források a generált ZIP jelentésében.
- Rövidített státuszüzenet a több évtizedes naptárakhoz; a részletes figyelmeztetések a ZIP-ben maradnak, és a történeti választó csak Németországnál látszik.

## 1.1.1 (2026-11-21)
- Az OpenHolidays 2020 előtti lefedettségének helyes kezelése. A hiányzó év már nem szakítja meg az egész naptárat.
- Magyarországon 2017-től országos munkaszüneti napok törvényi szabályok alapján kiszámíthatók, ha az API nem ad adatot. Iskolaszüneteket nem becsülünk.
- Évenkénti forráslefedettség, részleges adatok hangsúlyos figyelmeztetése, valamint _RESZLEGES ZIP-elnevezés.
- Az API-hiba és az adathiány az ellenőrzési jelentésben elkülönül.

# OMSI Tools – Változásnapló

## v1.1.0 – 2026. november 21.

### Területi naptárbővítés
- Németország mind a 16 tartománya, Ausztria, Svájc, Franciaország, Magyarország, Csehország, Szlovákia és az Egyesült Királyság.
- Összesen 204 város kiválasztási lehetősége, országonként és régiónként rendezve.
- OpenHolidays Subdivisions és Groups, hivatalos területi/szünetcsoport-adatok dinamikus beolvasása.
- Brit munkaszüneti napok GOV.UK forrásból, hiányzó év esetén Nager.Holidays tartalékkal.
- Brit iskolaszüneteknél egyértelmű hiányjelzés, ellenőrzött helyi CSV-bővítési lehetőség.
- Augsburg önálló városi ünnepe, az Augsburger Hohes Friedensfest.
- Magyar, cseh és szlovák OMSI-kódolás Windows-1250; más országokban Windows-1252.
- 18 automatizált regressziós teszt.

## v1.0.1 – 2026. november 21.

### Közzétételi csomag javítása
- A GitHubra feltölthető ZIP gyökerében közvetlenül a projektfájlok szerepelnek, nem egy külső `omsitools/` almappában.
- A közzétételi munkafolyamat külön jelzi, ha a szükséges GitHub Secret hiányzik.
- Külön `TELEPITES_GITHUB.md` útmutató a 404-es hibához.


## v1.0.0 – 2026. november 21.

### Első webes kiadás
- Önálló, magyar nyelvű, reszponzív webes felület.
- Település, ország, tartomány, városrész, vállalat és járat szerinti történeti kutatási feladat megadása; 1900–2099 közötti évintervallum.
- Feladattípusok és forráskutatási keresőhivatkozások; Markdown kutatási terv export.
- Járműrekordok forrásmegjelöléssel és igazolási státusszal; JSON projekt import/export.
- OMSI 2 `ailists.cfg` generálás (szabad közúti csoportok és menetrendi/telephelyi járművek), állományszám, rendszám és festés támogatással.
- `parklist_p.txt` generálás beállítható előfordulási arányokkal; ismétlések tudatos megőrzése.
- Meglévő OMSI-fájlok szerkezeti auditja, a forrásfájlok módosítása nélkül.
- `Holidays.txt` OpenHolidays API-ból vagy meglévő OMSI-fájlból, helyi CSV-eltérésekkel.
- `timezone.txt` IANA alapú nyáriidőszámítás-adatokkal; 2026-os európai óraátállítás helyes október 25-i dátummal.
- Saját, külső JS-függőség nélküli ZIP- és Windows-1250/1252 kódoló modul.
- Forrásjelentések és tesztek.
- Külön `omsitools` repo és csak az `rbtools/omsitools/` almappát frissítő GitHub Actions workflow előkészítve.

### Ismert korlátok
- A történeti járműpark összetételét a program nem kutatja meg automatikusan; ellenőrzött rekordok bevitele szükséges.
- A járműfájlok fizikai megléte és a pálya AI-forgalmi csoportbeállításai külön ellenőrizendők.
- A `parklist_p.txt` időszakon belüli dátumfüggő kiválasztást nem támogat, ezért időszakonként eltérő fájlt szükséges használni.
- A naptár az OpenHolidays területi lefedettségére és a futtató böngésző időzónaadatbázisára támaszkodik.
- A GitHub-repozitórium létrehozása és a közzétételi token beállítása szükséges ahhoz, hogy az oldal a megadott egyéni domainen működjön.
