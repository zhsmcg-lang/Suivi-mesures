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
  SYMADREM: {
    nom: "SYMADREM",
    site: null,
    texteLien: null,
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

  // AJOUTER LES NOUVELLES STATIONS JUSTE AU-DESSUS DE CETTE LIGNE.
];


/* =========================================
   FILTRES : LES OPTIONS SONT CRÉÉES AUTOMATIQUEMENT
   ========================================= */

function remplirFiltre(id, libelleTous, valeurs) {
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
    option.textContent = valeur;
    select.append(option);
  });
  select.value = valeurs.includes(ancienChoix) ? ancienChoix : "";
}

remplirFiltre("filtre-structure", "Toutes les structures",
  [...new Set(stations.map(station => station.structure))].sort());

const ordreParametres = ["Salinité", "Température", "Oxygène", "Conductivité", "Hauteur d’eau"];
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
  const mode = document.createElement("div");
  mode.textContent = station.teletransmission
    ? "Suivi par télétransmission"
    : "Relevés mensuels — sans télétransmission";
  const parametres = document.createElement("div");
  parametres.textContent = "Paramètres : " + station.parametres.join(" · ");
  fiche.append(titre, structure, mode, parametres);

  const publiques = station.donneesPubliques ?? organisme.donneesPubliques;
  if (publiques === false) {
    const acces = document.createElement("div");
    const mention = document.createElement("strong");
    mention.textContent = "Données non publiques";
    acces.append(mention);
    const detail = document.createElement("div");
    detail.textContent = "Seules la localisation et les informations descriptives sont présentées sur ce portail.";
    fiche.append(acces, detail);
  } else if (organisme.site) {
    const ligneLien = document.createElement("div");
    const lien = document.createElement("a");
    lien.href = organisme.site;
    lien.textContent = organisme.texteLien || "Site de la structure";
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    ligneLien.append(lien);
    fiche.append(ligneLien);
  }
  return fiche;
}


/* =========================================
   CARTE
   ========================================= */

let carte = null;
let coucheStations = null;

function actualiserStations() {
  if (carte === null || coucheStations === null) return;
  const structure = document.getElementById("filtre-structure")?.value || "";
  const parametre = document.getElementById("filtre-parametre")?.value || "";
  const mode = document.getElementById("filtre-mode")?.value || "";
  const visibles = stations.filter(station =>
    (!structure || station.structure === structure)
    && (!parametre || station.parametres.includes(parametre))
    && (!mode || (mode === "tt" && station.teletransmission)
      || (mode === "mensuel" && !station.teletransmission))
  );
  carte.closePopup();
  coucheStations.clearLayers();
  visibles.forEach(station => {
    L.marker([station.latitude, station.longitude], {
      title: station.nom,
      alt: station.nom
    }).bindPopup(creerFiche(station)).addTo(coucheStations);
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
    information.textContent = "Accès aux mesures : les données des stations SYMADREM ne sont pas publiques. "
      + "Ces stations sont présentées à titre de localisation et de description du suivi.";
    conteneur.before(information);
  }

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
  const demandee = window.location.hash.slice(1);
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
