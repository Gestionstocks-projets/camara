-- Fonctions, triggers et RLS — voir prompts/03-modele-donnees.md.

-- ── Helper rôle (security definer pour éviter la récursion RLS) ──────────

create or replace function is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- ── updated_at générique ────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger phones_set_updated_at
before update on phones
for each row execute function set_updated_at();

-- ── Calcul profit / reste à payer sur les ventes ───────────────────────
-- Le bénéfice dépend de `phones` (une autre table) : impossible d'utiliser
-- une colonne "generated always as" (Postgres l'interdit), d'où ce trigger.

create or replace function sales_set_calculated_fields()
returns trigger
language plpgsql
as $$
declare
  v_purchase_price numeric(12, 0);
  v_extra_fees numeric(12, 0);
begin
  select purchase_price, extra_fees
  into v_purchase_price, v_extra_fees
  from phones
  where id = new.phone_id;

  if v_purchase_price is null then
    raise exception 'Téléphone introuvable pour phone_id %', new.phone_id;
  end if;

  if new.payment_status = 'paye' then
    new.amount_paid := new.sale_price - new.discount;
  end if;

  new.profit := new.sale_price - new.discount - v_purchase_price - v_extra_fees;
  new.amount_due := (new.sale_price - new.discount) - new.amount_paid;

  if new.amount_due <= 0 then
    new.amount_due := 0;
    new.payment_status := 'paye';
  end if;

  return new;
end;
$$;

create trigger sales_before_write
before insert or update on sales
for each row execute function sales_set_calculated_fields();

-- ── Passage du téléphone à "vendu" après une vente ─────────────────────
-- Volontairement en AFTER INSERT : ne modifie `phones` que si la ligne
-- `sales` a passé toutes ses contraintes `check`.

create or replace function sales_after_insert_mark_phone_sold()
returns trigger
language plpgsql
as $$
begin
  update phones set status = 'vendu' where id = new.phone_id;
  return new;
end;
$$;

create trigger sales_after_insert
after insert on sales
for each row execute function sales_after_insert_mark_phone_sold();

-- ── Numérotation automatique des factures (FAC-AAAA-NNNN) ──────────────
-- security definer : la table invoice_counters n'est jamais manipulée
-- directement par les utilisateurs, uniquement via ce trigger.

create or replace function generate_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_prefix text;
  v_next int;
begin
  select invoice_prefix into v_prefix from settings where id = 1;

  insert into invoice_counters (year, last_number)
  values (v_year, 0)
  on conflict (year) do nothing;

  update invoice_counters
  set last_number = last_number + 1
  where year = v_year
  returning last_number into v_next;

  new.number := coalesce(v_prefix, 'FAC') || '-' || v_year || '-' || lpad(v_next::text, 4, '0');
  return new;
end;
$$;

create trigger invoices_before_insert
before insert on invoices
for each row execute function generate_invoice_number();

-- ── RLS ──────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table settings enable row level security;
alter table suppliers enable row level security;
alter table clients enable row level security;
alter table phones enable row level security;
alter table sales enable row level security;
alter table sale_payments enable row level security;
alter table invoices enable row level security;

-- profiles : chacun lit son propre profil ; le propriétaire lit/modifie tout.
create policy profiles_select on profiles
  for select using (id = auth.uid() or is_owner());
create policy profiles_update_owner on profiles
  for update using (is_owner());
-- Pas de policy insert/delete pour le rôle authenticated : la création et
-- la désactivation des gérants passent uniquement par service_role (prompt 12).

-- settings : lecture ouverte, écriture réservée au propriétaire.
create policy settings_select on settings
  for select using (auth.role() = 'authenticated');
create policy settings_update_owner on settings
  for update using (is_owner());

-- suppliers : lecture ouverte (nécessaire au formulaire d'ajout de
-- téléphone, prompt 07), écriture réservée au propriétaire (module
-- Fournisseurs owner-only, décision du 2026-09-03).
create policy suppliers_select on suppliers
  for select using (auth.role() = 'authenticated');
create policy suppliers_write_owner on suppliers
  for all using (is_owner()) with check (is_owner());

-- clients : lecture/écriture ouvertes aux deux rôles.
create policy clients_select on clients
  for select using (auth.role() = 'authenticated');
create policy clients_insert on clients
  for insert with check (auth.role() = 'authenticated');
create policy clients_update on clients
  for update using (auth.role() = 'authenticated');
create policy clients_delete on clients
  for delete using (auth.role() = 'authenticated');

-- phones : lecture/écriture ouvertes aux deux rôles (le gérant peut
-- modifier/supprimer, décision du 2026-09-03). La suppression d'un
-- téléphone déjà vendu est bloquée nativement par la contrainte de clé
-- étrangère `sales.phone_id -> phones.id` (pas de cascade/set null).
create policy phones_select on phones
  for select using (auth.role() = 'authenticated');
create policy phones_insert on phones
  for insert with check (auth.role() = 'authenticated');
create policy phones_update on phones
  for update using (auth.role() = 'authenticated');
create policy phones_delete on phones
  for delete using (auth.role() = 'authenticated');

-- sales : lecture/création/mise à jour ouvertes (mise à jour nécessaire à
-- "Enregistrer un paiement", prompt 08). Pas de suppression.
create policy sales_select on sales
  for select using (auth.role() = 'authenticated');
create policy sales_insert on sales
  for insert with check (auth.role() = 'authenticated');
create policy sales_update on sales
  for update using (auth.role() = 'authenticated');

-- sale_payments : lecture/création ouvertes, jamais de modification/suppression.
create policy sale_payments_select on sale_payments
  for select using (auth.role() = 'authenticated');
create policy sale_payments_insert on sale_payments
  for insert with check (auth.role() = 'authenticated');

-- invoices : lecture/création ouvertes, jamais de modification/suppression
-- (une facture émise est immuable).
create policy invoices_select on invoices
  for select using (auth.role() = 'authenticated');
create policy invoices_insert on invoices
  for insert with check (auth.role() = 'authenticated');
