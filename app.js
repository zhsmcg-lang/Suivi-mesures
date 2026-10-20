// Les rubriques de la page et les liens du menu.
const rubriques = document.querySelectorAll("main > section");
const liens = document.querySelectorAll("nav a");

// Afficher la rubrique correspondant à l'adresse.
function afficherRubrique() {
  const rubriqueDemandee = window.location.hash.slice(1);

  // Vérifier que la rubrique existe.
  const existe = Array.from(rubriques).some(
    rubrique => rubrique.id === rubriqueDemandee
  );

  // Afficher l'accueil si aucune rubrique valide n'est indiquée.
  const rubriqueActive = existe ? rubriqueDemandee : "accueil";

  // Masquer les autres rubriques.
  rubriques.forEach(rubrique => {
    rubrique.hidden = rubrique.id !== rubriqueActive;
  });

  // Mettre en évidence le bouton sélectionné.
  liens.forEach(lien => {
    const estActif =
      lien.getAttribute("href") === "#" + rubriqueActive;

    if (estActif) {
      lien.setAttribute("aria-current", "page");
    } else {
      lien.removeAttribute("aria-current");
    }
  });

  // Donner le focus au titre pour faciliter la navigation.
  const titre = document.querySelector(
    "#" + rubriqueActive + " h2"
  );

  if (titre) {
    titre.setAttribute("tabindex", "-1");
    titre.focus({ preventScroll: true });
  }
}

// Réagir aux clics et aux boutons précédent/suivant du navigateur.
window.addEventListener("hashchange", afficherRubrique);

// Afficher la bonne rubrique dès l'ouverture du site.
afficherRubrique();
