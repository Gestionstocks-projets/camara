# Prompt 16 — IMEI optionnel à la création

Lire `00-CONTEXTE.md` avant de commencer.

## Contexte

Retour du propriétaire (2026-09-08) : demander l'IMEI à la création
freine l'enregistrement d'un arrivage — la boutique reçoit souvent
plusieurs unités identiques sans avoir noté le numéro de série de
chacune. Décision : l'IMEI n'est plus demandé à la création, remplacé par
un simple champ **Quantité** ; il reste éditable plus tard, unité par
unité, depuis la fiche (`Modifier`), quand le propriétaire l'a sous la
main (ex. au moment de la vente, pour la garantie).

## Changements

### Base de données

`supabase/migrations/0010_imei_optional.sql` — `alter table phones alter
column imei drop not null;`. La contrainte d'unicité reste active pour les
IMEI réellement saisis (Postgres autorise plusieurs `NULL` sous `UNIQUE`).
**À exécuter manuellement dans le SQL Editor de Supabase** (pas de CLI
liée dans cet environnement) avant que la création de téléphones ne
fonctionne à nouveau.

### Formulaire (`phone-form.tsx`)

Création : le champ IMEI est remplacé par **Quantité** (nombre, 1 à 500,
défaut 1). Modification : l'IMEI redevient un champ facultatif (plus de
`required`), avec l'indication "Facultatif — à renseigner quand vous
l'avez sous la main."

### `actions.ts` / `schema.ts`

`createPhone` lit `quantity` (nouveau `quantitySchema`, 1 à 500) et crée
autant de lignes `phones` avec `imei: null`. `phoneSchema.imei` devient
optionnel (vide → `null`), réutilisé tel quel par `updatePhone`.

### Affichage

Toutes les vues qui affichaient l'IMEI (fiche téléphone, liste stock,
export stock, fiche fournisseur, sélecteur de vente, recherche globale,
facture PDF/HTML) gèrent maintenant l'absence de valeur : "—" dans les
tableaux/exports, ligne masquée sur la facture, aucune mention dans le
sélecteur de vente si absent.

## Critères d'acceptation

- [ ] La migration `0010` exécutée en base : créer un téléphone sans IMEI
      ne renvoie plus d'erreur "not null constraint"
- [ ] Créer avec Quantité = 5 crée 5 lignes distinctes, toutes sans IMEI
- [ ] La fiche/liste/export/facture n'affichent jamais "null" ou "undefined"
      pour un IMEI absent
- [ ] Modifier une fiche permet d'ajouter l'IMEI après coup, avec
      détection du doublon si déjà utilisé ailleurs
- [ ] `npm run build` réussit
