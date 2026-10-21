/* FILMED Sud — graphiques des relevés mensuels.
   Le fichier mesures.csv doit être placé à côté de index.html. */
(() => {
  "use strict";

  const section = document.getElementById("graphiques");
  if (!section) return;

  const JOUR = 86400000;
  const parametres = [
    { cle: "salinite", colonne: "Salinité", nom: "Salinité", unite: "PSU" },
    { cle: "temperature", colonne: "Temp", nom: "Température", unite: "°C" },
    { cle: "oxygene", colonne: "Oxygène (mg/l)", nom: "Oxygène dissous", unite: "mg/L" }
  ];
  const palette = ["#167568", "#3f6eaa", "#b66b1e", "#94578f", "#7b7829", "#b3515b"];
  const formes = ["circle", "rect", "triangle", "rectRot", "crossRot", "star"];
  const dateCourte = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC"
  });
  const moisAnnee = new Intl.DateTimeFormat("fr-FR", {
    month: "short", year: "2-digit", timeZone: "UTC"
  });
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  const controles = document.getElementById("commandes-graphiques");
  const listeStations = document.getElementById("stations-graphiques");
  const debut = document.getElementById("date-debut");
  const fin = document.getElementById("date-fin");
  const message = document.getElementById("message-graphiques");
  const zone = document.getElementById("courbes-graphiques");
  const resume = document.getElementById("resume-donnees");

  let mesures = [];
  let nomsStations = [];
  let chargement = null;
  let stationSansDonnees = "";
  const graphiques = new Map();

  // Lire explicitement JJ/MM/AAAA, sans inverser mois et jour.
  function lireDate(valeur) {
    const morceaux = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(valeur ?? "").trim());
    if (!morceaux) return null;
    const [, j, m, a] = morceaux.map(Number);
    const temps = Date.UTC(a, m - 1, j);
    const date = new Date(temps);
    return date.getUTCFullYear() === a && date.getUTCMonth() === m - 1 && date.getUTCDate() === j
      ? temps : null;
  }

  // Une cellule vide reste absente : elle ne devient jamais zéro.
  function lireNombre(valeur) {
    const texte = String(valeur ?? "").trim();
    if (texte === "") return null;
    const normalise = texte.replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalise)) {
      throw new Error("Valeur numérique invalide : « " + texte + " ».");
    }
    const resultat = Number(normalise);
    if (!Number.isFinite(resultat)) throw new Error("Valeur numérique trop grande.");
    return resultat;
  }

  function lireMesures(texte) {
    const lecture = Papa.parse(texte.replace(/^\uFEFF/, ""), {
      header: true,
      delimiter: ";",
      skipEmptyLines: "greedy",
      transformHeader: entete => entete.trim()
    });
    if (lecture.errors.length) {
      throw new Error("Le CSV contient une ligne mal formée. Vérifiez les colonnes et les points-virgules.");
    }
    const colonnes = ["Date", "Station", ...parametres.map(p => p.colonne)];
    for (const colonne of colonnes) {
      if (!lecture.meta.fields?.includes(colonne)) {
        throw new Error("Colonne manquante dans mesures.csv : « " + colonne + " ».");
      }
    }
    const dejaVues = new Set();
    return lecture.data.map((ligne, index) => {
      const date = lireDate(ligne.Date);
      const station = String(ligne.Station ?? "").trim();
      if (date === null || !station) {
        throw new Error("Date ou station invalide à la ligne " + (index + 2) + ".");
      }
      const identifiant = JSON.stringify([station, date]);
      if (dejaVues.has(identifiant)) {
        throw new Error("Plusieurs relevés pour « " + station + " » à la même date. Vérifiez le CSV.");
      }
      dejaVues.add(identifiant);
      const mesure = { station, date };
      for (const p of parametres) mesure[p.cle] = lireNombre(ligne[p.colonne]);
      return mesure;
    }).sort((a, b) => a.date - b.date);
  }

  function dateISO(temps) {
    return new Date(temps).toISOString().slice(0, 10);
  }

  function dateChoisie(champ) {
    return champ.value ? Date.parse(champ.value + "T00:00:00Z") : null;
  }

  function valeursCochees(nom) {
    return Array.from(section.querySelectorAll('input[name="' + nom + '"]:checked'), c => c.value);
  }

  // Un lien de la carte ressemble à #graphiques?station=Marette%20sud.
  // Les choix de paramètres et de période restent ceux du visiteur.
  function preselectionnerStation() {
    const recherche = window.location.hash.split("?").slice(1).join("?");
    const demandee = new URLSearchParams(recherche).get("station")?.trim() || "";
    stationSansDonnees = "";
    if (!demandee) return;
    section.querySelectorAll('input[name="station-graphe"]').forEach(caseACocher => {
      caseACocher.checked = caseACocher.value === demandee;
    });
    if (!nomsStations.includes(demandee)) stationSansDonnees = demandee;
  }

  function viderGraphiques() {
    for (const element of graphiques.values()) element.chart.destroy();
    graphiques.clear();
    zone.replaceChildren();
  }

  // Les changements de filtres mettent à jour les graphiques existants.
  function actualiser() {
    if (!mesures.length || section.hidden) return;
    const choisies = valeursCochees("station-graphe");
    const cles = valeursCochees("parametre-graphe");
    const du = dateChoisie(debut);
    const au = dateChoisie(fin);
    const erreur = !choisies.length
      ? stationSansDonnees
        ? "Les relevés de « " + stationSansDonnees + " » ne sont pas encore disponibles dans ce portail. Choisissez une autre station pour consulter ses mesures."
        : "Cochez au moins une station."
      : !cles.length ? "Cochez au moins un paramètre."
      : du === null || au === null || !Number.isFinite(du) || !Number.isFinite(au)
        ? "Renseignez les deux dates de la période."
      : du > au ? "La date de début doit précéder ou être égale à la date de fin." : "";
    debut.setCustomValidity(du > au && au !== null ? "Vérifiez l’ordre des dates." : "");
    if (erreur) {
      viderGraphiques();
      message.textContent = erreur;
      return;
    }
    const selection = mesures.filter(m => choisies.includes(m.station) && m.date >= du && m.date <= au);
    if (!selection.length) {
      viderGraphiques();
      message.textContent = "Aucun relevé pour ces stations sur cette période.";
      return;
    }
    for (const [cle, element] of graphiques) {
      if (!cles.includes(cle)) {
        element.chart.destroy();
        element.article.remove();
        graphiques.delete(cle);
      }
    }
    let total = 0;
    for (const p of parametres.filter(p => cles.includes(p.cle))) {
      const datasets = choisies.map(station => {
        const index = nomsStations.indexOf(station);
        return {
          label: station,
          data: selection.filter(m => m.station === station).map(m => ({ x: m.date, y: m[p.cle] })),
          borderColor: palette[index % palette.length],
          backgroundColor: palette[index % palette.length],
          pointStyle: formes[index % formes.length],
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 12,
          tension: 0,
          spanGaps: false
        };
      });
      const compte = datasets.reduce((n, d) => n + d.data.filter(point => point.y !== null).length, 0);
      total += compte;
      let element = graphiques.get(p.cle);
      if (!element) {
        const article = document.createElement("article");
        article.className = "carte-graphique";
        const titre = document.createElement("h3");
        titre.textContent = p.nom + " (" + p.unite + ")";
        const info = document.createElement("p");
        const cadre = document.createElement("div");
        cadre.className = "cadre-courbe";
        const canvas = document.createElement("canvas");
        canvas.setAttribute("role", "img");
        canvas.textContent = "Graphique de " + p.nom + ".";
        cadre.append(canvas);
        article.append(titre, info, cadre);
        zone.append(article);
        const chart = new Chart(canvas, {
          type: "line",
          data: { datasets: [] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            locale: "fr-FR",
            animation: { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250 },
            interaction: { mode: "nearest", intersect: false },
            plugins: {
              legend: { position: "bottom", labels: { usePointStyle: true, padding: 18 } },
              tooltip: {
                callbacks: {
                  title: elements => elements.length ? dateCourte.format(elements[0].parsed.x) : "",
                  label: contexte => contexte.dataset.label + " : " + nombre.format(contexte.parsed.y) + " " + p.unite
                }
              }
            },
            scales: {
              x: {
                type: "linear",
                title: { display: true, text: "Date du relevé" },
                ticks: { maxTicksLimit: 7, maxRotation: 0 },
                grid: { display: false }
              },
              y: {
                title: { display: true, text: p.nom + " (" + p.unite + ")" },
                grace: "10%",
                ticks: { callback: valeur => nombre.format(valeur) },
                grid: { color: "#e9eeeb" }
              }
            }
          }
        });
        element = { article, info, cadre, canvas, chart };
        graphiques.set(p.cle, element);
      }
      // Conserver l’ordre Salinité / Température / Oxygène.
      zone.append(element.article);
      element.info.textContent = compte ? compte + " valeurs mesurées sur la sélection."
        : "Aucune valeur disponible pour ce paramètre sur la sélection.";
      element.cadre.hidden = compte === 0;
      element.canvas.setAttribute("aria-label", p.nom + " en " + p.unite + ", " + choisies.join(", ")
        + ", du " + dateCourte.format(du) + " au " + dateCourte.format(au) + ". " + compte + " valeurs.");
      element.chart.data.datasets = datasets;
      const axe = element.chart.options.scales.x;
      // Une seule journée reste visible avec une petite marge horizontale.
      axe.min = du === au ? du - JOUR / 2 : du;
      axe.max = du === au ? au + JOUR / 2 : au;
      axe.ticks.callback = valeur => (au - du < 90 * JOUR ? dateCourte : moisAnnee).format(valeur);
      element.chart.update();
    }
    message.textContent = selection.length + " relevés sélectionnés · " + choisies.length
      + " station(s) · " + total + " valeurs pour les paramètres cochés.";
  }

  function preparerControles() {
    nomsStations = [...new Set(mesures.map(m => m.station))].sort((a, b) => a.localeCompare(b, "fr"));
    listeStations.replaceChildren();
    for (const station of nomsStations) {
      const label = document.createElement("label");
      const caseACocher = document.createElement("input");
      caseACocher.type = "checkbox";
      caseACocher.name = "station-graphe";
      caseACocher.value = station;
      caseACocher.checked = true;
      const texte = document.createElement("span");
      texte.textContent = station;
      label.append(caseACocher, texte);
      listeStations.append(label);
    }
    for (const champ of [debut, fin]) {
      champ.min = dateISO(mesures[0].date);
      champ.max = dateISO(mesures[mesures.length - 1].date);
    }
    debut.value = debut.min;
    fin.value = fin.max;
    controles.disabled = false;
    resume.textContent = "SMCG · Relevés mensuels sans télétransmission · " + mesures.length
      + " relevés disponibles, du " + dateCourte.format(mesures[0].date)
      + " au " + dateCourte.format(mesures[mesures.length - 1].date) + ".";
    controles.addEventListener("change", evenement => {
      if (evenement.target.name === "station-graphe") stationSansDonnees = "";
      actualiser();
    });
    for (const champ of [debut, fin]) champ.addEventListener("input", actualiser);
    document.getElementById("retablir-graphiques").addEventListener("click", () => {
      stationSansDonnees = "";
      controles.querySelectorAll('input[type="checkbox"]').forEach(c => { c.checked = true; });
      debut.value = debut.min;
      fin.value = fin.max;
      actualiser();
    });
  }

  async function charger() {
    try {
      if (typeof Chart === "undefined" || typeof Papa === "undefined") {
        throw new Error("Un outil graphique n’a pas pu être chargé. Vérifiez votre connexion puis actualisez la page.");
      }
      const reponse = await fetch("mesures.csv", { cache: "no-cache" });
      if (!reponse.ok) throw new Error("mesures.csv est introuvable ou inaccessible (HTTP " + reponse.status + ").");
      mesures = lireMesures(await reponse.text());
      if (!mesures.length) throw new Error("Le fichier mesures.csv ne contient aucun relevé.");
      preparerControles();
      preselectionnerStation();
      message.textContent = "Données chargées.";
      actualiser();
    } catch (erreur) {
      viderGraphiques();
      controles.disabled = true;
      message.textContent = "Impossible d’afficher les graphiques : " + erreur.message;
      console.error(erreur);
      chargement = null;
    }
  }

  function afficherSiNecessaire() {
    if (section.hidden) return;
    if (!mesures.length) {
      if (!chargement) chargement = charger();
    } else {
      requestAnimationFrame(() => {
        preselectionnerStation();
        actualiser();
        for (const element of graphiques.values()) element.chart.resize();
      });
    }
  }

  window.addEventListener("hashchange", () => requestAnimationFrame(afficherSiNecessaire));
  afficherSiNecessaire();
})();
