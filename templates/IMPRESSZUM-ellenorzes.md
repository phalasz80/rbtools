# RegionalBahn Impresszum: szerkesztőségi és jogi ellenőrzés

**Státusz:** 2026. szeptember 30-i szerkesztési javaslat. Az RBTools helyi Impresszum-sablonja a `templates/impresszum-regionalbahn.html` fájlból épül fel. Az éles `/p/impresszum.html` oldalt a program **nem módosítja automatikusan**.

## Az átadott HTML-hez képest

- Az ismétlődő, üres és egymásba ágyazott középre igazító `<div>` elemek helyett címsorok, szemantikus szakaszok és egyetlen, névtérrel ellátott CSS-stílusblokk szerepelnek. A szakaszok `lang="hu"`, `lang="de"`, `lang="en"` megjelölést kaptak.
- Megmaradt az alapítás éve, a hétfős magyar szerkesztőségi névsor és a podcast hét közreműködője **az átadott 2026.09.30-i szöveg alapján**. A tényleges mai személyi státuszt azonosító dokumentum nélkül nem állapítottuk meg, közzététel előtt ellenőrizendő.
- A német nyelvtan és az angol fogalmazás javítva; az angol `Marcel Mellár` névírás a magyar és német `Marcell Mellár` alakhoz igazítva, ellenőrzendő.
- Az e-mail cím szöveg helyett akadálymentes `mailto:` linket kapott. A robotszűrés/levélszemét szempontjából ez eltér a korábbi `[kukac]/[pont]` megoldástól; ha a szerkesztőség ezt nem szeretné, a szöveg visszaállítható, de a képernyőolvasós érthetőséget érdemes megtartani.
- A bemutatkozás megőrzi a független, tényszerű és kritikus közlekedési szemléletet. A jogi és moderálási részek nyelvileg rövidebbek, egyértelműbbek, a magyar szöveg a meghatározó.
- A német és az angol változat rövidebb összefoglalót tartalmaz a magyar szerzői jogi és moderálási szabályzatról, nem önálló, teljes körű fordítás; teljes többnyelvű jogi dokumentációhoz külön szakfordítás kell.

## Közzététel előtti érdemi ellenőrzés

1. **Szerzői jogi hivatkozás:** az eredeti általános tiltás `Szjt. 36. § (2)`-re hivatkozása pontatlan. A teljes anyag felhasználásának általános engedélyköteles szabályait az Szjt. 16. § (1) rögzíti, míg a 36. § (2) meghatározott napi eseményekhez kapcsolódó gazdasági/politikai témájú cikkek sajátos sajtóbeli továbbközléséről szól. A törvényi szabad felhasználást nem lehet általános impresszumszöveggel kizárni. Az új minta általános tájékoztatása mellett ezért csak a 36. § (2) meghatározott körében tesz tiltakozó nyilatkozatot. Az új szöveget célszerű kiadói jogi kontroll után véglegesíteni.
   - Hivatalos jogszabály: https://njt.jog.gov.hu/jogszabaly/1999-76-00-00
2. **A kiadó és az üzemeltető azonosítása:** a megadott szöveg nem tartalmazza a kiadó/üzemeltető pontos megnevezését, székhelyét vagy más releváns azonosító adatait. Ellenőrizni kell, ki a szolgáltató és az adott tevékenységre pontosan milyen közlési kötelezettségek vonatkoznak. Nem egészítettük ki kitalált szervezeti adatokkal.
   - A szolgáltatói adatszolgáltatás vizsgálatához: https://njt.jog.gov.hu/jogszabaly/2001-108-00-00
   - Sajtótermékek nyilvántartása és háttér: https://nmhh.hu/cikk/187268/Az_internetes_sajtotermekek_nyilvantartasa
3. **Felelős szerkesztő és adatkezelés:** tisztázandó, szükséges-e/hol szerepel a felelős szerkesztő, a médiatörvény szerinti kiadói tájékoztatás és az adott működéshez illeszkedő adatkezelési tájékoztató (például kommentek, kapcsolatfelvétel).
4. **Élő Blogger-teszt:** először külön tesztoldalon importáljuk a `templates/impresszum-regionalbahn.html` változatot. A szerveroldali HTML-átalakítás ellenőrzése csak a Blogger válaszából lehetséges.

## RBTools mentési döntés

Az eredeti HTML fájl letöltése **ajánlott, nem kötelező**. A két elfogadható művelet: (a) letöltés vagy (b) a **„NEM kérem az eredeti HTML mentését”** jelölőnégyzet kifejezett bepipálása. E nélkül a mentés nem indul. A sikeres Blogger-frissítést követően a korábbi döntés törlődik; a következő módosításhoz újra választani kell. Az élő oldalt továbbra is csak külön jóváhagyás, változásütközés-ellenőrzés és szerveroldali visszaellenőrzés után módosítjuk.
