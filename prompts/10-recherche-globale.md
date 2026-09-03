# Prompt 10 — Recherche globale

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Brancher la barre de recherche de la topbar (posée au prompt 04) sur une
recherche transverse multi-tables avec résultats groupés et navigation
directe.

## Pré-requis

Prompts 01–09 terminés.

## Spécifications détaillées

### Champs couverts

IMEI, marque, modèle, RAM, stockage, couleur, état (téléphones) ; adresse
mail (téléphone) ; nom/prénom/téléphone (clients) ; nom (fournisseurs) ;
numéro (factures).

### Implémentation

- Fonction serveur `globalSearch(query: string)` (`src/lib/search.ts`) :
  lance en parallèle (`Promise.all`) des requêtes `ilike '%query%'` sur
  `phones` (brand, model, imei, ram, storage, color, email), `clients`
  (first_name, last_name, phone), `suppliers` (name), `invoices` (number,
  jointure vers client pour recherche par nom si pertinent). Limiter à 5
  résultats par catégorie.
- **État (`condition`) inclus dans la recherche téléphone** : `condition`
  est un enum (`neuf` / `quasi_neuf`), pas un texte libre — ne pas faire un
  `ilike` brut dessus. Convertir la saisie en comparant contre les libellés
  français (via le mapping de `src/lib/constants.ts`, prompt 03) : si la
  requête correspond (même partiellement, insensible à la casse) à "Neuf"
  ou "Quasi neuf", ajouter `condition = 'neuf'` / `condition = 'quasi_neuf'`
  aux résultats téléphones. Sans ça, taper "quasi neuf" dans la recherche ne
  retrouve rien, alors que le cahier des charges l'exige explicitement.
- Composant `GlobalSearch` (client component) dans la topbar : `Input` avec
  debounce (300 ms), appel à une Server Action ou route handler
  `app/api/search/route.ts`, affichage d'un dropdown groupé par catégorie
  (icône + libellé de section : "Téléphones", "Clients", "Fournisseurs",
  "Factures"), chaque résultat cliquable navigue vers la fiche
  correspondante et ferme le dropdown.
- Raccourci clavier `/` ou `Ctrl+K` pour focus la recherche (optionnel mais
  soigné). `Échap` ferme le dropdown.
- État vide : "Aucun résultat pour « {query} »".

## Livrables attendus

- Recherche fonctionnelle depuis n'importe quelle page de `(app)`.
- Résultats pertinents, groupés, avec navigation correcte.

## Critères d'acceptation

- [ ] Taper un IMEI complet ou partiel retrouve le bon téléphone
- [ ] Taper "iPhone 15" retrouve tous les téléphones correspondants
- [ ] Taper un numéro de facture retrouve la facture exacte
- [ ] Aucune requête lancée pour une saisie vide ou de 1 caractère (éviter
      le bruit)
