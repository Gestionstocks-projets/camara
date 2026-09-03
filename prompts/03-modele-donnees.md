# Prompt 03 — Modèle de données Supabase

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Créer le schéma Postgres complet dans Supabase (via des fichiers de migration
SQL versionnés dans `supabase/migrations/`), avec les enums, contraintes,
triggers de calcul automatique, RLS, et les types TypeScript correspondants.

## Pré-requis

Prompt 01 terminé. Le client a créé le projet Supabase et fourni les clés
dans `.env.local` (non fourni ? Utiliser `supabase init` + `supabase start`
en local avec Docker pour développer sans attendre les clés de prod).

## Spécifications détaillées

### Extensions & enums

```sql
create type user_role as enum ('owner', 'manager');
create type phone_condition as enum ('neuf', 'quasi_neuf');
create type phone_status as enum ('en_stock', 'reserve', 'vendu');
create type payment_method as enum ('especes', 'orange_money', 'wave', 'carte', 'autre');
create type payment_status as enum ('paye', 'partiel', 'en_attente');
```

### Tables

- **`profiles`** (1-1 avec `auth.users`) : `id uuid primary key references
  auth.users`, `full_name text not null`, `role user_role not null default
  'manager'`, `phone text`, `created_at timestamptz default now()`.
- **`settings`** (une seule ligne, id fixe) : `id int primary key default 1
  check (id = 1)`, `shop_name text not null default 'Ma Boutique'`,
  `shop_logo_url text`, `shop_phone text`, `shop_whatsapp text`,
  `shop_email text`, `shop_address text`, `managers_see_purchase_price
  boolean not null default false`, `managers_see_profit boolean not null
  default false`, `invoice_prefix text not null default 'FAC'`.
- **`suppliers`** : `id uuid default gen_random_uuid() primary key`, `name
  text not null`, `phone text`, `whatsapp text`, `city text`, `notes text`,
  `created_at timestamptz default now()`.
- **`clients`** : `id uuid default gen_random_uuid() primary key`, `first_name
  text not null`, `last_name text not null`, `phone text`, `whatsapp text`,
  `email text`, `city text`, `created_at timestamptz default now()`.
- **`phones`** : `id uuid default gen_random_uuid() primary key`, `brand
  text not null`, `model text not null`, `imei text not null unique`,
  `condition phone_condition not null`, `ram text`, `storage text not null`,
  `color text`, `email text`, `status phone_status not null default 'en_stock'`,
  `supplier_id uuid references suppliers(id) on delete set null`,
  `arrival_date date not null default current_date`, `purchase_price
  numeric(12,0) not null`, `extra_fees numeric(12,0) not null default 0`,
  `planned_sale_price numeric(12,0) not null`, `created_by uuid references
  profiles(id)`, `created_at timestamptz default now()`, `updated_at
  timestamptz default now()`.
  - Contrainte `check (purchase_price >= 0 and extra_fees >= 0 and
    planned_sale_price >= 0)`.
  - Index sur `imei`, `status`, `brand`.
- **`sales`** : `id uuid default gen_random_uuid() primary key`, `phone_id
  uuid not null unique references phones(id)`, `client_id uuid not null
  references clients(id)`, `sale_date date not null default current_date`,
  `sale_price numeric(12,0) not null`, `discount numeric(12,0) not null
  default 0`, `profit numeric(12,0) not null default 0` (colonne normale,
  **jamais** `generated always as` — le calcul dépend de `phones`, une autre
  table, ce que Postgres interdit pour une colonne générée ; le calcul se
  fait exclusivement via le trigger ci-dessous), `payment_method
  payment_method not null`, `warranty text`, `payment_status payment_status
  not null default 'paye'`, `amount_paid numeric(12,0) not null`,
  `amount_due numeric(12,0) not null default 0`, `sold_by uuid references
  profiles(id)`, `created_at timestamptz default now()`.
  - `phone_id` est **`unique`** : c'est le vrai garde-fou anti-double-vente
    (une deuxième tentative de vente sur le même téléphone échoue avec une
    violation de contrainte, même en cas de requêtes concurrentes) — la
    vérification "le téléphone est toujours en_stock" côté application
    (prompt 08) n'est qu'un confort UX pour afficher un message clair
    *avant* de tenter l'insertion ; la Server Action doit aussi intercepter
    l'erreur Postgres `23505` (unique_violation) sur `phone_id` et
    retourner le même message clair au cas où la vérification préalable
    aurait été doublée par une requête concurrente.
  - Trigger `before insert or update on sales` : calcule `profit =
    sale_price - discount - purchase_price - extra_fees` du téléphone lié,
    calcule `amount_due = (sale_price - discount) - amount_paid`.
  - Trigger `after insert on sales` (trigger séparé) : **met à jour
    `phones.status = 'vendu'`** sur le téléphone concerné — volontairement
    en `after`, pas en `before`, pour ne modifier `phones` qu'une fois la
    ligne `sales` définitivement validée par toutes ses contraintes `check`.
  - Contrainte `check (amount_paid >= 0 and amount_paid <= sale_price -
    discount)`.
- **`invoices`** : `id uuid default gen_random_uuid() primary key`, `sale_id
  uuid not null unique references sales(id)`, `number text not null unique`,
  `created_at timestamptz default now()`.
  - Génération du `number` = `{invoice_prefix}-{année}-{compteur sur 4
    chiffres remis à zéro chaque année}` via une fonction Postgres
    `generate_invoice_number()` appelée par trigger `before insert on
    invoices` (utiliser une table `invoice_counters(year int primary key,
    last_number int not null default 0)` avec `select ... for update` pour
    éviter les collisions en cas d'accès concurrent).

### RLS (Row Level Security)

Activer RLS sur toutes les tables métier. Politique générale : tout
utilisateur authentifié (`auth.role() = 'authenticated'`) peut lire/écrire —
la distinction owner/manager se fait au niveau applicatif pour les actions
sensibles (créer un gérant, modifier les paramètres). Exceptions :
- `settings` : lecture pour tous les authentifiés, **écriture réservée au
  rôle `owner`** (vérifier via jointure sur `profiles.role`).
- `profiles` : un utilisateur lit son propre profil ; le propriétaire lit et
  modifie tous les profils (nécessaire pour gérer les gérants).
- `suppliers` : **lecture** (`select`) ouverte à tout authentifié (un
  gérant doit pouvoir peupler le menu déroulant "Fournisseur" du formulaire
  d'ajout de téléphone, prompt 07) ; **écriture** (`insert`/`update`/
  `delete`) réservée au rôle `owner` — le module Fournisseurs (prompt 05)
  est entièrement propriétaire-only par décision du client, la RLS est la
  ligne de défense réelle, la redirection de page côté Next.js n'est qu'un
  confort UX.

Le masquage de `purchase_price` / `extra_fees` / `profit` pour un gérant
quand `settings.managers_see_purchase_price` ou `managers_see_profit` vaut
`false` **n'est pas géré par RLS** (RLS ne fait pas de masquage colonne par
colonne) : il se fait **côté application**, dans les fonctions de lecture
serveur (voir prompt 07 et 08) qui retirent ces champs de la réponse avant
de les envoyer au client si l'utilisateur est `manager` et que le réglage
est désactivé.

### Types TypeScript

Générer `src/types/database.ts` via `npx supabase gen types typescript` (si
le projet Supabase est accessible), sinon écrire les types à la main en
reflétant exactement le schéma ci-dessus. Exporter aussi des types métier
"propres" dans `src/types/index.ts` (`Phone`, `Sale`, `Client`, `Supplier`,
`Invoice`, `Profile`, `Settings`) dérivés des types générés, avec les enums
en union de strings littérales françaises côté UI (mapping affiché ↔ valeur
DB centralisé dans `src/lib/constants.ts`).

## Livrables attendus

- `supabase/migrations/0001_init.sql` (schéma complet ci-dessus).
- `supabase/migrations/0002_functions_triggers.sql` (triggers profit,
  amount_due, statut téléphone, numérotation facture).
- `src/types/database.ts` + `src/types/index.ts`.
- `src/lib/constants.ts` avec les mappings d'enums et libellés français.

## Critères d'acceptation

- [ ] `supabase db reset` (ou équivalent) applique les migrations sans erreur
- [ ] Insérer un téléphone puis une vente avec remise calcule le bon
      `profit` et le bon `amount_due`
- [ ] Le statut du téléphone passe automatiquement à `vendu`
- [ ] Deux factures créées la même année ont des numéros séquentiels sans
      collision
- [ ] Un gérant ne peut pas modifier `settings`
- [ ] Un gérant peut lire `suppliers` mais un `insert`/`update`/`delete`
      tenté avec sa session échoue (RLS)
