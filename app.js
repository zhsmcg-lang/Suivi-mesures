/* =========================================
   STATIONS ET COORDONNÉES
   ========================================= */

// Informations communes aux structures.
const structures = {
  SMCG: {
    nom: "SMCG — Syndicat Mixte Camargue Gardoise",
    site: "https://www.camarguegardoise.com/",
    texteLien: "Site du SMCG"
  },

  VNF: {
    nom: "VNF",
    site: "https://www.vnf.fr/aghyre/#!/displaySIG",
    texteLien: "Cartes et mesures du réseau VNF"
  }
};

// Informations propres à chaque station.
const stations = [
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
  {
    nom: "Pont de Franquevaux",
    latitude: 43.64670848647801,
    longitude: 4.348546346343558,
    structure: "VNF",
    teletransmission: true,
    parametres: ["Conductivité", "Salinité", "Température"]
  }
];


/* =========================================
   CRÉATION DE LA CARTE
   ========================================= */

let carte = null;
let coucheStations = null;


/* Créer la fiche descriptive d'une station */
function creerFiche(station) {
  const structure = structures[station.structure];
  const fiche = document.createElement("div");

  const titre = document.createElement("strong");
  titre.textContent = station.nom;

  const organisme = document.createElement("div");
  organisme.textContent = structure.nom;

  const mode = document.createElement("div");
  mode.textContent = station.teletransmission
    ? "Suivi en télétransmission"
    : "Relevés mensuels — sans télétransmission";

  const parametres = document.createElement("div");
  parametres.textContent = station.parametres.join(" · ");

  const lien = document.createElement("a");
  lien.href = structure.site;
  lien.textContent = structure.texteLien;
  lien.target = "_blank";
  lien.rel = "noopener noreferrer";

  fiche.append(titre, organisme, mode, parametres, lien);

  return fiche;
}


/* Afficher les stations correspondant aux filtres */
function actualiserStations() {
  if (carte === null || coucheStations === null) {
    return;
  }

  const structureChoisie =
    document.getElementById("filtre-structure")?.value || "";

  const parametreChoisi =
    document.getElementById("filtre-parametre")?.value || "";

  const modeChoisi =
    document.getElementById("filtre-mode")?.value || "";

  const stationsVisibles = stations.filter(station => {
    const structureValide =
      structureChoisie === "" ||
      station.structure === structureChoisie;

    const parametreValide =
      parametreChoisi === "" ||
      station.parametres.includes(parametreChoisi);

    const modeValide =
      modeChoisi === "" ||
      (modeChoisi === "tt" && station.teletransmission) ||
      (modeChoisi === "mensuel" && !station.teletransmission);

    return structureValide && parametreValide && modeValide;
  });

  carte.closePopup();
  coucheStations.clearLayers();

  stationsVisibles.forEach(station => {
    L.marker(
      [station.latitude, station.longitude],
      {
        title: station.nom,
        alt: station.nom
      }
    )
      .bindPopup(creerFiche(station))
      .addTo(coucheStations);
  });

  const nombre = stationsVisibles.length;
  const message = document.getElementById("message-carte");

  if (nombre === 0) {
    message.textContent =
      "Aucune station ne correspond à cette sélection.";
  } else {
    const pluriel = nombre > 1 ? "s" : "";

    message.textContent =
      `${nombre} station${pluriel} affichée${pluriel}` +
      ` sur ${stations.length}.`;

    
  }
}


/* Créer la carte une seule fois */
function initialiserCarte() {
  if (carte !== null) {
    return;
  }

  if (typeof L === "undefined") {
    document.getElementById("message-carte").textContent =
      "La carte n’a pas pu être chargée. Actualisez la page.";
    return;
  }

  carte = L.map("carte-stations").setView(
    [43.59, 4.23],
    11
  );

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">' +
        "OpenStreetMap</a> contributors"
    }
  ).addTo(carte);

  coucheStations = L.featureGroup().addTo(carte);

  L.control.scale({
    imperial: false
  }).addTo(carte);

  actualiserStations();
}


/* Navigation entre les rubriques */
const rubriques = document.querySelectorAll("main > section");
const liens = document.querySelectorAll("nav a");

function afficherRubrique() {
  const rubriqueDemandee = window.location.hash.slice(1);

  const existe = Array.from(rubriques).some(
    rubrique => rubrique.id === rubriqueDemandee
  );

  const rubriqueActive = existe
    ? rubriqueDemandee
    : "accueil";

  rubriques.forEach(rubrique => {
    rubrique.hidden = rubrique.id !== rubriqueActive;
  });

  liens.forEach(lien => {
    const estActif =
      lien.getAttribute("href") === "#" + rubriqueActive;

    if (estActif) {
      lien.setAttribute("aria-current", "page");
    } else {
      lien.removeAttribute("aria-current");
    }
  });

  const titre = document.querySelector(
    "#" + rubriqueActive + " h2"
  );

  if (titre) {
    titre.setAttribute("tabindex", "-1");
    titre.focus({ preventScroll: true });
  }

  if (rubriqueActive === "carte") {
    initialiserCarte();

    requestAnimationFrame(() => {
      if (carte !== null) {
        carte.invalidateSize();
      }
    });
  }
}


/* Réagir aux changements de sélection */
document.querySelectorAll(".filtres-carte select").forEach(
  filtre => {
    filtre.addEventListener("change", actualiserStations);
  }
);


/* Réinitialiser les trois filtres */
const boutonReset = document.getElementById(
  "reinitialiser-filtres"
);

if (boutonReset) {
  boutonReset.addEventListener("click", () => {
    document.querySelectorAll(".filtres-carte select").forEach(
      filtre => {
        filtre.selectedIndex = 0;
      }
    );

    actualiserStations();
  });
}


/* Afficher la bonne rubrique au chargement */
window.addEventListener("hashchange", afficherRubrique);
afficherRubrique();

// Prendre en compte les clics et l'historique du navigateur.
window.addEventListener("hashchange", afficherRubrique);

// Afficher la rubrique au chargement.
afficherRubrique();
