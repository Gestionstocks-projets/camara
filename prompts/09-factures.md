# Prompt 09 — Module Factures

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Gabarit de facture professionnel, imprimable, exportable en PDF et
partageable par WhatsApp, avec numérotation automatique déjà posée au
prompt 03.

## Pré-requis

Prompts 01–08 terminés.

## Spécifications détaillées

### Contenu de la facture (`src/app/(app)/factures/[id]/page.tsx`)

- **En-tête boutique** : logo (si défini dans Paramètres, sinon nom seul),
  nom, téléphone, WhatsApp, email, adresse (depuis la table `settings`).
- **Numéro de facture** et date, en évidence (`FAC-2026-0001`).
- **Client** : nom, prénom, téléphone, email.
- **Téléphone vendu** : marque, modèle, IMEI, RAM, stockage, couleur, état.
- **Détail de vente** : prix de vente, remise, **total**, mode de paiement,
  statut de paiement (Payé/Partiel/En attente + reste à payer si
  applicable), garantie accordée, date.
- Mise en page en carte `surface` centrée, largeur type A4, avec une
  variante d'impression dédiée (voir plus bas).

### Liste des factures (`src/app/(app)/factures/page.tsx`)

Table : Numéro, Date, Client, Téléphone, Montant total, Statut de paiement.
Recherche par numéro (branchée à la recherche globale au prompt 10).

### Impression

CSS d'impression dédié (`@media print`) : masquer sidebar/topbar/boutons
d'action, n'afficher que le contenu de la facture, marges adaptées à
l'impression A4. Bouton "Imprimer" appelle `window.print()`.

### Export PDF

Installer `@react-pdf/renderer`. Créer un composant de document PDF
(`src/components/invoice-pdf.tsx`) qui reproduit fidèlement le même contenu
que la page HTML (ne pas dupliquer la logique de mise en forme des données —
extraire une fonction commune qui prépare les données d'affichage à partir
de la vente). Bouton "Télécharger PDF" déclenche la génération côté client
(`@react-pdf/renderer`'s `pdf().toBlob()`) et le téléchargement du fichier
nommé `{numero_facture}.pdf`.

### Partage WhatsApp

Bouton "Envoyer WhatsApp" :
1. Génère le PDF (comme ci-dessus).
2. L'upload dans un bucket Supabase Storage `invoices` (nom de fichier =
   numéro de facture, accès en lecture publique ou URL signée longue durée).
3. Ouvre un lien `https://wa.me/{numero_whatsapp_client}?text=...` avec un
   message pré-rempli ("Bonjour {prénom}, voici votre facture {numéro} :
   {url_pdf}"). Si le client n'a pas de numéro WhatsApp renseigné, désactiver
   le bouton avec une info-bulle explicative plutôt que de planter.

## Livrables attendus

- Page facture complète, imprimable proprement.
- Export PDF téléchargeable identique au rendu HTML.
- Partage WhatsApp fonctionnel avec fallback propre si pas de numéro.

## Critères d'acceptation

- [ ] Le numéro de facture affiché correspond bien à celui généré par le
      trigger du prompt 03
- [ ] `window.print()` produit un rendu propre sans sidebar/topbar
- [ ] Le PDF téléchargé contient les mêmes informations que la page
- [ ] Le lien WhatsApp s'ouvre avec le bon numéro et un message cohérent
- [ ] `npm run build` réussit
