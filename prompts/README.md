# Prompts de construction — application boutique de téléphones

14 prompts séquentiels pour construire l'application de A à Z avec Claude
Code, à exécuter dans l'ordre. Chacun suppose les précédents terminés.

## Comment les utiliser

1. Lire `00-CONTEXTE.md` une fois — c'est la référence partagée (stack,
   charte graphique, rôles, modèle métier, menu) que tous les prompts
   suivants supposent connue.
2. Donner un fichier à la fois à Claude Code (coller son contenu dans une
   demande, ou dire "exécute `prompts/0X-....md`").
3. Vérifier les critères d'acceptation en bas de chaque fichier avant de
   passer au suivant.
4. Les comptes Vercel et Supabase sont créés par le client lui-même ; fournir
   les clés dans `.env.local` avant le prompt 03 (ou développer en local
   avec `supabase start` en attendant).

## Sommaire

| # | Fichier | Contenu |
|---|---|---|
| 00 | `00-CONTEXTE.md` | Référence commune — à lire avant chaque prompt |
| 01 | `01-fondations.md` | Scaffold Next.js/TypeScript, arborescence, outillage |
| 02 | `02-design-system.md` | Palette Teranga, typographie, composants UI |
| 03 | `03-modele-donnees.md` | Schéma Supabase, triggers, RLS, types |
| 04 | `04-auth-et-shell.md` | Connexion, rôles, sidebar/topbar |
| 05 | `05-fournisseurs.md` | CRUD Fournisseurs |
| 06 | `06-clients.md` | CRUD Clients + historique d'achats |
| 07 | `07-stock-telephones.md` | Fiche téléphone, ajout, filtres, masquage prix |
| 08 | `08-ventes.md` | Vente, vente à crédit, mise à jour du stock |
| 09 | `09-factures.md` | Facture, impression, PDF, WhatsApp |
| 10 | `10-recherche-globale.md` | Recherche transverse |
| 11 | `11-dashboard.md` | Indicateurs, filtres de période, graphique |
| 12 | `12-gerants-parametres.md` | Gestion des comptes gérants, réglages |
| 13 | `13-exports.md` | Export Excel/PDF sur tous les modules |
| 14 | `14-qualite-et-deploiement.md` | Robustesse, recette, mise en production |

## Décisions déjà tranchées (ne pas rouvrir sans validation du client)

- Boutique unique, pas de multi-succursale.
- Vente à crédit prévue dès le départ (statut payé/partiel/en attente).
- Authentification email + mot de passe (pas d'OTP téléphone).
- Palette "Teranga" (indigo + laiton) validée.
- Champ "Quantité" retiré de la fiche téléphone (1 ligne = 1 IMEI).
