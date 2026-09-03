# Contexte du projet — application de gestion de boutique de téléphones

Ce fichier est la référence commune à tous les prompts du dossier `prompts/`.
Avant d'exécuter un prompt numéroté (`01-...md`, `02-...md`, etc.), relis ce fichier
en entier : il contient les décisions déjà validées avec le client et ne doivent
plus être remises en question sauf demande explicite.

## 1. Nature du projet

Application web de gestion pour une boutique revendant des téléphones (neufs et
quasi neufs) : stock par IMEI, ventes, clients, fournisseurs, facturation,
tableau de bord, exports. Marché cible : Afrique de l'Ouest (Sénégal), devise
FCFA (affichée `F`), paiements Espèces / Orange Money / Wave / Carte / Autre.

L'application gère **une seule boutique** (pas de multi-succursale). Interface
entièrement en **français**.

## 2. Stack technique (validée)

- **Framework** : Next.js (App Router, TypeScript, `src/` directory) — déjà scaffoldé
  dans `c:\camara` via `create-next-app`.
- **Styles** : Tailwind CSS v4 (config CSS-first via `@theme` dans `globals.css`,
  pas de `tailwind.config.js`).
- **Base de données / backend** : Supabase (Postgres + Auth + Storage). Le client
  gère lui-même la création du projet Supabase et du projet Vercel ; les prompts
  supposent que les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) seront fournies
  dans `.env.local` — ne jamais les committer.
- **Déploiement** : Vercel.
- **Icônes** : `lucide-react` (déjà installé). Pas d'emoji dans l'UI finale (les
  emoji du cahier des charges initial sont un raccourci de présentation, pas une
  spec visuelle).
- **Paquets déjà installés** : `@supabase/supabase-js`, `@supabase/ssr`,
  `lucide-react`, `clsx`.

## 3. Charte graphique — palette "Teranga" (validée par le client)

Indigo profond + laiton, typographie Unbounded (display) + Manrope (texte/UI).

| Token | Clair | Sombre |
|---|---|---|
| `background` | `#F6F3EC` | `#14131F` |
| `surface` | `#FFFFFF` | `#1C1B2B` |
| `foreground` (texte) | `#1D1B33` | `#ECE9E2` |
| `muted` (texte secondaire) | `#736F8C` | `#9D99B3` |
| `border` | `#E6E1D2` | `#2C2A3F` |
| `sidebar` (fond nav) | `#221F55` | `#1A1840` |
| `accent` (indigo, actions principales) | `#2E2A6E` | `#8F89E0` |
| `brass` (laiton, mise en avant chiffres/bénéfice) | `#C6913F` | `#D9A75A` |
| `success` | `#1E7A4C` | `#4CC98A` |
| `warning` | `#9A6810` | `#E3A83C` |
| `danger` | `#A8362A` | `#E2695A` |

Le thème doit fonctionner en clair et en sombre (préférence système), avec les
tokens définis en CSS variables et mappés dans `@theme inline`. Polices via
`next/font/google` : **Unbounded** (700/800, titres/marque) et **Manrope**
(400–800, tout le reste). Les montants utilisent `font-variant-numeric:
tabular-nums`.

Nom de boutique : générique (`Ma Boutique`) tant que le client n'a pas donné de
nom définitif — prévoir un champ dans Paramètres pour le personnaliser (nom,
logo, téléphone, WhatsApp, email, adresse) sans coder de valeur en dur ailleurs
que comme valeur par défaut.

## 4. Rôles et permissions

Deux rôles seulement :

- **Propriétaire** (`owner`) : accès total — stock, prix d'achat, bénéfices, CA,
  clients, fournisseurs, création de gérants, toutes les ventes/factures,
  paramètres.
- **Gérant** (`manager`) : ajoute, modifie et supprime des téléphones, voit le
  stock, fait une vente, enregistre et modifie un client, génère une facture,
  utilise la recherche. Un réglage dans **Paramètres** (accessible au
  propriétaire uniquement) détermine si les gérants voient ou non le **prix
  d'achat** et le **bénéfice** (par défaut : masqué).

Le propriétaire crée les comptes gérants (pas d'auto-inscription publique).

**Le module Fournisseurs (pages liste/fiche/création/modification) est
réservé au rôle `owner`** — décision explicite du client (ambiguïté du
cahier des charges initial tranchée le 2026-09-03). Un gérant garde
uniquement un accès en lecture à la liste des noms de fournisseurs, limité
au menu déroulant du formulaire "Ajouter un téléphone" (prompt 07) — il ne
peut pas créer, modifier ou consulter la fiche complète d'un fournisseur.

## 5. Modèle métier (résumé — le détail complet est dans `03-modele-donnees.md`)

- **Téléphone** (une ligne = une unité physique = un IMEI unique, pas de champ
  quantité) : marque, modèle/série, IMEI, état (Neuf / Quasi neuf), RAM,
  stockage, couleur, adresse mail, statut (En stock / Réservé / Vendu).
- **Arrivage / achat** (rattaché au téléphone) : date d'arrivée, fournisseur,
  prix d'achat, frais supplémentaires, prix de vente, remise accordée à la
  vente, bénéfice calculé automatiquement (`prix_vente_final - prix_achat -
  frais_supplementaires`), recalculé si une remise est appliquée à la vente.
- **Fournisseur** : nom, téléphone, WhatsApp, ville, observations ; liste des
  téléphones fournis consultable depuis sa fiche.
- **Client** : nom, prénom, téléphone, WhatsApp, email, ville ; historique
  d'achats calculé automatiquement (jamais saisi à la main).
- **Vente** : client, téléphone vendu, date, prix de vente, remise, mode de
  paiement (Espèces / Orange Money / Wave / Carte / Autre), garantie accordée,
  **statut de paiement** (Payé / Partiel / En attente) avec **montant payé** et
  **reste à payer** calculé — la vente à crédit est prévue dès le départ. Faire
  passer le téléphone de `En stock` à `Vendu` à la validation.
- **Facture** : générée à partir d'une vente, numérotée automatiquement
  `FAC-AAAA-NNNN` (compteur annuel), affiche infos boutique + client +
  téléphone + vente ; export impression / PDF / partage WhatsApp.

## 6. Menu final de l'application

`Dashboard` · `Stock` · `Ajouter un téléphone` · `Ventes` · `Clients` ·
`Factures` · `Fournisseurs` · `Gérants` · `Paramètres`

(`Gérants` et `Fournisseurs` visibles uniquement pour le rôle Propriétaire.)

## 7. Exigences transverses

- **Recherche globale** (barre en haut) : IMEI, marque, modèle, RAM, stockage,
  couleur, état, adresse mail, client, téléphone client, fournisseur, numéro de
  facture.
- **Filtres Stock** : marque, état, statut, stockage, RAM, couleur, prix
  min/max, date d'arrivée.
- **Exports Excel (.xlsx) et PDF** sur Stock, Ventes, Clients, Fournisseurs,
  avec sélecteur de période (Aujourd'hui / 7 jours / 30 jours / Ce mois / Cette
  année / Période personnalisée). Rapport PDF complet possible depuis le
  Dashboard.
- Toutes les valeurs monétaires en FCFA, formatées avec séparateur de milliers
  (espace) et suffixe `F` (ex. `350 000 F`).

## 8. Ordre d'exécution des prompts

01 Fondations du projet → 02 Système de design → 03 Modèle de données Supabase
→ 04 Authentification & rôles → 05 Fournisseurs → 06 Clients → 07 Stock /
téléphones → 08 Ventes → 09 Factures → 10 Recherche globale → 11 Dashboard →
12 Gérants & Paramètres → 13 Exports Excel/PDF → 14 Qualité & déploiement.

Chaque prompt suppose que les précédents sont terminés. Ne pas sauter d'étape.
Avant de commencer un prompt, vérifier l'état réel du code (il peut déjà être
partiellement fait) plutôt que de tout réécrire à l'aveugle.
