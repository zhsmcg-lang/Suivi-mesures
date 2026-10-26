/* Suivi Canaverier du SMCG. Charger après app.js et dce.js. */
(() => {
  "use strict";
  const JOUR = 86400000;
  const definitions = [
    { id:"salinite",colonne:"Salinite_pour_mille",nom:"Salinité",unite:"‰",carte:"Salinité" },
    { id:"temperature",colonne:"Temperature_C",nom:"Température",unite:"°C",carte:"Température" },
    { id:"conductivite",colonne:"Conductivite_mS_cm",nom:"Conductivité",unite:"mS/cm",carte:"Conductivité" },
    { id:"hauteur",colonne:"Hauteur_eau_m_NGF",nom:"Niveau d’eau NGF",unite:"m NGF",carte:"Hauteur d’eau" }
  ];
  const nombre=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:3});
  const dateCourte=new Intl.DateTimeFormat("fr-FR",{dateStyle:"short",timeZone:"UTC"});
  const moisAnnee=new Intl.DateTimeFormat("fr-FR",{month:"short",year:"numeric",timeZone:"UTC"});
  const nomsMois=["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."];
  const normaliser=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const creer=(tag,texte,classe)=>{const e=document.createElement(tag);if(texte!==undefined)e.textContent=texte;if(classe)e.className=classe;return e;};
  const moisNumero=t=>{const d=new Date(t);return d.getUTCFullYear()*12+d.getUTCMonth();};
  const milieuMois=n=>Date.UTC(Math.floor(n/12),n%12,15);
  const jourISO=t=>new Date(t).toISOString().slice(0,10);
  const libelleType=t=>t==="Limnimétrique"?"limnimétrie":"piézométrie";
  let donnees=[],points=[],ui=null,dernierLien="",pointAbsent="";
  const graphiques=new Map(),modes=new Map();
  function nombreCSV(texte,contexte){
    const s=String(texte??"").trim();if(!s)return null;
    if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s))throw new Error("Valeur invalide "+contexte+" : « "+s+" ».");
    const n=Number(s.replace(",","."));if(!Number.isFinite(n))throw new Error("Valeur non finie "+contexte+".");return n;
  }
  function dateCSV(texte){
    const m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(texte??"").trim());if(!m)return null;
    const t=Date.UTC(+m[3],+m[2]-1,+m[1]),d=new Date(t);
    return d.getUTCFullYear()===+m[3]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[1]?t:null;
  }
  function lireDonnees(texte){
    if(typeof Papa==="undefined")throw new Error("L’outil de lecture CSV n’est pas chargé.");
    const lecture=Papa.parse(texte.replace(/^\uFEFF/,""),{header:true,delimiter:";",skipEmptyLines:"greedy",transformHeader:h=>h.trim()});
    if(lecture.errors.length)throw new Error("Une ligne du CSV Canaverier est mal formée.");
    for(const h of ["Date","Type_suivi","Station","Identifiant_station","Longitude_WGS84","Latitude_WGS84",...definitions.map(p=>p.colonne)])if(!lecture.meta.fields?.includes(h))throw new Error("Colonne manquante : "+h+".");
    const vus=new Set(),identites=new Map(),resultat=[];
    for(const [index,r]of lecture.data.entries()){
      const ligne=index+2,id=String(r.Identifiant_station||"").trim(),type=String(r.Type_suivi||"").trim(),station=String(r.Station||"").trim();
      // Les deux mares sont exclusivement limnimétriques dans ce portail.
      if(type==="Piézométrique"&&(["CP06","CP07"].includes(id)||["mare nord","mare sud"].includes(normaliser(station))))continue;
      const date=dateCSV(r.Date);
      if(!id||!station||!["Limnimétrique","Piézométrique"].includes(type)||date===null)throw new Error("Identification ou date invalide, ligne "+ligne+".");
      const longitude=nombreCSV(r.Longitude_WGS84,ligne),latitude=nombreCSV(r.Latitude_WGS84,ligne);
      if(longitude===null||latitude===null||Math.abs(longitude)>180||Math.abs(latitude)>90)throw new Error("Coordonnées absentes ou invalides, ligne "+ligne+".");
      const identite=JSON.stringify([station,type,longitude,latitude]);
      if(identites.has(id)&&identites.get(id)!==identite)throw new Error("Le point « "+id+" » change de nom, de type ou de coordonnées dans le CSV.");identites.set(id,identite);
      const cle=JSON.stringify([id,date]);if(vus.has(cle))throw new Error("Relevé en double pour « "+station+" », le "+r.Date+".");vus.add(cle);
      const valeurs=Object.fromEntries(definitions.map(p=>[p.id,nombreCSV(r[p.colonne],p.nom+", ligne "+ligne)]));
      resultat.push({id,station,type,date,numeroMois:moisNumero(date),annee:new Date(date).getUTCFullYear(),longitude,latitude,valeurs,controle:String(r.Controle||"").trim()});
    }
    return resultat.sort((a,b)=>a.date-b.date||a.id.localeCompare(b.id));
  }
  function regrouperPoints(releves){
    const groupes=new Map();for(const r of releves){if(!groupes.has(r.id))groupes.set(r.id,[]);groupes.get(r.id).push(r);}
    return [...groupes].map(([id,groupe])=>{const r=groupe.at(-1);return{id,nom:r.station+" — "+libelleType(r.type),nomCourt:r.station,typeSuivi:r.type,
      latitude:r.latitude,longitude:r.longitude,structure:"SMCG",suivi:"CANAVERIER",teletransmission:false,
      parametres:definitions.filter(p=>groupe.some(m=>m.valeurs[p.id]!==null)).map(p=>p.carte),annees:[...new Set(groupe.map(m=>m.annee))].sort((a,b)=>a-b),debut:groupe[0].date,fin:groupe.at(-1).date};}).sort((a,b)=>a.nom.localeCompare(b.nom,"fr"));
  }
  function caseACocher(nom,valeur,texte,coche){const label=creer("label"),input=creer("input");input.type="checkbox";input.name=nom;input.value=valeur;input.checked=coche;label.append(input,creer("span",texte));return label;}
  function champ(tag,id,label,type){const parent=creer("label"),input=creer(tag);input.id=id;if(type)input.type=type;parent.append(creer("span",label),input);return{parent,input};}
  function option(select,valeur,texte){const e=creer("option",texte);e.value=valeur;select.append(e);}
  function preparerInterface(){
    const etudes=document.getElementById("analyses-complementaires");if(!etudes||document.getElementById("analyse-canaverier"))return;
    const panneau=creer("details",undefined,"panneau-canaverier bloc-etude-repliable");panneau.id="analyse-canaverier";
    panneau.append(creer("summary","Suivi Canaverier"),creer("p","Relevés du SMCG sur les eaux de surface (limnimétrie) et la nappe (piézométrie). Les deux suivis restent identifiés séparément. Mare Nord et Mare Sud sont présentées uniquement en limnimétrie."));
    const controles=creer("fieldset",undefined,"commandes-canaverier");controles.disabled=true;controles.append(creer("legend","Choisir les mesures"));
    const ligne=creer("div",undefined,"ligne-filtres-canaverier");
    const type=champ("select","type-canaverier","Type de suivi"),vue=champ("select","vue-canaverier","Présentation");
    option(type.input,"Limnimétrique","Limnimétrie — eaux de surface");option(type.input,"Piézométrique","Piézométrie — nappe");option(type.input,"","Les deux suivis");
    option(vue.input,"chronologie","Évolution dans le temps");option(vue.input,"annees","Comparer les années d’une station");
    const debut=champ("input","debut-canaverier","Du","date"),fin=champ("input","fin-canaverier","Au","date");
    ligne.append(type.parent,vue.parent,debut.parent,fin.parent);controles.append(ligne);
    const choixStations=creer("details",undefined,"selection-stations-canaverier"),resumeStations=creer("summary","Stations à comparer");choixStations.append(resumeStations);
    const recherche=champ("input","recherche-canaverier","Rechercher une station","search");recherche.input.placeholder="Ex. : mare, bourgidou, étang…";recherche.parent.className="recherche-canaverier";
    const actions=creer("div",undefined,"outils-canaverier"),cocher=creer("button","Cocher les stations visibles"),decocher=creer("button","Tout décocher");
    for(const b of [cocher,decocher])b.type="button";actions.append(cocher,decocher);
    const stationsZone=creer("div",undefined,"cases-canaverier");stationsZone.id="stations-canaverier";
    choixStations.append(recherche.parent,actions,stationsZone,creer("p","La recherche n’efface pas les stations déjà cochées.","aide-canaverier"));
    const stationAnnuelle=champ("select","station-annuelle-canaverier","Station pour la comparaison annuelle");stationAnnuelle.parent.hidden=true;
    const anneesBox=creer("fieldset");anneesBox.hidden=true;const anneesZone=creer("div",undefined,"cases-canaverier");anneesZone.id="annees-canaverier";anneesBox.append(creer("legend","Années à superposer"),anneesZone);
    const paramBox=creer("fieldset"),parametres=creer("div",undefined,"cases-canaverier");paramBox.append(creer("legend","Paramètres à afficher"),parametres);
    for(const p of definitions)parametres.append(caseACocher("parametre-canaverier",p.id,p.nom+" ("+p.unite+")",p.id==="salinite"));
    const verification=caseACocher("inclure-verifications-canaverier","oui","Inclure les conductivités encore signalées comme étant à vérifier",false),inclure=verification.querySelector("input");inclure.id="inclure-verifications-canaverier";
    const reset=creer("button","Réinitialiser la sélection Canaverier");reset.type="button";
    controles.append(choixStations,stationAnnuelle.parent,anneesBox,paramBox,verification,reset);
    const message=creer("p","Chargement des relevés Canaverier…");message.id="message-canaverier";message.setAttribute("role","status");message.setAttribute("aria-live","polite");
    const aide=creer("p","Un graphique par paramètre. Les mois sans mesure interrompent les lignes ; les points disponibles restent visibles. Les niveaux NGF et les vrais zéros sont conservés. Une case vide ne vaut pas zéro.","aide-canaverier");
    const notes=creer("details",undefined,"notes-canaverier");notes.hidden=true;notes.append(creer("summary","Informations sur les mesures sélectionnées"));const notesListe=creer("ul");notes.append(notesListe);
    const zone=creer("div");zone.id="courbes-canaverier";panneau.append(controles,message,aide,notes,zone);etudes.append(panneau);
    ui={etudes,panneau,controles,type:type.input,vue:vue.input,debut:debut.input,fin:fin.input,stations:stationsZone,choixStations,resumeStations,recherche:recherche.input,stationAnnuelle:stationAnnuelle.input,stationAnnuelleLabel:stationAnnuelle.parent,anneesBox,annees:anneesZone,parametres,inclure,verification,message,zone,notes,notesListe};
    controles.addEventListener("change",()=>{pointAbsent="";},true);
    controles.addEventListener("input",()=>{pointAbsent="";},true);
    type.input.addEventListener("change",()=>{remplirStations(true);remplirAnnees();actualiser();});
    stationAnnuelle.input.addEventListener("change",()=>{remplirAnnees();actualiser();});
    vue.input.addEventListener("change",()=>{remplirPresentation();actualiser();});
    controles.addEventListener("change",e=>{if(![ui.type,ui.vue,ui.stationAnnuelle].includes(e.target))actualiser();});
    for(const input of [ui.debut,ui.fin])input.addEventListener("input",actualiser);
    recherche.input.addEventListener("input",rechercher);
    cocher.addEventListener("click",()=>{pointAbsent="";ui.stations.querySelectorAll("label").forEach(l=>{if(!l.hidden)l.querySelector("input").checked=true;});actualiser();});
    decocher.addEventListener("click",()=>{pointAbsent="";pointAbsent="";ui.stations.querySelectorAll("input").forEach(c=>{c.checked=false;});actualiser();});
    reset.addEventListener("click",()=>{pointAbsent="";initialiserControles();modes.clear();dernierLien="";actualiser();});
    panneau.addEventListener("toggle",()=>{if(panneau.open)requestAnimationFrame(actualiser);});
  }
  function pointsDuType(){return points.filter(p=>!ui.type.value||p.typeSuivi===ui.type.value);}
  function remplirStations(nouvelleSelection){
    const anciens=new Set(Array.from(ui.stations.querySelectorAll("input:checked"),c=>c.value));
    const defauts=new Set(ui.type.value==="Piézométrique"?["CP01","CP02","CP03","CP04","CP05"]:["CL01","CL04","CL06","CL07"]),ancienneAnnuelle=ui.stationAnnuelle.value;
    ui.stations.replaceChildren();ui.stationAnnuelle.replaceChildren();
    for(const p of pointsDuType()){ui.stations.append(caseACocher("station-canaverier",p.id,p.nom,nouvelleSelection?defauts.has(p.id):anciens.has(p.id)));option(ui.stationAnnuelle,p.id,p.nom);}
    ui.stationAnnuelle.value=pointsDuType().some(p=>p.id===ancienneAnnuelle)?ancienneAnnuelle:pointsDuType().some(p=>p.id==="CL07")?"CL07":(pointsDuType()[0]?.id||"");rechercher();
  }
  function rechercher(){const mots=normaliser(ui.recherche.value).split(/\s+/).filter(Boolean);ui.stations.querySelectorAll("label").forEach(l=>{l.hidden=!mots.every(m=>normaliser(l.textContent).includes(m));});}
  function remplirAnnees(){
    const annees=[...new Set(donnees.filter(r=>r.id===ui.stationAnnuelle.value).map(r=>r.annee))].sort((a,b)=>a-b);ui.annees.replaceChildren();
    for(const a of annees)ui.annees.append(caseACocher("annee-canaverier",String(a),String(a),annees.slice(-3).includes(a)));
  }
  function remplirPresentation(){
    const annuelle=ui.vue.value==="annees";
    ui.choixStations.hidden=annuelle;ui.stationAnnuelleLabel.hidden=!annuelle;ui.anneesBox.hidden=!annuelle;
    // La comparaison annuelle utilise les années cochées, sans filtre de dates caché.
    for(const champ of [ui.debut,ui.fin]){champ.parentElement.hidden=annuelle;champ.disabled=annuelle;if(annuelle)champ.setCustomValidity("");}
  }
  function initialiserControles(){
    ui.type.value="Limnimétrique";ui.vue.value="chronologie";ui.recherche.value="";
    const min=jourISO(donnees[0].date),max=jourISO(donnees.at(-1).date);
    for(const c of [ui.debut,ui.fin]){c.min=min;c.max=max;}ui.debut.value=min;ui.fin.value=max;ui.inclure.checked=false;
    ui.parametres.querySelectorAll("input").forEach(c=>{c.checked=c.value==="salinite";});remplirStations(true);remplirAnnees();remplirPresentation();ui.controles.disabled=false;
    ui.verification.hidden=!donnees.some(r=>/conductivit[ée].*(?:v[ée]rifier|≥\s*100)/i.test(r.controle));
  }
  function appliquerVue(){
    if(!ui)return;
    const [section,requete=""]=location.hash.slice(1).split("?"),params=new URLSearchParams(requete),vue=params.get("vue");
    if(section!=="graphiques"||vue!=="canaverier"){dernierLien="";pointAbsent="";}
    if(vue==="dce")ui.panneau.open=false;
    if(section==="graphiques"&&vue==="canaverier"){
      ui.panneau.open=true;const id=params.get("point")||"";
      if(donnees.length&&id&&id!==dernierLien){
        const p=points.find(p=>p.id===id);if(!p){pointAbsent=id;vider();ui.message.textContent="Ce point Canaverier est absent du fichier. Choisissez une autre station.";return;}
        pointAbsent="";ui.type.value=p.typeSuivi;ui.vue.value="chronologie";ui.recherche.value="";remplirStations(true);
        ui.stations.querySelectorAll("input").forEach(c=>{c.checked=c.value===id;});ui.stationAnnuelle.value=id;remplirAnnees();remplirPresentation();
        ui.debut.value=jourISO(p.debut);ui.fin.value=jourISO(p.fin);dernierLien=id;
      }
    }
    if(section==="graphiques")requestAnimationFrame(actualiser);
  }
  function valeur(r,p){return p.id==="conductivite"&&!ui.inclure.checked&&/conductivit[ée].*(?:v[ée]rifier|≥\s*100)/i.test(r.controle)?null:r.valeurs[p.id];}
  function moyenneMensuelle(releves,p,du,au){
    const groupes=new Map();for(const r of releves){const v=valeur(r,p);if(v!==null){if(!groupes.has(r.numeroMois))groupes.set(r.numeroMois,[]);groupes.get(r.numeroMois).push(v);}}
    const resultat=[];for(let n=moisNumero(du);n<=moisNumero(au);n++){const valeurs=groupes.get(n)||[];resultat.push({x:Math.min(au,Math.max(du,milieuMois(n))),y:valeurs.length?valeurs.reduce((a,b)=>a+b,0)/valeurs.length:null,mois:n,info:moisAnnee.format(milieuMois(n)),n:valeurs.length});}return resultat;
  }
  function moyenneMobile(mois){return mois.map((m,i)=>{const bloc=mois.slice(Math.max(0,i-2),i+1),complet=bloc.length===3&&bloc.every(x=>x.y!==null);return{...m,y:complet?bloc.reduce((s,x)=>s+x.y,0)/3:null,info:m.info+" — moyenne mobile sur trois mois"};});}
  function tendance(mois){
    const v=mois.filter(m=>m.y!==null);if(v.length<3)return[];const origine=v[0].x,pts=v.map(m=>({x:(m.x-origine)/JOUR,y:m.y}));
    const mx=pts.reduce((s,p)=>s+p.x,0)/pts.length,my=pts.reduce((s,p)=>s+p.y,0)/pts.length,variance=pts.reduce((s,p)=>s+(p.x-mx)**2,0);if(!variance)return[];
    const pente=pts.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/variance;return[v[0],v.at(-1)].map(m=>({x:m.x,y:my+pente*((m.x-origine)/JOUR-mx),info:moisAnnee.format(m.x)+" — tendance descriptive"}));
  }
  function statistiques(releves,p){const v=releves.map(r=>valeur(r,p)).filter(v=>v!==null);return{n:v.length,min:v.length?Math.min(...v):null,moyenne:v.length?v.reduce((a,b)=>a+b,0)/v.length:null,max:v.length?Math.max(...v):null,mois:new Set(releves.filter(r=>valeur(r,p)!==null).map(r=>r.numeroMois)).size};}
  function couleur(cle){let n=0;for(const c of String(cle))n=(n*31+c.charCodeAt(0))>>>0;return"hsl("+(n*137.508%360).toFixed(1)+",62%,36%)";}
  function pointsBruts(releves,p){const data=[];let precedent=null;for(const r of releves){if(precedent!==null&&r.numeroMois-precedent>1)data.push({x:milieuMois(precedent+1),y:null});data.push({x:r.date,y:valeur(r,p),info:dateCourte.format(r.date)});precedent=r.numeroMois;}return data;}
  function creerReperes(article,p,series){
    const details=creer("details",undefined,"reperes-canaverier");details.append(creer("summary","Repères chiffrés sur la sélection"),creer("p","Ces repères portent sur les mesures disponibles, même lorsqu’un lissage ou une tendance est affiché. La moyenne compte chaque relevé ; le zoom ne change pas les calculs.","aide-canaverier"));
    const conteneur=creer("div",undefined,"tableau-canaverier");conteneur.tabIndex=0;conteneur.setAttribute("role","region");conteneur.setAttribute("aria-label","Synthèse de "+p.nom);
    const table=creer("table"),thead=creer("thead"),tr=creer("tr"),tbody=creer("tbody");table.append(creer("caption",p.nom+" — "+p.unite));
    for(const h of ["Station / année","Nombre de valeurs","Minimum","Moyenne","Maximum","Mois avec données"]){const th=creer("th",h);th.scope="col";tr.append(th);}thead.append(tr);
    for(const serie of series){const tr=creer("tr"),th=creer("th",serie.label);th.scope="row";tr.append(th);for(const v of [serie.stats.n,serie.stats.min,serie.stats.moyenne,serie.stats.max,serie.stats.mois])tr.append(creer("td",v===null?"—":nombre.format(v)));tbody.append(tr);}
    table.append(thead,tbody);conteneur.append(table);details.append(conteneur);article.append(details);
  }
  const fondBlanc={id:"fond-blanc-canaverier",beforeDraw(chart){const ctx=chart.ctx;ctx.save();ctx.globalCompositeOperation="destination-over";ctx.fillStyle="#fff";ctx.fillRect(0,0,chart.width,chart.height);ctx.restore();}};
  function vider(){for(const c of graphiques.values())c.destroy();graphiques.clear();ui?.zone.replaceChildren();}
  function afficherNotes(releves,parametres){
    ui.notesListe.replaceChildren();const groupes=new Map(),ids=new Set(parametres.map(p=>p.id));
    for(const r of releves)for(const note of r.controle.split(/\s+\/\s+/).filter(Boolean)){
      const n=normaliser(note);let pertinent=true;
      if(n.includes("ngf")||n.includes("echelle"))pertinent=ids.has("hauteur");else if(n.includes("conductivite"))pertinent=ids.has("conductivite");else if(n.startsWith("sal :"))pertinent=ids.has("salinite");else if(n.includes("temperature"))pertinent=ids.has("temperature");
      if(!pertinent)continue;if(!groupes.has(note))groupes.set(note,{n:0,stations:new Set()});const g=groupes.get(note);g.n++;g.stations.add(r.station);
    }
    for(const [texte,g]of groupes)ui.notesListe.append(creer("li",texte+" — "+g.n+" relevé(s) : "+[...g.stations].join(", ")+"."));ui.notes.hidden=!groupes.size;
  }
  function actualiser(){
    if(!ui||!donnees.length||ui.etudes.hidden||!ui.panneau.open||document.getElementById("graphiques")?.hidden)return;
    if(pointAbsent){vider();ui.message.textContent="Ce point Canaverier est absent du fichier. Choisissez une autre station.";return;}
    const coches=Array.from(ui.stations.querySelectorAll("input:checked"));ui.resumeStations.textContent=coches.length===1?"Station sélectionnée : "+points.find(p=>p.id===coches[0].value)?.nom:"Stations à comparer : "+coches.length+" sélectionnées";
    const annuelle=ui.vue.value==="annees",selection=new Set(annuelle?[ui.stationAnnuelle.value]:Array.from(ui.stations.querySelectorAll("input:checked"),c=>c.value));
    const parametres=definitions.filter(p=>ui.parametres.querySelector('input[value="'+p.id+'"]')?.checked);
    const annees=new Set(Array.from(ui.annees.querySelectorAll("input:checked"),c=>Number(c.value)));
    const du=annuelle?(annees.size?Date.UTC(Math.min(...annees),0,1):NaN):(ui.debut.value?Date.parse(ui.debut.value+"T00:00:00Z"):NaN);
    const au=annuelle?(annees.size?Date.UTC(Math.max(...annees),11,31):NaN):(ui.fin.value?Date.parse(ui.fin.value+"T00:00:00Z"):NaN);
    const erreur=!selection.size?"Choisissez au moins une station.":!parametres.length?"Choisissez au moins un paramètre.":!annuelle&&(!Number.isFinite(du)||!Number.isFinite(au))?"Renseignez les deux dates.":!annuelle&&du>au?"La date de début doit précéder ou être égale à la date de fin.":annuelle&&!annees.size?"Choisissez au moins une année.":"";
    vider();ui.notes.hidden=true;ui.debut.setCustomValidity(!annuelle&&du>au?"Vérifiez l’ordre des dates.":"");if(erreur){ui.message.textContent=erreur;return;}
    const releves=donnees.filter(r=>selection.has(r.id)&&(annuelle?annees.has(r.annee):r.date>=du&&r.date<=au));
    if(!releves.length){ui.message.textContent=annuelle?"Aucun relevé pour cette sélection. Choisissez d’autres années ou une autre station.":"Aucun relevé pour cette sélection. Élargissez la période ou choisissez d’autres stations.";return;}
    if(typeof Chart==="undefined"){ui.message.textContent="L’outil graphique n’est pas chargé. Vérifiez les scripts de la page.";return;}
    let total=0,ecartes=0;
    for(const p of parametres){
      const article=creer("article",undefined,"carte-graphique carte-graphique-canaverier");article.dataset.parametre=p.id;article.append(creer("h4",p.nom+" ("+p.unite+")"));
      const groupes=annuelle?[...annees].sort((a,b)=>a-b).map(a=>({label:String(a),cle:String(a),releves:releves.filter(r=>r.annee===a)})):points.filter(point=>selection.has(point.id)).map(point=>({label:point.nom,cle:point.id,releves:releves.filter(r=>r.id===point.id)}));
      const series=groupes.map(g=>({...g,stats:statistiques(g.releves,p)})),compte=series.reduce((n,s)=>n+s.stats.n,0);total+=compte;
      if(p.id==="conductivite")ecartes+=releves.filter(r=>r.valeurs[p.id]!==null&&valeur(r,p)===null).length;
      if(!compte){article.append(creer("p","Aucune valeur disponible pour ce paramètre sur cette sélection. Une hauteur NGF manquante n’est pas remplacée par une colonne d’eau ou une lecture d’échelle."));ui.zone.append(article);continue;}
      const mode=modes.get(p.id)||"mesures",datasets=[];let courbesAjoutees=0;
      if(!annuelle){const label=creer("label",undefined,"affichage-canaverier"),select=creer("select");select.id="affichage-canaverier-"+p.id;
        for(const [v,t]of [["mesures","Mesures seules"],["mobile3","Mesures + lissage sur 3 mois"],["tendance","Mesures + droite de tendance"]])option(select,v,t);
        select.value=mode;select.addEventListener("change",()=>{modes.set(p.id,select.value);actualiser();});label.append(creer("span","Affichage"),select);article.append(label);}
      for(const serie of series){
        if(!serie.stats.n)continue;
        const color=couleur(serie.cle),mensuels=annuelle?[]:moyenneMensuelle(serie.releves,p,du,au);
        const data=annuelle?Array.from({length:12},(_,m)=>{const valeurs=serie.releves.filter(r=>new Date(r.date).getUTCMonth()===m).map(r=>valeur(r,p)).filter(v=>v!==null);return{x:m+1,y:valeurs.length?valeurs.reduce((a,b)=>a+b,0)/valeurs.length:null,info:nomsMois[m]+" "+serie.label+" — moyenne de "+valeurs.length+" relevé(s)"};}):pointsBruts(serie.releves,p);
        datasets.push({label:serie.label,data,borderColor:color,backgroundColor:color,borderWidth:2,pointRadius:3.5,pointHoverRadius:6,pointHitRadius:8,spanGaps:false,tension:0});
        if(!annuelle&&mode!=="mesures"){
          const complement=mode==="mobile3"?moyenneMobile(mensuels):tendance(mensuels);
          if(complement.some(d=>d.y!==null)){courbesAjoutees++;datasets.push({label:serie.label+(mode==="mobile3"?" — lissage 3 mois":" — tendance"),data:complement,borderColor:color,backgroundColor:"#fff",pointBackgroundColor:"#fff",pointBorderColor:color,pointBorderWidth:2.5,borderWidth:2.5,borderDash:mode==="mobile3"?[7,4]:[12,5],pointRadius:mode==="mobile3"?4:0,spanGaps:false,tension:0});}
        }
      }
      const methode=annuelle?"Chaque point est la moyenne des relevés d’un mois. La comparaison utilise les années cochées en entier, indépendamment des dates de la chronologie. Une couleur représente une année. Les mois sans donnée restent vides.":mode==="mobile3"?"Le lissage est la moyenne des moyennes mensuelles du mois affiché et des deux mois précédents. Les trois mois doivent contenir des données. Les mesures sont pleines ; les points lissés sont blancs."+(courbesAjoutees?"":" Aucun groupe de trois mois consécutifs n’est disponible : seules les mesures sont affichées."):mode==="tendance"?"La droite de tendance est calculée sur les moyennes mensuelles disponibles, avec au moins trois mois renseignés. Elle décrit l’évolution de la période et ne constitue pas une prévision."+(courbesAjoutees?"":" Pas assez de mois pour calculer une tendance."):"Les points représentent les mesures aux dates réelles. Les mois sans valeur interrompent les lignes.";
      article.append(creer("p",methode,"aide-canaverier"));
      const periodeAffichee=annuelle?"Années : "+[...annees].sort((a,b)=>a-b).join(", "):dateCourte.format(du)+" – "+dateCourte.format(au);
      const cadre=creer("div",undefined,"cadre-courbe"),canvas=creer("canvas");canvas.setAttribute("role","img");canvas.setAttribute("aria-label",p.nom+", suivi Canaverier, "+periodeAffichee);cadre.append(canvas);article.append(cadre);ui.zone.append(article);
      const min=annuelle?1:du,max=annuelle?12:(au===du?au+JOUR:au+JOUR-1);
      const chart=new Chart(canvas,{type:"line",data:{datasets},plugins:[fondBlanc],options:{responsive:true,maintainAspectRatio:false,animation:false,locale:"fr-FR",interaction:{mode:"nearest",intersect:false},
        plugins:{title:{display:true,text:[p.nom+" ("+p.unite+") — SMCG / Suivi Canaverier",periodeAffichee+(annuelle?" · comparaison annuelle":"")]},legend:{position:"bottom",labels:{usePointStyle:true,padding:16}},tooltip:{callbacks:{title:items=>items[0]?.raw.info||"",label:ctx=>ctx.dataset.label+" : "+nombre.format(ctx.parsed.y)+" "+p.unite}},zoom:{limits:{x:{min,max,minRange:annuelle?1:JOUR}},pan:{enabled:false},zoom:{mode:"x",wheel:{enabled:true,modifierKey:"ctrl"},pinch:{enabled:true},drag:{enabled:true,modifierKey:"shift",threshold:10}}}},
        scales:{x:{type:"linear",min,max,title:{display:true,text:annuelle?"Mois de l’année":"Date de mesure"},ticks:{maxTicksLimit:annuelle?12:8,stepSize:annuelle?1:undefined,callback:(v,i,ticks)=>annuelle?(Number.isInteger(v)?nomsMois[v-1]||"":""):(i>0&&moisAnnee.format(ticks[i-1].value)===moisAnnee.format(v)?"":moisAnnee.format(v))}},y:{beginAtZero:false,title:{display:true,text:p.nom+" ("+p.unite+")"}}}}});
      graphiques.set(p.id,chart);const outils=creer("div",undefined,"outils-canaverier");
      for(const [texte,action]of [["Agrandir",()=>chart.zoom({x:1.5})],["Réduire",()=>chart.zoom({x:0.67})],["Vue complète",()=>chart.resetZoom()]]){const b=creer("button",texte);b.type="button";b.disabled=typeof chart.zoom!=="function";b.addEventListener("click",action);outils.append(b);}
      const image=creer("button","Enregistrer en image");image.type="button";image.addEventListener("click",()=>{const nom="canaverier-"+p.id+"-"+(annuelle?"annees-"+[...annees].sort((a,b)=>a-b).join("-"):ui.debut.value+"-"+ui.fin.value)+".png";canvas.toBlob(blob=>{if(!blob){ui.message.textContent="L’image n’a pas pu être préparée. Réessayez après l’affichage du graphique.";return;}const url=URL.createObjectURL(blob),a=creer("a");a.download=nom;a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);},"image/png");});outils.append(image);
      article.append(outils,creer("p","Zoom : Ctrl + molette, ou Maj + glisser dans le graphique. Sur écran tactile, pincez avec deux doigts.","aide-canaverier"));creerReperes(article,p,series);
    }
    afficherNotes(releves,parametres);ui.message.textContent=releves.length+" relevés sélectionnés · "+total+" valeurs affichées."+(ecartes?" "+ecartes+" conductivité(s) à vérifier masquée(s).":"");
  }
  async function charger(){
    try{const reponse=await fetch("mesures_canaverier.csv",{cache:"no-cache"});if(!reponse.ok)throw new Error("mesures_canaverier.csv inaccessible (HTTP "+reponse.status+").");
      donnees=lireDonnees(await reponse.text());if(!donnees.length)throw new Error("Le fichier ne contient aucun relevé Canaverier.");points=regrouperPoints(donnees);window.dispatchEvent(new CustomEvent("canaverier:stations",{detail:points}));
      if(ui){initialiserControles();ui.message.textContent=donnees.length+" relevés pour "+points.length+" points de suivi Canaverier.";appliquerVue();}return{donnees,points};
    }catch(erreur){if(ui){ui.controles.disabled=true;vider();ui.message.textContent="Impossible d’afficher Canaverier : "+erreur.message;}console.error(erreur);return{erreur:erreur.message};}
  }
  preparerInterface();window.addEventListener("hashchange",appliquerVue);const pret=charger();
  window.addEventListener("canaverier:demander-etat",()=>{pret.then(detail=>window.dispatchEvent(new CustomEvent("canaverier:etat",{detail})));});
})();
