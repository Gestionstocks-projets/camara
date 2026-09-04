-- `service_role` doit avoir un accès complet à toutes les tables (utilisé
-- uniquement côté serveur : création/désactivation des gérants via
-- l'API admin, prompt 12). Avec "Automatically expose new tables" décoché
-- à la création du projet, même `service_role` ne reçoit aucun GRANT par
-- défaut — il faut donc l'accorder explicitement, comme pour `authenticated`
-- (migration 0004).

grant usage on schema public to service_role;

grant all on
  profiles,
  settings,
  suppliers,
  clients,
  phones,
  sales,
  sale_payments,
  invoices,
  invoice_counters
to service_role;
