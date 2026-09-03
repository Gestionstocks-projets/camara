# Prompt 12 — Gérants & Paramètres

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Donner au propriétaire le contrôle des comptes gérants et des réglages
sensibles de l'application (visibilité prix d'achat/bénéfice, informations
de la boutique utilisées sur les factures).

## Pré-requis

Prompts 01–11 terminés.

## Spécifications détaillées

### Accès

Les deux pages de ce prompt (`/gerants`, `/parametres`) sont **réservées au
rôle `owner`** — un `manager` qui tente d'y accéder directement par URL doit
être redirigé (ex. vers `/dashboard`) avec un message clair, pas une erreur
brute.

### Page Gérants (`src/app/(app)/gerants/page.tsx`)

- Liste des profils `role = 'manager'` : nom, email, téléphone, statut
  (actif/désactivé), date de création.
- "+ Nouveau gérant" : formulaire (nom complet, email, téléphone, mot de
  passe temporaire généré ou saisi). Création via une **Server Action qui
  utilise la clé `service_role`** côté serveur uniquement (jamais exposée au
  client) pour appeler `supabase.auth.admin.createUser()`, puis insère la
  ligne `profiles` correspondante avec `role = 'manager'`.
- Désactivation d'un gérant : `supabase.auth.admin.updateUserById(id, {
  ban_duration: '876000h' })` (ou suppression complète si le client
  préfère — proposer la désactivation par défaut, réversible, plus sûre
  qu'une suppression).

### Page Paramètres (`src/app/(app)/parametres/page.tsx`)

- **Informations boutique** (utilisées sur les factures, prompt 09) : nom,
  logo (upload vers Supabase Storage, bucket `shop-assets`), téléphone,
  WhatsApp, email, adresse.
- **Permissions gérants** : deux interrupteurs (`Switch`) — "Les gérants
  voient le prix d'achat", "Les gérants voient le bénéfice" — écrivent
  directement dans `settings.managers_see_purchase_price` /
  `managers_see_profit`. Effet immédiat (pas besoin de reconnexion) : les
  requêtes de lecture (prompts 07, 08, 11) doivent lire ce réglage à chaque
  chargement de page, pas le mettre en cache longtemps.
- **Préfixe de facture** : champ texte (`settings.invoice_prefix`, défaut
  `FAC`) — avertir que changer le préfixe n'affecte que les futures
  factures.

## Livrables attendus

- Création/désactivation de gérants fonctionnelle de bout en bout (tester
  la connexion avec le compte gérant créé).
- Paramètres boutique persistés et effectivement utilisés sur les factures.
- Interrupteurs de permission avec effet immédiat vérifiable dans les
  modules Stock/Ventes/Dashboard.

## Critères d'acceptation

- [ ] La clé `service_role` n'apparaît dans aucun code exécuté côté
      navigateur (vérifier le bundle client)
- [ ] Un gérant créé ici peut se connecter et voit le menu restreint
      (prompt 04)
- [ ] Désactiver un gérant l'empêche immédiatement de se reconnecter
- [ ] Basculer un interrupteur de permission change immédiatement ce qu'un
      gérant voit sur Stock/Ventes/Dashboard
- [ ] `npm run build` réussit
