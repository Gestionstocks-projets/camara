-- Corrige sales_set_calculated_fields() : au moment de l'insert de
-- l'en-tête de vente, les lignes d'accessoires n'existent pas encore
-- (accessories_total = 0) ; si une remise est déjà saisie, le total
-- provisoire pouvait devenir négatif et amount_paid aussi (violation de la
-- contrainte amount_paid >= 0). Trouvé par le test automatisé du
-- 2026-09-04.

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
