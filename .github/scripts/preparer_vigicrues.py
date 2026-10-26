#!/usr/bin/env python3
"""Préparer le site statique et sa copie locale du flux public Vigicrues."""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path
import shutil
import sys
import time
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen

SOURCE = "https://www.vigicrues.gouv.fr/services/InfoVigiCru.geojson"
TRONCONS = {"GA6": "Vidourle", "GA32": "Vistre", "GA9": "Rhône d’Avignon à la mer"}
EXTENSIONS = {".html", ".css", ".js", ".mjs", ".json", ".geojson", ".csv", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".pdf", ".txt", ".webmanifest", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm"}


def iso(instant):
    return instant.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def lire_instant(texte):
    if not isinstance(texte, str):
        raise ValueError("La date de publication est absente.")
    instant = datetime.fromisoformat(texte.replace("Z", "+00:00"))
    if instant.tzinfo is None:
        raise ValueError("Le fuseau horaire de publication est absent.")
    return instant.astimezone(timezone.utc)


def verifier_coordonnees(geometrie):
    if not isinstance(geometrie, dict) or geometrie.get("type") not in ("LineString", "MultiLineString"):
        raise ValueError("Géométrie de tronçon invalide.")
    lignes = geometrie.get("coordinates")
    if geometrie["type"] == "LineString":
        lignes = [lignes]
    if not isinstance(lignes, list) or not lignes:
        raise ValueError("Tronçon sans coordonnées.")
    for ligne in lignes:
        if not isinstance(ligne, list) or len(ligne) < 2:
            raise ValueError("Une ligne doit contenir au moins deux coordonnées.")
        for c in ligne:
            if not isinstance(c, list) or len(c) < 2:
                raise ValueError("Coordonnée invalide.")
            if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in c[:2]):
                raise ValueError("Coordonnée non numérique.")
            if not -180 <= c[0] <= 180 or not -90 <= c[1] <= 90:
                raise ValueError("Coordonnée hors du domaine WGS84.")


def preparer_flux(source, maintenant=None):
    maintenant = maintenant or datetime.now(timezone.utc)
    if not isinstance(source, dict) or source.get("type") != "FeatureCollection" or not isinstance(source.get("features"), list):
        raise ValueError("Le flux n’est pas une collection GeoJSON.")
    publication = lire_instant(source.get("DtHrInfoVigiCru"))
    if publication > maintenant + timedelta(minutes=10):
        raise ValueError("La date de publication est dans le futur.")
    # Une publication ancienne n’est pas déclarée périmée sur son seul âge :
    # le bulletin de 16 h peut rester le dernier publié jusqu’au lendemain matin.
    # C’est la date de vérification du flux qui sert au contrôle d’actualisation.
    resultat = []
    vus = set()
    for feature in source["features"]:
        p = feature.get("properties", {}) if isinstance(feature, dict) else {}
        code = p.get("CdEntCru")
        if code not in TRONCONS:
            continue
        if code in vus:
            raise ValueError("Tronçon présent plusieurs fois : " + code)
        vus.add(code)
        niveau = p.get("NivInfViCr")
        if isinstance(niveau, str) and niveau in ("0", "1", "2", "3", "4"):
            niveau = int(niveau)
        if niveau is not None and (isinstance(niveau, bool) or niveau not in (0, 1, 2, 3, 4)):
            raise ValueError("Niveau inconnu pour " + code)
        if niveau == 0:
            niveau = None
        verifier_coordonnees(feature.get("geometry"))
        resultat.append({"type": "Feature", "properties": {
            "code": code, "nom": p.get("lbentcru") or TRONCONS[code], "niveau": niveau
        }, "geometry": feature["geometry"]})
    if vus != set(TRONCONS):
        raise ValueError("Tronçons manquants : " + ", ".join(sorted(set(TRONCONS) - vus)))
    resultat.sort(key=lambda f: list(TRONCONS).index(f["properties"]["code"]))
    return {"type": "FeatureCollection", "etat": "disponible", "source": "Vigicrues",
            "urlSource": SOURCE, "referencePublication": source.get("RefInfoVigiCru"),
            "publication": iso(publication), "verifieLe": iso(maintenant),
            "features": resultat}


def telecharger():
    derniere_erreur = None
    for tentative in range(3):
        try:
            requete = Request(SOURCE, headers={"User-Agent": "Suivi-Camargue-Gardoise/1.0", "Accept": "application/json"})
            with urlopen(requete, timeout=20) as reponse:
                contenu = reponse.read(10_000_001)
            if len(contenu) > 10_000_000:
                raise ValueError("Réponse trop volumineuse.")
            return json.loads(contenu)
        except Exception as erreur:
            derniere_erreur = erreur
            if tentative < 2:
                time.sleep(tentative + 1)
    raise RuntimeError("Lecture de la source Vigicrues impossible : " + str(derniere_erreur))


def copier_site(source, destination):
    source, destination = source.resolve(), destination.resolve()
    if source == destination or source not in destination.parents:
        raise ValueError("Le dossier de publication doit être situé dans le dossier source.")
    # Aucun fichier source n’est supprimé ou déplacé.
    destination.mkdir(parents=True, exist_ok=True)
    for fichier in source.rglob("*"):
        relatif = fichier.relative_to(source)
        if any(p.startswith(".") or p in {"node_modules", "work", "outputs", "__pycache__"} for p in relatif.parts):
            continue
        if fichier == destination or destination in fichier.parents or fichier.is_symlink():
            continue
        if fichier.is_file() and (fichier.suffix.lower() in EXTENSIONS or fichier.name in {"CNAME", "404"}):
            cible = destination / relatif
            cible.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(fichier, cible)
    if not (destination / "index.html").is_file():
        raise ValueError("index.html est absent de la racine du site.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("."))
    parser.add_argument("--destination", type=Path, default=Path("_site"))
    parser.add_argument("--fixture", type=Path, help="Réponse locale, uniquement pour les tests.")
    args = parser.parse_args()
    copier_site(args.source, args.destination)
    try:
        brut = json.loads(args.fixture.read_text(encoding="utf-8")) if args.fixture else telecharger()
        flux = preparer_flux(brut)
        print("Vigicrues : trois tronçons récupérés ; publication " + flux["publication"])
    except Exception as erreur:
        # Publier le reste du portail même si le service Vigicrues est indisponible.
        # Une copie ancienne ne reste jamais présentée comme actualisée.
        print(str(erreur), file=sys.stderr)
        flux = {"type": "FeatureCollection", "etat": "indisponible", "source": "Vigicrues",
                "urlSource": SOURCE, "publication": None, "verifieLe": None,
                "tentativeLe": iso(datetime.now(timezone.utc)), "features": []}
    cible = args.destination / "data" / "vigicrues.geojson"
    cible.parent.mkdir(parents=True, exist_ok=True)
    cible.write_text(json.dumps(flux, ensure_ascii=False, allow_nan=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()

