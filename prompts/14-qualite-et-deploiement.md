# Prompt 14 — Qualité, robustesse et déploiement

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Faire passer l'application d'un ensemble de fonctionnalités correctes à un
produit livrable : gestion d'erreurs, états de chargement, responsive,
nettoyage, puis déploiement sur Vercel connecté au Supabase de production.

## Pré-requis

Prompts 01–13 terminés. Tous les critères d'acceptation des prompts
précédents doivent être vérifiés avant de commencer celui-ci.

## Spécifications détaillées

### Nettoyage

- Supprimer la page `/ui-kit` de développement (prompt 02) ou la déplacer
  derrière une variable d'environnement `NODE_ENV !== 'production'`.
- Supprimer tout `console.log` de debug, tout composant/route mort.
- Vérifier qu'aucune valeur "en dur" de test (ex. faux IMEI, faux client)
  ne traîne dans le code applicatif (les seeds de démo vont dans
  `supabase/seed.sql`, séparés).

### Gestion d'erreurs et de chargement

- `loading.tsx` et `error.tsx` sur chaque segment de route de `(app)`
  (Stock, Ventes, Clients, Fournisseurs, Factures, Gérants, Paramètres,
  Dashboard) — squelettes de chargement cohérents avec la charte (pas de
  simple "Loading...").
- Toutes les Server Actions retournent des erreurs typées et lisibles
  (jamais de message d'erreur Postgres brut affiché à l'utilisateur) ; les
  formulaires affichent l'erreur au bon endroit (toast pour les erreurs
  globales, message sous le champ pour les erreurs de validation).
- Page 404 personnalisée (`not-found.tsx`) cohérente avec la charte.

### Responsive & accessibilité

- Vérifier chaque module à 3 largeurs : mobile (~375px), tablette
  (~768px), desktop (~1440px) — le comptoir de vente utilise souvent une
  tablette.
- Contraste des couleurs conforme WCAG AA sur les deux thèmes (vérifier en
  particulier les `Badge` de statut et le texte sur `sidebar`).
- Navigation clavier complète (tab order logique, focus visible partout,
  modals qui piègent le focus et se ferment à `Échap`).

### Sécurité — passe finale

- Revérifier qu'aucune clé `service_role` n'est accessible côté client.
- Revérifier les RLS sur toutes les tables (tenter, avec un compte
  `manager`, d'appeler directement les fonctions réservées à `owner` —
  doit échouer proprement).
- Valider côté serveur systématiquement (jamais faire confiance à la seule
  validation client `zod` — revalider dans chaque Server Action).

### Déploiement

1. `npm run build` local sans erreur ni avertissement bloquant.
2. Pousser le code sur le dépôt Git du client (confirmer l'URL du remote
   avec le client avant tout `git push`).
3. Créer/connecter le projet Vercel (le client s'en charge lui-même côté
   compte, cf. décision prise avec lui) et renseigner les variables
   d'environnement de production (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) dans les
   paramètres du projet Vercel — jamais dans un fichier committé.
4. Appliquer les migrations Supabase sur le projet de production
   (`supabase db push` ou équivalent) avant le premier déploiement.
5. Créer le premier compte `owner` réel (via SQL/dashboard Supabase, pas
   via l'UI puisqu'il n'y a pas d'auto-inscription) et vérifier la
   connexion en production.

### Checklist de recette finale (à dérouler manuellement en production)

- [ ] Créer un fournisseur, un client
- [ ] Ajouter un téléphone (avec calcul de bénéfice correct)
- [ ] Le vendre en "Partiel", enregistrer un paiement complémentaire jusqu'à
      solde
- [ ] Vérifier la facture générée, l'impression, le PDF, le lien WhatsApp
- [ ] Vérifier le Dashboard sur chaque période (Aujourd'hui/7j/30j/Mois/
      Année/Personnalisée)
- [ ] Exporter Stock et Ventes en Excel et PDF
- [ ] Créer un gérant, se connecter avec ce compte, vérifier le menu
      restreint (pas de "Gérants" ni "Fournisseurs"), l'accès refusé sur
      `/fournisseurs` en URL directe, et le masquage prix d'achat/bénéfice
- [ ] Basculer les interrupteurs de permission et re-vérifier le compte
      gérant
- [ ] Tester la recherche globale sur un IMEI, un nom de client, un numéro
      de facture
- [ ] Parcourir l'application entière sur mobile/tablette

## Livrables attendus

- Application déployée et accessible en production, connectée au Supabase
  de production, avec un premier compte `owner` fonctionnel.
- Checklist de recette entièrement cochée.

## Critères d'acceptation

Tous les points de la checklist ci-dessus, plus :
- [ ] `npm run build` sans erreur en environnement de production
- [ ] Aucune clé secrète dans le dépôt Git (vérifier l'historique, pas
      seulement l'état actuel)
