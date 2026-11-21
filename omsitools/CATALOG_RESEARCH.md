# OMSI Tools járműkatalógus – kutatási és besorolási jegyzet (1.3.0)

## Forrásállományok és módszer

A `catalog-data.mjs` teljes, megőrzött bejegyzésállománya két felhasználói fájlból származik:
- `kozuti_ai.txt`: 2727 eredeti útvonalsor, valamennyiben egyes relatív súly szerepel.
- `kozut_parklist.txt`: 1090 eredeti `.sco` objektumhivatkozás, egy sor = egy referencia.

A két állomány **nem** tartalmazja az OMSI-modellek tényleges tartalmát, a textúrákat, az autóállomány történeti statisztikáját vagy a térképen mért előfordulást. A katalógus ezért (1) az eredeti elérési utakat megőrzi, (2) a típusnév és az alapváltozat azonosításakor ismert gyártási korszakokat használ, (3) országos rendszámot választ, (4) jelzi a bizonytalanságot. Egy `Car_FR` és `Car_FR_FNI` nem két külön járműtípus. Egy `_LOD` változat sem új járműtípus.

A 2727 AI-sor közül 1690 az `AI_Cars_S3D_PL_repack` alkönyvtárban szerepel, **52 különböző modellmappával**. Ebből nem lehet 1690 különálló típust következtetni. Az eredeti lista minden súlya 1, ezért az ajánló saját **heurisztikus** súlyai nem igazolt forgalmi részesedések.

## Konkrétan ellenőrzött típusok és korszakok

| Típus | Fájlnévi ismertető | Alap gyártási korszak | Elsődleges környezet | Forrás |
|---|---|---|---|---|
| Trabant 601 | `Trabant`, `TH_Trabant` | 1964–1990 | NDK, a térség országaiba export | [Szász Állami Levéltár](https://www.archiv.sachsen.de/archiv/bestand.jsp?bestandid=31076&oid=9.9&syg_id=88083) |
| Wartburg 353 | `Wartburg_353_85` | 1966–1988 | NDK, esetleges export | [German History in Documents and Images](https://germanhistorydocs.org/en/two-germanies-1961-1989/production-of-the-wartburg-353-1966) |
| Škoda Favorit | `Skoda_Favorit` | 1987–1994/95 | Csehszlovákia, közép-európai országok | [Škoda gyártói archívum](https://www.skoda-auto.com/world/history-1986-1995) |
| Škoda Forman | `Skoda_Forman` | 1990–1995 | Csehszlovákia, közép-európai országok | [Škoda gyártói archívum](https://www.skoda-media.de/press/detail/2638/) |
| Volkswagen Polo II | `VW_Polo_2` | 1981–1994 | NSZK, Nyugat-Európa | [Volkswagen gyártói archívum](https://www.volkswagen-newsroom.com/en/polo-2-19811994-19143) |
| London Taxi TX4 | `TX4` | 2007-től | brit taxiforgalom | [LEVC vállalattörténet](https://www.levcbreweryroad.com/company/history/) |

A táblázatban nem szereplő modellgenerációkhoz a kód neve és a járműipari korszakadatok alapján **előzetes, ellenőrzendő** szabályok készültek. A `catalog-core.mjs` `RULES` táblája átnézhető és verziózott. A listából a típus pontos megjelenése, festése vagy felszereltsége **nem** ellenőrizhető.

## S3D-rendszámváltozatok

Az S3D Definitive AI Car Repack dokumentációja külön felsorolja a DE, DE_DIN, FR, FR_FNI, H, H_old, H_2022, UK, CZ, SK stb. rendszámokat. Az ajánló ezt a szabályt követi: a helyszín országához tartozó `.ovh` változatot részesíti előnyben. Nem jelenti ki, hogy a felhasználó saját OMSI-mappájában egy ilyen `ovh` létezik: azt csak a beküldött sor bizonyítja, hogy a hivatkozás a listában volt.

- **Franciaország:** SIV 2009 áprilisától; korábbi korszakhoz FNI, ha szerepel a listában. [Francia állami tájékoztató](https://www.service-public.gouv.fr/particuliers/vosdroits/F17638).
- **Magyarország:** 1990-től hárombetűs, 2004-től EU-sávos, 2022. július 1-jétől új formátumú rendszám. [326/2011. kormányrendelet](https://njt.jog.gov.hu/jogszabaly/2011-326-20-22.74). 1990 előtti magyar táblát az S3D pack `H_old` megnevezéséből nem feltételezünk.
- **Németország:** DIN és EU-sávos változat szétválasztása, régiónként átmeneti időszakok; 1980-as évekre `Car_DE` helyett `Car_DE_DIN` szükséges, amennyiben a listában valóban szerepel. [Rendszámtörténeti összefoglaló](https://dr-herzfeld.de/kennzeichengeschichte/kennzeichen.pdf).
- **Csehország és Szlovákia:** a mai államhoz kötött variánsokat nem vetítjük vissza 1993 elé, ha a régi korabeli csehszlovák rendszámot nem tudjuk igazolni.

Forrás a pack működéséhez: [S3D Definitive AI Car Repack](https://strefa-omsi.pl/Watek-S3D-Definitive-AI-Car-Repack-1-00-RC1--30901?pid=185205).

## Városkép és járműkategóriák

- **NDK 1970–1989:** Trabant, Wartburg, IFA teherautók elsődlegesek; nyugati luxusautók csak különleges, forrással igazolt esetben. A puszta `DDR` suffix az adott addon változatának neve, nem bizonyítja a modellkorszakot.
- **NSZK/Nyugat-Berlin:** a korszakba illő Volkswagen, Opel, Mercedes és Ford típusok előnyben; keleti jármű nem tipikus tömegmodell.
- **Magyarország/Csehszlovákia:** a Škoda/Lada/Trabant/UAZ és más korabeli közép-kelet-európai járművek részaránya eltérhet; nem használunk igazolhatatlan százalékokat.
- **Egyesült Királyság:** brit rendszámok, londoni taxi csak indokolt taxikörnyezettel; külön figyelem a nyitott `WH_UK_AI` csomagokra.
- **Ipari terület:** több teher- és haszonjármű; lakóövezet: kevesebb teherautó. A modellek AI-kompatibilitását a beküldött elérési utakból egyedileg nem lehet igazolni.

## OMSI-technika, LOD és illeszkedés

A `parklist_p.txt` statikus objektumokat használ, általában nem tartalmaz frekvenciaszámot. A `ailists.cfg` `[aigroup_2]` csoportjaiban a relatív súlyok használhatók, de ha a pálya külön speciális AI-csoportokat igényel, az új csoportneveket a pályán is kezelni kell. A `_LOD` változatokat alapértelmezés szerint nem duplázzuk a teljes felbontású változatok mellé. A külön `Police`, `Taxi`, `RTW` és `active` változatok nem kerülnek automatikusan az átlagos lakóövezeti forgalomba. [OMSI WebDisk AI ismertető](https://reboot.omsi-webdisk.de/wiki/entry/90-ai-traffic-from-ailists-cars-and-humans/).

**Hiányzó bizonyíték:** A modfájlok valódi létezése, a járművek 3D-modellje, gyártási alváltozata, az adott évben adott városban mért állományaránya és a korabeli járművek tényleges rendszámai további ellenőrzést igényelnek. Az alkalmazás emiatt minden automatikusan kiválasztott járművet `proposed` minőségjelzéssel helyez a projektbe, sosem `verified`-ként.
