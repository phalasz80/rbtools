/* Regional catalogue: ISO 3166-2 names are labels, API codes are verified at runtime. */
export const COUNTRIES = [
 {code:'DE',name:'Németország',language:'DE',zone:'Europe/Berlin',lat:51.2,lon:10.5,source:'open'},
 {code:'AT',name:'Ausztria',language:'DE',zone:'Europe/Vienna',lat:47.5,lon:14.5,source:'open'},
 {code:'CH',name:'Svájc',language:'DE',zone:'Europe/Zurich',lat:46.8,lon:8.2,source:'open'},
 {code:'FR',name:'Franciaország',language:'FR',zone:'Europe/Paris',lat:46.6,lon:2.2,source:'open'},
 {code:'HU',name:'Magyarország',language:'HU',zone:'Europe/Budapest',lat:47.2,lon:19.5,source:'open'},
 {code:'CZ',name:'Csehország',language:'CS',zone:'Europe/Prague',lat:49.8,lon:15.5,source:'open'},
 {code:'SK',name:'Szlovákia',language:'SK',zone:'Europe/Bratislava',lat:48.7,lon:19.7,source:'open'},
 {code:'GB',name:'Egyesült Királyság',language:'EN',zone:'Europe/London',lat:54,lon:-2.5,source:'uk'}
];
const rawRegions = {
 DE:`DE-BW|Baden-Württemberg;DE-BY|Bayern;DE-BE|Berlin;DE-BB|Brandenburg;DE-HB|Bremen;DE-HH|Hamburg;DE-HE|Hessen;DE-MV|Mecklenburg-Vorpommern;DE-NI|Niedersachsen;DE-NW|Nordrhein-Westfalen;DE-RP|Rheinland-Pfalz;DE-SL|Saarland;DE-SN|Sachsen;DE-ST|Sachsen-Anhalt;DE-SH|Schleswig-Holstein;DE-TH|Thüringen`,
 AT:`AT-1|Burgenland;AT-2|Kärnten;AT-3|Niederösterreich;AT-4|Oberösterreich;AT-5|Salzburg;AT-6|Steiermark;AT-7|Tirol;AT-8|Vorarlberg;AT-9|Wien`,
 CH:`CH-AG|Aargau;CH-AI|Appenzell Innerrhoden;CH-AR|Appenzell Ausserrhoden;CH-BE|Bern;CH-BL|Basel-Landschaft;CH-BS|Basel-Stadt;CH-FR|Fribourg;CH-GE|Genève;CH-GL|Glarus;CH-GR|Graubünden;CH-JU|Jura;CH-LU|Luzern;CH-NE|Neuchâtel;CH-NW|Nidwalden;CH-OW|Obwalden;CH-SG|St. Gallen;CH-SH|Schaffhausen;CH-SO|Solothurn;CH-SZ|Schwyz;CH-TG|Thurgau;CH-TI|Ticino;CH-UR|Uri;CH-VD|Vaud;CH-VS|Valais;CH-ZG|Zug;CH-ZH|Zürich`,
 FR:`FR-ARA|Auvergne-Rhône-Alpes;FR-BFC|Bourgogne-Franche-Comté;FR-BRE|Bretagne;FR-CVL|Centre-Val de Loire;FR-COR|Corse;FR-GES|Grand Est;FR-HDF|Hauts-de-France;FR-IDF|Île-de-France;FR-NOR|Normandie;FR-NAQ|Nouvelle-Aquitaine;FR-OCC|Occitanie;FR-PDL|Pays de la Loire;FR-PAC|Provence-Alpes-Côte d'Azur`,
 HU:`HU-BU|Budapest;HU-BK|Bács-Kiskun;HU-BA|Baranya;HU-BE|Békés;HU-BZ|Borsod-Abaúj-Zemplén;HU-CS|Csongrád-Csanád;HU-FE|Fejér;HU-GS|Győr-Moson-Sopron;HU-HB|Hajdú-Bihar;HU-HE|Heves;HU-JN|Jász-Nagykun-Szolnok;HU-KE|Komárom-Esztergom;HU-NO|Nógrád;HU-PE|Pest;HU-SO|Somogy;HU-SZ|Szabolcs-Szatmár-Bereg;HU-TO|Tolna;HU-VA|Vas;HU-VE|Veszprém;HU-ZA|Zala`,
 CZ:`CZ-10|Praha;CZ-20|Středočeský kraj;CZ-31|Jihočeský kraj;CZ-32|Plzeňský kraj;CZ-41|Karlovarský kraj;CZ-42|Ústecký kraj;CZ-51|Liberecký kraj;CZ-52|Královéhradecký kraj;CZ-53|Pardubický kraj;CZ-63|Kraj Vysočina;CZ-64|Jihomoravský kraj;CZ-71|Olomoucký kraj;CZ-72|Zlínský kraj;CZ-80|Moravskoslezský kraj`,
 SK:`SK-BC|Banskobystrický kraj;SK-BL|Bratislavský kraj;SK-KI|Košický kraj;SK-NI|Nitriansky kraj;SK-PV|Prešovský kraj;SK-TA|Trnavský kraj;SK-TC|Trenčiansky kraj;SK-ZI|Žilinský kraj`,
 GB:`GB-EAW|Anglia és Wales;GB-SCT|Skócia;GB-NIR|Észak-Írország`
};
export const REGIONS = Object.fromEntries(Object.entries(rawRegions).map(([country,s])=>[country,s.split(';').map(record=>{const [code,name]=record.split('|');return {code,name};})]));
// Format: name|country subregion|latitude|longitude. City presets are not proof of local holiday coverage.
const rawCities = {
 DE:`Berlin|DE-BE|52.520|13.405;Hamburg|DE-HH|53.551|9.993;München|DE-BY|48.137|11.575;Augsburg|DE-BY|48.370|10.898;Nürnberg|DE-BY|49.454|11.078;Regensburg|DE-BY|49.013|12.101;Würzburg|DE-BY|49.793|9.935;Bamberg|DE-BY|49.891|10.892;Passau|DE-BY|48.574|13.456;Köln|DE-NW|50.938|6.960;Düsseldorf|DE-NW|51.227|6.774;Essen|DE-NW|51.456|7.012;Dortmund|DE-NW|51.514|7.468;Duisburg|DE-NW|51.434|6.762;Bochum|DE-NW|51.481|7.216;Bonn|DE-NW|50.737|7.098;Wuppertal|DE-NW|51.256|7.151;Münster|DE-NW|51.961|7.626;Bielefeld|DE-NW|52.021|8.533;Aachen|DE-NW|50.775|6.083;Frankfurt am Main|DE-HE|50.110|8.682;Wiesbaden|DE-HE|50.082|8.241;Darmstadt|DE-HE|49.872|8.650;Kassel|DE-HE|51.312|9.479;Stuttgart|DE-BW|48.776|9.182;Karlsruhe|DE-BW|49.006|8.404;Mannheim|DE-BW|49.488|8.467;Heidelberg|DE-BW|49.398|8.673;Freiburg|DE-BW|47.999|7.842;Ulm|DE-BW|48.398|9.991;Leipzig|DE-SN|51.340|12.373;Dresden|DE-SN|51.050|13.738;Chemnitz|DE-SN|50.832|12.925;Görlitz|DE-SN|51.156|14.989;Magdeburg|DE-ST|52.120|11.628;Halle (Saale)|DE-ST|51.482|11.970;Erfurt|DE-TH|50.984|11.029;Jena|DE-TH|50.927|11.586;Weimar|DE-TH|50.980|11.326;Bremen|DE-HB|53.075|8.807;Bremerhaven|DE-HB|53.540|8.580;Hannover|DE-NI|52.376|9.738;Braunschweig|DE-NI|52.269|10.526;Wolfsburg|DE-NI|52.424|10.787;Oldenburg|DE-NI|53.143|8.214;Osnabrück|DE-NI|52.280|8.047;Göttingen|DE-NI|51.541|9.915;Kiel|DE-SH|54.323|10.139;Lübeck|DE-SH|53.865|10.687;Flensburg|DE-SH|54.784|9.436;Rostock|DE-MV|54.092|12.099;Schwerin|DE-MV|53.635|11.402;Stralsund|DE-MV|54.309|13.082;Potsdam|DE-BB|52.400|13.059;Cottbus|DE-BB|51.760|14.334;Frankfurt (Oder)|DE-BB|52.341|14.553;Mainz|DE-RP|50.000|8.271;Koblenz|DE-RP|50.357|7.589;Trier|DE-RP|49.749|6.638;Kaiserslautern|DE-RP|49.444|7.768;Saarbrücken|DE-SL|49.234|7.000`,
 AT:`Wien|AT-9|48.208|16.373;Graz|AT-6|47.070|15.439;Linz|AT-4|48.307|14.286;Salzburg|AT-5|47.800|13.044;Innsbruck|AT-7|47.269|11.404;Klagenfurt|AT-2|46.624|14.306;Villach|AT-2|46.610|13.855;St. Pölten|AT-3|48.205|15.626;Wiener Neustadt|AT-3|47.812|16.242;Eisenstadt|AT-1|47.846|16.525;Bregenz|AT-8|47.503|9.747;Dornbirn|AT-8|47.413|9.741;Wels|AT-4|48.158|14.025;Steyr|AT-4|48.042|14.421;Leoben|AT-6|47.383|15.091`,
 CH:`Zürich|CH-ZH|47.377|8.542;Winterthur|CH-ZH|47.499|8.726;Bern|CH-BE|46.948|7.447;Biel/Bienne|CH-BE|47.137|7.247;Basel|CH-BS|47.560|7.590;Genève|CH-GE|46.204|6.143;Lausanne|CH-VD|46.520|6.633;Montreux|CH-VD|46.431|6.910;Luzern|CH-LU|47.051|8.306;St. Gallen|CH-SG|47.424|9.377;Chur|CH-GR|46.853|9.530;Davos|CH-GR|46.802|9.836;Lugano|CH-TI|46.003|8.951;Bellinzona|CH-TI|46.194|9.024;Locarno|CH-TI|46.168|8.797;Fribourg|CH-FR|46.806|7.162;Neuchâtel|CH-NE|46.989|6.929;Schaffhausen|CH-SH|47.696|8.634;Solothurn|CH-SO|47.208|7.537;Aarau|CH-AG|47.393|8.045;Baden|CH-AG|47.473|8.307;Zug|CH-ZG|47.168|8.516;Sion|CH-VS|46.233|7.360;Brig|CH-VS|46.317|7.987;Thun|CH-BE|46.759|7.628`,
 FR:`Paris|FR-IDF|48.857|2.352;Versailles|FR-IDF|48.805|2.130;Lyon|FR-ARA|45.764|4.835;Grenoble|FR-ARA|45.188|5.724;Saint-Étienne|FR-ARA|45.439|4.387;Marseille|FR-PAC|43.297|5.370;Nice|FR-PAC|43.703|7.266;Toulon|FR-PAC|43.124|5.928;Lille|FR-HDF|50.629|3.057;Amiens|FR-HDF|49.894|2.296;Strasbourg|FR-GES|48.584|7.750;Metz|FR-GES|49.119|6.176;Nancy|FR-GES|48.693|6.184;Reims|FR-GES|49.258|4.032;Bordeaux|FR-NAQ|44.837|-0.580;Limoges|FR-NAQ|45.833|1.261;Poitiers|FR-NAQ|46.581|0.340;Toulouse|FR-OCC|43.604|1.444;Montpellier|FR-OCC|43.611|3.877;Perpignan|FR-OCC|42.688|2.895;Nantes|FR-PDL|47.218|-1.553;Angers|FR-PDL|47.473|-0.551;Rennes|FR-BRE|48.117|-1.678;Brest|FR-BRE|48.391|-4.486;Rouen|FR-NOR|49.443|1.099;Le Havre|FR-NOR|49.493|0.108;Caen|FR-NOR|49.183|-0.370;Dijon|FR-BFC|47.323|5.041;Besançon|FR-BFC|47.238|6.024;Orléans|FR-CVL|47.903|1.909;Tours|FR-CVL|47.394|0.684;Ajaccio|FR-COR|41.919|8.738;Bastia|FR-COR|42.698|9.450`,
 HU:`Budapest|HU-BU|47.498|19.040;Debrecen|HU-HB|47.532|21.628;Szeged|HU-CS|46.254|20.148;Pécs|HU-BA|46.072|18.233;Miskolc|HU-BZ|48.104|20.791;Győr|HU-GS|47.687|17.635;Nyíregyháza|HU-SZ|47.956|21.717;Kecskemét|HU-BK|46.907|19.692;Székesfehérvár|HU-FE|47.186|18.422;Szombathely|HU-VA|47.231|16.622;Szolnok|HU-JN|47.174|20.176;Tatabánya|HU-KE|47.569|18.404;Kaposvár|HU-SO|46.359|17.797;Veszprém|HU-VE|47.093|17.911;Zalaegerszeg|HU-ZA|46.842|16.842;Békéscsaba|HU-BE|46.674|21.087;Eger|HU-HE|47.903|20.373;Sopron|HU-GS|47.682|16.590;Siófok|HU-SO|46.910|18.055;Esztergom|HU-KE|47.786|18.741`,
 CZ:`Praha|CZ-10|50.076|14.438;Brno|CZ-64|49.195|16.608;Ostrava|CZ-80|49.820|18.263;Plzeň|CZ-32|49.738|13.374;Liberec|CZ-51|50.767|15.056;Olomouc|CZ-71|49.594|17.251;České Budějovice|CZ-31|48.975|14.474;Hradec Králové|CZ-52|50.210|15.832;Pardubice|CZ-53|50.034|15.781;Zlín|CZ-72|49.226|17.666;Karlovy Vary|CZ-41|50.231|12.871;Ústí nad Labem|CZ-42|50.660|14.042;Jihlava|CZ-63|49.396|15.591;Kladno|CZ-20|50.147|14.103;Mladá Boleslav|CZ-20|50.413|14.904;Děčín|CZ-42|50.773|14.212`,
 SK:`Bratislava|SK-BL|48.149|17.108;Košice|SK-KI|48.716|21.262;Prešov|SK-PV|48.999|21.240;Žilina|SK-ZI|49.223|18.740;Nitra|SK-NI|48.306|18.086;Trnava|SK-TA|48.378|17.588;Trenčín|SK-TC|48.894|18.044;Banská Bystrica|SK-BC|48.738|19.153;Martin|SK-ZI|49.065|18.922;Poprad|SK-PV|49.054|20.297;Zvolen|SK-BC|48.574|19.154;Komárno|SK-NI|47.764|18.129;Nové Zámky|SK-NI|47.986|18.162`,
 GB:`London|GB-EAW|51.507|-0.128;Birmingham|GB-EAW|52.486|-1.891;Manchester|GB-EAW|53.480|-2.243;Liverpool|GB-EAW|53.408|-2.991;Leeds|GB-EAW|53.801|-1.549;Sheffield|GB-EAW|53.382|-1.470;Bristol|GB-EAW|51.455|-2.588;Oxford|GB-EAW|51.752|-1.256;Cambridge|GB-EAW|52.205|0.122;Newcastle upon Tyne|GB-EAW|54.979|-1.614;Nottingham|GB-EAW|52.954|-1.159;Southampton|GB-EAW|50.909|-1.404;Cardiff|GB-EAW|51.482|-3.179;Swansea|GB-EAW|51.621|-3.943;Edinburgh|GB-SCT|55.953|-3.188;Glasgow|GB-SCT|55.864|-4.252;Aberdeen|GB-SCT|57.150|-2.095;Dundee|GB-SCT|56.462|-2.970;Inverness|GB-SCT|57.478|-4.224;Belfast|GB-NIR|54.597|-5.930;Derry/Londonderry|GB-NIR|54.997|-7.309`
};
export const CITIES = Object.entries(rawCities).flatMap(([country,raw])=>raw.split(';').map(record=>{
 const [name,subdivision,lat,lon]=record.split('|');
 const id=(country+'-'+name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
 return {id,name,country,subdivision,lat:Number(lat),lon:Number(lon)};
}));
export function countryMeta(code){return COUNTRIES.find(x=>x.code===code)||null;}
export function regionName(country,code){return REGIONS[country]?.find(x=>x.code===code)?.name||code;}
export function normalizeLabel(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function apiSubdivisionOptions(payload){
 const result=[],seen=new Set();
 function walk(nodes,parent=''){
  for(const x of nodes||[]){if(!x?.code)continue;
   const name=Array.isArray(x.name)?x.name.find(v=>v.language==='EN')?.text||x.name.find(v=>v.language==='DE')?.text||x.name[0]?.text:x.name;
   if(!seen.has(x.code)){result.push({code:x.code,name:String(name||x.code),parent});seen.add(x.code);}
   walk(x.children,x.code);
  }
 }walk(payload);return result;
}
export function matchRemoteRegion(city,options){
 if(!city)return '';
 if(options.some(r=>r.code===city.subdivision))return city.subdivision;
 const region=regionName(city.country,city.subdivision),normalized=normalizeLabel(region);
 const alias={
  'AT-1':['burgenland'],'AT-2':['karnten','carinthia'],'AT-3':['niederosterreich','lower austria'],
  'AT-4':['oberosterreich','upper austria'],'AT-5':['salzburg'],'AT-6':['steiermark','styria'],
  'AT-7':['tirol','tyrol'],'AT-8':['vorarlberg'],'AT-9':['wien','vienna']
 };
 const choices=[normalized,...(alias[city.subdivision]||[])].map(normalizeLabel);
 const found=options.filter(r=>choices.includes(normalizeLabel(r.name)));
 if(found.length===1)return found[0].code;
 if(city.country==='FR'){
  const citySpecific=options.filter(r=>normalizeLabel(r.name)===normalizeLabel(city.name));
  if(citySpecific.length===1)return citySpecific[0].code;
  const zone={'FR-IDF':'FR-ZC','FR-ARA':'FR-ZA','FR-BFC':'FR-ZA','FR-NAQ':'FR-ZA',
   'FR-HDF':'FR-ZB','FR-GES':'FR-ZB','FR-NOR':'FR-ZB','FR-PDL':'FR-ZB','FR-BRE':'FR-ZB',
   'FR-CVL':'FR-ZB','FR-PAC':'FR-ZB','FR-OCC':'FR-ZC'}[city.subdivision];
  if(zone&&options.some(r=>r.code===zone))return zone;
 }
 return '';
}
export function codepageFor(country){return ['HU','CZ','SK'].includes(country)?'1250':'1252';}
