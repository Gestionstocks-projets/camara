# Prompt 05 — Module Fournisseurs

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

CRUD complet des fournisseurs, avec vue des téléphones associés à chaque
fournisseur. Ce module sert aussi de gabarit de référence pour les modules
CRUD suivants (Clients) : garder la même structure de fichiers et de
patterns pour la cohérence.

## Pré-requis

Prompts 01–04 terminés.

## Accès

**Ce module entier (`/fournisseurs` et ses sous-routes) est réservé au rôle
`owner`** (décision explicite du client, cf. `00-CONTEXTE.md` section 4) —
un `manager` qui accède directement à l'URL doit être redirigé (même
traitement que `/gerants` et `/parametres`, prompt 12). Un gérant garde
uniquement une lecture indirecte, limitée aux noms de fournisseurs, via le
menu déroulant du formulaire "Ajouter un téléphone" (prompt 07) — jamais via
ces pages.

## Spécifications détaillées

### Champs

Nom (obligatoire), Téléphone, WhatsApp, Ville, Observations.

### Pages (`src/app/(app)/fournisseurs/`)

- `page.tsx` : liste (Table) — colonnes Nom, Ville, Téléphone, WhatsApp,
  nombre de téléphones fournis (calculé), actions (voir, modifier,
  supprimer). `PageHeader` avec titre "Fournisseurs" et bouton "+ Nouveau
  fournisseur" (ouvre une `Modal` avec le formulaire). `EmptyState` si aucun
  fournisseur.
- `[id]/page.tsx` : fiche fournisseur — informations, bouton modifier,
  section "Téléphones fournis" listant les téléphones (`phones` où
  `supplier_id = id`) avec marque/modèle/IMEI/statut/date d'arrivée, lien
  vers la fiche téléphone (prompt 07).

### Actions serveur (`src/app/(app)/fournisseurs/actions.ts`)

`createSupplier`, `updateSupplier`, `deleteSupplier` (Server Actions,
validation `zod`, revalidation du cache après mutation). Suppression : si
des téléphones référencent encore ce fournisseur, la contrainte
`on delete set null` (prompt 03) les laisse orphelins de fournisseur plutôt
que d'empêcher la suppression — confirmer ce comportement à l'utilisateur
dans la boîte de confirmation ("Les X téléphones liés resteront mais sans
fournisseur associé").

### Validation

`zod` schema partagé entre le formulaire client et la Server Action (fichier
`schema.ts` dans le dossier du module). Téléphone/WhatsApp : format libre
mais trim + longueur raisonnable, pas de regex trop stricte (numéros
locaux variés).

## Livrables attendus

- Liste, création, modification, suppression, fiche détail fonctionnelles.
- Recherche/tri simple sur la liste (nom) — la recherche globale multi-
  module arrive au prompt 10.

## Critères d'acceptation

- [ ] Créer, modifier, supprimer un fournisseur fonctionne sans rechargement
      complet de page (Server Actions + revalidation)
- [ ] La fiche fournisseur affiche les bons téléphones associés
- [ ] Formulaire : erreurs de validation affichées sous chaque champ
- [ ] Un compte `manager` redirigé s'il tente d'accéder à `/fournisseurs`
      directement par URL
- [ ] Un compte `manager` voit malgré tout la liste des noms de
      fournisseurs dans le formulaire "Ajouter un téléphone" (prompt 07)
