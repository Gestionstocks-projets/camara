-- La page de connexion (visiteur non authentifié) doit pouvoir afficher le
-- nom et le logo de la boutique — aucun des champs de `settings` n'est
-- réellement sensible (pas de secret), donc lecture publique.

grant usage on schema public to anon;
grant select on settings to anon;

drop policy if exists settings_select on settings;
create policy settings_select on settings
  for select using (true);
