# RBTools

A RegionalBahn belső szerkesztői eszköze: **https://tools.regionalbahn.hu**

## Gyors munkamenet a kollégáknak

### 1. Blogger: csak a képek előkészítése

1. Nyiss egy új Blogger-bejegyzést, egyelőre maradhat piszkozat.
2. Töltsd fel a cikkhez szükséges **összes képet** a Blogger saját képfeltöltőjével.
3. Válts a bejegyzés **HTML-nézetére**.
4. Másold ki a feltöltött képek által létrehozott HTML-kódot. Nem kell a képeket végleges sorrendbe rakni, ezt az RBToolsban lehet megtenni.
5. A Bloggerben ezen a ponton még nem kell elkészíteni a cikk tördelését vagy a képaláírásokat.

### 2. RBTools: Cikkadmin

1. Nyisd meg a **Cikkadmin** fület. Ez az alapértelmezett kezdőoldal.
2. A **Cikkszöveg** mezőbe:
   - illeszd be a Markdown/plain text szöveget, vagy
   - nyiss meg egy **.md, .txt vagy .docx** fájlt.
3. A **Bloggerben feltöltött képek HTML-je** mezőbe illeszd be az előző pontban kimásolt képkódot, majd válaszd a **Képek beolvasása** gombot.
4. A képtárban:
   - állítsd be a képaláírást és a kreditet;
   - jelöld ki a megfelelő képet **főképnek**;
   - a többi képet húzd a vizuális cikkszerkesztő **kék beszúrási sávjaira**.
5. A vizuális szerkesztőben a szöveg közvetlenül módosítható. A blokkok húzással vagy a fel/le gombokkal átrendezhetők.
6. Kijelölt szövegre használható a **félkövér, dőlt, aláhúzott, áthúzott és link** formázás.
7. A **+ Keretes** gombbal RegionalBahn-féle szürke keretes blokk szúrható be. A keretesbe külön kép is húzható a képtárból.
8. A **Végleges Blogger HTML** mező folyamatosan frissül.

### 3. Vissza a Bloggerbe

1. Másold ki a **Blogger-címet** a külön gombbal, és tedd a Blogger címmezőjébe.
2. Másold ki a **Végleges HTML-t**.
3. A Blogger bejegyzés **HTML-nézetében** cseréld le a tartalmat erre a HTML-re.
4. Előnézetben ellenőrizd a tördelést, képeket, képaláírásokat, linkeket és a `<!--more-->` helyét.
5. Ezután mentsd piszkozatként, időzítsd vagy publikáld a szokásos szerkesztőségi rend szerint.

## Meglévő cikk tovább szerkesztése

A Cikkadmin **„Meglévő Blogger-cikk HTML-jének visszatöltése szerkesztésre”** részébe beilleszthető egy korábban elkészített RegionalBahn-cikk HTML-je. Az RBTools megpróbálja visszafejteni a leadet, a főképét, a normál képblokkokat, alcímeket, kereteseket és a szerzői footert, majd ezeket újra szerkeszthető blokkokká alakítja.

A Blogger-cím nem része a bejegyzés HTML-törzsének, ezért azt szükség esetén külön kell megadni.

## Mit nem automatizálunk jelenleg?

A **Blogger-képfeltöltést** továbbra is a Blogger felületén kell elvégezni. Az RBTools statikus GitHub Pages alkalmazás, és a Blogger API ugyan tud bejegyzést létrehozni, módosítani és publikálni, de nincs hozzá egyszerű, önálló Blogger-képfeltöltési API-művelet.

Később külön Google/Blogger OAuth-integrációval automatizálható lehet a **kész cím + HTML piszkozatba küldése vagy meglévő piszkozat frissítése**. A képek feltöltése ettől még külön lépés maradna.

## Technikai háttér

- Publikálás: GitHub Pages
- Branch: `main`
- Egyedi domain: `tools.regionalbahn.hu`
- Az oldal `noindex` meta utasításokat tartalmaz, de a közvetlen URL nyilvánosan elérhető.
