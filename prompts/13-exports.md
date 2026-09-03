# Prompt 13 — Exports Excel / PDF

Lire `00-CONTEXTE.md` avant de commencer.

## Objectif

Permettre l'export Excel (.xlsx) et PDF du Stock, des Ventes, des Clients et
des Fournisseurs, avec sélection de période, comme décrit dans le cahier des
charges.

## Pré-requis

Prompts 01–12 terminés.

## Spécifications détaillées

### Bibliothèque

Installer `xlsx` (SheetJS) pour l'export Excel. Réutiliser
`@react-pdf/renderer` (déjà installé au prompt 09) pour les exports PDF
tabulaires.

### Composant partagé

`src/components/export-buttons.tsx` : deux boutons "Exporter Excel" /
"Exporter PDF" pris en props (`data`, `columns`, `filename`, `title`), à
poser dans le `PageHeader` de chaque page concernée (Stock, Ventes, Clients,
Fournisseurs).

**Sélecteur de période par page** — seule la page Ventes a déjà un
`PeriodFilter` (posé au prompt 08, sur `sale_date`) : le réutiliser tel
quel, l'export y porte sur les données actuellement filtrées/affichées à
l'écran. Stock, Clients et Fournisseurs **n'ont pas** de `PeriodFilter`
existant (Stock n'a qu'un filtre de plage sur la date d'arrivée parmi
d'autres filtres, prompt 07 ; Clients et Fournisseurs n'ont aucun filtre de
date, prompts 05/06) : sur ces trois pages, `ExportButtons` doit donc
embarquer son **propre** sélecteur de période (mêmes options —
Aujourd'hui/7 jours/30 jours/Ce mois/Cette année/Personnalisée),
indépendant des filtres déjà présents sur la page, et l'appliquer sur le
champ de date pertinent : `arrival_date` pour Stock, `created_at` pour
Clients et Fournisseurs.

### Contenu par module

- **Stock** : marque, modèle, IMEI, état, statut, RAM, stockage, couleur,
  prix d'achat (si visible pour le rôle courant), prix de vente, date
  d'arrivée, fournisseur.
- **Ventes** : date de vente, marque, modèle, IMEI, état, RAM, stockage,
  prix d'achat, prix de vente, remise, bénéfice (ces trois derniers omis
  si le rôle courant n'y a pas droit), client, mode de paiement, statut de
  paiement.
- **Clients** : nom, prénom, téléphone, whatsapp, email, ville, nombre
  d'achats, total dépensé.
- **Fournisseurs** : nom, téléphone, whatsapp, ville, nombre de téléphones
  fournis.

### Génération

- Excel : `XLSX.utils.json_to_sheet` → `XLSX.writeFile`, nom de fichier
  `{module}-{periode}.xlsx` (ex. `ventes-2026-09.xlsx`).
- PDF : gabarit tabulaire simple (en-tête boutique + titre + tableau +
  date d'export), même approche que le rapport Dashboard du prompt 11.
- **Respecter le masquage des champs sensibles** : appliquer exactement la
  même logique de filtrage par rôle que les pages elles-mêmes (ne jamais
  laisser fuiter prix d'achat/bénéfice dans un export si le compte gérant
  n'y a pas droit — réutiliser les mêmes fonctions de lecture serveur des
  prompts 07/08, jamais une requête parallèle non filtrée).

## Livrables attendus

- Boutons d'export fonctionnels sur Stock, Ventes, Clients, Fournisseurs.
- Fichiers Excel et PDF corrects, cohérents avec les filtres actifs à
  l'écran.

## Critères d'acceptation

- [ ] Un export Ventes filtré sur "Ce mois" ne contient que les ventes du
      mois en cours
- [ ] Un compte `manager` sans droit sur le bénéfice ne trouve ce champ
      dans aucun export, y compris PDF
- [ ] Les fichiers s'ouvrent correctement dans Excel/LibreOffice et un
      lecteur PDF standard
- [ ] `npm run build` réussit
