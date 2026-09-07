# Prompt 15 — Enregistrement par lot + corrections stock

Lire `00-CONTEXTE.md` avant de commencer.

## Contexte

Retour du propriétaire (2026-09-07) : la fiche "Ajouter un téléphone" ne
gère qu'un appareil à la fois alors que la boutique reçoit des lots
d'unités identiques (même marque/modèle/stockage/prix) — ressaisir les
~12 champs pour chaque unité est trop lent. Le champ IMEI refusait aussi
toute saisie de plus de 17 caractères, avec un message d'erreur brut de
la librairie de validation (en anglais, technique) au lieu d'un message
clair — perçu par l'utilisateur comme "le site n'accepte pas au-delà de
18 caractères". Enfin, le stockage ne proposait aucune option en dessous
de 64 Go alors que la boutique vend aussi des appareils 8/16/32 Go.

## Décision révisée

`README.md` notait : *"Champ 'Quantité' retiré de la fiche téléphone (1
ligne = 1 IMEI)"* comme décision tranchée à ne pas rouvrir sans validation
du client. Le client (propriétaire) demande explicitly cette réouverture :
on garde "1 ligne = 1 IMEI" en base (chaque unité reste traçable
individuellement, indispensable pour la revente et la garantie), mais le
**formulaire de création** permet désormais de saisir plusieurs IMEI en
une seule soumission pour un même lot de caractéristiques partagées.

## Changements

### 1. Stockage — `src/lib/constants.ts`

`STORAGE_OPTIONS` étendu avec "8 Go", "16 Go", "32 Go" (avant "64 Go").

### 2. IMEI / numéro de série — `src/app/(app)/stock/schema.ts`

Le champ IMEI sert aussi bien à un IMEI téléphone (15 chiffres) qu'à un
numéro de série (ordinateurs/tablettes, alphanumérique — cf. fiche "Apple
pro book" enregistrée avec un IMEI factice faute d'alternative). Nouvelle
règle (`imeiSchema`, réutilisable) : 5 à 30 caractères, lettres/chiffres/
espaces/tirets/barres obliques, avec messages d'erreur en français précis
— plus jamais le message brut de zod ("Too big: expected string to have
<=17 characters"). Tous les autres champs texte du formulaire (`brand`,
`model`, `color`, `email`…) reçoivent désormais aussi un message français
sur leur limite de longueur.

### 3. Enregistrement par lot — `phone-form.tsx` + `actions.ts`

En création (pas en modification — une unité déjà en stock reste unique),
le champ IMEI devient une liste dynamique ("+ Ajouter un appareil" /
"Retirer"), avec détection des doublons saisis dans le lot en direct côté
client. Toutes les autres informations (marque, état, stockage, prix
d'achat/vente, fournisseur…) sont saisies une seule fois et appliquées à
chaque IMEI du lot.

`createPhone` lit tous les IMEI soumis (`formData.getAll("imei")`),
vérifie l'absence de doublon dans le lot et en base (une seule requête
`.in("imei", …)` avant insertion, message listant précisément le ou les
IMEI déjà utilisés), puis insère toutes les lignes en un seul appel. Si
une seule unité a été créée, redirection vers sa fiche (comportement
inchangé) ; si plusieurs, redirection vers la liste stock.

### 4. Nettoyage — suppression du système d'inventaire à variantes

Le commit précédent ("Implémente système d'inventaire professionnel avec
variantes & FIFO") avait ajouté `inventory.actions.ts`,
`inventory.queries.ts`, `src/types/inventory.ts` et la migration
`001_inventory_refactor.sql` : un second modèle de données (marques →
modèles → variantes → unités) jamais branché à une page, jamais appliqué
à la base réelle, et qui ne compilait pas contre les types générés
(`src/types/database.ts`) — **`npm run build` échouait donc en
production** depuis ce commit. Ces fichiers ont été supprimés : le module
Stock reste sur la table `phones` unique (prompt 07), avec le lot en
saisie uniquement (voir point 3), qui couvre le besoin réel sans réécrire
tout le module Ventes/Factures/Dashboard qui dépend de `phones`.

## Critères d'acceptation

- [ ] `npm run build` réussit (échouait avant ce prompt)
- [ ] La liste "Stockage" propose 8 Go, 16 Go et 32 Go
- [ ] Un numéro de série alphanumérique (ex. `C02XYZABCDEF`) est accepté
- [ ] Créer 3 téléphones identiques ne demande de saisir qu'une fois la
      marque/le modèle/les prix, avec 3 champs IMEI
- [ ] Un IMEI déjà utilisé en base bloque tout le lot avec un message
      indiquant lequel, sans effacer la saisie
- [ ] Toutes les erreurs de validation du formulaire stock sont en
      français, sans message technique de la librairie de validation
