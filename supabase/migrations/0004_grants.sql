-- Droits d'accès explicites — nécessaire car le projet Supabase a été créé
-- avec "Automatically expose new tables" décoché (recommandé par Supabase
-- pour contrôler l'accès manuellement plutôt que par exposition automatique).
--
-- La RLS (migration 0002) définit QUI peut lire/écrire QUELLES LIGNES ;
-- ces GRANT définissent QUELLES TABLES sont accessibles via l'API
-- PostgREST pour QUELS RÔLES. Les deux sont nécessaires : sans GRANT, les
-- policies RLS ne suffisent pas (Postgres refuse l'accès à la table avant
-- même d'évaluer les policies).
--
-- `anon` ne reçoit aucun droit : l'application entière est derrière
-- authentification Supabase Auth (pas de page publique), donc aucune table
-- du schéma public n'a besoin d'être lisible sans session. La connexion
-- (email/mot de passe) passe par le service Auth, pas par ces tables.

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  profiles,
  settings,
  suppliers,
  clients,
  phones,
  sales,
  sale_payments,
  invoices
to authenticated;

-- `invoice_counters` reste volontairement sans GRANT direct : elle n'est
-- touchée que par le trigger `generate_invoice_number()` (security definer,
-- migration 0002), jamais par une requête authentifiée directe — sinon
-- n'importe quel utilisateur pourrait fausser la numérotation des factures.
