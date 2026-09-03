# Prompt 01 — Fondations du projet

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Vérifier/compléter le socle technique du projet pour qu'il soit propre,
typé strictement, et prêt à recevoir les modules métier. Ne pas repartir de
zéro si un scaffold existe déjà : auditer l'existant et combler ce qui manque.

## Pré-requis

Aucun — c'est le premier prompt.

## Spécifications détaillées

1. **Vérifier le scaffold Next.js** (`package.json`, `next.config.ts`,
   `tsconfig.json`). Si absent, créer un projet Next.js App Router + TypeScript
   + Tailwind CSS v4 + ESLint avec `src/` directory et alias `@/*`.
2. **TypeScript strict** : `tsconfig.json` doit avoir `"strict": true`. Ajouter
   `"noUncheckedIndexedAccess": true`.
3. **Dépendances à installer** si absentes : `@supabase/supabase-js`,
   `@supabase/ssr`, `lucide-react`, `clsx`, `tailwind-merge`,
   `class-variance-authority`, `zod`, `react-hook-form`,
   `@hookform/resolvers`, `date-fns`.
4. **Arborescence cible** sous `src/` :
   ```
   src/
     app/
       (auth)/login/page.tsx
       (app)/...                 # routes protégées, voir prompts suivants
       layout.tsx
       globals.css
     components/
       ui/                       # composants de design system (prompt 02)
       layout/                   # sidebar, topbar, shell (prompt 04)
     lib/
       supabase/
         client.ts                # client navigateur
         server.ts                # client serveur (cookies)
         middleware.ts            # helper pour le middleware
       utils.ts                   # cn(), formatCurrency(), formatDate()...
       constants.ts                # enums métier (statuts, modes paiement...)
     types/
       database.ts                 # types générés/écrits pour Supabase
       index.ts
   ```
5. **`src/lib/utils.ts`** : fonction `cn()` (clsx + tailwind-merge),
   `formatFCFA(amount: number): string` → `"350 000 F"` (séparateur espace,
   pas de décimales), `formatDate(date, style)` avec `date-fns` locale
   française (`import { fr } from "date-fns/locale"`).
6. **`.env.local.example`** listant `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, avec un
   commentaire précisant que ce fichier ne doit jamais contenir de vraies
   clés. Vérifier que `.env.local` est bien dans `.gitignore`.
7. **Métadonnées racine** (`src/app/layout.tsx`) : `lang="fr"`, `title`
   "Ma Boutique — Gestion" (valeur par défaut, personnalisable plus tard via
   Paramètres), `description` cohérente avec le métier.
8. **Scripts `package.json`** : `dev`, `build`, `start`, `lint`,
   `typecheck` (`tsc --noEmit`).
9. Nettoyer la page d'accueil par défaut de `create-next-app`
   (`src/app/page.tsx`) : rediriger `/` vers `/dashboard` si authentifié,
   sinon vers `/login` (la logique de redirection réelle arrive au prompt 04
   — pour l'instant, une page d'accueil minimale ou un simple `redirect()`
   suffit, à ajuster ensuite).

## Livrables attendus

- Arborescence conforme au point 4.
- `npm run build` et `npm run lint` passent sans erreur.
- `.env.local.example` présent et documenté.

## Critères d'acceptation

- [ ] `npm run typecheck` sans erreur
- [ ] `npm run lint` sans erreur
- [ ] `npm run build` réussit
- [ ] Aucune clé secrète committée
