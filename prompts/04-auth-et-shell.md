# Prompt 04 — Authentification, rôles et coquille applicative

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Mettre en place la connexion (email/mot de passe via Supabase Auth), la
protection des routes, la récupération du rôle courant, et la coquille
visuelle de l'application (sidebar + topbar avec recherche) utilisée par
tous les modules suivants.

## Pré-requis

Prompts 01, 02, 03 terminés.

## Spécifications détaillées

### Auth Supabase

- `src/lib/supabase/client.ts` : `createBrowserClient` (`@supabase/ssr`).
- `src/lib/supabase/server.ts` : `createServerClient` avec gestion des
  cookies Next.js (Server Components + Server Actions).
- `src/middleware.ts` : rafraîchit la session sur chaque requête, redirige
  vers `/login` si non authentifié et route protégée, vers `/dashboard` si
  authentifié et sur `/login`.
- Pas d'auto-inscription publique : aucune page `/signup`. Les comptes sont
  créés uniquement par le propriétaire (prompt 12, via l'API admin
  `service_role`, jamais exposée au client).

### Page de connexion (`src/app/(auth)/login/page.tsx`)

- Formulaire email + mot de passe (`react-hook-form` + `zod`), validation
  d'email, message d'erreur clair si identifiants invalides ("Email ou mot
  de passe incorrect" — pas de détail technique Supabase brut).
- Pas de lien "mot de passe oublié" pour l'instant (hors périmètre) sauf si
  trivial à ajouter avec `resetPasswordForEmail`.
- Design cohérent avec la charte Teranga (fond `background`, carte `surface`,
  logo/texte "Ma Boutique").

### Récupération du rôle courant

`src/lib/auth.ts` : fonction serveur `getCurrentProfile()` qui lit la session
puis la ligne `profiles` correspondante (role, full_name). Utilisée dans les
layouts et Server Components pour afficher/masquer des éléments selon
`role === 'owner'`.

### Coquille applicative (`src/app/(app)/layout.tsx`)

- **Sidebar** (fond `sidebar`, texte `sidebar-foreground`) : logo/nom
  boutique en haut, puis les liens du menu (section 6 de `00-CONTEXTE.md`) —
  `Gérants` **et** `Fournisseurs` visibles seulement si `role === 'owner'`.
  Lien actif surligné (`sidebar-active`). Icônes `lucide-react` (pas
  d'emoji).
- **Topbar** : barre de recherche globale (placeholder connecté au prompt
  10 — pour l'instant un simple champ non fonctionnel branché plus tard),
  nom de l'utilisateur connecté + rôle, bouton de déconnexion.
- Layout responsive : sidebar repliable en menu hamburger sous un certain
  breakpoint (mobile/tablette — les vendeurs utiliseront parfois une
  tablette au comptoir).

### Page racine (`src/app/page.tsx`)

Redirige vers `/dashboard` si authentifié, sinon `/login` (via le
middleware ou un `redirect()` serveur).

## Livrables attendus

- Connexion/déconnexion fonctionnelles de bout en bout avec un utilisateur
  de test créé manuellement dans Supabase (SQL ou dashboard) avec un profil
  `role = 'owner'`.
- Sidebar + topbar conformes à la charte, responsive.
- Routes protégées : impossible d'accéder à `/dashboard` sans session.

## Critères d'acceptation

- [ ] Un utilisateur non connecté redirigé vers `/login` sur toute route de
      `(app)`
- [ ] Après connexion, redirection vers `/dashboard`
- [ ] Les liens "Gérants" et "Fournisseurs" sont invisibles pour un profil
      `manager`
- [ ] Déconnexion invalide bien la session (retour forcé à `/login`)
- [ ] `npm run build` réussit
