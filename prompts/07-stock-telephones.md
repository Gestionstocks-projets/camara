# Prompt 07 — Module Stock / Téléphones

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Le cœur métier de l'application : fiche téléphone, formulaire "Ajouter un
téléphone" fidèle au cahier des charges, liste filtrable, gestion du
masquage prix d'achat/bénéfice pour les gérants.

## Pré-requis

Prompts 01–06 terminés.

## Spécifications détaillées

### Formulaire "Ajouter un téléphone" (`src/app/(app)/stock/nouveau/page.tsx`)

Reproduire exactement les trois sections du cahier des charges, dans cet
ordre, en un seul formulaire (`react-hook-form` + `zod`) :

**Informations téléphone**
Marque* (select avec options courantes Apple/Samsung/Xiaomi/Tecno/Infinix +
"Autre" en saisie libre), Modèle / Série*, IMEI* (15 chiffres, unicité
vérifiée côté serveur avant soumission — message "Cet IMEI existe déjà" si
doublon), État* (Neuf / Quasi neuf), RAM, Stockage*, Couleur, Adresse mail.

**Informations d'achat**
Fournisseur (select alimenté par une lecture simple de `suppliers(id,
name)` — accessible à `owner` **et** `manager` même si le module
Fournisseurs complet est réservé au propriétaire, cf. prompt 05). Le lien
"créer un nouveau fournisseur" ouvrant une modal rapide n'est visible que
pour `role === 'owner'` (créer un fournisseur reste une action réservée) ;
un gérant qui a besoin d'un fournisseur absent de la liste doit le demander
au propriétaire. Puis Date d'arrivée* (défaut : aujourd'hui), Prix d'achat*,
Frais supplémentaires.

**Informations de vente**
Prix de vente*, Remise accordée (désactivée à ce stade — la remise réelle
se saisit au moment de la vente, prompt 08 ; ce champ ici sert uniquement de
prévision), **Bénéfice calculé automatiquement** en lecture seule, mis à
jour en temps réel à chaque changement de Prix d'achat / Frais
supplémentaires / Prix de vente (`bénéfice = prix_vente - prix_achat -
frais_supplementaires`), affiché en `brass` avec `formatFCFA`.

Bouton "ENREGISTRER LE TÉLÉPHONE" (Button `size=lg`, pleine largeur ou bien
mis en évidence).

### Liste Stock (`src/app/(app)/stock/page.tsx`)

- Table : Marque/Modèle, IMEI, État (Badge), Statut (Badge), Stockage, RAM,
  Couleur, Prix de vente, Date d'arrivée.
- **Filtres** (barre au-dessus de la table, en `Select`/`Input` compacts) :
  Marque, État, Statut, Stockage, RAM, Couleur, Prix min/max, Date d'arrivée
  (plage). Filtres combinables, reflétés dans l'URL (`searchParams`) pour
  être partageables/rechargeables.
- Ligne cliquable → fiche téléphone `[id]/page.tsx`.

### Fiche téléphone (`src/app/(app)/stock/[id]/page.tsx`)

Toutes les informations, bouton "Modifier" (réutilise le formulaire du
prompt en mode édition), bouton "Vendre" (actif seulement si statut =
`En stock`, redirige vers le flux de vente du prompt 08 avec le téléphone
pré-sélectionné), bouton "Marquer réservé" / "Annuler la réservation",
suppression possible seulement si jamais vendu (sinon message explicite).

### Masquage prix d'achat / bénéfice pour les gérants

Dans les fonctions de lecture serveur (`getPhones`, `getPhoneById` dans
`src/app/(app)/stock/queries.ts`) : si `profile.role === 'manager'` et que
`settings.managers_see_purchase_price === false`, ne pas inclure
`purchase_price`/`extra_fees` dans les données envoyées au composant (les
mettre à `null` ou les omettre du type retourné) ; même logique séparée pour
`managers_see_profit` sur le bénéfice affiché dans le formulaire/fiche. Les
composants d'affichage doivent gérer l'absence de ces champs proprement
(ne pas afficher la ligne plutôt qu'afficher "null" ou "0 F").

## Livrables attendus

- Formulaire d'ajout conforme au cahier des charges, calcul de bénéfice en
  temps réel.
- Liste filtrable, fiche détail, édition, changement de statut.
- Masquage effectif des champs sensibles pour un compte gérant quand le
  réglage est désactivé (à tester avec un compte de test `manager`).

## Critères d'acceptation

- [ ] Impossible d'enregistrer deux téléphones avec le même IMEI
- [ ] Le bénéfice affiché correspond exactement à `prix_vente - prix_achat
      - frais_supplementaires`
- [ ] Un compte `manager` avec les réglages par défaut (masqué) ne voit ni
      prix d'achat, ni frais, ni bénéfice nulle part dans ce module
- [ ] Les filtres combinés donnent des résultats corrects (tester au moins
      3 filtres combinés)
- [ ] `npm run build` réussit
