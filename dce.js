/* Suivi DCE du SMCG : charger ce fichier après app.js et les modules FILMED. */
(() => {
  "use strict";
  const JOUR = 86400000;
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 });
  const moisAnnee = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" });
  const dateCourte = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  const definitions = [
    { id: "salinite", colonne: "Salinité (unité à confirmer)", nom: "Salinité", unite: "unité à confirmer", carte: "Salinité" },
    { id: "temperature", colonne: "Température (°C)", nom: "Température", unite: "°C", carte: "Température" },
    { id: "oxygene", colonne: "Oxygène (mg/L)", nom: "Oxygène dissous", unite: "mg/L", carte: "Oxygène" },
    { id: "saturation", colonne: "Oxygène (% saturation)", nom: "Saturation en oxygène", unite: "%", carte: "Oxygène" },
    { id: "conductivite", colonne: "Conductivité (mS/cm)", nom: "Conductivité", unite: "mS/cm", carte: "Conductivité" },
    { id: "ph", colonne: "pH", nom: "pH", unite: "sans unité", carte: "pH" },
    { id: "turbidite", colonne: "Turbidité (NTU)", nom: "Turbidité", unite: "NTU", carte: "Turbidité" },
    { id: "secchi", colonne: "Secchi (cm)", nom: "Transparence (Secchi)", unite: "cm", carte: "Transparence" },
    { id: "mes", colonne: "MES (mg/L)", nom: "Matières en suspension", unite: "mg/L", carte: "MES" },
    { id: "mineral", colonne: "Matière minérale (mg/L)", nom: "Matière minérale", unite: "mg/L", carte: "Matière minérale" },
    { id: "ammonium", colonne: "Ammonium (µmol/L)", nom: "Ammonium", unite: "µmol/L", carte: "Ammonium" },
    { id: "nitrite", colonne: "Nitrite (µmol/L)", nom: "Nitrites", unite: "µmol/L", carte: "Nitrites" },
    { id: "nitrate", colonne: "Nitrate (µmol/L)", nom: "Nitrates", unite: "µmol/L", carte: "Nitrates" },
    { id: "nid", colonne: "NID (unité à confirmer)", nom: "Azote inorganique dissous", unite: "unité à confirmer", carte: "Nutriments" },
    { id: "phosphate", colonne: "Phosphate (µmol/L)", nom: "Phosphates", unite: "µmol/L", carte: "Phosphates" },
    { id: "azote", colonne: "Azote total (µmol N/L)", nom: "Azote total", unite: "µmol N/L", carte: "Azote total" },
    { id: "phosphore", colonne: "Phosphore total (µmol P/L)", nom: "Phosphore total", unite: "µmol P/L", carte: "Phosphore total" },
    { id: "chl", colonne: "Chlorophylle a (µg/L)", nom: "Chlorophylle a", unite: "µg/L", carte: "Chlorophylle a" },
    { id: "chl-source", colonne: "Chlorophylle a (unité non précisée)", nom: "Chlorophylle a — autre mesure source", unite: "unité à confirmer", carte: "Chlorophylle a" },
    { id: "pheo", colonne: "Phéopigment (µg/L)", nom: "Phéopigment", unite: "µg/L", carte: "Phéopigments" },
    { id: "chl-pheo", colonne: "Chlorophylle-a phéopigment (µg/L) — libellé source", nom: "Chlorophylle-a phéopigment — libellé source", unite: "µg/L", carte: "Phéopigments" },
    { id: "profondeur", colonne: "Profondeur (unité source)", nom: "Profondeur", unite: "cm", condition: r => r["Unité profondeur"] === "cm", carte: "Profondeur" },
    { id: "profondeur-source", colonne: "Profondeur (unité source)", nom: "Profondeur — unité source non précisée", unite: "unité à confirmer", condition: r => r["Unité profondeur"] !== "cm", carte: "Profondeur" },
    { id: "vegetation", colonne: "Recouvrement végétal (unité à confirmer)", nom: "Recouvrement végétal", unite: "unité à confirmer", carte: "Végétation" }
  ];
  let donnees = [], points = [], disponibles = [], graphiques = [];
  let ui = null, dernierPoint = "";
  const creer = (tag, texte, classe) => {
    const e = document.createElement(tag);
    if (texte !== undefined) e.textContent = texte;
    if (classe) e.className = classe;
    return e;
  };
  function lireNombre(texte, contexte) {
    const s = String(texte ?? "").trim();
    if (!s) return null;
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s)) throw new Error("Valeur invalide " + contexte + " : « " + s + " ».");
    const n = Number(s.replace(",", "."));
    if (!Number.isFinite(n)) throw new Error("Valeur trop grande " + contexte + ".");
    return n;
  }
  function lireDonnees(texte) {
    if (typeof Papa === "undefined") throw new Error("L’outil de lecture CSV est absent. Vérifiez les scripts de index.html.");
    const lecture = Papa.parse(texte.replace(/^\uFEFF/, ""), {
      header: true, delimiter: ";", skipEmptyLines: "greedy", transformHeader: h => h.trim()
    });
    if (lecture.errors.length) throw new Error("Le CSV DCE contient une ligne mal formée.");
    for (const h of ["Structure", "Suivi", "Étang", "Station", "Identifiant point", "Année", "Mois", "Précision date", "Longitude WGS84", "Latitude WGS84", ...definitions.map(p => p.colonne)]) {
      if (!lecture.meta.fields?.includes(h)) throw new Error("Colonne DCE manquante : " + h + ".");
    }
    const vus = new Set();
    return lecture.data.map((r, index) => {
      const ligne = index + 2, annee = lireNombre(r["Année"], ligne), mois = lireNombre(r.Mois, ligne);
      if (!Number.isInteger(annee) || annee < 1900 || annee > 2200 || !Number.isInteger(mois) || mois < 1 || mois > 12) throw new Error("Année ou mois invalide à la ligne " + ligne + ".");
      const id = r["Identifiant point"]?.trim(), station = r.Station?.trim(), etang = r["Étang"]?.trim();
      if (r.Structure !== "SMCG" || r.Suivi !== "DCE" || !id || !station || !etang) throw new Error("Identification du point invalide à la ligne " + ligne + ".");
      const longitude = lireNombre(r["Longitude WGS84"], ligne), latitude = lireNombre(r["Latitude WGS84"], ligne);
      if (longitude === null || latitude === null || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) throw new Error("Coordonnées absentes ou invalides à la ligne " + ligne + ".");
      let temps = Date.UTC(annee, mois - 1, 15);
      const precision = r["Précision date"];
      if (precision === "jour") {
        const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(r.Date || "");
        if (!m || Number(m[2]) !== mois || Number(m[3]) !== annee) throw new Error("Date incohérente à la ligne " + ligne + ".");
        temps = Date.UTC(annee, mois - 1, Number(m[1]));
        if (new Date(temps).getUTCMonth() !== mois - 1) throw new Error("Jour invalide à la ligne " + ligne + ".");
      } else if (precision !== "mois") throw new Error("Précision de date invalide à la ligne " + ligne + ".");
      const cle = JSON.stringify([id, precision, precision === "jour" ? r.Date : annee + "-" + mois, r.Heure || ""]);
      if (vus.has(cle)) throw new Error("Relevé DCE en double à la ligne " + ligne + ".");
      vus.add(cle);
      const valeurs = {};
      for (const p of definitions) valeurs[p.id] = p.condition && !p.condition(r) ? null : lireNombre(r[p.colonne], p.nom + ", ligne " + ligne);
      return { id, station, etang, annee, mois, numeroMois: annee * 12 + mois - 1, temps, precision, longitude, latitude,
        valeurs, aVerifier: Boolean(r["Valeurs à vérifier"]?.trim()), source: r["Fichier source"], brut: r };
    }).sort((a, b) => a.temps - b.temps || a.id.localeCompare(b.id));
  }
  function regrouperPoints(releves) {
    const groupes = new Map();
    for (const r of releves) {
      if (!groupes.has(r.id)) groupes.set(r.id, []);
      groupes.get(r.id).push(r);
    }
    return [...groupes].map(([id, groupe]) => {
      const dernier = groupe.reduce((a, b) => a.temps > b.temps ? a : b);
      const parametres = [...new Set(definitions.filter(p => groupe.some(r => r.valeurs[p.id] !== null)).map(p => p.carte))];
      return { id, nom: dernier.etang + " — " + dernier.station, code: dernier.station, etang: dernier.etang,
        latitude: dernier.latitude, longitude: dernier.longitude, structure: "SMCG", suivi: "DCE", teletransmission: false,
        etatSuivi: "a_confirmer", parametres, parametresResume: parametres.slice(0, 7).concat(parametres.length > 7 ? ["Autres paramètres dans les analyses"] : []),
        annees: [...new Set(groupe.map(r => r.annee))].sort((a,b) => a-b),
        positionsHistoriques: new Set(groupe.map(r => r.longitude.toFixed(6) + "," + r.latitude.toFixed(6))).size > 1,
        debut: Math.min(...groupe.map(r => r.numeroMois)), fin: Math.max(...groupe.map(r => r.numeroMois)) };
    }).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }
  function caseACocher(nom, valeur, texte, coche) {
    const label = creer("label"), input = creer("input");
    input.type = "checkbox"; input.name = nom; input.value = valeur; input.checked = coche;
    label.append(input, creer("span", texte));
    return label;
  }
  const moisISO = n => Math.floor(n / 12) + "-" + String(n % 12 + 1).padStart(2, "0");
  function numeroMois(chaine) {
    const m = /^(\d{4})-(\d{2})$/.exec(chaine || "");
    return m && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
  }
  function selectionPoints(pointUnique) {
    ui.points.replaceChildren();
    points.filter(p => !ui.etang.value || p.etang === ui.etang.value).forEach(p => {
      ui.points.append(caseACocher("point-dce", p.id, p.code + " — " + p.etang, pointUnique ? p.id === pointUnique : true));
    });
  }
  function preparerInterface() {
    const section = document.getElementById("graphiques");
    if (!section || document.getElementById("analyse-filmed")) return;
    const titre = section.querySelector("h2");
    const filmed = creer("div"); filmed.id = "analyse-filmed";
    for (const enfant of Array.from(section.children)) if (enfant !== titre) filmed.append(enfant);
    filmed.prepend(creer("h3", "FILMED — Tournées Nord et Sud"));
    if (titre) titre.textContent = "Analyses des données";
    const navSite = document.querySelector('nav a[href="#graphiques"]');
    if (navSite) navSite.textContent = "Analyses des données";
    const choix = creer("div", undefined, "choix-analyses"); choix.setAttribute("role", "group"); choix.setAttribute("aria-label", "Choisir un espace d’analyse");
    const boutonFilmed = creer("button", "Analyse des mesures FILMED"), boutonEtudes = creer("button", "Études et comparaisons complémentaires");
    for (const b of [boutonFilmed, boutonEtudes]) b.type = "button";
    boutonFilmed.addEventListener("click", () => { window.location.hash = "graphiques?vue=filmed"; appliquerVue(); });
    boutonEtudes.addEventListener("click", () => { window.location.hash = "graphiques?vue=dce"; appliquerVue(); });
    choix.append(boutonFilmed, boutonEtudes);
    const etudes = creer("div"); etudes.id = "analyses-complementaires";
    etudes.append(creer("h3", "Études et comparaisons complémentaires"));
    const panneau = creer("article", undefined, "panneau-dce"); panneau.id = "analyse-dce";
    panneau.append(creer("h4", "Suivi DCE des lagunes"), creer("p", "Campagnes estivales du SMCG sur les étangs de Marette, Charnier, Crey et Scamandre. Ces données sont distinctes du suivi mensuel FILMED."));
    const message = creer("p", "Chargement des données DCE…"); message.id = "message-dce"; message.setAttribute("role", "status"); message.setAttribute("aria-live", "polite");
    const controles = creer("fieldset", undefined, "commandes-dce"); controles.disabled = true; controles.append(creer("legend", "Choisir les données DCE"));
    const ligne = creer("div", undefined, "ligne-filtres-dce");
    const etang = creer("select"); etang.id = "etang-dce";
    const debut = creer("input"); debut.type = "month"; debut.id = "debut-dce";
    const fin = creer("input"); fin.type = "month"; fin.id = "fin-dce";
    for (const [champ, texte] of [[etang, "Étang"], [debut, "Du mois de"], [fin, "Au mois de"]]) {
      const label = creer("label"); label.append(creer("span", texte), champ); ligne.append(label);
    }
    controles.append(ligne);
    const pointsBox = creer("fieldset"), pointsZone = creer("div", undefined, "cases-dce"); pointsZone.id = "points-dce";
    pointsBox.append(creer("legend", "Points de prélèvement"), pointsZone);
    const paramBox = creer("fieldset"), paramZone = creer("div", undefined, "cases-dce"); paramZone.id = "parametres-dce";
    paramBox.append(creer("legend", "Paramètres à afficher"), paramZone);
    const verification = caseACocher("verifications-dce", "oui", "Inclure les valeurs signalées comme étant à vérifier", false);
    const inclure = verification.querySelector("input"); inclure.id = "inclure-verifications-dce";
    const remettre = creer("button", "Réinitialiser la sélection DCE"); remettre.type = "button";
    controles.append(pointsBox, paramBox, verification, remettre);
    const aide = creer("p", "Un graphique par paramètre. Les lignes relient seulement des campagnes de mois consécutifs d’une même année. Les dates connues uniquement au mois sont placées au milieu du mois pour l’affichage ; aucun jour de mesure ne leur est attribué.", "aide-dce");
    const zone = creer("div"); zone.id = "courbes-dce";
    panneau.append(controles, message, aide, zone); etudes.append(panneau);
    section.append(choix, filmed, etudes);
    ui = { section, filmed, etudes, boutonFilmed, boutonEtudes, etang, debut, fin, points: pointsZone,
      parametres: paramZone, inclure, controles, message, zone };
    etang.addEventListener("change", () => { selectionPoints(); actualiser(); });
    controles.addEventListener("change", actualiser);
    debut.addEventListener("input", actualiser); fin.addEventListener("input", actualiser);
    remettre.addEventListener("click", () => { initialiserControles(); dernierPoint = ""; actualiser(); });
    appliquerVue();
  }
  function initialiserControles() {
    if (!ui || !donnees.length) return;
    ui.etang.replaceChildren();
    const tous = creer("option", "Tous les étangs"); tous.value = ""; ui.etang.append(tous);
    for (const etang of [...new Set(points.map(p => p.etang))].sort((a,b) => a.localeCompare(b,"fr"))) {
      const option = creer("option", etang); option.value = etang; ui.etang.append(option);
    }
    ui.etang.value = points.some(p => p.etang === "Marette") ? "Marette" : "";
    const min = Math.min(...donnees.map(r => r.numeroMois)), max = Math.max(...donnees.map(r => r.numeroMois));
    for (const champ of [ui.debut, ui.fin]) { champ.min = moisISO(min); champ.max = moisISO(max); }
    ui.debut.value = moisISO(min); ui.fin.value = moisISO(max);
    selectionPoints(); ui.parametres.replaceChildren();
    const autres = creer("details", undefined, "autres-parametres-dce");
    autres.append(creer("summary", "Autres paramètres disponibles"));
    const casesAutres = creer("div", undefined, "cases-dce"); autres.append(casesAutres);
    for (const p of disponibles) {
      const zone = ["salinite", "temperature", "oxygene"].includes(p.id) ? ui.parametres : casesAutres;
      zone.append(caseACocher("parametre-dce", p.id, p.nom + " (" + p.unite + ")", p.id === "salinite"));
    }
    if (casesAutres.children.length) ui.parametres.append(autres);
    ui.inclure.checked = false; ui.controles.disabled = false;
  }
  function appliquerVue() {
    if (!ui) return;
    const hash = window.location.hash.slice(1), [section, requete = ""] = hash.split("?");
    const params = new URLSearchParams(requete), dce = params.get("vue") === "dce";
    ui.filmed.hidden = dce; ui.etudes.hidden = !dce;
    ui.boutonFilmed.setAttribute("aria-pressed", String(!dce)); ui.boutonEtudes.setAttribute("aria-pressed", String(dce));
    const id = params.get("point") || "";
    if (section === "graphiques" && dce && donnees.length && id && id !== dernierPoint) {
      const point = points.find(p => p.id === id);
      if (point) {
        ui.etang.value = point.etang; selectionPoints(id);
        ui.debut.value = moisISO(point.debut); ui.fin.value = moisISO(point.fin); dernierPoint = id;
      } else { vider(); ui.message.textContent = "Ce point DCE est absent du fichier. Choisissez un autre point."; return; }
    }
    if (section === "graphiques" && dce && donnees.length) actualiser();
    if (!dce) requestAnimationFrame(() => {
      if (typeof Chart !== "undefined") for (const canvas of ui.filmed.querySelectorAll("canvas")) Chart.getChart?.(canvas)?.resize();
    });
  }

  function vider() {
    for (const graphique of graphiques) graphique.destroy();
    graphiques = []; ui?.zone.replaceChildren();
  }
  function couleur(id) {
    let hash = 0; for (const lettre of id) hash = (hash * 31 + lettre.charCodeAt(0)) >>> 0;
    return "hsl(" + (hash * 137.508 % 360).toFixed(1) + ",65%,35%)";
  }
  function creerTableau(article, p, series) {
    const details = creer("details", undefined, "tableau-reperes"); details.append(creer("summary", "Repères sur la sélection"));
    const table = creer("table"); table.append(creer("caption", p.nom + " — " + p.unite));
    const thead = creer("thead"), entetes = creer("tr");
    for (const titre of ["Point", "Nombre de valeurs", "Minimum", "Moyenne", "Maximum"]) {
      const th = creer("th", titre); th.scope = "col"; entetes.append(th);
    }
    thead.append(entetes); table.append(thead); const tbody = creer("tbody");
    for (const serie of series) {
      const valeurs = serie.data.filter(d => d.y !== null).map(d => d.y);
      const ligne = creer("tr"), nom = creer("th", serie.label); nom.scope = "row"; ligne.append(nom);
      for (const v of [valeurs.length, valeurs.length ? Math.min(...valeurs) : null,
        valeurs.length ? valeurs.reduce((s,v) => s+v,0)/valeurs.length : null, valeurs.length ? Math.max(...valeurs) : null]) {
        ligne.append(creer("td", v === null ? "—" : nombre.format(v)));
      }
      tbody.append(ligne);
    }
    table.append(tbody); details.append(table); article.append(details);
  }
  function actualiser() {
    if (!ui || ui.etudes.hidden || !donnees.length) return;
    vider();
    const selection = new Set(Array.from(ui.points.querySelectorAll('input:checked'), c => c.value));
    const parametres = disponibles.filter(p => Array.from(ui.parametres.querySelectorAll('input:checked')).some(c => c.value === p.id));
    const du = numeroMois(ui.debut.value), au = numeroMois(ui.fin.value);
    let erreur = !selection.size ? "Choisissez au moins un point de prélèvement." : !parametres.length ? "Choisissez au moins un paramètre."
      : du === null || au === null ? "Choisissez les deux mois de la période."
      : du > au ? "Le mois de début doit précéder le mois de fin." : "";
    if (erreur) { ui.message.textContent = erreur; return; }
    const releves = donnees.filter(r => selection.has(r.id) && r.numeroMois >= du && r.numeroMois <= au);
    if (!releves.length) { ui.message.textContent = "Aucun relevé DCE sur cette sélection. Élargissez la période ou changez les points."; return; }
    if (typeof Chart === "undefined") { ui.message.textContent = "L’outil graphique n’a pas été chargé. Vérifiez les scripts de index.html."; return; }
    const min = Date.UTC(Math.floor(du/12), du%12, 1), max = Date.UTC(Math.floor(au/12), au%12+1, 1)-1;
    let total = 0, ecartes = 0;
    for (const p of parametres) {
      const article = creer("article", undefined, "carte-graphique carte-graphique-dce");
      article.append(creer("h4", p.nom + " (" + p.unite + ")"));
      const series = [];
      for (const point of points.filter(point => selection.has(point.id))) {
        const color = couleur(point.id), data = releves.filter(r => r.id === point.id).map(r => {
          const signalee = p.id === "oxygene" && r.aVerifier;
          const y = signalee && !ui.inclure.checked ? null : r.valeurs[p.id];
          if (signalee && !ui.inclure.checked && r.valeurs[p.id] !== null) ecartes++;
          return { x: r.temps, y, dateTexte: r.precision === "jour" ? dateCourte.format(r.temps) : moisAnnee.format(r.temps) + " (jour non renseigné)",
            annee: r.annee, numeroMois: r.numeroMois, aVerifier: signalee };
        });
        if (!data.some(d => d.y !== null)) continue;
        total += data.filter(d => d.y !== null).length;
        series.push({ label: point.nom, data, borderColor: color, backgroundColor: color, borderWidth: 2,
          pointRadius: 4, pointHoverRadius: 6, pointBorderWidth: 2,
          pointBackgroundColor: ctx => ctx.raw?.aVerifier ? "#ffffff" : color,
          pointBorderColor: ctx => ctx.raw?.aVerifier ? "#a24d00" : color,
          segment: { borderColor: ctx => {
            const a = ctx.p0.raw, b = ctx.p1.raw;
            return a.annee !== b.annee || b.numeroMois - a.numeroMois > 1 ? "transparent" : color;
          } }, spanGaps: false, tension: 0 });
      }
      if (!series.length) {
        article.append(creer("p", "Aucune valeur affichable pour ce paramètre sur la sélection.")); ui.zone.append(article); continue;
      }
      const cadre = creer("div", undefined, "cadre-courbe"), canvas = creer("canvas");
      canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", p.nom + ", campagnes DCE, du mois de " + ui.debut.value + " au mois de " + ui.fin.value);
      cadre.append(canvas); article.append(cadre); ui.zone.append(article);
      const chart = new Chart(canvas, {
        type: "line", data: { datasets: series },
        options: { responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: { position: "bottom" },
            tooltip: { callbacks: {
              title: items => items[0]?.raw.dateTexte || "",
              label: ctx => ctx.dataset.label + " : " + nombre.format(ctx.parsed.y) + " " + p.unite + (ctx.raw.aVerifier ? " — valeur à vérifier" : "")
            } },
            zoom: { limits: { x: { min, max, minRange: JOUR } },
              pan: { enabled: false },
              zoom: { mode: "x", wheel: { enabled: true, modifierKey: "ctrl" }, pinch: { enabled: true }, drag: { enabled: true, modifierKey: "shift" } }
            }
          },
          scales: { x: { type: "linear", min, max,
            title: { display: true, text: "Campagne de prélèvement" },
            ticks: { maxTicksLimit: 9, callback: valeur => moisAnnee.format(valeur) } },
            y: { title: { display: true, text: p.nom + " (" + p.unite + ")" } } }
        }
      });
      graphiques.push(chart);
      const zoom = creer("div", undefined, "outils-dce");
      for (const [texte, action] of [["Agrandir", () => chart.zoom({ x: 1.5 })],
        ["Réduire", () => chart.zoom({ x: 0.67 })], ["Vue complète", () => chart.resetZoom()]]) {
        const bouton = creer("button", texte); bouton.type = "button";
        bouton.disabled = typeof chart.zoom !== "function";
        bouton.addEventListener("click", action); zoom.append(bouton);
      }
      article.append(zoom); creerTableau(article, p, series);
    }
    ui.message.textContent = releves.length + " lignes de suivi sélectionnées · " + total + " valeurs affichées. "
      + (ecartes ? ecartes + " valeur(s) d’oxygène à vérifier non affichée(s). Cochez l’option ci-dessus pour les inclure." : "")
      + " Les cellules vides restent absentes ; les vrais zéros sont conservés.";
  }
  async function charger() {
    try {
      const reponse = await fetch("mesures_dce.csv", { cache: "no-cache" });
      if (!reponse.ok) throw new Error("mesures_dce.csv inaccessible (HTTP " + reponse.status + ").");
      donnees = lireDonnees(await reponse.text());
      if (!donnees.length) throw new Error("Le fichier DCE ne contient aucun relevé.");
      points = regrouperPoints(donnees);
      disponibles = definitions.filter(p => donnees.some(r => r.valeurs[p.id] !== null));
      window.dispatchEvent(new CustomEvent("dce:stations", { detail: points }));
      if (ui) {
        initialiserControles(); ui.message.textContent = donnees.length + " lignes de suivi pour " + points.length + " points DCE. Choisissez les données à afficher.";
        appliquerVue();
      }
      return { donnees, points };
    } catch (erreur) {
      if (ui) { ui.controles.disabled = true; vider(); ui.message.textContent = "Impossible d’afficher les données DCE : " + erreur.message; }
      const carte = document.getElementById("message-carte");
      if (carte) carte.textContent += " Les points DCE n’ont pas pu être chargés : " + erreur.message;
      console.error(erreur);
      return { erreur: erreur.message };
    }
  }
  preparerInterface();
  window.addEventListener("hashchange", appliquerVue);
  // Ce signal permet de vérifier le chargement sans télécharger deux fois le CSV.
  const pret = charger();
  window.addEventListener("dce:demander-etat", () => {
    pret.then(resultat => window.dispatchEvent(new CustomEvent("dce:etat", { detail: resultat })));
  });
})();
