"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const C=require(path.join(__dirname,"..","corrector-core.js"));

assert.equal(C.normalizeLang("hu"),"hu-HU");
assert.equal(C.normalizeLang("de-DE"),"de-DE");
assert.equal(C.normalizeLang("en-US"),"en-GB");
assert.equal(C.detectLanguage("A vonat ma is pontosan érkezett Budapestre.",{enabled:["hu-HU","de-DE","en-GB"],primary:"hu-HU"}),"hu-HU");
assert.equal(C.detectLanguage("Der Zug fährt heute pünktlich nach Berlin.",{enabled:["hu-HU","de-DE","en-GB"],primary:"hu-HU"}),"de-DE");
assert.equal(C.detectLanguage("The train arrives at the station on time.",{enabled:["hu-HU","de-DE","en-GB"],primary:"hu-HU"}),"en-GB");

const hu=C.localIssues("Ez mindíg így lessz. A helyesírás ellenőrző segít.", "hu-HU");
assert.ok(hu.some(x=>x.ruleId==="HU_MINDIG"&&x.replacements[0]==="mindig"));
assert.ok(hu.some(x=>x.ruleId==="HU_LESZ"&&x.replacements[0]==="lesz"));
assert.ok(hu.some(x=>x.ruleId==="HU_HELYESIRAS_ELLENORZO"&&x.replacements[0]==="helyesírás-ellenőrző"));

const de=C.localIssues("Die Strasse hat einen Standart. Wir wollen es kennen lernen.","de-DE");
assert.ok(de.some(x=>x.ruleId==="DE_STRASSE"));
assert.ok(de.some(x=>x.ruleId==="DE_STANDARD"));
assert.ok(de.some(x=>x.ruleId==="DE_KENNENLERNEN"));

const en=C.localIssues("My favorite color is blue, but I recieve updates.","en-GB");
assert.ok(en.some(x=>x.ruleId==="EN_GB_FAVOURITE"&&x.severity==="style"));
assert.ok(en.some(x=>x.ruleId==="EN_GB_COLOUR"&&x.severity==="style"));
assert.ok(en.some(x=>x.ruleId==="EN_RECEIVE"&&x.severity==="error"));

const generic=C.localIssues("Egy  mondat , hibás térközzel.","hu-HU");
assert.ok(generic.some(x=>x.ruleId==="RB_SPACE_DOUBLE"));
assert.ok(generic.some(x=>x.ruleId==="RB_SPACE_BEFORE_PUNCT"));

assert.ok(C.dictionarySet([]).has(C.dictionaryKey("ComfortJet")));
const fake=[{offset:0,length:"ComfortJet".length,ruleId:"X"}];
assert.equal(C.suppressDictionary(fake,"ComfortJet",[]).length,0);
assert.equal(C.suppressDictionary(fake,"MásikSzó",[]).length,1);

const body=C.languageToolBody("British colour","en-GB");
assert.equal(body.get("language"),"en-GB");
assert.equal(body.get("preferredVariants"),"en-GB");
const lt=C.fromLanguageTool({offset:2,length:4,message:"Test",replacements:[{value:"good"}],rule:{id:"RULE",issueType:"misspelling",category:{name:"Typos"}}},"en-GB");
assert.equal(lt.source,"languagetool");
assert.equal(lt.severity,"error");
assert.deepEqual(lt.replacements,["good"]);

const huLinks=C.lookupUrls("helyesírás ellenőrző","hu-HU");
assert.match(huLinks.spelling,/helyesiras\.mta\.hu/);
assert.match(huLinks.compound,/kulegy/);
assert.match(huLinks.rules,/akh12/);
assert.match(C.lookupUrls("Straße","de-DE").dictionary,/duden\.de/);

console.log("Three-language corrector core: PASS");
