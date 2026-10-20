/* =========================================
   STATIONS ET COORDONNÉES
   ========================================= */

const stations = [
  {
    nom: "Chenal Marette",
    latitude: 43.552118917373306,
    longitude: 4.170558794461427
  },
  {
    nom: "Marette sud",
    latitude: 43.55308777446753,
    longitude: 4.170699836116174
  },
  {
    nom: "Médard Sud Ouest",
    latitude: 43.541609743542324,
    longitude: 4.142196992593226
  },
  {
    nom: "Ponant",
    latitude: 43.564589198174176,
    longitude: 4.121582251596615
  }
];


/* =========================================
   CRÉATION DE LA CARTE
   ========================================= */

let carte = null;

function initialiserCarte() {
  // Conserver la carte si elle existe déjà.
  if (carte !== null) {
    return;
  }

  // Afficher un message si Leaflet n'a pas pu être chargé.
  if (typeof L === "undefined") {
    document.getElementById("message-carte").textContent =
      "La carte n’a pas pu être chargée. Actualisez la page.";
    return;
  }

  carte = L.map("carte-stations");

  // Fond de carte OpenStreetMap.
  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">' +
        "OpenStreetMap</a> contributors"
    }
  ).addTo(carte);

  const points = [];

  // Ajouter chaque station.
  stations.forEach(station => {
    const point = L.marker(
      [station.latitude, station.longitude],
      {
        title: station.nom,
        alt: station.nom
      }
    ).addTo(carte);

        // Préparer la fiche du point.
    const fiche = document.createElement("div");

    const titre = document.createElement("strong");
    titre.textContent = station.nom;

    const organisme = document.createElement("div");
    organisme.textContent =
      "SMCG — Syndicat Mixte Camargue Gardoise";

    const mode = document.createElement("div");
    mode.textContent =
      "Relevés mensuels — sans télétransmission";

    const parametres = document.createElement("div");
    parametres.textContent =
      "Salinité · Température · Oxygène";

    const lien = document.createElement("a");
    lien.href = "https://www.camarguegardoise.com/";
    lien.textContent = "Site du SMCG";
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";

    fiche.append(
      titre,
      organisme,
      mode,
      parametres,
      lien
    );

    point.bindPopup(fiche);
    points.push(point);
  });

  // Cadrer la carte sur les quatre stations.
  const groupe = L.featureGroup(points);

  carte.fitBounds(groupe.getBounds(), {
    padding: [35, 35],
    maxZoom: 14
  });

  // Ajouter une échelle en mètres et kilomètres.
  L.control.scale({
    imperial: false
  }).addTo(carte);
}


/* =========================================
   NAVIGATION ENTRE LES RUBRIQUES
   ========================================= */

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

  // Afficher uniquement la rubrique choisie.
  rubriques.forEach(rubrique => {
    rubrique.hidden = rubrique.id !== rubriqueActive;
  });

  // Identifier le bouton sélectionné.
  liens.forEach(lien => {
    const estActif =
      lien.getAttribute("href") === "#" + rubriqueActive;

    if (estActif) {
      lien.setAttribute("aria-current", "page");
    } else {
      lien.removeAttribute("aria-current");
    }
  });

  // Placer le focus sur le titre de la rubrique.
  const titre = document.querySelector(
    "#" + rubriqueActive + " h2"
  );

  if (titre) {
    titre.setAttribute("tabindex", "-1");
    titre.focus({ preventScroll: true });
  }

  // Charger la carte lorsqu'elle devient visible.
  if (rubriqueActive === "carte") {
    initialiserCarte();

    // Réajuster la carte après un changement d'onglet.
    requestAnimationFrame(() => {
      if (carte !== null) {
        carte.invalidateSize();
      }
    });
  }
}

// Prendre en compte les clics et l'historique du navigateur.
window.addEventListener("hashchange", afficherRubrique);

// Afficher la rubrique au chargement.
afficherRubrique();
