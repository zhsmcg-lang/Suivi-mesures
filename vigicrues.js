/* Couche Vigicrues : charger après app.js. La copie du flux est préparée par GitHub Actions. */
(() => {
  "use strict";
  const conteneur = document.getElementById("carte-stations");
  if (!conteneur || document.getElementById("vigilance-crues-controles")) return;
  const SOURCE = "https://www.vigicrues.gouv.fr/";
  const CODES = ["GA6", "GA32", "GA9"];
  const NIVEAUX = {
    1: { nom: "Vert", couleur: "#27823b" },
    2: { nom: "Jaune", couleur: "#f3d321" },
    3: { nom: "Orange", couleur: "#e67e00" },
    4: { nom: "Rouge", couleur: "#d92332" }
  };
  const VERIFICATION_MAX = 90 * 60000;
  const PUBLICATION_MAX = 30 * 3600000;
  const INTERVALLE = 5 * 60000;
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
  let couche = null, dernierFlux = null, chargement = null, derniereLecture = 0;
  const creer = (tag, texte, classe) => {
    const element = document.createElement(tag);
    if (texte !== undefined) element.textContent = texte;
    if (classe) element.className = classe;
    return element;
  };
  const bloc = creer("aside", undefined, "bloc-vigicrues");
  bloc.id = "vigilance-crues-controles"; bloc.setAttribute("aria-labelledby", "titre-vigilance-crues");
  const titre = creer("h3", "Vigilance crues — Vigicrues"); titre.id = "titre-vigilance-crues";
  const choix = creer("label", undefined, "choix-vigicrues");
  const caseACocher = creer("input"); caseACocher.type = "checkbox"; caseACocher.id = "afficher-vigilance-crues";
  choix.append(caseACocher, creer("span", "Afficher la vigilance sur les cours d’eau"));
  const outils = creer("div", undefined, "outils-vigicrues");
  const actualiser = creer("button", "Actualiser"); actualiser.type = "button"; actualiser.disabled = true;
  outils.append(choix, actualiser);
  const statut = creer("span", "Activez la couche pour consulter le Vidourle, le Vistre et le Rhône d’Avignon à la mer.");
  statut.id = "statut-vigicrues"; statut.setAttribute("role", "status"); statut.setAttribute("aria-live", "polite");
  const dates = creer("p", undefined, "dates-vigicrues"); dates.id = "dates-vigicrues";
  const legende = creer("div", undefined, "legende-vigicrues"); legende.hidden = true;
  legende.setAttribute("aria-label", "Niveaux de vigilance crues");
  legende.append(creer("span", "Légende :"));
  for (const niveau of Object.values(NIVEAUX)) {
    const item = creer("span"), pastille = creer("span", undefined, "pastille-vigicrues");
    pastille.style.backgroundColor = niveau.couleur; pastille.setAttribute("aria-hidden", "true");
    item.append(pastille, creer("span", niveau.nom)); legende.append(item);
  }
  const liste = creer("ul", undefined, "liste-vigicrues"); liste.id = "troncons-vigicrues";
  const aide = creer("p", undefined, "aide-vigicrues");
  const officiel = creer("a", "Vigicrues"); officiel.href = SOURCE; officiel.target = "_blank"; officiel.rel = "noopener noreferrer";
  aide.append(statut, document.createTextNode(" La vigilance concerne des tronçons de cours d’eau. Pour les bulletins et les consignes, consultez "), officiel, document.createTextNode("."));
  bloc.append(titre, outils, dates, liste, legende, aide);
  conteneur.after(bloc);

  function obtenirCarte() { return typeof carte !== "undefined" ? carte : null; }
  function retirerCouche() { if (couche) { couche.remove(); couche = null; } }
  function retirerNiveaux() { retirerCouche(); liste.replaceChildren(); legende.hidden = true; }
  function instant(texte) {
    if (typeof texte !== "string" || !/(?:Z|[+-]\d{2}:\d{2})$/.test(texte)) return NaN;
    return Date.parse(texte);
  }
  function controlerFlux(flux, maintenant = Date.now()) {
    if (!flux || flux.type !== "FeatureCollection" || flux.etat !== "disponible") throw new Error("La source Vigicrues n’a pas pu être actualisée.");
    const publication = instant(flux.publication), verification = instant(flux.verifieLe);
    if (!Number.isFinite(publication) || !Number.isFinite(verification)) throw new Error("La date de publication ou de vérification est absente.");
    if (verification > maintenant + 10 * 60000 || publication > verification + 10 * 60000) throw new Error("Les dates du flux sont incohérentes. Vérifiez également l’horloge de votre appareil.");
    if (maintenant - verification > VERIFICATION_MAX) throw new Error("La synchronisation GitHub date de plus de 90 minutes. Consultez Vigicrues pour la situation actuelle.");
    if (maintenant - publication > PUBLICATION_MAX) throw new Error("La dernière publication reçue date de plus de 30 heures. Consultez Vigicrues pour la situation actuelle.");
    if (!Array.isArray(flux.features) || flux.features.length !== CODES.length) throw new Error("La liste des tronçons est incomplète.");
    const vus = new Set();
    for (const feature of flux.features) {
      const p = feature.properties || {};
      if (feature.type !== "Feature" || !CODES.includes(p.code) || vus.has(p.code)) throw new Error("Un tronçon est absent, inconnu ou présent deux fois.");
      vus.add(p.code);
      if (p.niveau !== null && !Object.hasOwn(NIVEAUX, p.niveau)) throw new Error("Un niveau de vigilance est inconnu.");
      const geometrie = feature.geometry;
      if (!geometrie || !["LineString", "MultiLineString"].includes(geometrie.type)) throw new Error("Le tracé d’un tronçon est invalide.");
      const lignes = geometrie.type === "LineString" ? [geometrie.coordinates] : geometrie.coordinates;
      if (!Array.isArray(lignes) || !lignes.length || lignes.some(l => !Array.isArray(l) || l.length < 2 || l.some(c => !Array.isArray(c) || c.length < 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1]) || Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90))) throw new Error("Les coordonnées d’un tronçon sont invalides.");
    }
    return { publication, verification };
  }
  function afficherDates(flux) {
    const publication = instant(flux?.publication);
    dates.textContent = Number.isFinite(publication) ? "Publication Vigicrues : " + date.format(publication) + "." : "";
  }
  function indisponible(message) {
    retirerNiveaux(); bloc.dataset.etat = "indisponible";
    statut.textContent = "Information indisponible ou à actualiser. " + message;
    afficherDates(dernierFlux);
  }
  function fiche(feature, publication) {
    const p = feature.properties, niveau = NIVEAUX[p.niveau];
    const element = creer("div", undefined, "fiche-vigicrues");
    element.append(creer("strong", p.nom || p.code), creer("div", "Vigilance : " + (niveau?.nom || "niveau non renseigné")),
      creer("div", "Publication : " + date.format(publication)), creer("div", "Source : Vigicrues"));
    const lien = creer("a", "Consulter le bulletin officiel"); lien.href = SOURCE; lien.target = "_blank"; lien.rel = "noopener noreferrer";
    element.append(lien); return element;
  }
  function afficher(flux) {
    if (!caseACocher.checked) return;
    try {
      const { publication } = controlerFlux(flux), map = obtenirCarte();
      afficherDates(flux);
      if (!map || typeof L === "undefined") throw new Error("La carte n’est pas encore disponible. Revenez sur Carte des suivis puis réessayez.");
      retirerNiveaux();
      if (!map.getPane("vigilance-crues")) map.createPane("vigilance-crues").style.zIndex = "350";
      couche = L.geoJSON(flux, {
        pane: "vigilance-crues",
        style: feature => ({ color: NIVEAUX[feature.properties.niveau]?.couleur || "#68777a", weight: 5, opacity: 0.95,
          dashArray: feature.properties.niveau === null ? "6 5" : undefined }),
        onEachFeature: (feature, trait) => trait.bindPopup(fiche(feature, publication), { maxWidth: 310 })
      }).addTo(map);
      for (const feature of flux.features) {
        const p = feature.properties, niveau = NIVEAUX[p.niveau], item = creer("li");
        const puce = creer("span", undefined, "pastille-vigicrues"); puce.style.backgroundColor = niveau?.couleur || "#68777a"; puce.setAttribute("aria-hidden", "true");
        const nom = creer("span", p.nom || p.code, "nom-troncon-vigicrues");
        const etat = creer("span", undefined, "etat-troncon-vigicrues");
        etat.append(puce, creer("strong", niveau?.nom || "niveau non renseigné"));
        item.append(nom, etat); liste.append(item);
      }
      legende.hidden = false; bloc.dataset.etat = "disponible";
      statut.textContent = "Trois tronçons affichés. Source : Vigicrues. La vigilance est indépendante des filtres des stations.";
      // La couche ne change ni le zoom ni la position de la carte.
    } catch (erreur) { indisponible(erreur.message); }
  }
  async function charger() {
    if (chargement) return chargement;
    actualiser.disabled = true; statut.textContent = "Lecture de la dernière vigilance disponible…";
    const controle = new AbortController(), delai = setTimeout(() => controle.abort(), 15000);
    chargement = (async () => {
      try {
        const reponse = await fetch("data/vigicrues.geojson", { cache: "no-store", signal: controle.signal });
        if (!reponse.ok) throw new Error("Le flux local n’est pas disponible. Vérifiez la publication GitHub Actions.");
        const flux = await reponse.json();
        dernierFlux = flux; controlerFlux(flux); derniereLecture = Date.now();
        if (caseACocher.checked) afficher(flux);
      } catch (erreur) {
        derniereLecture = 0;
        if (caseACocher.checked) indisponible(erreur.name === "AbortError" ? "La lecture du flux a pris trop de temps." : erreur.message);
      } finally {
        clearTimeout(delai); chargement = null; actualiser.disabled = !caseACocher.checked;
      }
    })();
    return chargement;
  }
  function auRetour() {
    if (!caseACocher.checked || document.hidden || window.location.hash.slice(1).split("?")[0] !== "carte") return;
    if (!dernierFlux || Date.now() - derniereLecture >= INTERVALLE) charger();
    else if (!couche) afficher(dernierFlux);
    else {
      try { controlerFlux(dernierFlux); } catch (erreur) { indisponible(erreur.message); }
    }
  }
  caseACocher.addEventListener("change", () => {
    actualiser.disabled = !caseACocher.checked;
    if (caseACocher.checked) charger();
    else { retirerNiveaux(); dates.textContent = ""; bloc.dataset.etat = "masque"; statut.textContent = "La couche de vigilance est masquée."; }
  });
  actualiser.addEventListener("click", charger);
  window.addEventListener("hashchange", () => requestAnimationFrame(auRetour));
  document.addEventListener("visibilitychange", auRetour);
  setInterval(auRetour, 60000);
})();
