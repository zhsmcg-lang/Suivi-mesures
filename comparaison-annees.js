/* Comparaison des années, à charger APRÈS graphiques.js.
   Ce fichier réutilise les mesures déjà chargées ; aucun téléchargement supplémentaire du CSV. */
(() => {
  "use strict";
  const section = document.getElementById("graphiques");
  const commandes = document.getElementById("commandes-graphiques");
  if (!section || !commandes) return;

  const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const parametres = [
    { cle: "salinite", nom: "Salinité", unite: "PSU" },
    { cle: "temperature", nom: "Température", unite: "°C" },
    { cle: "oxygene", nom: "Oxygène dissous", unite: "mg/L" }
  ];
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  const formes = ["circle", "rect", "triangle", "rectRot", "crossRot", "star"];
  const courbes = new Map();
  const message = document.getElementById("message-graphiques");
  const zoneChronologie = document.getElementById("courbes-graphiques");
  let mesures = [];
  let vue = null;
  let station = null;
  let listeAnnees = null;
  let panneau = null;
  let zone = null;

  function annee(date) { return new Date(date).getUTCFullYear(); }
  function active() { return vue?.value === "annees"; }
  function anneesCochees() {
    return Array.from(listeAnnees.querySelectorAll('input:checked'), caseACocher => Number(caseACocher.value));
  }
  function couleur(annee) { return "hsl(" + ((annee * 137.508) % 360).toFixed(1) + ", 60%, 36%)"; }
  function vider() {
    for (const courbe of courbes.values()) courbe.chart.destroy();
    courbes.clear();
    zone?.replaceChildren();
  }

  // Une moyenne par mois, en conservant séparément le nombre de mesures.
  function resumerAnnee(releves, cle) {
    const groupes = Array.from({ length: 12 }, () => []);
    const valeurs = [];
    for (const mesure of releves) {
      if (mesure[cle] === null) continue;
      groupes[new Date(mesure.date).getUTCMonth()].push(mesure[cle]);
      valeurs.push(mesure[cle]);
    }
    return {
      points: groupes.map(groupe => groupe.length ? groupe.reduce((s, v) => s + v, 0) / groupe.length : null),
      effectifs: groupes.map(groupe => groupe.length),
      n: valeurs.length,
      minimum: valeurs.length ? Math.min(...valeurs) : null,
      moyenne: valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : null,
      maximum: valeurs.length ? Math.max(...valeurs) : null,
      mois: groupes.filter(groupe => groupe.length).length
    };
  }

  function preparerAnnees() {
    const disponibles = [...new Set(mesures.filter(m => m.station === station.value).map(m => annee(m.date)))].sort((a, b) => b - a);
    listeAnnees.replaceChildren();
    disponibles.forEach((valeur, index) => {
      const label = document.createElement("label");
      const caseACocher = document.createElement("input");
      caseACocher.type = "checkbox";
      caseACocher.name = "annee-comparaison";
      caseACocher.value = String(valeur);
      caseACocher.checked = index < 3;
      const texte = document.createElement("span");
      texte.textContent = String(valeur);
      label.append(caseACocher, texte);
      listeAnnees.append(label);
    });
  }

  function appliquerVue() {
    if (!vue) return;
    const comparaison = active();
    const periode = commandes.querySelector(".periode-graphiques");
    const choixStations = document.getElementById("stations-graphiques")?.parentElement;
    if (periode) periode.hidden = comparaison;
    if (choixStations) choixStations.hidden = comparaison;
    panneau.hidden = !comparaison;
    zone.hidden = !comparaison;
    zoneChronologie.hidden = comparaison;
    const aide = section.querySelector(".aide-graphiques");
    if (aide) aide.hidden = comparaison;
    window.dispatchEvent(new CustomEvent("filmed:vue-annees", { detail: comparaison }));
    if (comparaison) actualiser();
  }

  function creerGraphique(p) {
    const article = document.createElement("article");
    article.className = "carte-graphique";
    const titre = document.createElement("h3");
    titre.textContent = p.nom + " (" + p.unite + ") — comparaison des années";
    const info = document.createElement("p");
    const aide = document.createElement("p");
    aide.className = "methode-graphique";
    aide.textContent = "Chaque point représente la moyenne des relevés du mois pour une année. Les mois sans valeur restent vides. "
      + "Une couleur et un symbole correspondent à une année, identiques dans tous les graphiques. Cette vue présente les moyennes mensuelles sans lissage.";
    const cadre = document.createElement("div");
    cadre.className = "cadre-courbe";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    cadre.append(canvas);
    const outils = document.createElement("div");
    outils.className = "outils-zoom";
    outils.setAttribute("role", "group");
    outils.setAttribute("aria-label", "Zoom de la comparaison de " + p.nom);
    const boutons = ["Agrandir", "Réduire", "Vue complète"].map(texte => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = texte;
      outils.append(bouton);
      return bouton;
    });
    const aideZoom = document.createElement("p");
    aideZoom.className = "aide-zoom";
    const details = document.createElement("details");
    details.className = "reperes-graphiques";
    const sommaire = document.createElement("summary");
    sommaire.textContent = "Repères chiffrés par année";
    const methode = document.createElement("p");
    methode.textContent = "Ces repères portent sur les relevés disponibles entre janvier et décembre de chaque année sélectionnée. "
      + "La moyenne est celle des relevés, tandis que les points du graphique sont des moyennes mensuelles. Le zoom ne change pas les calculs.";
    const conteneur = document.createElement("div");
    conteneur.className = "tableau-reperes";
    conteneur.tabIndex = 0;
    conteneur.setAttribute("role", "region");
    conteneur.setAttribute("aria-label", "Repères annuels pour " + p.nom + ", tableau défilant horizontalement si nécessaire");
    const tableau = document.createElement("table");
    const caption = document.createElement("caption");
    caption.textContent = p.nom + " — synthèse par année";
    const entetes = document.createElement("thead");
    const ligne = document.createElement("tr");
    for (const texte of ["Année", "Nombre de valeurs", "Minimum (" + p.unite + ")", "Moyenne (" + p.unite + ")", "Maximum (" + p.unite + ")", "Mois avec données"]) {
      const cellule = document.createElement("th");
      cellule.scope = "col";
      cellule.textContent = texte;
      ligne.append(cellule);
    }
    entetes.append(ligne);
    const corps = document.createElement("tbody");
    tableau.append(caption, entetes, corps);
    conteneur.append(tableau);
    details.append(sommaire, methode, conteneur);
    article.append(titre, info, aide, outils, aideZoom, cadre, details);
    zone.append(article);
    const chart = new Chart(canvas, {
      type: "line",
      data: { labels: mois, datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        locale: "fr-FR",
        animation: { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, padding: 18 } },
          tooltip: { callbacks: {
            title: elements => elements[0]?.label || "",
            label: contexte => contexte.dataset.label + " : " + nombre.format(contexte.parsed.y) + " " + p.unite,
            afterLabel: contexte => {
              const n = contexte.dataset.effectifs[contexte.dataIndex];
              return n + " relevé" + (n > 1 ? "s" : "") + " pour cette moyenne mensuelle";
            }
          } },
          zoom: {
            pan: { enabled: false },
            limits: { x: { min: 0, max: 11, minRange: 1 } },
            zoom: {
              mode: "x",
              wheel: { enabled: true, modifierKey: "ctrl", speed: 0.1 },
              drag: { enabled: true, modifierKey: "shift", threshold: 10, backgroundColor: "rgba(22,117,104,0.15)" },
              pinch: { enabled: true }
            }
          }
        },
        scales: {
          x: { type: "category", min: 0, max: 11, title: { display: true, text: "Mois de l’année" }, ticks: { maxRotation: 45 }, grid: { display: false } },
          y: { title: { display: true, text: p.nom + " (" + p.unite + ")" }, grace: "10%", grid: { color: "#e9eeeb" } }
        }
      }
    });
    const disponible = typeof chart.zoom === "function";
    boutons.forEach(bouton => { bouton.disabled = !disponible; });
    aideZoom.textContent = disponible ? "Ctrl + molette ou Maj + glisser pour zoomer sur les mois. Les boutons sont également utilisables."
      : "La comparaison reste consultable. Le zoom nécessite le module de zoom dans index.html.";
    boutons[0].addEventListener("click", () => { if (disponible) chart.zoom({ x: 1.4 }, "none"); });
    boutons[1].addEventListener("click", () => { if (disponible) chart.zoom({ x: 0.7 }, "none"); });
    boutons[2].addEventListener("click", () => {
      if (typeof chart.resetZoom === "function") chart.resetZoom("none");
      chart.options.scales.x.min = 0;
      chart.options.scales.x.max = 11;
      chart.update("none");
    });
    return { article, chart, info, cadre, canvas, corps, signature: null };
  }

  function actualiser() {
    if (!active() || section.hidden || !mesures.length) return;
    const annees = anneesCochees().sort((a, b) => a - b);
    const cles = Array.from(section.querySelectorAll('input[name="parametre-graphe"]:checked'), c => c.value);
    if (!annees.length || !cles.length) {
      vider();
      message.textContent = !annees.length ? "Cochez au moins une année à comparer." : "Cochez au moins un paramètre.";
      return;
    }
    for (const [cle, courbe] of courbes) {
      if (!cles.includes(cle)) { courbe.chart.destroy(); courbe.article.remove(); courbes.delete(cle); }
    }
    const relevesStation = mesures.filter(m => m.station === station.value);
    let total = 0;
    for (const p of parametres.filter(p => cles.includes(p.cle))) {
      let courbe = courbes.get(p.cle);
      if (!courbe) { courbe = creerGraphique(p); courbes.set(p.cle, courbe); }
      const series = annees.map(valeur => ({ annee: valeur, resume: resumerAnnee(relevesStation.filter(m => annee(m.date) === valeur), p.cle) }));
      const compte = series.reduce((s, serie) => s + serie.resume.n, 0);
      total += compte;
      courbe.chart.data.datasets = series.map(serie => ({
        label: String(serie.annee),
        data: serie.resume.points,
        effectifs: serie.resume.effectifs,
        borderColor: couleur(serie.annee),
        backgroundColor: "#ffffff",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: couleur(serie.annee),
        pointBorderWidth: 2,
        pointStyle: formes[serie.annee % formes.length],
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0,
        spanGaps: false
      }));
      courbe.info.textContent = station.value + " · " + compte + " valeurs utilisées pour les moyennes mensuelles.";
      courbe.cadre.hidden = compte === 0;
      if (!compte) courbe.info.textContent += " Aucune valeur disponible pour ce paramètre sur les années choisies.";
      courbe.canvas.setAttribute("aria-label", p.nom + " en " + p.unite + ", station " + station.value + ", années " + annees.join(", ") + ". Moyennes de janvier à décembre.");
      courbe.corps.replaceChildren();
      for (const serie of series) {
        const ligne = document.createElement("tr");
        const entete = document.createElement("th");
        entete.scope = "row";
        entete.textContent = String(serie.annee);
        ligne.append(entete);
        const s = serie.resume;
        for (const valeur of [s.n, s.minimum, s.moyenne, s.maximum, s.mois + " / 12"]) {
          const cellule = document.createElement("td");
          cellule.textContent = valeur === null ? "—" : typeof valeur === "number" ? nombre.format(valeur) : valeur;
          ligne.append(cellule);
        }
        courbe.corps.append(ligne);
      }
      const signature = JSON.stringify([station.value, annees]);
      if (signature !== courbe.signature) {
        if (typeof courbe.chart.resetZoom === "function") courbe.chart.resetZoom("none");
        courbe.chart.options.scales.x.min = 0;
        courbe.chart.options.scales.x.max = 11;
        courbe.signature = signature;
      }
      courbe.chart.update();
      zone.append(courbe.article);
    }
    message.textContent = "Comparaison des années · " + station.value + " · " + annees.length + " année(s) · " + total + " valeurs disponibles pour les paramètres cochés.";
  }

  function initialiser(donnees) {
    if (vue) return;
    mesures = donnees;
    const nomsStations = [...new Set(mesures.map(m => m.station))].sort((a, b) => a.localeCompare(b, "fr"));
    const choixVue = document.createElement("label");
    choixVue.className = "choix-vue-graphiques";
    const texteVue = document.createElement("span");
    texteVue.textContent = "Vue des graphiques";
    vue = document.createElement("select");
    vue.id = "vue-graphiques";
    for (const [valeur, texte] of [["chronologie", "Évolution dans le temps"], ["annees", "Comparer les années"]]) {
      const option = document.createElement("option"); option.value = valeur; option.textContent = texte; vue.append(option);
    }
    vue.value = "chronologie";
    choixVue.append(texteVue, vue);
    commandes.before(choixVue);
    panneau = document.createElement("div");
    panneau.className = "commandes-comparaison";
    panneau.hidden = true;
    const choixStation = document.createElement("label");
    choixStation.className = "choix-station-comparaison";
    const texteStation = document.createElement("span");
    texteStation.textContent = "Station à comparer";
    station = document.createElement("select");
    station.id = "station-comparaison";
    for (const nom of nomsStations) {
      const option = document.createElement("option"); option.value = nom; option.textContent = nom; station.append(option);
    }
    const cochees = Array.from(section.querySelectorAll('input[name="station-graphe"]:checked'), c => c.value);
    station.value = cochees.length === 1 ? cochees[0] : nomsStations[0];
    choixStation.append(texteStation, station);
    const choixAnnees = document.createElement("fieldset");
    choixAnnees.className = "choix-graphiques";
    const legende = document.createElement("legend");
    legende.textContent = "Années à comparer";
    listeAnnees = document.createElement("div");
    listeAnnees.id = "annees-comparaison";
    listeAnnees.className = "cases-graphiques annees-comparaison";
    choixAnnees.append(legende, listeAnnees);
    const aide = document.createElement("p");
    aide.textContent = "Choisissez une seule station et les années à comparer. Les trois années les plus récentes sont cochées au départ. "
      + "Les années choisies sont prises de janvier à décembre, indépendamment des dates de la vue chronologique. Une année peut être incomplète ; les mois disponibles sont indiqués dans les repères.";
    panneau.append(choixStation, choixAnnees, aide);
    const groupeStations = document.getElementById("stations-graphiques")?.parentElement;
    if (groupeStations) groupeStations.before(panneau);
    else commandes.append(panneau);
    zone = document.createElement("div");
    zone.id = "courbes-comparaison";
    zone.hidden = true;
    zoneChronologie.after(zone);
    preparerAnnees();
    vue.addEventListener("change", appliquerVue);
    station.addEventListener("change", () => { preparerAnnees(); actualiser(); });
    commandes.addEventListener("change", () => { if (active()) actualiser(); });
    document.getElementById("retablir-graphiques")?.addEventListener("click", () => {
      if (!active()) return;
      listeAnnees.querySelectorAll("input").forEach(caseACocher => { caseACocher.checked = true; });
      actualiser();
    });
    window.addEventListener("hashchange", () => requestAnimationFrame(() => { if (active()) actualiser(); }));
    appliquerVue();
  }

  window.addEventListener("filmed:mesures", evenement => initialiser(evenement.detail));
  window.addEventListener("filmed:station-carte", evenement => {
    if (!vue) return;
    if (Array.from(station.options).some(option => option.value === evenement.detail)) {
      station.value = evenement.detail;
      preparerAnnees();
    }
    vue.value = "chronologie";
    appliquerVue();
  });
  window.dispatchEvent(new CustomEvent("filmed:demander-mesures"));
})();
