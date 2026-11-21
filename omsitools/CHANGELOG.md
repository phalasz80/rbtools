# OMSI Tools – Változásnapló

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
