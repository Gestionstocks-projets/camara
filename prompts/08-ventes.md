# Prompt 08 — Module Ventes (avec vente à crédit)

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Le flux "Vendre" complet, y compris le paiement partiel/à crédit décidé avec
le client, la mise à jour automatique du stock et la génération de facture.

## Pré-requis

Prompts 01–07 terminés.

## Spécifications détaillées

### Déclenchement

Depuis la fiche téléphone (bouton "Vendre", téléphone pré-rempli) ou depuis
`/ventes/nouvelle` (sélection d'un téléphone parmi ceux `En stock` via un
combobox recherchable — marque/modèle/IMEI).

### Formulaire de vente

- **Téléphone** (pré-rempli ou à choisir, lecture seule une fois choisi,
  affiche marque/modèle/IMEI/prix de vente prévu).
- **Client** : combobox recherchable sur les clients existants + bouton
  "Nouveau client" ouvrant `ClientQuickCreateModal` (prompt 06) sans quitter
  l'écran.
- **Date de vente** (défaut aujourd'hui).
- **Prix de vente** (pré-rempli avec `planned_sale_price` du téléphone,
  modifiable).
- **Remise accordée** (0 par défaut).
- **Mode de paiement** : Espèces / Orange Money / Wave / Carte / Autre.
- **Garantie accordée** (texte libre ou durée, ex. "3 mois").
- **Statut de paiement** : Payé / Partiel / En attente.
  - Si **Payé** : `amount_paid = prix_vente - remise` automatiquement,
    champ non modifiable.
  - Si **Partiel** : champ **Montant payé** éditable (borné entre 0 et
    `prix_vente - remise`), **Reste à payer** affiché en lecture seule
    (calculé), en `warning`.
  - Si **En attente** : `amount_paid = 0`, tout le montant en `Reste à
    payer` (`danger`).
- **Total à payer** affiché en évidence (`prix_vente - remise`), avec le
  détail du calcul (prix de vente, remise) visible juste au-dessus.

### Soumission (Server Action `createSale`)

1. Valider que le téléphone est toujours `En stock` (éviter une double
   vente en cas de double-clic ou d'accès concurrent) — sinon erreur claire
   "Ce téléphone vient d'être vendu par quelqu'un d'autre."
2. Insérer la vente (le trigger du prompt 03 calcule `profit`, `amount_due`,
   et passe le téléphone à `vendu`).
3. Créer automatiquement la facture associée (insert dans `invoices`,
   numéro auto-généré par trigger).
4. Rediriger vers la facture générée (`/factures/[id]`) avec un toast de
   succès "Vente enregistrée — facture {numéro} générée".

### Liste des ventes (`src/app/(app)/ventes/page.tsx`)

Table : Date, Téléphone (marque/modèle/IMEI), Client, Prix de vente,
Remise, **Bénéfice** (masqué pour un gérant si le réglage l'exige, cf.
prompt 07), Mode de paiement, Statut de paiement (Badge), lien vers la
facture. Filtres : période (réutiliser le composant de sélection de période
qui servira aussi au Dashboard et aux exports — le construire ici comme
composant partagé `src/components/period-filter.tsx` si pas déjà fait),
statut de paiement, mode de paiement.

### Cas des ventes "Partiel" / "En attente"

Prévoir sur la fiche vente (`/ventes/[id]`) un bouton "Enregistrer un
paiement" qui ajoute au `amount_paid` existant (jamais ne le remplace
directement) et recalcule `amount_due` / met à jour `payment_status` à
`paye` si `amount_due` atteint 0. Historiser ces paiements dans une table
`sale_payments (id, sale_id, amount, paid_at, method)` — ajouter cette
table via une migration complémentaire `supabase/migrations/0003_sale_payments.sql`
plutôt que de modifier la migration initiale.

**Important** : si la vente est créée directement avec un `amount_paid > 0`
(statut "Partiel" avec un premier versement, ou "Payé"), la Server Action
`createSale` doit **aussi insérer une première ligne dans `sale_payments`**
pour ce montant initial (mode de paiement = celui choisi sur le formulaire
de vente). Sans cela, l'historique des paiements affiché sur la fiche vente
serait incomplet : il ne montrerait que les versements ultérieurs, pas le
premier.

## Livrables attendus

- Flux de vente complet, y compris crédit partiel avec suivi des paiements
  ultérieurs.
- Liste des ventes filtrable.
- Génération automatique de facture à chaque vente.

## Critères d'acceptation

- [ ] Une vente "Payé" ne laisse aucun reste à payer
- [ ] Une vente "Partiel" affiche correctement le reste à payer et permet
      d'enregistrer un paiement complémentaire qui le réduit
- [ ] Le téléphone vendu disparaît de la liste "En stock" et n'apparaît
      plus comme vendable
- [ ] Une facture est systématiquement créée à la validation d'une vente
- [ ] `npm run build` réussit
