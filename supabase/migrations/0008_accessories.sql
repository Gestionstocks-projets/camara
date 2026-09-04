-- Module Accessoires (chargeurs, écrans, batteries, écouteurs, AirPods…)
-- + refonte de `sales` en panier multi-articles (téléphone optionnel +
-- lignes d'accessoires en quantité), décision du 2026-09-04.

create type accessory_category as enum (
  'chargeur', 'ecran', 'batterie', 'ecouteurs', 'airpods', 'coque', 'cable', 'autre'
);

create table accessories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category accessory_category not null,
  compatible_with text,
  supplier_id uuid references suppliers (id) on delete set null,
  purchase_price numeric(12, 0) not null default 0,
  sale_price numeric(12, 0) not null,
  quantity_in_stock int not null default 0,
  low_stock_threshold int not null default 3,
  photo_url text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accessories_amounts_non_negative check (
    purchase_price >= 0 and sale_price >= 0
  ),
  constraint accessories_quantity_non_negative check (quantity_in_stock >= 0)
);

create index accessories_category_idx on accessories (category);
create index accessories_supplier_idx on accessories (supplier_id);

create trigger accessories_set_updated_at
before update on accessories
for each row execute function set_updated_at();

-- ── Panier : téléphone optionnel + lignes d'accessoires ──────────────────

-- Le téléphone devient optionnel dans une vente (vente d'accessoires seuls
-- possible). `sale_price` ne représente plus que le prix du téléphone dans
-- cette vente (0 si aucun téléphone) ; `accessories_total`/
-- `accessories_profit` sont maintenus par le trigger sur `sale_items`.
alter table sales alter column phone_id drop not null;
alter table sales alter column sale_price set default 0;
alter table sales add column accessories_total numeric(12, 0) not null default 0;
alter table sales add column accessories_profit numeric(12, 0) not null default 0;

-- L'ancienne contrainte `discount <= sale_price` supposait que sale_price
-- était le total de la vente. Avec le panier (accessoires ajoutés après
-- coup, sur des lignes séparées), ce n'est plus vrai au moment de l'insert
-- de l'en-tête — la vérification discount <= total complet se fait
-- désormais côté application (schema.ts), une fois le panier connu.
alter table sales drop constraint if exists sales_prices_non_negative;
alter table sales add constraint sales_prices_non_negative check (
  sale_price >= 0 and discount >= 0
);

-- Même raison : `amount_paid <= sale_price - discount` ne tenait pas
-- compte des accessoires, ajoutés après l'en-tête. Le trigger clampe déjà
-- amount_due à 0 minimum ; la borne haute d'amount_paid vs le total complet
-- est vérifiée côté application une fois le panier connu.
alter table sales drop constraint if exists sales_amount_paid_bounds;
alter table sales add constraint sales_amount_paid_bounds check (amount_paid >= 0);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales (id) on delete cascade,
  accessory_id uuid not null references accessories (id),
  quantity int not null check (quantity > 0),
  unit_price numeric(12, 0) not null check (unit_price >= 0),
  unit_cost numeric(12, 0) not null check (unit_cost >= 0),
  created_at timestamptz not null default now()
);

create index sale_items_sale_idx on sale_items (sale_id);
create index sale_items_accessory_idx on sale_items (accessory_id);

-- ── Recalcul du bénéfice / reste à payer (remplace le trigger du 0002) ──
-- Le bénéfice combine la part téléphone (si présent) et la part
-- accessoires ; la remise s'applique une seule fois sur le total du panier.
-- Sans changement de comportement pour une vente téléphone seul (le calcul
-- se réduit exactement à l'ancienne formule quand accessories_total = 0).

create or replace function sales_set_calculated_fields()
returns trigger
language plpgsql
as $$
declare
  v_phone_cost numeric(12, 0) := 0;
  v_total numeric(12, 0);
begin
  if new.phone_id is not null then
    select purchase_price + extra_fees into v_phone_cost
    from phones
    where id = new.phone_id;

    if v_phone_cost is null then
      raise exception 'Téléphone introuvable pour phone_id %', new.phone_id;
    end if;
  end if;

  -- greatest(...,0) : au moment de l'insert de l'en-tête, les lignes
  -- d'accessoires n'existent pas encore (accessories_total = 0) — si une
  -- remise est déjà saisie à ce stade, le total provisoire peut être
  -- négatif. Il se corrige dès l'ajout des lignes (cascade depuis
  -- sale_items_after_insert), mais ne doit jamais produire un amount_paid
  -- négatif entre-temps.
  v_total := greatest(
    coalesce(new.sale_price, 0) + coalesce(new.accessories_total, 0) - coalesce(new.discount, 0),
    0
  );

  if new.payment_status = 'paye' then
    new.amount_paid := v_total;
  end if;

  new.profit := coalesce(new.sale_price, 0) - v_phone_cost + coalesce(new.accessories_profit, 0) - coalesce(new.discount, 0);
  new.amount_due := v_total - new.amount_paid;

  if new.amount_due <= 0 then
    new.amount_due := 0;
    new.payment_status := 'paye';
  end if;

  return new;
end;
$$;

-- ── Ligne d'accessoire : décrémente le stock + recalcule l'en-tête ──────
-- Le check `quantity_in_stock >= 0` fait office de garde-fou anti-survente
-- (la mise à jour échoue si la quantité demandée dépasse le stock).

create or replace function sale_items_after_insert()
returns trigger
language plpgsql
as $$
declare
  v_totals record;
begin
  update accessories
  set quantity_in_stock = quantity_in_stock - new.quantity
  where id = new.accessory_id;

  select
    coalesce(sum(unit_price * quantity), 0) as total,
    coalesce(sum((unit_price - unit_cost) * quantity), 0) as profit
  into v_totals
  from sale_items
  where sale_id = new.sale_id;

  -- Ce UPDATE re-déclenche `sales_set_calculated_fields` (BEFORE UPDATE sur
  -- `sales`), qui recalcule profit/reste à payer avec le nouveau total.
  update sales
  set accessories_total = v_totals.total, accessories_profit = v_totals.profit
  where id = new.sale_id;

  return new;
end;
$$;

create trigger sale_items_after_insert
after insert on sale_items
for each row execute function sale_items_after_insert();

-- ── Le passage du téléphone à "vendu" ne s'applique que s'il y en a un ──

create or replace function sales_after_insert_mark_phone_sold()
returns trigger
language plpgsql
as $$
begin
  if new.phone_id is not null then
    update phones set status = 'vendu' where id = new.phone_id;
  end if;
  return new;
end;
$$;

-- ── RLS + GRANT pour les nouvelles tables ────────────────────────────────

alter table accessories enable row level security;
alter table sale_items enable row level security;

create policy accessories_select on accessories
  for select using (auth.role() = 'authenticated');
create policy accessories_insert on accessories
  for insert with check (auth.role() = 'authenticated');
create policy accessories_update on accessories
  for update using (auth.role() = 'authenticated');
create policy accessories_delete on accessories
  for delete using (auth.role() = 'authenticated');

create policy sale_items_select on sale_items
  for select using (auth.role() = 'authenticated');
create policy sale_items_insert on sale_items
  for insert with check (auth.role() = 'authenticated');

grant select, insert, update, delete on accessories to authenticated;
grant select, insert on sale_items to authenticated;
grant all on accessories, sale_items to service_role;
