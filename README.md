# Zeltrack

Tracker web pour suivre les objets d'upgrade d'armures de Zelda: Tears of the Kingdom.

L'application est en PHP côté backend, sans framework côté frontend. Le front utilise des modules ES natifs et persiste la progression dans le `localStorage` du navigateur.

## Fonctionnalités

- recherche d'objets et de drops de monstres
- affichage des détails d'un objet
- traduction FR avec cache local
- index FR pré-généré pour accélérer la recherche
- sauvegarde locale de la progression
- export / import JSON
- partage via URL encodée dans le hash
- liens vers ObjMap pour les objets, zones et monstres

## Prérequis

- PHP 8+
- accès réseau sortant pour :
  - l'API du compendium TotK
  - l'API de traduction Google utilisée par le projet

Le projet n'a pas de dépendances Node ni de build frontend.

## Lancer le projet

Depuis la racine du repo :

```bash
php -S localhost:8000
```

Puis ouvrir :

```text
http://localhost:8000/index.php
```

Au premier chargement, l'application récupère les données du compendium et remplit le cache local si nécessaire.

## Structure

```text
api/
  item.php
  search.php
  translate.php
assets/
  main.js
  style.css
  modules/
cache/
  master.json
  fr_index.json
  translations_fr.json
index.php
src/
  Translator.php
tools/
  buildFrIndex.php
```

## Caches

Le dossier `cache/` contient :

- `master.json` : dump local du compendium TotK
- `translations_fr.json` : cache des traductions EN -> FR
- `fr_index.json` : index pré-construit des noms FR pour la recherche

Ces fichiers sont reconstruits automatiquement quand nécessaire.

Pour repartir d'un cache propre :

```bash
rm -f cache/fr_index.json cache/translations_fr.json
```

## Rebuild manuel de l'index FR

Deux options :

```bash
php tools/buildFrIndex.php
```

ou via navigateur :

```text
http://localhost:8000/tools/buildFrIndex.php
```

Si `cache/master.json` n'existe pas encore, ouvrir `index.php` pour peupler le cache principal.

## Endpoints internes

### `GET /api/search.php?q=...`

Retourne jusqu'à 15 résultats pour la recherche d'objets ou de drops.

Exemple de réponse :

```json
[
  {
    "name": "Hinox Toenail",
    "display_name": "Ongle de Hinox"
  }
]
```

### `GET /api/item.php?item=...`

Retourne le détail d'un objet, ses zones et les monstres sources si applicable.

### `POST /api/translate.php`

Traduit une liste de textes.

Payload :

```json
{
  "texts": ["Hinox Toenail", "Amber"]
}
```

## Frontend

Le point d'entrée frontend est `assets/main.js`.

Les modules principaux sont :

- `tracker-app.js` : orchestration de l'UI
- `tracker-store.js` : état applicatif et persistence
- `search-panel.js` : recherche et suggestions
- `item-details-modal.js` : modale de détails
- `data-modal-controller.js` : export, import et partage
- `templates.js` : templates HTML réutilisables
- `constants.js` : constantes UI, routes et sélecteurs DOM

## Traduction

La logique de traduction est centralisée dans `src/Translator.php`.

Points importants :

- cache local des traductions
- protection d'un glossaire de termes TotK pour éviter certaines mauvaises traductions
- support de recherche EN + FR via `fr_index.json`
- filtrage des drops corrompus trop longs via une limite de longueur

## Données externes utilisées

- Compendium TotK : `https://botw-compendium.herokuapp.com/api/v3/compendium/all?game=totk`
- Traduction : `https://translate.googleapis.com/translate_a/single?client=gtx`
- Cartographie : `https://objmap-totk.zeldamods.org/`

## Notes de dev

- le frontend utilise des modules ES natifs
- la progression utilisateur est stockée dans le `localStorage` du navigateur
- le partage par lien encode `items` et `progress` dans le hash de l'URL
- l'application ne dépend pas d'une base de données

## Dépannage rapide

Si la recherche FR semble vide ou incohérente :

1. supprimer `cache/fr_index.json`
2. supprimer `cache/translations_fr.json`
3. recharger `index.php`
4. relancer `php tools/buildFrIndex.php` si besoin

Si les détails d'objet ne remontent pas :

1. vérifier que `cache/master.json` existe
2. recharger la page pour forcer le peuplement initial
3. vérifier que PHP a le droit d'écrire dans `cache/`