/* =========================================
   ORGANISMES
   Pour une nouvelle structure, ajouter une entrée ici.
   ========================================= */

const structures = {
  SMCG: {
    nom: "SMCG — Syndicat Mixte Camargue Gardoise",
    site: "https://www.camarguegardoise.com/",
    texteLien: "Site du SMCG",
    donneesPubliques: true
  },
  VNF: {
    nom: "VNF",
    site: "https://www.vnf.fr/aghyre/#!/displaySIG",
    texteLien: "Cartes et mesures du réseau VNF",
    donneesPubliques: true
  },
  CEN: {
    nom: "CEN Occitanie",
    libelleFiltre: "CEN Occitanie",
    site: null,
    donneesPubliques: false
  },
  VIGICRUES: {
    nom: "Vigicrues",
    libelleFiltre: "Vigicrues",
    texteLien: "Consulter les mesures sur Vigicrues",
    donneesPubliques: true
  },
  SYMADREM: {
    nom: "SYMADREM",
    site: "http://195.101.247.177:88/WebServ2/?PageType=Mimic&PageId=2",
    texteLien: "Cartographie SYMADREM",
    donneesPubliques: false
  }
};

/* =========================================
   LISTE DES STATIONS
   Longitude = premier nombre du Point WKT (X).
   Latitude = deuxième nombre du Point WKT (Y).
   ========================================= */

const stations = [
  // SMCG — Tournée Sud : coordonnées déjà utilisées, conservées.
  {
    nom: "Chenal Marette",
    latitude: 43.552118917373306,
    longitude: 4.170558794461427,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Marette sud",
    latitude: 43.55308777446753,
    longitude: 4.170699836116174,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Médard Sud Ouest",
    latitude: 43.541609743542324,
    longitude: 4.142196992593226,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Ponant",
    latitude: 43.564589198174176,
    longitude: 4.121582251596615,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },

  // SMCG — Tournée Nord.
  {
    nom: "Capette sud",
    latitude: 43.608608507158365,
    longitude: 4.333387926632358,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Capette nord",
    latitude: 43.608608826210265,
    longitude: 4.333361926403964,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Charnier",
    latitude: 43.6204119851779,
    longitude: 4.315412373880283,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Scamandre",
    latitude: 43.62234084221612,
    longitude: 4.351107997830763,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "Crey",
    nomDonnees: "Crey Centre",
    latitude: 43.624404777462,
    longitude: 4.317870045912599,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },
  {
    nom: "CRS Gallician",
    latitude: 43.63793312845474,
    longitude: 4.298950345926178,
    structure: "SMCG",
    teletransmission: false,
    parametres: ["Salinité", "Température", "Oxygène"]
  },

  // VNF — Nouvelle liste : l’ancien point Franquevaux est remplacé.
  {
    nom: "Canal Pont Espeyran",
    latitude: 43.63610643023938,
    longitude: 4.404327468178766,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Salinité", "Température", "Conductivité"]
  },
  {
    nom: "Canal Pont Franquevaux",
    latitude: 43.64659354853086,
    longitude: 4.348259642670403,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Salinité", "Température", "Conductivité"]
  },
  {
    nom: "Canal Pont Gallician",
    latitude: 43.63787152355043,
    longitude: 4.298423148753252,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Salinité", "Température", "Conductivité"]
  },
  {
    nom: "Canal Pont Tourradons",
    latitude: 43.6192504954846,
    longitude: 4.259648585865463,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau", "Salinité", "Température", "Conductivité"]
  },
  {
    nom: "Pont de Corbiere",
    latitude: 43.588496441844796,
    longitude: 4.196227683624564,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "Pont Rouge Aigues Mortes",
    latitude: 43.56915888827598,
    longitude: 4.189042642506877,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "Petit Rhone amont ecluse",
    latitude: 43.644991468637684,
    longitude: 4.4346747979255765,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "Canal Saint-Gilles",
    latitude: 43.64348322557427,
    longitude: 4.430087741110209,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "SAS ecluse",
    latitude: 43.64450307349397,
    longitude: 4.433298166158127,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },

  // SYMADREM — Télétransmission ; données non publiques.
  {
    nom: "Rigole Trop Long",
    latitude: 43.60118137801688,
    longitude: 4.280309502585123,
    structure: "SYMADREM",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "Petit Rhone - Pont Sylvereal",
    latitude: 43.54604251301814,
    longitude: 4.349275361091932,
    structure: "SYMADREM",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },
  {
    nom: "Petit Rhone - Capette",
    latitude: 43.56243929928922,
    longitude: 4.386541359087521,
    structure: "SYMADREM",
    teletransmission: true,
    parametres: ["Hauteur d’eau", "Salinité", "Température"]
  },
  {
    nom: "Canal - Les Pecheries",
    latitude: 43.686785146913564,
    longitude: 4.447597751518203,
    structure: "SYMADREM",
    teletransmission: true,
    parametres: ["Hauteur d’eau"]
  },

  // CEN Occitanie — Télétransmission ; données non publiques.
  {
    nom: "Nord Étang Médard",
    latitude: 43.55093262739895,
    longitude: 4.157107222559436,
    structure: "CEN",
    teletransmission: true,
    parametres: ["Salinité", "Hauteur d’eau", "Température", "Conductivité"]
  },
  {
    nom: "Vieux Vistre",
    latitude: 43.62501226913735,
    longitude: 4.2423201124067,
    structure: "CEN",
    teletransmission: true,
    parametres: ["Salinité", "Hauteur d’eau", "Température", "Conductivité"]
  },
  {
    nom: "Prairie au Cailar",
    latitude: 43.63389438762363,
    longitude: 4.249970999690099,
    structure: "CEN",
    teletransmission: true,
    parametres: ["Salinité", "Hauteur d’eau", "Température", "Conductivité"]
  },

  // Vigicrues — Les liens ouvrent directement la station concernée.
  {
    nom: "Port Camargue",
    latitude: 43.52032663219912,
    longitude: 4.1264028024815005,
    structure: "VIGICRUES",
    teletransmission: true,
    parametres: ["Hauteur d’eau"],
    site: "https://www.vigicrues.gouv.fr/station/Y354000101"
  },
  {
    nom: "Le Cailar — Vieux Vistre (lit mineur)",
    latitude: 43.67054316126651,
    longitude: 4.244486775520346,
    structure: "VIGICRUES",
    teletransmission: true,
    parametres: ["Hauteur d’eau", "Débit"],
    site: "https://www.vigicrues.gouv.fr/station/Y353401001"
  },

  // AJOUTER LES NOUVELLES STATIONS JUSTE AU-DESSUS DE CETTE LIGNE.
];


/* =========================================
   FILTRES : LES OPTIONS SONT CRÉÉES AUTOMATIQUEMENT
   ========================================= */

function remplirFiltre(id, libelleTous, valeurs, libelle = valeur => valeur) {
  const select = document.getElementById(id);
  if (!select) return;
  const ancienChoix = select.value;
  select.replaceChildren();
  const toutes = document.createElement("option");
  toutes.value = "";
  toutes.textContent = libelleTous;
  select.append(toutes);
  valeurs.forEach(valeur => {
    const option = document.createElement("option");
    option.value = valeur;
    option.textContent = libelle(valeur);
    select.append(option);
  });
  select.value = valeurs.includes(ancienChoix) ? ancienChoix : "";
}

remplirFiltre("filtre-structure", "Toutes les structures",
  [...new Set(stations.map(station => station.structure))].sort(),
  valeur => structures[valeur]?.libelleFiltre || valeur);

const ordreParametres = ["Salinité", "Température", "Oxygène", "Conductivité", "Hauteur d’eau", "Débit"];
const parametresPresents = [...new Set(stations.flatMap(station => station.parametres))];
remplirFiltre("filtre-parametre", "Tous les paramètres", [
  ...ordreParametres.filter(parametre => parametresPresents.includes(parametre)),
  ...parametresPresents.filter(parametre => !ordreParametres.includes(parametre)).sort()
]);


/* =========================================
   FICHES DES STATIONS
   ========================================= */

function creerFiche(station) {
  const organisme = structures[station.structure] || { nom: station.structure };
  const fiche = document.createElement("div");
  const titre = document.createElement("strong");
  titre.textContent = station.nom;
  const structure = document.createElement("div");
  structure.textContent = organisme.nom;
  if (station.suivi === "DCE") {
    const suivi = document.createElement("div");
    suivi.textContent = "SMCG · Suivi DCE des lagunes";
    fiche.append(suivi);
  }
  if (station.suivi === "CANAVERIER") {
    const suivi = document.createElement("div");
    suivi.textContent = "SMCG · Suivi Canaverier · " + station.typeSuivi;
    fiche.append(suivi);
  }
  const mode = document.createElement("div");
  mode.textContent = station.suivi === "CANAVERIER" ? "Relevés ponctuels — sans télétransmission" : station.suivi === "DCE" ? "Campagnes estivales — sans télétransmission" : station.teletransmission
    ? "Suivi par télétransmission"
    : "Relevés mensuels — sans télétransmission";
  const parametres = document.createElement("div");
  parametres.textContent = "Paramètres : " + (station.parametresResume || station.parametres).join(" · ");
  fiche.prepend(titre, structure);
  fiche.append(mode, parametres);
  if (station.suivi === "DCE") {
    const periode = document.createElement("div");
    periode.textContent = "Années disponibles : " + station.annees.join(", ");
    const etat = document.createElement("div");
    etat.textContent = "État actuel du suivi : à confirmer";
    fiche.append(periode, etat);
    if (station.positionsHistoriques) {
      const historique = document.createElement("div");
      historique.textContent = "Le point affiché correspond aux coordonnées les plus récentes. Les positions historiques sont conservées avec les relevés.";
      fiche.append(historique);
    }
  }

  if (station.suivi === "CANAVERIER") {
    const periode = document.createElement("div");
    periode.textContent = "Années disponibles : " + station.annees.join(", ");
    const hauteur = document.createElement("div");
    hauteur.textContent = station.parametres.includes("Hauteur d’eau")
      ? "Niveaux d’eau exprimés en m NGF."
      : "Niveau d’eau NGF non renseigné dans les relevés disponibles.";
    fiche.append(periode, hauteur);
  }
  const publiques = station.donneesPubliques ?? organisme.donneesPubliques;
  if (publiques === false) {
    const acces = document.createElement("div");
    const mention = document.createElement("strong");
    mention.textContent = "Données non publiques";
    acces.append(mention);
    const detail = document.createElement("div");
    detail.textContent = "Seules la localisation et les informations descriptives sont présentées sur ce portail.";
    fiche.append(acces, detail);
  }
  const site = station.site || organisme.site;
  if (site) {
    const ligneLien = document.createElement("div");
    const lien = document.createElement("a");
    lien.href = site;
    lien.textContent = station.texteLien || organisme.texteLien || "Site de la structure";
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    ligneLien.append(lien);
    fiche.append(ligneLien);
  }
  if (station.structure === "SMCG" && publiques !== false) {
    const ligneGraphiques = document.createElement("div");
    const lienGraphiques = document.createElement("a");
    lienGraphiques.href = station.suivi === "CANAVERIER"
      ? "#graphiques?vue=canaverier&point=" + encodeURIComponent(station.id)
      : station.suivi === "DCE"
      ? "#graphiques?vue=dce&point=" + encodeURIComponent(station.id)
      : "#graphiques?station=" + encodeURIComponent(station.nomDonnees || station.nom);
    lienGraphiques.textContent = station.suivi === "CANAVERIER"
      ? "Voir les analyses Canaverier de ce point" : station.suivi === "DCE"
      ? "Voir les analyses DCE de ce point" : "Voir les graphiques de cette station";
    ligneGraphiques.append(lienGraphiques);
    fiche.append(ligneGraphiques);
  }
  return fiche;
}


/* =========================================
   CARTE
   ========================================= */

let carte = null;
let coucheStations = null;

// Une même forme ; la couleur indique le mode de mesure ou la campagne DCE.
const categoriesMarqueurs = {
  tt: { classe: "tt", libelle: "Télétransmission" },
  manuel: { classe: "manuel", libelle: "Relevés manuels" },
  dce: { classe: "dce", libelle: "Campagnes DCE" }
};
const dessinRepereStation = '<svg viewBox="0 0 28 38" aria-hidden="true" focusable="false">'
  + '<path d="M14 1C7 1 1 6.6 1 13.5c0 9.4 13 23 13 23s13-13.6 13-23C27 6.6 21 1 14 1Z" fill="currentColor" stroke="white" stroke-width="2"/>'
  + '<circle cx="14" cy="13" r="4" fill="white"/></svg>';

function categorieStation(station) {
  if (station.suivi === "DCE") return categoriesMarqueurs.dce;
  return station.teletransmission ? categoriesMarqueurs.tt : categoriesMarqueurs.manuel;
}

function creerIconeStation(station) {
  return L.divIcon({
    className: "repere-station repere-" + categorieStation(station).classe,
    html: dessinRepereStation,
    iconSize: [28, 38], iconAnchor: [14, 37], popupAnchor: [0, -33]
  });
}

function ajouterLegendeStations(conteneur) {
  if (document.getElementById("legende-stations-carte")) return;
  const legende = document.createElement("ul");
  legende.id = "legende-stations-carte";
  legende.setAttribute("aria-label", "Légende des stations");
  for (const categorie of Object.values(categoriesMarqueurs)) {
    const ligne = document.createElement("li");
    const symbole = document.createElement("span");
    symbole.className = "symbole-legende-station repere-" + categorie.classe;
    symbole.innerHTML = dessinRepereStation;
    symbole.setAttribute("aria-hidden", "true");
    ligne.append(symbole, document.createTextNode(categorie.libelle));
    legende.append(ligne);
  }
  conteneur.before(legende);
}


function actualiserStations() {
  if (carte === null || coucheStations === null) return;
  const structure = document.getElementById("filtre-structure")?.value || "";
  const parametre = document.getElementById("filtre-parametre")?.value || "";
  const mode = document.getElementById("filtre-mode")?.value || "";
  const selectSuivi = document.getElementById("filtre-suivi-smcg");
  const conteneurSuivi = document.getElementById("choix-suivi-smcg");
  if (conteneurSuivi) conteneurSuivi.hidden = structure !== "SMCG";
  if (selectSuivi && structure !== "SMCG") selectSuivi.value = "";
  const suivi = selectSuivi?.value || "";
  const visibles = stations.filter(station =>
    (!structure || station.structure === structure)
    && (!parametre || station.parametres.includes(parametre))
    && (!suivi || (station.structure === "SMCG" && (station.suivi || "FILMED") === suivi))
    && (!mode || (mode === "tt" && station.teletransmission)
      || (mode === "mensuel" && !station.teletransmission && station.suivi !== "DCE" && station.suivi !== "CANAVERIER")
      || (mode === "campagne" && station.suivi === "DCE")
      || (mode === "manuel-canaverier" && station.suivi === "CANAVERIER"))
  );
  carte.closePopup();
  coucheStations.clearLayers();
  visibles.forEach(station => {
    L.marker([station.latitude, station.longitude], {
      title: station.nom + " — " + categorieStation(station).libelle,
      alt: station.nom + " — " + categorieStation(station).libelle,
      icon: creerIconeStation(station)
    }).bindPopup(creerFiche(station)).addTo(coucheStations)
      .getElement().setAttribute("aria-label", station.nom + " — " + categorieStation(station).libelle);
  });
  const message = document.getElementById("message-carte");
  if (message) {
    message.textContent = visibles.length
      ? visibles.length + " station" + (visibles.length > 1 ? "s" : "")
        + " affichée" + (visibles.length > 1 ? "s" : "") + " sur " + stations.length + "."
      : "Aucune station ne correspond à cette sélection.";
  }
  // Aucun changement de zoom ou de position lors du filtrage.
}

function initialiserCarte() {
  if (carte !== null) return;
  const conteneur = document.getElementById("carte-stations");
  const message = document.getElementById("message-carte");
  if (!conteneur) {
    if (message) message.textContent = "L’emplacement de la carte est absent du fichier index.html.";
    return;
  }
  if (typeof L === "undefined") {
    if (message) message.textContent = "La carte n’a pas pu être chargée. Actualisez la page.";
    return;
  }

  if (!document.getElementById("information-acces-carte")) {
    const information = document.createElement("p");
    information.id = "information-acces-carte";
    information.setAttribute("role", "note");
    const producteursPrives = [...new Set(stations
      .filter(station => (station.donneesPubliques ?? structures[station.structure]?.donneesPubliques) === false)
      .map(station => structures[station.structure]?.nom || station.structure))];
    information.textContent = "Accès aux mesures : les données des réseaux "
      + producteursPrives.join(" et ") + " ne sont pas publiques. "
      + "Seules leur localisation et leurs paramètres sont présentés sur ce portail.";
    conteneur.before(information);
  }

  ajouterLegendeStations(conteneur);
  carte = L.map("carte-stations");
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(carte);
  coucheStations = L.featureGroup().addTo(carte);
  L.control.scale({ imperial: false }).addTo(carte);

  // Cadrage général calculé UNE FOIS, à l’ouverture de la carte.
  // Les filtres conserveront ensuite l’emprise choisie par le visiteur.
  if (stations.length) {
    carte.fitBounds(stations.map(station => [station.latitude, station.longitude]), {
      padding: [35, 35],
      maxZoom: 12
    });
  } else {
    carte.setView([43.61, 4.28], 10);
  }
  actualiserStations();
}


/* =========================================
   NAVIGATION ENTRE LES RUBRIQUES
   Les graphiques restent gérés par graphiques.js.
   ========================================= */

const rubriques = document.querySelectorAll("main > section");
const liens = document.querySelectorAll("nav a");

function afficherRubrique() {
  // Le nom de station reste dans l’adresse pour permettre le partage du lien.
  const demandee = window.location.hash.slice(1).split("?")[0];
  const existe = Array.from(rubriques).some(rubrique => rubrique.id === demandee);
  const active = existe ? demandee : "accueil";
  rubriques.forEach(rubrique => { rubrique.hidden = rubrique.id !== active; });
  liens.forEach(lien => {
    if (lien.getAttribute("href") === "#" + active) lien.setAttribute("aria-current", "page");
    else lien.removeAttribute("aria-current");
  });
  const titre = document.querySelector("#" + active + " h2");
  if (titre) {
    titre.setAttribute("tabindex", "-1");
    titre.focus({ preventScroll: true });
  }
  if (active === "carte") {
    initialiserCarte();
    requestAnimationFrame(() => { if (carte !== null) carte.invalidateSize(); });
  }
}

document.querySelectorAll(".filtres-carte select").forEach(select => {
  select.addEventListener("change", actualiserStations);
});
document.getElementById("reinitialiser-filtres")?.addEventListener("click", () => {
  document.querySelectorAll(".filtres-carte select").forEach(select => { select.selectedIndex = 0; });
  actualiserStations();
});
window.addEventListener("hashchange", afficherRubrique);
afficherRubrique();


/* Les points DCE proviennent du fichier mesures_dce.csv chargé par dce.js.
   Ils sont ajoutés une seule fois et restent indépendants des stations FILMED. */
window.addEventListener("dce:stations", evenement => {
  const nouvelles = evenement.detail;
  if (!Array.isArray(nouvelles)) return;
  for (const station of nouvelles) {
    if (station.structure !== "SMCG" || station.suivi !== "DCE"
        || !Number.isFinite(station.latitude) || !Number.isFinite(station.longitude)) continue;
    const ancienne = stations.findIndex(s => s.id === station.id && s.suivi === "DCE");
    if (ancienne >= 0) stations[ancienne] = station;
    else stations.push(station);
  }
  const presents = [...new Set(stations.flatMap(station => station.parametres))];
  remplirFiltre("filtre-parametre", "Tous les paramètres", [
    ...ordreParametres.filter(p => presents.includes(p)),
    ...presents.filter(p => !ordreParametres.includes(p)).sort((a,b) => a.localeCompare(b,"fr"))
  ]);
  const mode = document.getElementById("filtre-mode");
  if (mode && !Array.from(mode.children).some(o => o.value === "campagne")) {
    const option = document.createElement("option");
    option.value = "campagne"; option.textContent = "Campagnes estivales DCE"; mode.append(option);
  }
  const filtres = document.querySelector(".filtres-carte");
  if (filtres && !document.getElementById("filtre-suivi-smcg")) {
    const label = document.createElement("label");
    label.id = "choix-suivi-smcg"; label.hidden = true;
    const texte = document.createElement("span"); texte.textContent = "Suivi du SMCG";
    const select = document.createElement("select"); select.id = "filtre-suivi-smcg";
    for (const [valeur, libelle] of [["", "Tous les suivis du SMCG"], ["FILMED", "FILMED"], ["DCE", "DCE"], ["CANAVERIER", "Suivi Canaverier"]]) {
      const option = document.createElement("option"); option.value = valeur; option.textContent = libelle; select.append(option);
    }
    select.addEventListener("change", actualiserStations); label.append(texte, select);
    const bouton = document.getElementById("reinitialiser-filtres");
    if (bouton && bouton.parentElement === filtres) bouton.before(label);
    else filtres.append(label);
  }
  actualiserStations();
});

/* Les points Canaverier proviennent de mesures_canaverier.csv.
   Ce chargement conserve l’emprise de la carte et les autres réseaux. */
window.addEventListener("canaverier:stations", evenement => {
  const nouvelles = evenement.detail;
  if (!Array.isArray(nouvelles)) return;
  for (const station of nouvelles) {
    if (station.structure !== "SMCG" || station.suivi !== "CANAVERIER"
        || !Number.isFinite(station.latitude) || !Number.isFinite(station.longitude)) continue;
    const ancienne = stations.findIndex(s => s.id === station.id && s.suivi === "CANAVERIER");
    if (ancienne >= 0) stations[ancienne] = station;
    else stations.push(station);
  }
  const presents = [...new Set(stations.flatMap(station => station.parametres))];
  remplirFiltre("filtre-parametre", "Tous les paramètres", [
    ...ordreParametres.filter(p => presents.includes(p)),
    ...presents.filter(p => !ordreParametres.includes(p)).sort((a,b) => a.localeCompare(b,"fr"))
  ]);
  const mode = document.getElementById("filtre-mode");
  if (mode && !Array.from(mode.options).some(o => o.value === "manuel-canaverier")) {
    const option = document.createElement("option");
    option.value = "manuel-canaverier"; option.textContent = "Relevés manuels Canaverier"; mode.append(option);
  }
  let select = document.getElementById("filtre-suivi-smcg");
  const filtres = document.querySelector(".filtres-carte");
  if (!select && filtres) {
    const label = document.createElement("label"); label.id = "choix-suivi-smcg"; label.hidden = true;
    const texte = document.createElement("span"); texte.textContent = "Suivi du SMCG";
    select = document.createElement("select"); select.id = "filtre-suivi-smcg";
    for (const [valeur, libelle] of [["", "Tous les suivis du SMCG"], ["FILMED", "FILMED"], ["DCE", "DCE"]]) {
      const option = document.createElement("option"); option.value = valeur; option.textContent = libelle; select.append(option);
    }
    select.addEventListener("change", actualiserStations); label.append(texte, select);
    const bouton = document.getElementById("reinitialiser-filtres");
    if (bouton && bouton.parentElement === filtres) bouton.before(label); else filtres.append(label);
  }
  if (select && !Array.from(select.options).some(o => o.value === "CANAVERIER")) {
    const option = document.createElement("option"); option.value = "CANAVERIER"; option.textContent = "Suivi Canaverier"; select.append(option);
  }
  actualiserStations();
});
