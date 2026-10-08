(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.RBTOOLS_CORRECTOR=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  const LANGS={
    "hu-HU":{short:"HU",label:"Magyar"},
    "de-DE":{short:"DE",label:"Deutsch"},
    "en-GB":{short:"EN",label:"English (UK)"}
  };
  const DEFAULT_DICTIONARY=[
    "RegionalBahn","RBTools","MÁV","MÁV-csoport","MÁV-START","MÁV Személyszállítás",
    "BKK","BKV","BVG","DB","DB InfraGO","ÖBB","ČD","ZSSK","RegioJet","Railjet",
    "ComfortJet","InnoTrans","Stadtbahn","S-Bahn","U-Bahn","Deutschlandticket",
    "Verkehrsverbund","VBB","rbb","ARD","ZDF","HÉV","FLIRT","KISS","Talent"
  ];

  const WORDS={
    "hu-HU":[" a "," az "," és "," hogy "," nem "," egy "," is "," de "," vagy "," van "," volt "," lesz "," illetve "," szerint "," számára "," között "," magyar "," budapest "],
    "de-DE":[" der "," die "," das "," und "," ist "," nicht "," ein "," eine "," auch "," oder "," mit "," für "," von "," im "," auf "," nach "," berlin "],
    "en-GB":[" the "," and "," is "," are "," not "," a "," an "," also "," or "," with "," for "," from "," in "," on "," to "," of "," this "]
  };

  function cleanText(value){
    return String(value??"").replace(/\u00a0/g," ").replace(/\r\n?/g,"\n");
  }
  function normalizeLang(lang){
    const value=String(lang||"").toLowerCase();
    if(value.startsWith("hu"))return "hu-HU";
    if(value.startsWith("de"))return "de-DE";
    if(value.startsWith("en"))return "en-GB";
    return "auto";
  }
  function enabledLanguages(value){
    const raw=Array.isArray(value)?value:Object.keys(LANGS);
    const out=raw.map(normalizeLang).filter(x=>LANGS[x]);
    return out.length?Array.from(new Set(out)):Object.keys(LANGS);
  }
  function detectLanguage(text,{enabled,primary="hu-HU"}={}){
    text=" "+cleanText(text).toLocaleLowerCase("hu-HU")+" ";
    const allowed=enabledLanguages(enabled);
    const fallback=allowed.includes(normalizeLang(primary))?normalizeLang(primary):allowed[0];
    const letters=(text.match(/\p{L}/gu)||[]).length;
    if(letters<5)return fallback;
    const scores={"hu-HU":0,"de-DE":0,"en-GB":0};
    if(/[őűáéíóöü]/i.test(text))scores["hu-HU"]+=3;
    if(/[äöüß]/i.test(text))scores["de-DE"]+=3;
    if(/\b(?:th|wh)[a-z]/i.test(text))scores["en-GB"]+=1;
    for(const lang of allowed){
      for(const token of WORDS[lang])if(text.includes(token))scores[lang]+=1;
    }
    const ranked=allowed.map(lang=>[lang,scores[lang]]).sort((a,b)=>b[1]-a[1]);
    return ranked[0][1]===ranked[1]?.[1]&&ranked[0][1]===0?fallback:ranked[0][0];
  }

  function issue(offset,length,message,replacements,ruleId,severity="error",category="helyesírás"){
    return {offset,length,message,replacements:Array.isArray(replacements)?replacements:[],ruleId,severity,category,source:"local"};
  }
  function addRegex(out,text,re,message,replacement,ruleId,severity="error",category="helyesírás"){
    let m;
    re.lastIndex=0;
    while((m=re.exec(text))){
      const hit=m[1]??m[0],base=m.index+(m[0].indexOf(hit));
      const repl=typeof replacement==="function"?replacement(m):replacement;
      out.push(issue(base,hit.length,message,repl?[repl]:[],ruleId,severity,category));
      if(m[0].length===0)re.lastIndex++;
    }
  }
  function localIssues(input,lang="auto",options={}){
    const text=cleanText(input),primary=normalizeLang(options.primary||"hu-HU");
    lang=normalizeLang(lang);
    if(lang==="auto")lang=detectLanguage(text,{enabled:options.enabled,primary});
    const out=[];

    addRegex(out,text,/ {2,}/g,"Többszörös szóköz.",m=>" ","RB_SPACE_DOUBLE","style","tipográfia");
    addRegex(out,text,/\s+([,.;!?])/g,"Az írásjel előtt fölösleges szóköz van.",m=>m[1],"RB_SPACE_BEFORE_PUNCT","style","tipográfia");
    addRegex(out,text,/\t+/g,"Tabulátor a folyószövegben.",m=>" ","RB_TAB","style","tipográfia");

    if(lang==="hu-HU"){
      const rules=[
        [/\bmindíg\b/giu,"A „mindig” rövid i-vel írandó.","mindig","HU_MINDIG"],
        [/\bmuszály\b/giu,"A helyes alak: muszáj.","muszáj","HU_MUSZAJ"],
        [/\blessz\b/giu,"A helyes alak: lesz.","lesz","HU_LESZ"],
        [/\bhelyesírás\s+ellenőrző\b/giu,"A jelöletlen birtokos összetétel kötőjeles alakja: helyesírás-ellenőrző.","helyesírás-ellenőrző","HU_HELYESIRAS_ELLENORZO"]
      ];
      for(const [re,msg,repl,id] of rules)addRegex(out,text,re,msg,repl,id);
      addRegex(out,text,/\b(20\d{2})\s+(január|február|március|április|május|június|július|augusztus|szeptember|október|november|december)\b/giu,
        "Az évszám után pont kell a magyar keltezésben.",m=>m[1]+". "+m[2],"HU_DATE_YEAR_DOT","warning","dátum");
    }
    if(lang==="de-DE"){
      const rules=[
        [/\bStrasse\b/gu,"Németországi standard szerint: Straße.","Straße","DE_STRASSE"],
        [/\bStandart\b/giu,"A helyes alak: Standard.","Standard","DE_STANDARD"],
        [/\bkennen\s+lernen\b/giu,"A mai standard helyesírásban rendszerint egybeírjuk: kennenlernen.","kennenlernen","DE_KENNENLERNEN"]
      ];
      for(const [re,msg,repl,id] of rules)addRegex(out,text,re,msg,repl,id);
    }
    if(lang==="en-GB"){
      const rules=[
        [/\brecieve\b/giu,"The usual spelling is “receive”.","receive","EN_RECEIVE"],
        [/\bseperate\b/giu,"The usual spelling is “separate”.","separate","EN_SEPARATE"],
        [/\bdefinately\b/giu,"The usual spelling is “definitely”.","definitely","EN_DEFINITELY"]
      ];
      for(const [re,msg,repl,id] of rules)addRegex(out,text,re,msg,repl,id);
      const styles=[
        [/\bcolor\b/giu,"RBTools alapértelmezése brit angol: colour.","colour","EN_GB_COLOUR"],
        [/\bcenter\b/giu,"RBTools alapértelmezése brit angol: centre.","centre","EN_GB_CENTRE"],
        [/\bfavorite\b/giu,"RBTools alapértelmezése brit angol: favourite.","favourite","EN_GB_FAVOURITE"]
      ];
      for(const [re,msg,repl,id] of styles)addRegex(out,text,re,msg,repl,id,"style","en-GB stílus");
    }
    return out.sort((a,b)=>a.offset-b.offset||b.length-a.length).map(x=>({...x,language:lang}));
  }

  function dictionaryKey(value){
    return String(value||"").trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}+-]+$/gu,"").toLocaleLowerCase("hu-HU");
  }
  function dictionarySet(extra=[]){
    return new Set([...DEFAULT_DICTIONARY,...extra].map(dictionaryKey).filter(Boolean));
  }
  function suppressDictionary(issues,text,extra=[]){
    const dict=dictionarySet(extra);
    return (issues||[]).filter(item=>{
      const hit=cleanText(text).slice(item.offset,item.offset+item.length);
      const key=dictionaryKey(hit);
      return !(key&&dict.has(key));
    });
  }

  function languageToolCode(lang){
    lang=normalizeLang(lang);
    return lang==="auto"?"auto":lang;
  }
  function languageToolBody(text,lang){
    const body=new URLSearchParams();
    body.set("text",cleanText(text));
    body.set("language",languageToolCode(lang));
    if(normalizeLang(lang)==="en-GB")body.set("preferredVariants","en-GB");
    return body;
  }
  function fromLanguageTool(match,lang){
    return {
      offset:Number(match?.offset)||0,
      length:Number(match?.length)||0,
      message:String(match?.message||"LanguageTool-javaslat"),
      replacements:Array.isArray(match?.replacements)?match.replacements.slice(0,8).map(x=>String(x?.value||"")).filter(Boolean):[],
      ruleId:String(match?.rule?.id||"LT"),
      severity:match?.rule?.issueType==="misspelling"?"error":"warning",
      category:String(match?.rule?.category?.name||"LanguageTool"),
      language:normalizeLang(lang)==="auto"?"auto":normalizeLang(lang),
      source:"languagetool"
    };
  }

  function lookupUrls(term,lang){
    const q=encodeURIComponent(String(term||"").trim());
    lang=normalizeLang(lang);
    if(lang==="hu-HU")return {
      spelling:"https://helyesiras.mta.hu/helyesiras/default/suggest?q="+q,
      compound:"https://helyesiras.mta.hu/helyesiras/default/kulegy?q="+q,
      rules:"https://helyesiras.mta.hu/helyesiras/default/akh12"
    };
    if(lang==="de-DE")return {dictionary:"https://www.duden.de/suchen/dudenonline/"+q};
    return {};
  }

  function context(text,offset,length,radius=42){
    text=cleanText(text);offset=Math.max(0,Number(offset)||0);length=Math.max(0,Number(length)||0);
    const a=Math.max(0,offset-radius),b=Math.min(text.length,offset+length+radius);
    return (a?"…":"")+text.slice(a,b)+(b<text.length?"…":"");
  }

  return {
    LANGS,DEFAULT_DICTIONARY,cleanText,normalizeLang,enabledLanguages,detectLanguage,
    localIssues,dictionaryKey,dictionarySet,suppressDictionary,languageToolCode,
    languageToolBody,fromLanguageTool,lookupUrls,context
  };
});
