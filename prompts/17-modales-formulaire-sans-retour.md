# Prompt 17 — Audit : modales de formulaire sans retour visible

Lire `00-CONTEXTE.md` avant de commencer.

## Contexte

Retour du propriétaire (2026-09-18) : "on n'arrive pas à mettre un
client, ni à faire une vente". Diagnostic : le bucket Storage, les
policies RLS, les GRANT et les triggers de `sales` ont été vérifiés
directement contre la base de production (lecture + tests d'écriture
isolés) — tout fonctionne côté base de données. Le problème est côté
formulaire : plusieurs modales de création/modification ne donnent
**aucun signal visible de succès**, ce qui donne l'impression que
l'enregistrement a échoué alors qu'il a réussi.

## Bug (deux variantes du même défaut)

1. **Redirection vers la page déjà affichée.** Une modale de création
   (`CreateClientButton`, `CreateSupplierButton`) est ouverte sur la
   liste (`/clients`, `/fournisseurs`) ; son action serveur, en cas de
   succès, faisait `redirect("/clients")` — la même URL. Next.js ne
   remonte pas le composant client qui possède l'état `open` de la
   modale : elle ne se referme jamais, le formulaire reste affiché tel
   quel, sans erreur ni confirmation. Idem pour la modification
   (`EditClientButton`, `EditSupplierButton`), ouverte sur la fiche
   elle-même (`/clients/[id]`) et qui redirigeait vers cette même fiche.
2. **État de succès indistinguable de l'état initial.** `CreateManagerButton`
   n'utilisait ni redirect ni signal dédié : l'action renvoyait `{}` en
   cas de succès — exactement la même valeur que l'état initial de
   `useActionState`. Impossible de détecter "vient de réussir" pour
   fermer la modale.

Ni l'un ni l'autre n'est une erreur serveur : dans les deux cas, la
ligne est bien créée/modifiée en base — c'est uniquement le retour
visuel qui manque, ce qui crée l'impression que "ça ne marche pas".

## Corrections

- **Création** (clients, fournisseurs) : redirige maintenant vers la
  fiche du nouvel enregistrement (`/clients/${id}`,
  `/fournisseurs/${id}`) au lieu de la liste — une vraie navigation qui
  démonte la modale, cohérent avec le comportement déjà utilisé pour
  Stock et Accessoires.
- **Modification** (clients, fournisseurs) : ne redirige plus du tout ;
  l'action renvoie `{ success: true }`, et `ClientForm`/`SupplierForm`
  acceptent désormais un `onSuccess` appelé depuis un `useEffect` sur
  `state.success` — `EditClientButton`/`EditSupplierButton` s'en
  servent pour fermer leur propre modale.
- **Gérants** : `createManager` renvoie `{ success: true }` ;
  `CreateManagerButton` ferme la modale et vide les champs sur succès.
- Audit complet des autres modales de l'app (`SupplierQuickCreateModal`,
  `ClientQuickCreateModal`, tous les `Delete*Button`) : déjà correctes
  (les créations rapides utilisent un signal de succès dédié ; les
  suppressions redirigent vers une page réellement différente).

## Critères d'acceptation

- [ ] Créer un client depuis `/clients` referme la modale et affiche la
      fiche du nouveau client
- [ ] Modifier un client depuis sa fiche referme la modale et montre les
      nouvelles valeurs sans rechargement manuel
- [ ] Même chose pour un fournisseur (création et modification)
- [ ] Créer un gérant referme la modale et vide le formulaire
- [ ] `npm run build` réussit
