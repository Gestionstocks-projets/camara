# Prompt 11 — Dashboard

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Le tableau de bord tel que décrit dans le cahier des charges initial : tous
les indicateurs visibles directement, avec les filtres de période.

## Pré-requis

Prompts 01–10 terminés (le Dashboard agrège les données de tous les
modules).

## Spécifications détaillées

### Filtre de période

Réutiliser/finaliser le composant `PeriodFilter` (posé au prompt 08) :
`Aujourd'hui | 7 jours | 30 jours | Mois | Année | Période personnalisée`
(les deux derniers avec un sélecteur de dates). Le choix affecte tous les
indicateurs "du jour/mois" ci-dessous sauf les compteurs de stock global
(qui sont toujours "à l'instant présent", pas soumis à la période).

### Indicateurs (StatTile, en haut, grille responsive)

- Chiffre d'affaires du jour / du mois / total
- Bénéfice du jour / du mois / total (masqué si le profil `manager` n'a pas
  le droit — cf. réglage `managers_see_profit`, prompt 07/12 ; si masqué,
  ne pas afficher la tuile plutôt que "—")
- Nombre de téléphones en stock
- Nombre de téléphones vendus (sur la période sélectionnée)
- Nombre de téléphones neufs / quasi neufs (en stock, à l'instant présent)
- Valeur totale du stock (`sum(purchase_price + extra_fees)` des téléphones
  `en_stock` — masquée pour un gérant sans le droit prix d'achat)

### Sections

- **Dernières ventes** : les 5-8 ventes les plus récentes (téléphone,
  client, montant, statut de paiement), lien vers chaque facture.
- **Marques les plus vendues** : classement (barres horizontales
  proportionnelles) des marques par nombre de ventes sur la période.
- **Graphique des ventes** : évolution du chiffre d'affaires (et du nombre
  de ventes) sur la période sélectionnée. Utiliser `recharts` (à installer).
  Respecter les bonnes pratiques du skill `dataviz` de Claude Code si
  disponible dans l'environnement d'exécution (palette cohérente avec
  Teranga, `tabular-nums`, grille discrète, libellés lisibles en clair et en
  sombre) — sinon appliquer manuellement : couleur de la courbe/barres =
  `accent`, grille en `border` à faible opacité, texte en `muted`.

### Rapport PDF complet

Bouton "Rapport PDF" en haut du Dashboard : génère un PDF (réutiliser
`@react-pdf/renderer` du prompt 09) contenant CA, bénéfice, nombre de
téléphones vendus, stock restant, valeur du stock, meilleures marques et
une représentation du graphique de ventes (image rendue côté client avant
insertion dans le PDF, ou tableau de données équivalent si le rendu d'un
graphique interactif dans le PDF est trop complexe pour l'itération
actuelle — un tableau propre est acceptable en premier jet).

## Livrables attendus

- Dashboard complet avec tous les indicateurs et sections listés.
- Filtre de période fonctionnel sur l'ensemble des indicateurs concernés.
- Export "Rapport PDF" fonctionnel.

## Critères d'acceptation

- [ ] Changer la période met à jour tous les indicateurs concernés sans
      recharger toute la page (navigation par `searchParams` + Server
      Components, ou fetch client ciblé)
- [ ] Les indicateurs masqués pour un gérant (bénéfice, valeur du stock) le
      sont réellement, testé avec un compte `manager`
- [ ] Le graphique reste lisible et correctement légendé en thème clair et
      sombre
- [ ] `npm run build` réussit
