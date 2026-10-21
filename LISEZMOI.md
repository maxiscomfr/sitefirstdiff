# Site FirstDiff × Armony Cucine

Site vitrine statique (HTML, CSS, JavaScript sans étape de build), prêt pour Netlify.

## Pages

| Page | Contenu |
|---|---|
| `index.html` | Portail d'entrée : cuisine Armony en 3D qui change de « portrait », choix Particuliers / Professionnels |
| `particuliers.html` | Collezione Anniversario 50, les 12 collections Armony, les portraits avec leurs finitions, aperçu 3D, étapes du projet, formulaire « Être rappelé » |
| `configurateur.html` | Configurateur 3D : le visiteur choisit la taille de sa pièce et un modèle Armony, pose et fait glisser ses meubles (bas, colonnes, hauts, îlots, aimantés aux murs), puis choisit façades, accent, plan de travail et poignées parmi les 154 finitions du catalogue Armony 2026 (`assets/js/finitions.js`, vignettes dans `assets/img/finitions/`). Envoi pour chiffrage |
| `professionnels.html` | Arguments Armony, catalogues à télécharger, showroom Tours Nord, secteur, prise de rendez-vous en 3 étapes (appel, puis magasin ou showroom) |
| `merci.html`, `mentions-legales.html`, `404.html` | Pages simples |

## Mise en ligne sur Netlify

1. Pousser ce dossier dans un dépôt GitHub privé, puis « Add new site → Import an existing project » sur Netlify.
2. Aucune commande de build. Dossier publié : la racine (déjà réglé dans `netlify.toml`).
3. **Formulaires** : Netlify détecte seuls les trois formulaires (`rappel-particulier`, `configuration-cuisine`, `rendez-vous-pro`). Dans *Site configuration → Forms*, activer la détection si besoin, puis *Form notifications → Email notification* vers l'adresse de FirstDiff pour recevoir chaque demande par e-mail.
4. Chaque demande du configurateur contient : le récapitulatif, une image JPEG de la cuisine composée, et un lien qui rouvre exactement la même cuisine dans le configurateur.

## À compléter

- `assets/js/donnees.js` : coordonnées, collections, portraits et catalogues. Tout le texte variable est là.
- `catalogues/` : déposer les PDF avec les noms indiqués dans `donnees.js` (ex. `armony-collection-2026.pdf`). Tant qu'un fichier manque, la carte affiche « Sur demande » et renvoie vers le formulaire de rendez-vous.
- Showroom : les 5 emplacements photo de `professionnels.html` attendent les photos du showroom (ajouter `data-photo` ou une balise `<img>` dans chaque bloc `.photo`).
- `mentions-legales.html` : adresse et SIRET de MAXIS (éditeur), directeur de publication.
- Le site ne mentionne qu'Armony : ne pas y ajouter d'autre marque.

## Photos Armony

Les photos des collections et des portraits sont chargées depuis armonycucine.it. Pour les héberger sur le site (plus rapide et indépendant du site Armony) :

```bash
bash outils/telecharger-photos-armony.sh
```

Le script copie les images dans `assets/img/armony/` et bascule le site dessus. Une image absente en local est automatiquement redemandée à armonycucine.it.

## Technique

- Three.js 0.169 (vendorisé dans `assets/vendor/three/`), cuisine 3D entièrement procédurale (`assets/js/cuisine3d.js`) : aucun modèle 3D à télécharger.
- Polices Jost et Cormorant Garamond hébergées localement.
- Pas de cookie, pas de traceur. Le configurateur garde la dernière composition dans le navigateur du visiteur.
- Tester en local : `python3 -m http.server` à la racine puis ouvrir http://localhost:8000 (les formulaires ne fonctionnent qu'une fois sur Netlify).

## Mises à jour du 21 octobre

- Photos Armony hébergées sur le site (`assets/img/armony/`). Pour les recopier après un changement chez Armony : onglet Actions du dépôt GitHub, « Photos Armony », « Run workflow ».
- Catalogue 2026 compressé (52 Mo → 16 Mo), texte et mise en page conservés.
- Accueil sur téléphone : images fixes de la scène 3D (`assets/img/accueil/`, refaites avec `outils/images-accueil.mjs`), la 3D reste sur ordinateur et tablette.
- Configurateur : ombres de contact, arêtes adoucies, laques vernies, parquet ; mention « esquisse indicative ».
- Après toute modification d'un script ou du CSS, changer le suffixe `?v=` dans les pages et les imports, pour que les visiteurs reçoivent la nouvelle version.
