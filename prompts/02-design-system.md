# Prompt 02 — Système de design (palette Teranga)

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Implémenter la charte graphique validée ("Teranga") comme design tokens
réutilisables, puis construire la bibliothèque de composants UI de base sur
laquelle tous les modules métier s'appuieront. Personne ne doit re-taper des
classes Tailwind brutes de couleur dans les modules — tout passe par ces
tokens et ces composants.

## Pré-requis

Prompt 01 terminé.

## Spécifications détaillées

### Tokens (`src/app/globals.css`)

Reprendre exactement les valeurs de la section 3 de `00-CONTEXTE.md` :
variables CSS dans `:root` (clair), redéfinies dans
`@media (prefers-color-scheme: dark)`, puis mappées dans un bloc
`@theme inline` (`--color-background`, `--color-surface`, `--color-foreground`,
`--color-muted`, `--color-border`, `--color-sidebar`, `--color-sidebar-foreground`,
`--color-sidebar-muted`, `--color-sidebar-active`, `--color-accent`,
`--color-accent-foreground`, `--color-brass`, `--color-brass-foreground`,
`--color-success` / `-soft`, `--color-warning` / `-soft`, `--color-danger` /
`-soft`). Ajouter une classe utilitaire `.tabular` (`font-variant-numeric:
tabular-nums`).

### Typographie

Charger **Unbounded** (700, 800) et **Manrope** (400, 500, 600, 700, 800) via
`next/font/google` dans `layout.tsx`, exposées en variables CSS
(`--font-unbounded`, `--font-manrope`) mappées vers `--font-display` et
`--font-sans` dans `@theme inline`. Titres de page en `font-display`, tout le
reste en `font-sans`.

### Composants (`src/components/ui/`)

Construire avec `class-variance-authority` + `cn()` (prompt 01), accessibles
(focus visible, `aria-*` corrects), fonctionnels en clair/sombre :

- **Button** : variants `primary` (fond `accent`), `brass` (mise en avant
  chiffres/CTA secondaire), `outline`, `ghost`, `danger` ; tailles `sm`/`md`/`lg`.
- **Card** : conteneur `surface` + `border` + radius cohérent, sous-composants
  `CardHeader`, `CardTitle`, `CardContent`.
- **StatTile** : label (muted, majuscules, petit), valeur (font-display,
  tabular-nums), variante `accent`/`brass` pour la couleur de la valeur,
  utilisé sur le Dashboard.
- **Badge / StatusPill** : statuts métier avec couleur sémantique —
  `En stock` (neutre), `Réservé` (warning), `Vendu` (success) ; `Payé`
  (success), `Partiel` (warning), `En attente` (danger) ; `Neuf` / `Quasi neuf`.
- **Input, Select, Textarea** : label, message d'erreur, état disabled,
  intégrables avec `react-hook-form`.
- **Table** : `Table`, `TableHeader`, `TableRow`, `TableCell`, avec état vide
  géré par `EmptyState`, et wrapper `overflow-x-auto` pour le responsive.
- **Modal / Dialog** : pour les formulaires courts (ex. créer un fournisseur)
  et les confirmations de suppression.
- **Toast** : succès/erreur après une action (créer/modifier/supprimer/vendre).
- **PageHeader** : titre + description + zone d'actions à droite (boutons
  "Exporter Excel", "Exporter PDF", "+ Nouveau...").
- **EmptyState** : icône (lucide-react), message, action.

### Page de démonstration temporaire

Créer `src/app/(dev)/ui-kit/page.tsx` affichant tous les composants avec
leurs variantes (sert de vérification visuelle rapide). Cette page sera
supprimée au prompt 14 (nettoyage final) — la laisser marquée clairement
comme page de développement.

## Livrables attendus

- `globals.css` mis à jour avec tous les tokens.
- Tous les composants listés dans `src/components/ui/`.
- Page `/ui-kit` fonctionnelle affichant l'ensemble.

## Critères d'acceptation

- [ ] Le thème change correctement entre clair et sombre (tester en basculant
      le thème du système/OS)
- [ ] Aucune couleur "en dur" (hex) utilisée en dehors de `globals.css`
- [ ] Tous les composants ont un état focus clavier visible
- [ ] `npm run build` réussit
