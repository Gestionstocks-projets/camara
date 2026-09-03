# Prompt 06 — Module Clients

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

CRUD complet des clients, avec historique d'achats calculé automatiquement
(jamais saisi manuellement). Suit le même pattern que le module Fournisseurs
(prompt 05).

## Pré-requis

Prompts 01–05 terminés.

## Spécifications détaillées

### Champs

Nom, Prénom (obligatoires), Téléphone, WhatsApp, Email, Ville.

### Pages (`src/app/(app)/clients/`)

- `page.tsx` : liste — colonnes Nom complet, Téléphone, Ville, Nombre
  d'achats (calculé via `count(sales where client_id = id)`), Total dépensé
  (`sum(sales.sale_price - sales.discount)`). `PageHeader` avec "+ Nouveau
  client".
- `[id]/page.tsx` : fiche client — informations, section "Historique
  d'achats" listant chaque vente (téléphone, date, prix payé, statut de
  paiement) triée du plus récent au plus ancien, avec un total en haut
  ("3 achats · 850 000 F dépensés"). Lien vers chaque facture associée.

### Actions serveur

`createClient`, `updateClient`, `deleteClient` — empêcher la suppression
d'un client ayant des ventes existantes (contrainte `references clients(id)`
sans `on delete cascade`/`set null` sur `sales.client_id` → l'action doit
intercepter l'erreur Postgres et afficher un message clair : "Impossible de
supprimer un client ayant des achats enregistrés.").

### Création rapide depuis le flux de vente

Prévoir un composant `ClientQuickCreateModal` réutilisable (formulaire
réduit : nom, prénom, téléphone) que le prompt 08 (Ventes) réutilisera pour
créer un client à la volée sans quitter l'écran de vente.

## Livrables attendus

- Liste, création, modification, suppression, fiche détail avec historique
  automatique.
- Composant `ClientQuickCreateModal` exporté et documenté (props claires)
  pour réutilisation au prompt 08.

## Critères d'acceptation

- [ ] L'historique d'achats est à 100% dérivé de `sales`, aucun champ
      "achats" saisissable à la main sur la fiche client
- [ ] Suppression bloquée avec message clair si le client a des ventes
- [ ] `ClientQuickCreateModal` fonctionne isolément (testable depuis la page
      liste avant même d'être branché au module Ventes)
