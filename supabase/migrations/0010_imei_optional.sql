-- Rend l'IMEI optionnel (prompt 16) : la boutique doit pouvoir enregistrer
-- des téléphones en quantité (même marque/modèle/état/stockage/prix) sans
-- connaître individuellement le numéro de série de chaque unité au moment
-- de la réception. La contrainte d'unicité reste active pour les IMEI
-- réellement saisis — Postgres autorise plusieurs NULL sous UNIQUE.
alter table phones alter column imei drop not null;
